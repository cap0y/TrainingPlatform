import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/contexts/cart-context";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
// import LoginPage from "@/pages/login-page";
// import SignupPage from "@/pages/signup-page";
import TrainingPage from "@/pages/training-page";
import CoursesPage from "@/pages/courses-page";
import EnhancedCourseDetailPage from "@/pages/enhanced-course-detail-page";
import TrainingCoursesPage from "@/pages/training-courses-page";
import CertificateCoursesPage from "@/pages/certificate-courses-page";
import ProfessionalDevelopmentPage from "@/pages/professional-development-page";
import SeminarsPage from "@/pages/seminars-page";
import SeminarDetailPage from "@/pages/seminar-detail-page";
import NoticesPage from "@/pages/notices-page";
import AllAnnouncementsPage from "@/pages/all-announcements-page";
import HelpCenterPage from "@/pages/help-center-page";
import StudyAbroadPage from "@/pages/study-abroad-page";
import StudyAbroadListPage from "@/pages/study-abroad-list-page";
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
      <Route path="/login" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/courses/:id" component={EnhancedCourseDetailPage} />
      <Route path="/training-courses" component={TrainingCoursesPage} />
      <Route path="/certificate-courses" component={CertificateCoursesPage} />
      <Route
        path="/professional-development"
        component={ProfessionalDevelopmentPage}
      />
      <Route path="/seminars" component={SeminarsPage} />
      <Route path="/seminars/:id" component={SeminarDetailPage} />
      <Route path="/notices" component={NoticesPage} />
      <Route path="/announcements" component={AllAnnouncementsPage} />
      <Route path="/help" component={HelpCenterPage} />
      <Route path="/study-abroad" component={StudyAbroadListPage} />
      <Route path="/study-abroad/:id" component={StudyAbroadPage} />
      <ProtectedRoute
        path="/training-application"
        component={() => <TrainingApplicationPage />}
      />
      <ProtectedRoute
        path="/all-training-programs"
        component={() => <AllTrainingProgramsPage />}
      />
      <ProtectedRoute path="/admin" component={() => <AdminPage />} />
      <ProtectedRoute
        path="/enhanced-admin"
        component={() => <EnhancedAdminPage />}
      />
      <ProtectedRoute
        path="/business-dashboard"
        component={() => <BusinessDashboardPage />}
      />
      <ProtectedRoute
        path="/super-admin"
        component={() => <SuperAdminPage />}
      />
      <ProtectedRoute
        path="/enhanced-help"
        component={() => <EnhancedHelpCenterPage />}
      />
      <ProtectedRoute path="/enhanced-notice" component={EnhancedNoticePage} />
      <ProtectedRoute path="/mypage" component={MyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
