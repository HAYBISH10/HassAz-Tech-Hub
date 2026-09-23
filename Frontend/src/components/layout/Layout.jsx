import { useState } from "react";
import { Outlet } from "react-router-dom";
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

  return (
    <div
      className={`flex min-h-screen w-full flex-col overflow-x-clip bg-white ${
        isOpen ? "pb-32 sm:pb-28" : "pb-12"
      }`}
    >
      <TopBar />
      <Navbar onSearch={() => setSearchOpen(true)} onBook={openBooking} />
      <main className="w-full flex-1">
        <Outlet context={{ onBook: openBooking }} />
      </main>
      <VisitTracker />
      <Footer />
      <HassAzChat />
      <ApplicationDeadlineBar />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
