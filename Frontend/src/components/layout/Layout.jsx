import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useApplicationWindow } from "../../context/ApplicationWindowContext";
import BookingModal from "../booking/BookingModal";
import ApplicationDeadlineBar from "./ApplicationDeadlineBar";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SearchModal from "./SearchModal";
import TopBar from "./TopBar";
import VisitTracker from "./VisitTracker";
import HassAzChat from "./HassAzChat";

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);
  const { isOpen } = useApplicationWindow();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const applyMode = pathname === "/apply";

  useEffect(() => {
    if (searchParams.get("book") !== "1") return;
    setBookingOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("book");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div
      className={`flex min-h-screen w-full flex-col overflow-x-clip bg-white ${
        applyMode ? "pb-0" : isOpen ? "pb-32 sm:pb-28" : "pb-12"
      }`}
    >
      {applyMode ? null : <TopBar />}
      {applyMode ? null : <Navbar onSearch={() => setSearchOpen(true)} onBook={openBooking} />}
      <main className="w-full flex-1">
        <Outlet context={{ onBook: openBooking }} />
      </main>
      <VisitTracker />
      {applyMode ? null : <Footer />}
      <HassAzChat />
      {applyMode ? null : <ApplicationDeadlineBar />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
