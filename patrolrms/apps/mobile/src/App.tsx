import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginScreen from './screens/LoginScreen';
import LocationScreen from './screens/LocationScreen';
import CaseListScreen from './screens/CaseListScreen';
import ActionScreen from './screens/ActionScreen';
import CaseReportForm from './screens/CaseReportForm';
import ArrestReportForm from './screens/ArrestReportForm';
import PropertyReportScreen from './screens/PropertyReportScreen';
import CollisionReportForm from './screens/CollisionReportForm';
import TowImpoundForm from './screens/TowImpoundForm';
import SupervisorQueue from './screens/SupervisorQueue';
import DeputyReportForm from './screens/DeputyReportForm';
import DigitalEvidenceFolder from './screens/DigitalEvidenceFolder';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="h-full flex flex-col bg-bg">
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<PrivateRoute><LocationScreen /></PrivateRoute>} />
        <Route path="/cases" element={<PrivateRoute><CaseListScreen /></PrivateRoute>} />
        <Route path="/cases/:caseId/action" element={<PrivateRoute><ActionScreen /></PrivateRoute>} />
        <Route path="/reports/:reportId/case" element={<PrivateRoute><CaseReportForm /></PrivateRoute>} />
        <Route path="/reports/:reportId/arrest" element={<PrivateRoute><ArrestReportForm /></PrivateRoute>} />
        <Route path="/reports/:reportId/property" element={<PrivateRoute><PropertyReportScreen /></PrivateRoute>} />
        <Route path="/reports/:reportId/collision" element={<PrivateRoute><CollisionReportForm /></PrivateRoute>} />
        <Route path="/reports/:reportId/tow" element={<PrivateRoute><TowImpoundForm /></PrivateRoute>} />
        <Route path="/reports/:reportId/deputy" element={<PrivateRoute><DeputyReportForm /></PrivateRoute>} />
        <Route path="/reports/:reportId/digital" element={<PrivateRoute><DigitalEvidenceFolder /></PrivateRoute>} />
        <Route path="/queue" element={<PrivateRoute><SupervisorQueue /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
