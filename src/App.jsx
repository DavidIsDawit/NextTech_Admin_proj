import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import FAQ from "./pages/FAQ";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword";

import Gallery from "./pages/Gallery";
import Partner from "./pages/Partner";
import News from "./pages/News";

import Certificate from "./pages/Certificate";
import Counter from "./pages/Counter";
import Testimonial from "./pages/Testimonial";
import ModalExamples from "./pages/ModalExamples";
import PageNotFound from "./pages/PageNotFound";
import ProfileSetting from "./pages/ProfileSetting";

// simple wrapper that redirects to login if there is no access token
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// guard that ensures first-time login flow is completed
const RequireFirstTimeCompleted = ({ children }) => {
  const firstTime = localStorage.getItem("firstTimeLogin") === "true";
  // if user is currently on change-password allow it
  const pathname = window.location.pathname;
  if (firstTime && pathname !== "/admin/change-password") {
    return <Navigate to="/admin/change-password" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* always allow login and change-password pages */}
        <Route path="/admin/login" element={<Login />} />
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

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


