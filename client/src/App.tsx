import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LoginPage from "@/pages/login-page";
import SignupPage from "@/pages/signup-page";
import TrainingPage from "@/pages/training-page";
import CoursesPage from "@/pages/courses-page";
import CourseDetailPage from "@/pages/course-detail-page";
import EnhancedCourseDetailPage from "@/pages/enhanced-course-detail-page";
import TrainingCoursesPage from "@/pages/training-courses-page";
import CertificateCoursesPage from "@/pages/certificate-courses-page";
import ProfessionalDevelopmentPage from "@/pages/professional-development-page";
import SeminarsPage from "@/pages/seminars-page";
import SeminarDetailPage from "@/pages/seminar-detail-page";
import SeminarsListPage from "@/pages/seminars-list-page";
import NoticesPage from "@/pages/notices-page";
import AllAnnouncementsPage from "@/pages/all-announcements-page";
import HelpCenterPage from "@/pages/help-center-page";
import StudyAbroadPage from "@/pages/study-abroad-page";
import TrainingApplicationPage from "@/pages/training-application-page";
import AdminPage from "@/pages/admin-page";
import MyPage from "@/pages/my-page";
import AllTrainingProgramsPage from "@/pages/all-training-programs-page";
import EnhancedAdminPage from "@/pages/enhanced-admin-page";
import BusinessDashboardPage from "@/pages/business-dashboard-page";
import SuperAdminPage from "@/pages/super-admin-page";
import BusinessRegistrationPage from "@/pages/business-registration-page";
import EnhancedHelpCenterPage from "@/pages/enhanced-help-center-page";
import EnhancedNoticePage from "@/pages/enhanced-notice-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/training" component={TrainingPage} />
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/courses/:id" component={EnhancedCourseDetailPage} />
      <ProtectedRoute path="/training-courses" component={TrainingCoursesPage} />
      <ProtectedRoute path="/certificate-courses" component={CertificateCoursesPage} />
      <ProtectedRoute path="/professional-development" component={ProfessionalDevelopmentPage} />
      <ProtectedRoute path="/seminars" component={SeminarsPage} />
      <ProtectedRoute path="/seminars/:id" component={SeminarDetailPage} />
      <ProtectedRoute path="/notices" component={NoticesPage} />
      <ProtectedRoute path="/announcements" component={AllAnnouncementsPage} />
      <ProtectedRoute path="/help" component={HelpCenterPage} />
      <ProtectedRoute path="/study-abroad" component={StudyAbroadPage} />
      <ProtectedRoute path="/training-application" component={TrainingApplicationPage} />
      <ProtectedRoute path="/all-training-programs" component={AllTrainingProgramsPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/enhanced-admin" component={EnhancedAdminPage} />
      <ProtectedRoute path="/business-dashboard" component={BusinessDashboardPage} />
      <ProtectedRoute path="/super-admin" component={SuperAdminPage} />
      <ProtectedRoute path="/enhanced-help" component={EnhancedHelpCenterPage} />
      <ProtectedRoute path="/enhanced-notice" component={EnhancedNoticePage} />
      <ProtectedRoute path="/mypage" component={MyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
