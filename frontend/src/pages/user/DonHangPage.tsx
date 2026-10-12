import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useParams } from 'react-router-dom'
import OrderReviewModal from '../../components/orders/OrderReviewModal'
import { useNeuEngine } from '../../hooks/useNeuEngine'
import { NEU_CAMPUS_MAP_EMBED_URL } from '../../data/campusMap'
import { resolveTrackingOrder } from '../../lib/resolveTrackingOrder'
import { appendReviewsFromOrder } from '../../lib/dishReviews'
import { getReviewForOrder, saveReviewForOrder } from '../../lib/orderReviews'
import { NeuOrder, OrderStatus } from '../../types/neuModels'
import styles from './DonHangPage.module.css'

function formatPrice(n: number) {
  return `${Number(n || 0).toLocaleString('vi-VN')}đ`
}

export default function DonHangPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const {
    orders,
    customerCancelOrder,
    customerConfirmReceived,
    submitComplaint,
  } = useNeuEngine()

  // Find order in mockEngine first
  const neuOrder: NeuOrder | undefined = useMemo(() => {
    return orders.find((o) => o.id === orderId || o.code === orderId)
  }, [orders, orderId])

  // Fallback for legacy demo IDs if not found in mockEngine
  const legacyOrder = useMemo(() => {
    if (neuOrder) return null
    return resolveTrackingOrder(orderId, [])
  }, [neuOrder, orderId])

  // Local state for modals & actions
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  const [complaintModalOpen, setComplaintModalOpen] = useState(false)
  const [complaintType, setComplaintType] = useState<'missing_dish' | 'wrong_dish' | 'cold_food' | 'shipper_attitude' | 'other'>('cold_food')
  const [complaintDesc, setComplaintDesc] = useState('')
  const [complaintSuccess, setComplaintSuccess] = useState(false)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRecord, setReviewRecord] = useState<any>(null)
  const [reviewToast, setReviewToast] = useState(false)
  const [actionSuccessToast, setActionSuccessToast] = useState('')

  useEffect(() => {
    if (orderId) setReviewRecord(getReviewForOrder(orderId))
  }, [orderId])

  useEffect(() => {
    if (!reviewToast && !actionSuccessToast) return
    const t = setTimeout(() => {
      setReviewToast(false)
      setActionSuccessToast('')
    }, 4500)
    return () => clearTimeout(t)
  }, [reviewToast, actionSuccessToast])

  if (!orderId) {
    return <Navigate to="/lich-su-don" replace />
  }

  if (!neuOrder && !legacyOrder) {
    return <Navigate to="/lich-su-don" replace />
  }

  // Normalize order data for UI
  const currentStatus: OrderStatus = neuOrder ? neuOrder.status : (legacyOrder?.status as any || 'preparing')
  const isCancelled = currentStatus === 'cancelled'
  const isIncident = currentStatus === 'incident'
  const isCompleted = currentStatus === 'completed'
  const isDelivered = currentStatus === 'delivered'

  // Rules: BR-16: Khách chỉ được hủy khi đơn chưa được Canteen bắt đầu chuẩn bị
  const canCancel = neuOrder
    ? ['created', 'awaiting_payment', 'awaiting_canteen', 'confirmed'].includes(neuOrder.status)
    : false

  // Rules: BR-22: Khách có thể xác nhận nhận hàng khi đơn đã tới nơi
  const canConfirmReceived = neuOrder
    ? ['delivered', 'ready_for_handover'].includes(neuOrder.status)
    : false

  // Rules: BR-24: Đánh giá sau khi hoàn thành
  const canReview = (isCompleted || isDelivered) && !reviewRecord

  // Rules: BR-25: Gửi khiếu nại trong vòng 24h sau khi nhận
  const canComplain = (isCompleted || isDelivered) && !neuOrder?.hasComplaint

  function handleCancelSubmit() {
    if (!neuOrder) return
    setCancelError('')
    try {
      customerCancelOrder(neuOrder.id, cancelReason || 'Khách đổi ý muốn hủy đơn')
      setCancelModalOpen(false)
      setActionSuccessToast('Đã hủy đơn hàng thành công (BR-16).')
    } catch (err: any) {
      setCancelError(err.message || 'Không thể hủy đơn hàng.')
    }
  }

  function handleConfirmReceivedClick() {
    if (!neuOrder) return
    customerConfirmReceived(neuOrder.id)
    setActionSuccessToast('Cảm ơn bạn đã xác nhận đã nhận hàng (BR-22)!')
  }

  function handleComplaintSubmit() {
    if (!neuOrder) return
    if (!complaintDesc.trim()) return
    submitComplaint({
      orderId: neuOrder.id,
      reasonType: complaintType,
      description: complaintDesc.trim(),
    })
    setComplaintModalOpen(false)
    setComplaintSuccess(true)
    setActionSuccessToast('Đã gửi khiếu nại tới Quản trị viên (UC17, BR-25).')
  }

  function handleReviewSaved(data: any) {
    if (!orderId) return
    saveReviewForOrder(orderId, data)
    const items = neuOrder ? neuOrder.items : legacyOrder?.items || []
    appendReviewsFromOrder(orderId, items as any, data.starsByLine, data.comment, data.photosByLine)
    setReviewRecord(getReviewForOrder(orderId))
    setReviewOpen(false)
    setReviewToast(true)
  }

  // Stepper calculations for the 11 states
  const isAtCanteen = neuOrder?.receiveType === 'at_canteen'

  // Define steps according to BR-18, BR-29, BR-30
  const stepsList = useMemo(() => {
    if (isAtCanteen) {
      return [
        { key: 'created', label: 'Tạo đơn' },
        { key: 'awaiting_canteen', label: 'Chờ Canteen nhận (BR-15)' },
        { key: 'preparing', label: 'Đang nấu món' },
        { key: 'ready_for_handover', label: 'Sẵn sàng tại quầy (BR-31)' },
        { key: 'completed', label: 'Đã nhận & Hoàn thành' },
      ]
    }
    return [
      { key: 'created', label: 'Đã đặt' },
      { key: 'awaiting_canteen', label: 'Canteen xác nhận' },
      { key: 'preparing', label: 'Chuẩn bị món' },
      { key: 'ready_for_handover', label: 'Sẵn sàng bàn giao' },
      { key: 'shipper_assigned', label: 'Đã có Shipper' },
      { key: 'delivering', label: 'Đang giao tới phòng' },
      { key: 'delivered', label: neuOrder?.paymentMethod === 'cod' ? 'Giao & Thu COD (BR-34)' : 'Đã giao tới phòng' },
      { key: 'completed', label: 'Hoàn tất' },
    ]
  }, [isAtCanteen, neuOrder?.paymentMethod])

  function getStepStatus(stepKey: string) {
    const orderPhases = [
      'created',
      'awaiting_payment',
      'awaiting_canteen',
      'confirmed',
      'preparing',
      'ready_for_handover',
      'shipper_assigned',
      'picked_up',
      'delivering',
      'delivered',
      'completed',
    ]

    const curIdx = orderPhases.indexOf(currentStatus)
    const stepIdx = orderPhases.indexOf(stepKey)

    if (currentStatus === stepKey) return 'current'
    if (curIdx > stepIdx) return 'done'
    return 'upcoming'
  }

  // Status Titles and Descriptions
  const statusInfo = useMemo(() => {
    switch (currentStatus) {
      case 'awaiting_canteen':
        return {
          title: 'Chờ Canteen A2 xác nhận',
          lead: 'Canteen A2 đang kiểm tra đơn trong vòng 10 phút (BR-15). Bạn vẫn có thể hủy đơn lúc này.',
        }
      case 'preparing':
        return {
          title: 'Nhà bếp đang chuẩn bị món',
          lead: 'Đầu bếp Canteen A2 đang nấu món ăn nóng sốt. Đơn không thể hủy từ bước này theo quy định BR-16.',
        }
      case 'ready_for_handover':
        return {
          title: isAtCanteen ? 'Món đã sẵn sàng tại quầy!' : 'Sẵn sàng bàn giao cho Shipper',
          lead: isAtCanteen
            ? 'Vui lòng tới quầy Canteen A2 đọc mã đơn để lấy đồ. Canteen giữ món tối đa 30 phút (BR-31).'
            : 'Món ăn đã đóng gói xong. Hệ thống đang điều phối Shipper nội khu tới lấy.',
        }
      case 'shipper_assigned':
        return {
          title: 'Đã có Shipper nhận đơn',
          lead: `Shipper ${neuOrder?.shipperName || 'nội khu'} đang di chuyển tới Canteen A2 lấy đồ.`,
        }
      case 'picked_up':
      case 'delivering':
        return {
          title: 'Shipper đang trên đường giao tới phòng',
          lead: `Shipper đang mang đồ tới ${neuOrder?.location ? `Tòa ${neuOrder.location.building} - Tầng ${neuOrder.location.floor} - ${neuOrder.location.room}` : 'địa chỉ của bạn'}.`,
        }
      case 'delivered':
        return {
          title: 'Đơn hàng đã được giao tới nơi!',
          lead: neuOrder?.paymentMethod === 'cod'
            ? 'Shipper đã bàn giao đồ và thu tiền mặt thành công (BR-34). Vui lòng xác nhận nhận hàng.'
            : 'Shipper đã giao đồ tới phòng học. Vui lòng xác nhận đã nhận hàng.',
        }
      case 'completed':
        return {
          title: 'Đơn hàng đã hoàn thành',
          lead: 'Cảm ơn bạn đã sử dụng NEUFood! Bạn có thể đánh giá hoặc gửi khiếu nại trong vòng 24h (BR-25).',
        }
      case 'cancelled':
        return {
          title: 'Đơn hàng đã hủy',
          lead: `Lý do: ${neuOrder?.cancelReason || 'Theo yêu cầu của khách hàng'}. ${neuOrder?.paymentMethod === 'qr_online' ? 'Tiền thanh toán online sẽ được hoàn 100% trong vòng 2 ngày (BR-17).' : ''}`,
        }
      case 'incident':
        return {
          title: 'Đơn hàng gặp sự cố giao hàng',
          lead: `Shipper báo cáo sự cố: "${neuOrder?.incidentReason || 'Không liên lạc được'}". Quản trị viên đang thụ lý xử lý (UC38, BR-36).`,
        }
      default:
        return {
          title: 'Đang xử lý đơn hàng',
          lead: 'Hệ thống đang cập nhật trạng thái đơn hàng.',
        }
    }
  }, [currentStatus, isAtCanteen, neuOrder])

  return (
    <main className={styles.page}>
      {/* Toast notifications */}
      {actionSuccessToast ? (
        <div className={styles.reviewToast} style={{ background: '#065f46' }}>
          <span className={`material-symbols-outlined ${styles.reviewToastIco}`}>check_circle</span>
          {actionSuccessToast}
        </div>
      ) : null}

      {reviewToast ? (
        <div className={styles.reviewToast}>
          <span className={`material-symbols-outlined ${styles.reviewToastIco}`}>check_circle</span>
          Cảm ơn bạn đã gửi đánh giá cho Canteen &amp; Shipper!
        </div>
      ) : null}

      {/* Review Modal */}
      {reviewOpen && canReview ? (
        <OrderReviewModal
          orderId={orderId}
          items={(neuOrder ? neuOrder.items : legacyOrder?.items || []) as any}
          onClose={() => setReviewOpen(false)}
          onSubmitReview={handleReviewSaved}
        />
      ) : null}

      <div className={`wrap ${styles.layout}`}>
        <div className={styles.main}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Link className={styles.back} to="/lich-su-don">
              ← Danh sách đơn hàng
            </Link>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
              Mã tra cứu: #{neuOrder ? neuOrder.code : orderId}
            </span>
          </div>

          <header className={styles.head}>
            <div className={styles.live}>
              <span className={styles.ping}>
                <span className={styles.pingDot} />
              </span>
              Đồng bộ dữ liệu thời gian thực (LocalStorage Engine)
            </div>
            <h1 className={styles.title}>{statusInfo.title}</h1>
            <p className={styles.lead}>{statusInfo.lead}</p>
          </header>

          {/* SLA Warning (BR-23) */}
          {['delivering', 'picked_up'].includes(currentStatus) ? (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px' }}>timer</span>
              <span style={{ fontSize: '0.8125rem', color: '#92400e' }}>
                <strong>Mục tiêu giao hàng SLA:</strong> Tối đa 20 phút từ lúc Canteen xác nhận đến lúc giao tận phòng (BR-23).
              </span>
            </div>
          ) : null}

          {/* Stepper view */}
          {isCancelled ? (
            <section className={styles.cancelBox} aria-label="Trạng thái hủy">
              <span className={`material-symbols-outlined ${styles.cancelIco}`}>cancel</span>
              <div>
                <strong style={{ fontSize: '1rem', color: '#b91c1c', display: 'block' }}>Đơn hàng đã bị hủy</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#475569' }}>
                  {neuOrder?.cancelReason || 'Đơn đã hủy thành công'}
                </p>
              </div>
            </section>
          ) : isIncident ? (
            <section style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '28px' }}>report_problem</span>
              <div>
                <strong style={{ color: '#991b1b', fontSize: '1rem', display: 'block' }}>Sự cố giao hàng (BR-36)</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#7f1d1d' }}>
                  Lý do báo cáo: {neuOrder?.incidentReason}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                  Admin đang thụ lý đối soát. Nếu có hành vi boom hàng, tài khoản sẽ bị đưa vào Blacklist COD.
                </p>
              </div>
            </section>
          ) : (
            <section className={styles.track} aria-label="Tiến trình đơn hàng">
              <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px' }}>
                {stepsList.map((st, idx) => {
                  const state = getStepStatus(st.key)
                  const isDone = state === 'done'
                  const isCur = state === 'current'
                  return (
                    <div
                      key={st.key}
                      style={{
                        flex: '1 0 110px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '6px',
                          background: isDone ? '#059669' : isCur ? '#881337' : '#e2e8f0',
                          color: isDone || isCur ? '#ffffff' : '#94a3b8',
                          boxShadow: isCur ? '0 0 0 4px rgba(136, 19, 55, 0.2)' : 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {isDone ? (
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                        ) : isCur ? (
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>radio_button_checked</span>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: isCur ? 700 : isDone ? 600 : 500,
                          color: isCur ? '#881337' : isDone ? '#0f172a' : '#94a3b8',
                          lineHeight: 1.2,
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Action buttons row (Hủy đơn, Xác nhận nhận hàng, Gửi khiếu nại) */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {/* 1. Nút HỦY ĐƠN (BR-16) */}
            {!isCancelled && !isCompleted ? (
              canCancel ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ef4444',
                    background: '#ffffff',
                    color: '#dc2626',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                  Hủy đơn hàng (BR-16)
                </button>
              ) : (
                <div
                  title="Canteen đã bắt đầu chuẩn bị món, không thể hủy theo quy định BR-16"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'not-allowed',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                  Không thể hủy (Quán đã nấu món - BR-16)
                </div>
              )
            ) : null}

            {/* 2. Nút XÁC NHẬN ĐÃ NHẬN HÀNG (BR-22) */}
            {canConfirmReceived && !isCompleted ? (
              <button
                type="button"
                onClick={handleConfirmReceivedClick}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
                }}
              >
                <span className="material-symbols-outlined">task_alt</span>
                Xác nhận đã nhận hàng (BR-22)
              </button>
            ) : null}

            {/* 3. Nút GỬI KHIẾU NẠI (BR-25, UC17) */}
            {canComplain ? (
              <button
                type="button"
                onClick={() => setComplaintModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d97706',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
                Gửi khiếu nại trong 24h (BR-25)
              </button>
            ) : neuOrder?.hasComplaint ? (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                Đã gửi khiếu nại (Admin đang xử lý - UC38)
              </div>
            ) : null}
          </div>

          {/* Map view with driver info */}
          {!isCancelled ? (
            <section className={styles.map} aria-label="Bản đồ NEU">
              <iframe
                title="Bản đồ NEU"
                src={NEU_CAMPUS_MAP_EMBED_URL}
                className={styles.mapIframe}
                loading="lazy"
                allowFullScreen
              />
              <div className={styles.mapGrad} aria-hidden />

              {/* Shipper info (BR-28: Chỉ hiện khi có shipper nhận) */}
              {neuOrder?.shipperName ? (
                <div className={styles.mapFoot}>
                  <div className={styles.glass}>
                    <div className={styles.drvPic}>
                      <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80" alt="" />
                    </div>
                    <div>
                      <p className={styles.drvLbl}>Shipper sinh viên NEU</p>
                      <p className={styles.drvName}>{neuOrder.shipperName}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>SĐT: {neuOrder.shipperPhone}</p>
                    </div>
                  </div>
                  <div className={styles.shipBtns}>
                    <a href={`tel:${neuOrder.shipperPhone}`} className={`${styles.round} ${styles.roundPri}`} aria-label="Gọi shipper">
                      <span className="material-symbols-outlined">call</span>
                    </a>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* Aside: Order Items & Delivery address */}
        <aside className={styles.aside}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Đơn hàng #{neuOrder ? neuOrder.code : orderId}</h2>
            <div className={styles.items}>
              {(neuOrder ? neuOrder.items : legacyOrder?.items || []).map((item: any, idx: number) => (
                <div key={idx} className={styles.row}>
                  <div className={styles.thumb}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'} alt={item.name} />
                  </div>
                  <div className={styles.rowBody}>
                    <h3 className={styles.rowName}>{item.name}</h3>
                    {item.note ? <p className={styles.rowNote}>Ghi chú: {item.note}</p> : null}
                    <div className={styles.rowFoot}>
                      <span className={styles.qty}>x{item.qty}</span>
                      <span className={styles.price}>{formatPrice(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.bill}>
                <div className={styles.billRow}>
                  <span>Tạm tính</span>
                  <span>{formatPrice(neuOrder ? neuOrder.subtotal : legacyOrder?.subtotal || 0)}</span>
                </div>
                <div className={styles.billRow}>
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(neuOrder ? neuOrder.shippingFee : legacyOrder?.shipFee || 0)}</span>
                </div>
                <div className={styles.billRow}>
                  <span>Phương thức</span>
                  <span style={{ fontWeight: 600 }}>
                    {neuOrder?.paymentMethod === 'cod' ? 'Tiền mặt khi nhận (COD)' : 'Chuyển khoản QR'}
                  </span>
                </div>
                <div className={styles.billTotal}>
                  <span>Tổng thanh toán</span>
                  <span className={styles.billSum}>{formatPrice(neuOrder ? neuOrder.total : legacyOrder?.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery destination card */}
          <div className={styles.info}>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">
                  {isAtCanteen ? 'storefront' : 'location_on'}
                </span>
                <div>
                  <p className={styles.infoLbl}>Điểm nhận hàng</p>
                  <p className={styles.infoTxt}>
                    {isAtCanteen
                      ? 'Nhận trực tiếp tại quầy Canteen A2'
                      : neuOrder?.location
                        ? `Tòa ${neuOrder.location.building} - Tầng ${neuOrder.location.floor} - ${neuOrder.location.room}`
                        : 'Khuôn viên Đại học Kinh tế Quốc dân'}
                  </p>
                  <p className={styles.infoSub}>
                    {isAtCanteen ? 'Giữ đồ tối đa 30 phút (BR-31)' : 'Giao nội khu NEU'}
                  </p>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className="material-symbols-outlined">schedule</span>
                <div>
                  <p className={styles.infoLbl}>Thời gian giao / nhận</p>
                  <p className={styles.infoTxt}>
                    {neuOrder?.deliveryTiming === 'scheduled'
                      ? `Hẹn giờ nhận lúc: ${neuOrder.scheduledTime}`
                      : 'Giao ngay (15 - 20 phút)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Review button at bottom */}
          <div className={styles.act2}>
            <Link to="/menu" className={`${styles.actBtn} ${styles.actGhost}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>replay</span>
              Đặt món khác
            </Link>

            <button
              type="button"
              className={reviewRecord ? `${styles.actBtn} ${styles.actDone}` : `${styles.actBtn} ${styles.actPri}`}
              disabled={!canReview}
              onClick={() => setReviewOpen(true)}
            >
              <span className={`material-symbols-outlined ${styles.icoFill}`} style={{ fontSize: '1.125rem' }}>
                {reviewRecord ? 'check_circle' : 'star'}
              </span>
              {reviewRecord ? 'Đã đánh giá' : 'Đánh giá món &amp; Shipper'}
            </button>
          </div>
        </aside>
      </div>

      {/* MODAL HỦY ĐƠN HÀNG (BR-16) */}
      {cancelModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.125rem', color: '#b91c1c' }}>Xác nhận hủy đơn hàng (BR-16)</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
              Khách hàng chỉ được hủy khi Canteen chưa bắt đầu chuẩn bị món. Nếu đơn đã thanh toán online, bạn sẽ được hoàn tiền 100% trong vòng 2 ngày (BR-17).
            </p>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
              Lý do hủy đơn:
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ví dụ: Đổi giờ học, muốn chọn món khác..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '16px' }}
            />

            {cancelError ? (
              <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginBottom: '12px' }}>{cancelError}</p>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL GỬI KHIẾU NẠI (BR-25, UC17) */}
      {complaintModalOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', color: '#1e293b' }}>Gửi khiếu nại đơn hàng (UC17)</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
              Khiếu nại được tiếp nhận trong vòng <strong>24 giờ</strong> sau khi đơn hoàn thành (BR-25). Quản trị viên sẽ phân xử và hoàn tiền nếu lỗi do Canteen hoặc Shipper (BR-37).
            </p>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
              Loại sự cố:
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value as any)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '12px' }}
            >
              <option value="missing_dish">Thiếu món / Sai số lượng</option>
              <option value="wrong_dish">Giao nhầm món ăn khác</option>
              <option value="cold_food">Món ăn nguội / Không đảm bảo chất lượng</option>
              <option value="shipper_attitude">Thái độ phục vụ của Shipper</option>
              <option value="other">Lý do khác</option>
            </select>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
              Mô tả chi tiết và bằng chứng:
            </label>
            <textarea
              rows={3}
              value={complaintDesc}
              onChange={(e) => setComplaintDesc(e.target.value)}
              placeholder="Mô tả cụ thể sự cố để Admin đối soát..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setComplaintModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!complaintDesc.trim()}
                onClick={handleComplaintSubmit}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#d97706', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Gửi khiếu nại tới Admin
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
