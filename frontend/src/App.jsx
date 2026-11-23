import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import FallGame from './pages/FallGame.jsx';
import MeaningGame from './pages/MeaningGame.jsx';
import History from './pages/History.jsx';
import Admin from './pages/Admin.jsx';

function Protected({ children, admin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/fall" element={<FallGame />} />
        <Route path="/meaning" element={<MeaningGame />} />
        <Route path="/history" element={<History />} />
        <Route
          path="/admin"
          element={
            <Protected admin>
              <Admin />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
