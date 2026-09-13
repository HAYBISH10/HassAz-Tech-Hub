import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BookingModal from "../booking/BookingModal";
import ApplicationDeadlineBar from "./ApplicationDeadlineBar";
import CorporateNavbar from "./CorporateNavbar";
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
  const { pathname } = useLocation();
  const isCorporate = pathname === "/corporate" || pathname.startsWith("/corporate/");

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-white pb-14 sm:pb-11">
      <TopBar />
      {isCorporate ? (
        <CorporateNavbar onSearch={() => setSearchOpen(true)} />
      ) : (
        <Navbar onSearch={() => setSearchOpen(true)} onBook={openBooking} />
      )}
      <main className="w-full flex-1">
        <Outlet context={{ onBook: openBooking }} />
      </main>
      <VisitTracker />
      <Footer />
      <HassAzChat />
      {isCorporate ? null : <ApplicationDeadlineBar />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
