import { Routes, Route, Navigate } from 'react-router-dom'

// Employee pages
import AccessPage from './pages/employee/AccessPage'
import EventDashboard from './pages/employee/EventDashboard'
import SelectQuantity from './pages/employee/SelectQuantity'
import ParticipantsForm from './pages/employee/ParticipantsForm'
import TermsPage from './pages/employee/TermsPage'
import OrderConfirmation from './pages/employee/OrderConfirmation'
import MyOrders from './pages/employee/MyOrders'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ImportPage from './pages/admin/ImportPage'
import OrdersList from './pages/admin/OrdersList'
import PrintCenter from './pages/admin/PrintCenter'
import PickupControl from './pages/admin/PickupControl'
import CheckIn from './pages/admin/CheckIn'
import Reports from './pages/admin/Reports'

// Layouts
import AdminLayout from './layouts/AdminLayout'

export default function App() {
  return (
    <Routes>
      {/* Employee flow */}
      <Route path="/" element={<AccessPage />} />
      <Route path="/evento" element={<EventDashboard />} />
      <Route path="/emitir/quantidade" element={<SelectQuantity />} />
      <Route path="/emitir/participantes" element={<ParticipantsForm />} />
      <Route path="/emitir/termos" element={<TermsPage />} />
      <Route path="/emitir/confirmacao" element={<OrderConfirmation />} />
      <Route path="/meus-pedidos" element={<MyOrders />} />

      {/* Admin flow */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="importacao" element={<ImportPage />} />
        <Route path="pedidos" element={<OrdersList />} />
        <Route path="impressao" element={<PrintCenter />} />
        <Route path="retirada" element={<PickupControl />} />
        <Route path="checkin" element={<CheckIn />} />
        <Route path="relatorios" element={<Reports />} />
      </Route>
    </Routes>
  )
}
