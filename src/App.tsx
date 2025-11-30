import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import routes from './routes';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Login from '@/pages/Login';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/adminherelogin" element={<Login />} />
          
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen bg-background">
                <Sidebar />
                <div className="flex-1 ml-64">
                  <Header />
                  <main className="min-h-[calc(100vh-4rem)]">
                    <Routes>
                      {routes.map((route, index) => (
                        <Route
                          key={index}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
};

export default App;
