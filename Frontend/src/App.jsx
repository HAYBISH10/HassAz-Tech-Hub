import { Suspense, lazy } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ADMIN_BASE } from "./adminPath";
import Layout from "./components/layout/Layout";
import PageLoader from "./components/ui/PageLoader";
import { ApplicationWindowProvider } from "./context/ApplicationWindowContext";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import Apply from "./pages/Apply";
import Community from "./pages/Community";
import Corporate from "./pages/Corporate";
import CourseCategory from "./pages/CourseCategory";
import CourseProgram from "./pages/CourseProgram";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import VerifyConfirm from "./pages/VerifyConfirm";

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminApplications = lazy(() => import("./pages/AdminApplications"));
const AdminApplicants = lazy(() => import("./pages/AdminApplicants"));
const AdminCalls = lazy(() => import("./pages/AdminCalls"));
const AdminGraduates = lazy(() => import("./pages/AdminGraduates"));
const AdminContacts = lazy(() => import("./pages/AdminContacts"));
const AdminBroadcast = lazy(() => import("./pages/AdminBroadcast"));
const AdminVisitors = lazy(() => import("./pages/AdminVisitors"));
const AdminIntakes = lazy(() => import("./pages/AdminIntakes"));
const AdminDatabase = lazy(() => import("./pages/AdminDatabase"));

function adminElement(element) {
  return <Suspense fallback={<PageLoader overlay label="Loading..." />}>{element}</Suspense>;
}

export default function App() {
  return (
    <ApplicationWindowProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:categorySlug" element={<CourseCategory />} />
            <Route path="/courses/:categorySlug/:programSlug" element={<CourseProgram />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/register" element={<Navigate to="/apply" replace />} />
            <Route path="/login" element={<Navigate to="/apply" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/apply" replace />} />
            <Route path="/reset-password" element={<Navigate to="/apply" replace />} />
            <Route path="/auth/callback" element={<Navigate to="/apply" replace />} />
            <Route path="/account" element={<Navigate to="/apply" replace />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/confirm/:token" element={<VerifyConfirm />} />
            <Route path="/verify/:certificateId" element={<Verify />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/careers" element={<Careers />} />
            <Route path="/about/faqs" element={<Faqs />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path={`${ADMIN_BASE}/login`} element={adminElement(<AdminLogin />)} />
          <Route path={ADMIN_BASE} element={adminElement(<AdminLayout />)}>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="applicants" element={<AdminApplicants />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="graduates" element={<AdminGraduates />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="intakes" element={<AdminIntakes />} />
            <Route path="database" element={<AdminDatabase />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApplicationWindowProvider>
  );
}

function NotFound() {
  return (
    <section className="px-5 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold text-navy">Page not found</h1>
      <p className="mt-3 text-muted">That address does not exist on HIACDI Tech Hub.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/" className="font-semibold text-gold">
          Home
        </Link>
        </div>
      </section>
  );
}
