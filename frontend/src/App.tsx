import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { CartProvider } from './contexts/CartContext'
import { OrderHistoryProvider } from './contexts/OrderHistoryContext'
import { MenuSearchProvider } from './contexts/MenuSearchContext'
import AppRoutes from './routes'

import DemoRoleSwitcher from './components/common/DemoRoleSwitcher'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <OrderHistoryProvider>
              <MenuSearchProvider>
                <BrowserRouter>
                  <AppRoutes />
                  <DemoRoleSwitcher />
                </BrowserRouter>
              </MenuSearchProvider>
            </OrderHistoryProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
