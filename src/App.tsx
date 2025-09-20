import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/layout/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import ProjectsList from "@/pages/projects/ProjectsList";
import CreateProject from "@/pages/projects/CreateProject";
import ProjectDetail from "@/pages/projects/ProjectDetail";
import ApartmentsList from "@/pages/apartments/ApartmentsList";
import CreateApartment from "@/pages/apartments/CreateApartment";
import ApartmentDetail from "@/pages/apartments/ApartmentDetail";
import EditApartment from "@/pages/apartments/EditApartment";
import BlogList from "@/pages/blog/BlogList";
import BlogCreate from "@/pages/blog/BlogCreate";
import BlogCategoriesList from "@/pages/blog/BlogCategoriesList";
import SystemConfig from "@/pages/system-config/SystemConfig";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes - with simple layout */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main app routes - with main layout */}
        <Route path="/" element={<Layout />}>
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
          <Route path="system-config" element={<SystemConfig />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
