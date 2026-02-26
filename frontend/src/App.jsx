import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentShowcase from './pages/StudentShowcase';
import TeacherShowcase from './pages/TeacherShowcase';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherManageStudents from './pages/TeacherManageStudents';
import TeacherMaterials from './pages/TeacherMaterials';
import TeacherCourses from './pages/TeacherCourses';
import StudentDashboard from './pages/StudentDashboard';
import StudentMaterials from './pages/StudentMaterials';
import StudentCourses from './pages/StudentCourses';
import StudentCourseDetail from './pages/StudentCourseDetail';
import StudentKnowledgeMap from './pages/StudentKnowledgeMap';
import StudentRevisions from './pages/StudentRevisions';
import StudentProgress from './pages/StudentProgress';
import StudentLeaderboard from './pages/StudentLeaderboard';
import StudentProfile from './pages/StudentProfile';
import Chatbot from './pages/Chatbot';
import StudentOfflineDownloads from './pages/StudentOfflineDownloads';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
    return (
        <AuthProvider>
            <Router>
                <OfflineIndicator />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/student-showcase" element={<StudentShowcase />} />
                    <Route path="/teacher-showcase" element={<TeacherShowcase />} />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <ManageUsers />
                            </ProtectedRoute>
                        }
                    />

                    {/* Teacher Routes */}
                    <Route
                        path="/teacher"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teacher/materials"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherMaterials />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teacher/students"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherManageStudents />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teacher/courses"
                        element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <TeacherCourses />
                            </ProtectedRoute>
                        }
                    />

                    {/* Student Routes */}
                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/materials"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentMaterials />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/courses"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentCourses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/courses/:courseId"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentCourseDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/knowledge-map"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentKnowledgeMap />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/revisions"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentRevisions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/progress"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentProgress />
                            </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/student/chatbot"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <Chatbot />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/leaderboard"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentLeaderboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/profile"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student/offline-downloads"
                        element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentOfflineDownloads />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
