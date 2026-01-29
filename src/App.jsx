import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import TaskList from './components/TaskList';
import ProtectedLayout from './components/ProtectedLayout';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
        <Route path="/" element={<TaskList />} />
        <Route
          path="/admin/dashboard"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
}

export default App;
