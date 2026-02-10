import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "./ui/AppLayout";
import FAQ from "./pages/FAQ";
import Services from "./pages/Services";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Login from "./pages/Login"

import Gallery from "./pages/Gallery";
import Partner from "./pages/Partner";
import News from "./pages/News";

import Certificate from "./pages/Certificate";
import Counter from "./pages/Counter";
import Testimonial from "./pages/Testimonial";
import ModalExamples from "./pages/ModalExamples";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* <Route index element={<Navigate replace to="/" />} /> */}
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
          <Route path="/admin/login" element={<Login />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


