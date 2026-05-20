import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/Toast';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DoctorLayout from './components/doctor/DoctorLayout';
import DashboardPage from './pages/doctor/DashboardPage';
import PatientListPage from './pages/doctor/PatientListPage';
import PatientAddPage from './pages/doctor/PatientAddPage';
import PatientDetailPage from './pages/doctor/PatientDetailPage';
import PrescriptionListPage from './pages/doctor/PrescriptionListPage';
import CreatePrescriptionPage from './pages/doctor/CreatePrescriptionPage';
import PrescriptionDetailPage from './pages/doctor/PrescriptionDetailPage';
import UpdatePrescriptionPage from './pages/doctor/UpdatePrescriptionPage';
import MedicationCalendarPage from './pages/doctor/MedicationCalendarPage';
import NotificationsPage from './pages/doctor/NotificationsPage';
import NotificationDetailPage from './pages/doctor/NotificationDetailPage';
import NotificationSettingsPage from './pages/doctor/NotificationSettingsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DrugListPage from './pages/doctor/DrugListPage';
import PatientLayout from './components/patient/PatientLayout';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientPrescriptionPage from './pages/patient/PatientPrescriptionPage';
import PatientSchedulePage from './pages/patient/PatientSchedulePage';
import PatientNotificationsPage from './pages/patient/PatientNotificationsPage';
import PatientChangePasswordPage from './pages/patient/PatientChangePasswordPage';
import './styles/global.css';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor" element={
        <PrivateRoute allowedRoles={['doctor']}>
          <DoctorLayout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/add" element={<PatientAddPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="prescriptions" element={<PrescriptionListPage />} />
        <Route path="prescriptions/create" element={<CreatePrescriptionPage />} />
        <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
        <Route path="prescriptions/:id/update" element={<UpdatePrescriptionPage />} />
        <Route path="calendar" element={<MedicationCalendarPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="notifications/:id" element={<NotificationDetailPage />} />
        <Route path="prescriptions/:id/notification-settings" element={<NotificationSettingsPage />} />
        <Route path="drugs" element={<DrugListPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* Patient routes */}
      <Route path="/patient" element={
        <PrivateRoute allowedRoles={['patient']}>
          <PatientLayout />
        </PrivateRoute>
      }>
        <Route index element={<PatientDashboardPage />} />
        <Route path="prescriptions" element={<PatientPrescriptionPage />} />
        <Route path="schedule" element={<PatientSchedulePage />} />
        <Route path="notifications" element={<PatientNotificationsPage />} />
        <Route path="change-password" element={<PatientChangePasswordPage />} />
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
