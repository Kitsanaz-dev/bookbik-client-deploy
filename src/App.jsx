import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import BusinessDetail from "./pages/BusinessDetail";
import BookingHistory from "./pages/BookingHistory";
import BookingConfirmation from "./pages/BookingConfirmation";
import Favorites from "./pages/Favorites";

import RoomDetail from "./pages/RoomDetail";

import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Payment and Login pages - no layout/nav/footer */}
              <Route path="/payment" element={<Payment />} />
              <Route path="/login" element={<Login />} />
                <Route path="booking-confirmation/:id" element={<BookingConfirmation />} /> 
              
              {/* All other pages with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="booking/:id" element={<Booking />} />
                <Route path="business/:id" element={<BusinessDetail />} />
                <Route path="my-bookings" element={<BookingHistory />} />
                <Route path="favorites" element={<Favorites />} />

                <Route path="room/:id" element={<RoomDetail />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
