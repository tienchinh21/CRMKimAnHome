import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/layout/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import ProjectsList from "@/pages/projects";
import CreateProject from "@/pages/projects/CreateProject";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import ApartmentsList from "@/pages/apartments";
import CreateApartment from "@/pages/apartments/CreateApartment";
import ApartmentDetail from "@/pages/apartments/ApartmentDetail";
import EditApartment from "@/pages/apartments/EditApartment";
import BlogList from "@/pages/blog";
import BlogCreate from "@/pages/blog/BlogCreate";
import BlogCategoriesList from "@/pages/blog/BlogCategoriesList";
import SystemConfig from "@/pages/system-config/SystemConfig";
import UserManagement from "@/pages/users";
import TeamManagement from "@/pages/teams";
import TeamDashboard from "@/pages/teams/dashboard";
import CustomerManagement from "@/pages/customers";
import DealManagement from "@/pages/deals";
import PayrollManagement from "@/pages/payrolls";
import BonusManagement from "@/pages/bonuses";
import NotFound from "@/pages/NotFound";
import PublicRoute from "./components/auth/PublicRoute";
import RoleDebugger from "@/components/debug/RoleDebugger";
function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes - only accessible when NOT logged in */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route
                path="login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
            </Route>

            {/* Main app routes - only accessible when logged in */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/new" element={<CreateProject />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="apartments" element={<ApartmentsList />} />
              <Route path="apartments/new" element={<CreateApartment />} />
              <Route path="apartments/:id" element={<ApartmentDetail />} />
              <Route path="apartments/:id/edit" element={<EditApartment />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/new" element={<BlogCreate />} />
              <Route path="blog-categories" element={<BlogCategoriesList />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="teams" element={<TeamManagement />} />
              <Route
                path="teams/:teamId/dashboard"
                element={<TeamDashboard />}
              />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="deals" element={<DealManagement />} />
              <Route path="payrolls" element={<PayrollManagement />} />
              <Route path="bonuses" element={<BonusManagement />} />
              <Route path="system-config" element={<SystemConfig />} />
            </Route>

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" richColors />
          <RoleDebugger />
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
