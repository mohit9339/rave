import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import {
  getEventById,
  cancelEvent,
  restoreEvent,
  duplicateEvent,
} from "../../events/services/eventService";
import { getEventAttendees, joinEvent } from "../../events/services/attendeeService";
import { getEventPayments, updatePaymentStatus } from "../../payments/services/paymentService";
import { createTicket, hasTicket, getCheckedInTickets } from "../../tickets/services/ticketService";
import useMobile from "../../../hooks/useMobile";

function calculateAge(dob) {
  if (!dob) return "N/A";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function HostEventDetails() {
  const { id } = useParams();
  const isMobile = useMobile();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [checkedInTickets, setCheckedInTickets] = useState([]);

  useEffect(() => {
    async function loadPage() {
      const eventResult = await getEventById(id);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (eventResult.data && eventResult.data.host_id !== user?.id) {
        alert("Unauthorized");
        window.location.href = "/";
        return;
      }

      const [attendeeResult, paymentResult, checkedInResult] = await Promise.all([
        getEventAttendees(id),
        getEventPayments(id),
        getCheckedInTickets(id),
      ]);

      if (eventResult.data) setEvent(eventResult.data);
      if (attendeeResult.data) setAttendees(attendeeResult.data);
      if (paymentResult.data) setPayments(paymentResult.data);
      if (checkedInResult.data) setCheckedInTickets(checkedInResult.data);
    }

    loadPage();
  }, [id]);

  if (!event) {
    return (
      <>
        <Navbar />
        <p>Loading...</p>
      </>
    );
  }

  const maleCount = attendees.filter((a) => a.users?.sex === "Male").length;
  const femaleCount = attendees.filter((a) => a.users?.sex === "Female").length;
  const seatsLeft = event.capacity - attendees.length;
  const fillRate =
    event.capacity > 0 ? Math.round((attendees.length / event.capacity) * 100) : 0;

  async function handleCancel() {
    const confirmed = window.confirm("Cancel this event?");
    if (!confirmed) return;

    const { error } = await cancelEvent(event.id);
    if (error) { alert(error.message); return; }

    alert("Event cancelled");
    window.location.reload();
  }

  async function handleRestore() {
    const { error } = await restoreEvent(event.id);
    if (error) { alert(error.message); return; }

    alert("Event restored");
    window.location.reload();
  }

  async function handleDuplicate() {
    const { error } = await duplicateEvent(event);
    if (error) { alert(error.message); return; }

    alert("Event duplicated");
  }

  async function handleApprove(payment) {
    // Guard: check for existing ticket
    const ticketCheck = await hasTicket(payment.user_id, payment.event_id);
    if (ticketCheck.data) {
      alert("This user already has a ticket.");
      await updatePaymentStatus(payment.id, "approved");
      setPayments(payments.map((p) => p.id === payment.id ? { ...p, status: "approved" } : p));
      return;
    }

    // Guard: check for existing attendee row
    const alreadyJoined = attendees.some((a) => a.user_id === payment.user_id);
    if (alreadyJoined) {
      alert("This user is already an attendee.");
      await updatePaymentStatus(payment.id, "approved");
      setPayments(payments.map((p) => p.id === payment.id ? { ...p, status: "approved" } : p));
      return;
    }

    const ticketCode = crypto.randomUUID();

    await joinEvent(payment.event_id, payment.user_id);

    await createTicket({
      user_id: payment.user_id,
      event_id: payment.event_id,
      payment_status: "paid",
      ticket_code: ticketCode,
    });

    await updatePaymentStatus(payment.id, "approved");

    setPayments(payments.map((p) =>
      p.id === payment.id ? { ...p, status: "approved" } : p
    ));

    alert("Payment Approved");
  }

  async function handleReject(payment) {
    await updatePaymentStatus(payment.id, "rejected");

    setPayments(payments.map((p) =>
      p.id === payment.id ? { ...p, status: "rejected" } : p
    ));

    alert("Payment Rejected");
  }

  const cardStyle = {
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "24px",
    padding:
    isMobile
      ? "18px"
      : "30px",
    textAlign: "center",
  };

  const pillStyle = {
    background: "#1A1A1A",
    border: "1px solid #232323",
    padding: "8px 12px",
    borderRadius: "999px",
  };

  const btnBase = {
    border: "none",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: "600",
  };

  const statusColor = {
    pending: { background: "#2A2000", color: "#FFD966" },
    approved: { background: "#1E2A00", color: "#C7FF41" },
    rejected: { background: "#4b1d1d", color: "#ff6b6b" },
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "1000px",
          margin: isMobile
            ? "20px auto"
            : "40px auto",
        
          padding: isMobile
            ? "16px"
            : "20px",
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: "50px" }}>
          <p
            style={{
              color: "#C7FF41",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Host Event
          </p>

          <h1
            style={{
              fontSize:
              isMobile
                ? "40px"
                : "clamp(50px, 6vw, 90px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            {event.title}
          </h1>

          <p style={{ color: "#9CA3AF" }}>
            {event.event_date} • {event.start_time} - {event.end_time}
          </p>

          <div
            style={{
              marginTop: "20px",
              display: "inline-block",
              background: event.is_cancelled ? "#4b1d1d" : "#1E2A00",
              color: event.is_cancelled ? "#ff6b6b" : "#C7FF41",
              padding: "10px 18px",
              borderRadius: "999px",
            }}
          >
            {event.is_cancelled ? "Cancelled" : "Upcoming"}
          </div>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
            isMobile
              ? "1fr 1fr"
              : "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "50px",
          }}
        >
          <div style={cardStyle}><h2>{event.capacity}</h2><p>Capacity</p></div>
          <div style={cardStyle}><h2>{attendees.length}</h2><p>Joined</p></div>
          <div style={cardStyle}><h2>{seatsLeft}</h2><p>Seats Left</p></div>
          <div style={cardStyle}><h2>{fillRate}%</h2><p>Fill Rate</p></div>
          <div style={cardStyle}><h2>{maleCount}</h2><p>Male</p></div>
          <div style={cardStyle}><h2>{femaleCount}</h2><p>Female</p></div>
          <div style={cardStyle}><h2>{checkedInTickets.length}</h2><p>Checked In</p></div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex",
        flexDirection:
          isMobile
            ? "column"
            : "row",

        gap: "12px", marginBottom: "60px" }}>
          <button
            onClick={() => (window.location.href = `/edit-event/${event.id}`)}
            style={{ ...btnBase, background: "#C7FF41", color: "#000", borderRadius: "999px" }}
          >
            Edit Event
          </button>

          <button
            onClick={handleDuplicate}
            style={{ ...btnBase, background: "#141414", border: "1px solid #232323", color: "#fff", borderRadius: "999px" }}
          >
            Duplicate Event
          </button>

          {event.is_cancelled ? (
            <button
              onClick={handleRestore}
              style={{ ...btnBase, background: "#C7FF41", color: "#000", borderRadius: "999px" }}
            >
              Restore Event
            </button>
          ) : (
            <button
              onClick={handleCancel}
              style={{ ...btnBase, background: "#ff4d4f", color: "white", borderRadius: "999px" }}
            >
              Cancel Event
            </button>
          )}

          <button
            onClick={() => (window.location.href = `/host-checkin/${event.id}`)}
            style={{ ...btnBase, background: "#141414", border: "1px solid #C7FF41", color: "#C7FF41", borderRadius: "999px" }}
          >
            🎟 Scan Tickets
          </button>

          <button
            onClick={() => (window.location.href = `/host-attendees/${event.id}`)}
            style={{ ...btnBase, background: "#141414", border: "1px solid #232323", color: "#fff", borderRadius: "999px" }}
          >
            👥 View Attendees
          </button>
        </div>

        {/* Attendees */}
        <h2 style={{ marginBottom: "20px" }}>Attendees</h2>

        {attendees.length === 0 ? (
          <p>No attendees yet.</p>
        ) : (
          attendees.map((attendee) => (
            <div
              key={attendee.id}
              style={{
                background: "#141414",
                border: "1px solid #232323",
                padding: "20px",
                marginBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <h3>{attendee.users?.full_name}</h3>
              <p>📧 {attendee.users?.email}</p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap",fontSize:  isMobile    ? "13px"    : "14px", marginTop: "15px" }}>
                <div style={pillStyle}>{attendee.users?.sex}</div>
                <div style={pillStyle}>
                  {calculateAge(attendee.users?.date_of_birth)} Years
                </div>
              </div>
            </div>
          ))
        )}

        {/* Payment Requests */}
        <h2 style={{ marginTop: "60px", marginBottom: "20px" }}>Payment Requests</h2>

        {payments.length === 0 ? (
          <p>No payment requests.</p>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "20px",
                padding: "20px",
                marginBottom: "15px",
              }}
            >
              <div style={{ display: "flex",
              flexDirection:
                isMobile
                  ? "column"
                  : "row",

              justifyContent:
                "space-between", 
                alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{payment.users?.full_name}</h3>
                  <p style={{ color: "#9CA3AF", margin: "0 0 4px" }}>{payment.users?.email}</p>
                  <p style={{ margin: "4px 0" }}>UTR: <span style={{ color: "#fff" }}>{payment.utr}</span></p>
                  <p style={{ margin: "4px 0" }}>Amount: <span style={{ color: "#fff" }}>₹{payment.amount}</span></p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                  {/* Status badge */}
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "600",
                      ...(statusColor[payment.status] || statusColor.pending),
                    }}
                  >
                    {payment.status ?? "pending"}
                  </div>

                  {/* Action buttons — only show if still pending */}
                  {(!payment.status || payment.status === "pending") && (
                    <div style={{ display: "flex", display: "flex",

                    flexDirection:
                      isMobile
                        ? "column"
                        : "row",
                    
                    gap: "8px",
                    
                    width:
                      isMobile
                        ? "100%"
                        : "auto", }}>
                      <button
                        onClick={() => handleApprove(payment)}
                        style={{
                          ...btnBase,
                          background: "#C7FF41",
                          color: "#000",
                          borderRadius: "999px",
                          padding: "8px 16px",
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(payment)}
                        style={{
                          ...btnBase,
                          background: "#ff4d4f",
                          color: "#fff",
                          borderRadius: "999px",
                          padding: "8px 16px",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Checked In Guests */}
        <h2 style={{ marginTop: "60px", marginBottom: "20px" }}>
          Checked In Guests
          <span style={{ color: "#9CA3AF", fontSize: "18px", fontWeight: "400", marginLeft: "12px" }}>
            {checkedInTickets.length} / {attendees.length}
          </span>
        </h2>

        {checkedInTickets.length === 0 ? (
          <p>No guests checked in yet.</p>
        ) : (
          checkedInTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                background: "#141414",
                border: "1px solid #232323",
                padding: "20px",
                marginBottom: "12px",
                borderRadius: "20px",
                display: "flex",
                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                justifyContent:
                  "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px" }}>{ticket.users?.full_name}</h3>
                <p style={{ color: "#9CA3AF", margin: 0 }}>{ticket.users?.email}</p>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ ...pillStyle }}>{ticket.users?.sex}</div>
                <div
                  style={{
                    background: "#1E2A00",
                    color: "#C7FF41",
                    border: "1px solid #C7FF41",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  ✓ Checked In
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}