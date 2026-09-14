import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ADMIN_BASE } from "./adminPath";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import PageLoader from "./components/ui/PageLoader";
import { ApplicationWindowProvider } from "./context/ApplicationWindowContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import AccountDashboard from "./pages/AccountDashboard";
import AdminContacts from "./pages/AdminContacts";
import AdminBroadcast from "./pages/AdminBroadcast";
import AdminVisitors from "./pages/AdminVisitors";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Faqs from "./pages/Faqs";
import AdminApplicants from "./pages/AdminApplicants";
import AdminApplications from "./pages/AdminApplications";
import AdminCalls from "./pages/AdminCalls";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGraduates from "./pages/AdminGraduates";
import AdminIntakes from "./pages/AdminIntakes";
import AdminLogin from "./pages/AdminLogin";
import Apply from "./pages/Apply";
import Community from "./pages/Community";
import Corporate from "./pages/Corporate";
import CorporateHire from "./pages/CorporateHire";
import CorporatePartner from "./pages/CorporatePartner";
import CorporateTraining from "./pages/CorporateTraining";
import CourseCategory from "./pages/CourseCategory";
import CourseProgram from "./pages/CourseProgram";
import Courses from "./pages/Courses";
import Home from "./pages/Home";
import Verify from "./pages/Verify";

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ApplicationWindowProvider>
      <UserAuthProvider>
      {booting ? <PageLoader label="Please wait..." /> : null}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:categorySlug" element={<CourseCategory />} />
            <Route path="/courses/:categorySlug/:programSlug" element={<CourseProgram />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/account" element={<AccountDashboard />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/careers" element={<Careers />} />
            <Route path="/about/faqs" element={<Faqs />} />
            <Route path="/corporate" element={<Corporate />} />
            <Route path="/corporate/hire" element={<CorporateHire />} />
            <Route path="/corporate/training" element={<CorporateTraining />} />
            <Route path="/corporate/partner" element={<CorporatePartner />} />
            <Route path="/community" element={<Community />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />
          <Route path={ADMIN_BASE} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="applicants" element={<AdminApplicants />} />
            <Route path="calls" element={<AdminCalls />} />
            <Route path="graduates" element={<AdminGraduates />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="broadcast" element={<AdminBroadcast />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="intakes" element={<AdminIntakes />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </UserAuthProvider>
    </ApplicationWindowProvider>
  );
}

function NotFound() {
  return (
    <section className="px-5 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold text-navy">Page not found</h1>
      <p className="mt-3 text-muted">That address does not exist on HassAz Tech Hub.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/" className="font-semibold text-gold">
          Home
        </Link>
        </div>
      </section>
  );
}
