import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { WorkerLayout } from './layouts/WorkerLayout';
import { OrganisationLayout } from './layouts/OrganisationLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportAnimalPage } from './pages/citizen/ReportAnimalPage';
import { MyReportsPage } from './pages/citizen/MyReportsPage';
import { ReportDetailsPage } from './pages/citizen/ReportDetailsPage';
import { AssistedReportingPage } from './pages/citizen/AssistedReportingPage';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { AvailableTasksPage } from './pages/worker/AvailableTasksPage';
import { TaskDetailsPage } from './pages/worker/TaskDetailsPage';
import { MyTasksPage } from './pages/worker/MyTasksPage';
import { EarningsPage } from './pages/worker/EarningsPage';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';
import { TrainingVerificationPage } from './pages/worker/TrainingVerificationPage';

// Organisation Pages
import { OrgDashboard } from './pages/org/OrgDashboard';
import { ManageReportsPage } from './pages/org/ManageReportsPage';
import { InteractiveMapPage } from './pages/org/InteractiveMapPage';
import { ManageTasksPage } from './pages/org/ManageTasksPage';
import { ReviewCompletionPage } from './pages/org/ReviewCompletionPage';
import { PaymentManagementPage } from './pages/org/PaymentManagementPage';
import { WorkerManagementPage } from './pages/org/WorkerManagementPage';
import { ImpactAnalyticsPage } from './pages/org/ImpactAnalyticsPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LanguageProvider } from './i18n/LanguageContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. PUBLIC ROUTES (Freely Accessible) */}
                <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* 2. CITIZEN ROUTES (Protected) */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CitizenDashboard />} />
                <Route path="report" element={<ReportAnimalPage />} />
                <Route path="reports" element={<MyReportsPage />} />
                <Route path="reports/:id" element={<ReportDetailsPage />} />
                <Route path="assisted-help" element={<AssistedReportingPage />} />
              </Route>

              {/* 3. WORKER ROUTES (Protected) */}
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<WorkerDashboard />} />
                <Route path="tasks" element={<AvailableTasksPage />} />
                <Route path="tasks/:id" element={<TaskDetailsPage />} />
                <Route path="my-tasks" element={<MyTasksPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="profile" element={<WorkerProfilePage />} />
                <Route path="training" element={<TrainingVerificationPage />} />
              </Route>

              {/* 4. ORGANISATION ROUTES (Protected) */}
              <Route
                path="/org"
                element={
                  <ProtectedRoute allowedRoles={['organisation']}>
                    <OrganisationLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OrgDashboard />} />
                <Route path="reports" element={<ManageReportsPage />} />
                <Route path="map" element={<InteractiveMapPage />} />
                <Route path="tasks" element={<ManageTasksPage />} />
                <Route path="review-completion" element={<ReviewCompletionPage />} />
                <Route path="payments" element={<PaymentManagementPage />} />
                <Route path="workers" element={<WorkerManagementPage />} />
                <Route path="analytics" element={<ImpactAnalyticsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);
};

export default App;
