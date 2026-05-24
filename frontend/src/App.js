import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage  from './pages/CoursesPage';
import CoursePage   from './pages/CoursePage';
import LessonPage   from './pages/LessonPage';
import ProfilePage  from './pages/ProfilePage';
import Navbar       from './components/Navbar';
import CreateCoursePage  from './pages/CreateCoursePage';
import CreateLessonPage  from './pages/CreateLessonPage';
import CreateTaskPage    from './pages/CreateTaskPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses"  element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
          <Route path="/courses/:id" element={<PrivateRoute><CoursePage /></PrivateRoute>} />
          <Route path="/lessons/:id" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
          <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/courses/new" element={<PrivateRoute adminOnly><CreateCoursePage /></PrivateRoute>} />
          <Route path="/courses/:courseId/lessons/new" element={<PrivateRoute adminOnly><CreateLessonPage /></PrivateRoute>} />
          <Route path="/lessons/:lessonId/tasks/new" element={<PrivateRoute adminOnly><CreateTaskPage /></PrivateRoute>} />
          <Route path="/tasks/:taskId/edit" element={<PrivateRoute adminOnly><CreateTaskPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;