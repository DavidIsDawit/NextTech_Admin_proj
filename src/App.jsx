import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import FAQ from "./pages/FAQ";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Gallery from "./pages/Gallery";
import Partner from "./pages/Partner";
import News from "./pages/News";

import Certificate from "./pages/Certificate";
import Counter from "./pages/Counter";
import Testimonial from "./pages/Testimonial";
import ModalExamples from "./pages/ModalExamples";
import PageNotFound from "./pages/PageNotFound";
import ProfileSetting from "./pages/ProfileSetting";
import ServerError from "./pages/ServerError";

import { Toaster } from "sonner";

// simple wrapper that redirects to login if there is no access token
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// guard that ensures first-time login flow is completed
const RequireFirstTimeCompleted = ({ children }) => {
  const firstTime = (localStorage.getItem("firstTimeLogin") === "true") || (sessionStorage.getItem("firstTimeLogin") === "true");
  // if user is currently on change-password allow it
  const pathname = window.location.pathname;
  if (firstTime && pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }
  return children;
};

import { useEffect } from "react";
import api from "./api/api";

function App() {
  // Proactively check server connectivity on boot.
  // This ensures the user is redirected to the server error page 
  // even on the login page if the server is down.
  useEffect(() => {
    // If we're already on the server-error page, don't ping again
    // (the user will manually retry via the "Try Again" button)
    if (window.location.pathname === "/server-error") return;

    // The interceptor in api.js will handle the redirect if this fails.
    // We use a slightly longer timeout (8s) for this initial check to avoid false redirects on slow networks.
    api.get("/AllNews", { timeout: 8000 }).catch(() => { });
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* always allow login and password reset pages */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/login/Reset_password/:token" element={<ResetPassword />} />
        <Route
          path="/admin/change-password"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />

        {/* protect everything else */}
        <Route
          element={
            <RequireAuth>
              <RequireFirstTimeCompleted>
                <AppLayout />
              </RequireFirstTimeCompleted>
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin/services" element={<Services />} />
          <Route path="/admin/teams" element={<Teams />} />
          <Route path="/admin/projects" element={<Projects />} />
          {/* <Route path="/projects/:id" element={<ProjectDetail />} /> */}
          <Route path="/admin/gallery" element={<Gallery />} />
          <Route path="/admin/news" element={<News />} />
          {/* <Route path="/news/:id" element={<NewsDetail />} /> */}
          <Route path="/admin/faqs" element={<FAQ />} />
          <Route path="/admin/counters" element={<Counter />} />
          <Route path="/admin/testimonials" element={<Testimonial />} />
          <Route path="/admin/partners" element={<Partner />} />
          <Route path="/admin/modalexamples" element={<ModalExamples />} />
          <Route path="/admin/certificates" element={<Certificate />} />
          <Route path="/admin/profile_setting" element={<ProfileSetting />} />
        </Route>

        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


