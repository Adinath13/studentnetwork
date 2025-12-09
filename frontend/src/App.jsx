import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import GalleryPage from './pages/GalleryPage';
import NewsPage from './pages/NewsPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';

// Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TPODashboard from './pages/TPODashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import JobsPage from './pages/JobsPage';
import DonationPage from './pages/DonationPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MentorshipPage from './pages/MentorshipPage';
import MessagingPage from './pages/MessagingPage';
import CareerResourcesPage from './pages/CareerResourcesPage';
import AdminMentorManagement from './pages/AdminMentorManagement';
import MentorDashboard from './pages/MentorDashboard';
import MentorApplicationForm from './components/MentorApplicationForm';
import MessageManagement from './pages/MessageManagement';
import UserManagement from './pages/UserManagement';

function App() {
    return (
        <ToastProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/landing" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                        <Route path="/registration-success" element={<RegistrationSuccessPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/success-stories" element={<SuccessStoriesPage />} />
                        <Route path="/career-resources" element={<CareerResourcesPage />} />

                        {/* Protected Routes - Admin & TPO */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'tpo']} />}>
                            <Route path="/admin/mentors" element={<AdminMentorManagement />} />
                            <Route path="/message-management" element={<MessageManagement />} />
                        </Route>

                        {/* Protected Routes - Admin Only */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                        </Route>

                        {/* Protected Routes - Alumni */}
                        <Route element={<ProtectedRoute allowedRoles={['alumni']} />}>
                            <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
                            <Route path="/become-mentor" element={<MentorApplicationForm />} />
                            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
                        </Route>

                        {/* Protected Routes - Student */}
                        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                            <Route path="/student-dashboard" element={<StudentDashboard />} />
                        </Route>

                        {/* Protected Routes - TPO */}
                        <Route element={<ProtectedRoute allowedRoles={['tpo']} />}>
                            <Route path="/tpo-dashboard" element={<TPODashboard />} />
                        </Route>

                        {/* Protected Routes - All Authenticated Users */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'alumni', 'student', 'tpo']} />}>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/directory" element={<AlumniDirectory />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/donations" element={<DonationPage />} />
                            <Route path="/announcements" element={<AnnouncementsPage />} />
                            <Route path="/mentorship" element={<MentorshipPage />} />
                            <Route path="/messages" element={<MessagingPage />} />
                            <Route path="/messaging" element={<MessagingPage />} /> {/* Redirect alias */}
                        </Route>
                    </Routes>
                </Layout>
            </Router>
        </ToastProvider>
    );
}

export default App;

