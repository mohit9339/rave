import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getEventById, getEventFeatures } from "../services/eventService";
import { joinEvent, getAttendees } from "../services/attendeeService";
import { createTicket, hasTicket } from "../../tickets/services/ticketService";
import { submitPayment, hasSubmittedPayment } from "../../payments/services/paymentService";
import raveQr from "../../../assets/payment/rave-qr.jpeg";
import useMobile from "../../../hooks/useMobile";

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobile();

  const [event, setEvent] = useState(null);
  const [features, setFeatures] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [user, setUser] = useState(null);
  const [joined, setJoined] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState(false);
  const [utr, setUtr] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | "pending" | "approved" | "rejected"
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      // Fetch everything in parallel
      const userFetches = user
        ? Promise.all([
            supabase.from("users").select("*").eq("id", user.id).single(),
            hasTicket(user.id, id),
            hasSubmittedPayment(user.id, id),
          ])
        : Promise.resolve([null, null, null]);

      const [
        [eventResult, featureResult, attendeeResult],
        [profileRes, ticketRes, paymentRes],
      ] = await Promise.all([
        Promise.all([getEventById(id), getEventFeatures(id), getAttendees(id)]),
        userFetches,
      ]);

      if (profileRes?.data) setProfile(profileRes.data);
      if (ticketRes?.data) setHasPurchased(true);
      if (paymentRes?.data) {
        setPaymentStatus(paymentRes.data.status);
        setPaymentSubmitted(true);
      }

      if (eventResult.data) setEvent(eventResult.data);
      if (featureResult.data) setFeatures(featureResult.data);

      if (attendeeResult.data) {
        setAttendees(attendeeResult.data);

        if (eventResult.data && attendeeResult.data.length >= eventResult.data.capacity) {
          setIsFull(true);
        }

        if (user) {
          const alreadyJoined = attendeeResult.data.some(
            (a) => a.user_id === user.id
          );
          setJoined(alreadyJoined);
        }
      }

      setLoading(false);
    }

    loadPage();
  }, [id]);

  async function handleJoinEvent() {
    // FIX: auth check first, before any profile access
    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (joined) { alert("Already joined"); return; }
    if (isFull) { alert("This event is full"); return; }

    if (event.minimum_age > 0) {
      if (!profile?.date_of_birth) {
        alert("Please complete your profile before joining age-restricted events.");
        return;
      }

      const age = calculateAge(profile.date_of_birth);

      if (age < event.minimum_age) {
        alert(`This event requires attendees to be ${event.minimum_age}+ years old.`);
        return;
      }
    }

    setJoiningEvent(true);
    const { error } = await joinEvent(id, user.id);
    setJoiningEvent(false);

    if (error) { alert(error.message); return; }

    setJoined(true);

    const attendeeResult = await getAttendees(id);
    if (attendeeResult.data) setAttendees(attendeeResult.data);

    alert("Joined Event!");
  }

  async function handleBuyTicket() {
    if (!user) { alert("Please login"); navigate("/login"); return; }
    if (hasPurchased) { alert("Ticket already purchased"); return; }

    const ticketCode = crypto.randomUUID();

    const { error } = await createTicket({
      user_id: user.id,
      event_id: id,
      payment_status: "paid",
      ticket_code: ticketCode,
    });

    if (error) { alert(error.message); return; }

    setHasPurchased(true);
    alert("Ticket Purchased!");
  }

  async function handleSubmitPayment() {
    // FIX: auth check with redirect
    if (!user) {
      alert("Please login to complete payment");
      navigate("/login");
      return;
    }

    if (!utr.trim()) {
      alert("Please enter UTR number");
      return;
    }

    // Guard: prevent duplicate submission
    const existing = await hasSubmittedPayment(user.id, id);
    if (existing.data) {
      setPaymentStatus(existing.data.status);
      setPaymentSubmitted(true);
      alert("You have already submitted a payment for this event.");
      return;
    }

    setSubmittingPayment(true);

    const { error } = await submitPayment({
      user_id: user.id,
      event_id: id,
      utr,
      amount: event.price,
    });

    setSubmittingPayment(false);

    if (error) { alert(error.message); return; }

    setPaymentStatus("pending");
    setPaymentSubmitted(true);
    alert("Payment submitted for verification.");
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading...</h2>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "40px" }}>Event Not Found</h2>
      </>
    );
  }

  // Renders the right-panel action section based on event type and user state
  function renderActionPanel() {
    // Paid event flow
    if (event.price > 0) {
      // User has been approved / joined after payment
      if (joined) {
        return (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "16px",
              background: "#1E2A00",
              color: "#C7FF41",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            You have joined this event
          </div>
        );
      }

      // Payment was rejected — let them try again
      if (paymentStatus === "rejected") {
        return (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "#4b1d1d",
                color: "#ff6b6b",
                marginBottom: "12px",
                fontWeight: "600",
              }}
            >
              Payment rejected by host
            </div>
            <button
              onClick={() => {
                setPaymentSubmitted(false);
                setPaymentStatus(null);
                setUtr("");
              }}
              style={{
                width: "100%",
                height: "56px",
                border: "none",
                borderRadius: "16px",
                background: "#C7FF41",
                color: "#000",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        );
      }

      // Payment pending approval
      if (paymentSubmitted) {
        return (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "16px",
              background: "#1E2A00",
              color: "#C7FF41",
            }}
          >
            Payment submitted. Awaiting host approval.
          </div>
        );
      }

      // FIX: not logged in — show login prompt instead of payment form
      if (!user) {
        return (
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              height: "60px",
              border: "none",
              borderRadius: "16px",
              background: "#C7FF41",
              color: "#000",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Login to Purchase
          </button>
        );
      }

      // FIX: event full — show disabled state instead of payment form
      if (isFull) {
        return (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "16px",
              background: "#1A1A1A",
              color: "#9CA3AF",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Event Full
          </div>
        );
      }

      // Show payment form
      return (
        <div style={{ marginTop: "20px" }}>
          <p>Pay ₹{event.price}</p>
          <p>UPI ID: ravepayments@ybl</p>

          <button
            onClick={() => setShowQr(true)}
            style={{
              background: "none",
              border: "1px solid #232323",
              color: "#C7FF41",
              padding: "8px 14px",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "13px",
              marginTop: "8px",
            }}
          >
            Show QR Code
          </button>

          <input
            type="text"
            placeholder="Enter UTR Number"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #232323",
              background: "#0F0F0F",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={handleSubmitPayment}
            disabled={submittingPayment}
            style={{
              width: "100%",
              height: "56px",
              border: "none",
              borderRadius: "16px",
              background: "#C7FF41",
              color: "#000",
              fontWeight: "700",
              marginTop: "12px",
              cursor: submittingPayment ? "not-allowed" : "pointer",
              opacity: submittingPayment ? 0.7 : 1,
            }}
          >
            {submittingPayment ? "Submitting..." : "Submit Payment"}
          </button>
        </div>
      );
    }

    // Free event flow
    return (
      <button
        onClick={handleJoinEvent}
        disabled={joined || isFull || joiningEvent}
        style={{
          width: "100%",
          height: "60px",
          border: "none",
          borderRadius: "16px",
          background: joined || isFull ? "#666" : "#C7FF41",
          color: "#000",
          fontWeight: "700",
          fontSize: "18px",
          cursor: joined || isFull || joiningEvent ? "not-allowed" : "pointer",
          marginTop: "20px",
          opacity: joiningEvent ? 0.7 : 1,
        }}
      >
        {joiningEvent ? "Joining..." : isFull ? "Event Full" : joined ? "Already Joined" : "Join Event"}
      </button>
    );
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1200px",
        margin: isMobile
          ? "20px auto"
          : "40px auto",
        padding: isMobile
          ? "16px"
          : "20px", }}>

        {/* Cover Image */}
        <div
          style={{
            width: "100%",
            height: isMobile
              ? "240px"
              : "500px",
            borderRadius: "32px",
            overflow: "hidden",
            marginBottom: "40px",
            background: "#141414",
          }}
        >
          {event.cover_image ? (
            <img
              src={event.cover_image}
              alt={event.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              No Cover Image
            </div>
          )}
        </div>

        {/* Age Badge */}
        {event.minimum_age > 0 && (
          <div
            style={{
              display: "inline-block",
              background: "#1E2A00",
              color: "#C7FF41",
              padding: "8px 16px",
              borderRadius: "999px",
              marginBottom: "20px",
            }}
          >
            {event.minimum_age}+
          </div>
        )}

        <h1 style={{ fontSize: isMobile  ? "38px"  : "64px", lineHeight: "1", marginBottom: "20px" }}>
          {event.title}
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile
              ? "12px"
              : "30px",
            flexWrap: "wrap",
            marginBottom: "30px",
            color: "#9CA3AF",
          }}
        >
          <span>📍 {event.area}, {event.city}</span>
          <span>📅 {event.event_date}</span>
          <span>🕒 {event.start_time}{event.end_time ? ` - ${event.end_time}` : ""}</span>
          <span>💰 {event.price > 0 ? `₹${event.price}` : "Free"}</span>
        </div>

        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            ggridTemplateColumns:
            isMobile
              ? "1fr"
              : "2fr 1fr",
            gap: "40px",
          }}
        >
          {/* Left: About + Features */}
          <div>
            <h2>About Event</h2>
            <p style={{ color: "#9CA3AF", lineHeight: "1.8" }}>
              {event.description}
            </p>

            <h2 style={{ marginTop: "50px" }}>Features</h2>
            {features.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No features listed.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    style={{
                      background: "#171717",
                      border: "1px solid #232323",
                      padding: isMobile  ? "8px 12px"  : "10px 16px",
                      borderRadius: "999px",
                    }}
                  >
                    ✓ {feature.feature_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sticky Info Card */}
          <div>
            <div
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "24px",
                padding: "24px",
                position:
                isMobile
                  ? "static"
                  : "sticky",

              top:
                isMobile
                  ? "auto"
                  : "100px",
              }}
            >
              <h2>Event Info</h2>
              <p>👥 Capacity: {event.capacity}</p>
              <p>🎟 Joined: {attendees.length}</p>
              <p>Seats Left: {Math.max(0, event.capacity - attendees.length)}</p>

              {renderActionPanel()}
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "24px",
              padding: isMobile  ? "20px"  : "32px",
              textAlign: "center",
              maxWidth: "340px",
              width: "90%",
            }}
          >
            <h3 style={{ marginBottom: "8px" }}>Scan to Pay</h3>
            <p style={{ color: "#9CA3AF", marginBottom: "20px", fontSize: "14px" }}>
              UPI ID: ravepayments@ybl
            </p>

            <img
              src={raveQr}
              alt="RAVE Payment QR"
              style={{
                width: "100%",
                borderRadius: "16px",
              }}
            />

            <button
              onClick={() => setShowQr(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                height: "48px",
                background: "#1A1A1A",
                border: "1px solid #232323",
                borderRadius: "999px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}