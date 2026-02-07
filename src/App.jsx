import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider, useAppState } from './store/useAppState.jsx'
import { ToastProvider } from './ui/toast.jsx'

import AuthLayout from './layouts/AuthLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Warehouses from './pages/Warehouses.jsx'
import Products from './pages/Products.jsx'
import StockMoves from './pages/StockMoves.jsx'
import Inventory from './pages/Inventory.jsx'
import Stores from './pages/Stores.jsx'
import Settings from './pages/Settings.jsx'
import Services from './pages/Services.jsx'

function RequireAuth({ children }) {
  const { state } = useAppState()
  const loc = useLocation()
  if (!state?.auth?.sessionUserId) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

export default function App() {
  return (
    <AppStateProvider>
      <ToastProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </Route>

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/almacenes" element={<Warehouses />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/movimientos" element={<StockMoves />} />
            <Route path="/inventario" element={<Inventory />} />
            <Route path="/tiendas" element={<Stores />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/configuracion" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AppStateProvider>
  )
}
