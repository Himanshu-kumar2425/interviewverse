import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { InterviewProvider } from "./context/InterviewContext.jsx";

import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeUpload from "./pages/ResumeUpload.jsx";
import AIInterview from "./pages/AIInterview.jsx";
import PeerInterview from "./pages/PeerInterview.jsx";
import PeerJoin from "./pages/PeerJoin.jsx";
import Reports from "./pages/Reports.jsx";
import ReportDetail from "./pages/ReportDetail.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Peer join — accessible without auth so the link is shareable,
              the page itself redirects to login if unauthenticated */}
          <Route path="/peer/join/:roomId" element={<PeerJoin />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/interview/ai" element={<AIInterview />} />
            <Route path="/interview/peer" element={<PeerInterview />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:sessionId" element={<ReportDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </InterviewProvider>
    </AuthProvider>
  );
}
