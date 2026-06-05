import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getEventById } from "../../events/services/eventService";
import { getEventAttendees } from "../../events/services/attendeeService";
import { getCheckedInTickets } from "../../tickets/services/ticketService";

function calculateAge(dob) {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default function EventAttendees() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [checkedInIds, setCheckedInIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // "all" | "checkedin" | "pending"

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const eventResult = await getEventById(id);

      if (!eventResult.data) {
        alert("Event not found");
        navigate("/host-dashboard");
        return;
      }

      if (eventResult.data.host_id !== user?.id) {
        alert("Unauthorized");
        navigate("/");
        return;
      }

      setEvent(eventResult.data);

      const [attendeeResult, checkedInResult] = await Promise.all([
        getEventAttendees(id),
        getCheckedInTickets(id),
      ]);

      if (attendeeResult.data) setAttendees(attendeeResult.data);

      if (checkedInResult.data) {
        setCheckedInIds(new Set(checkedInResult.data.map((t) => t.user_id)));
      }

      setLoading(false);
    }

    load();
  }, [id, navigate]);

  const filteredAttendees =
    tab === "checkedin"
      ? attendees.filter((a) => checkedInIds.has(a.user_id))
      : tab === "pending"
      ? attendees.filter((a) => !checkedInIds.has(a.user_id))
      : attendees;

  const pillStyle = {
    background: "#1A1A1A",
    border: "1px solid #232323",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "13px",
  };

  const tabStyle = (active) => ({
    padding: "10px 20px",
    borderRadius: "999px",
    border: "1px solid #232323",
    background: active ? "#C7FF41" : "#141414",
    color: active ? "#000" : "#fff",
    cursor: "pointer",
    fontWeight: active ? "700" : "400",
  });

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>

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
            Host · Attendees
          </p>

          <h1
            style={{
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            {loading ? "Loading..." : event?.title}
          </h1>

          {event && (
            <p style={{ color: "#9CA3AF" }}>
              {event.event_date} · {event.city}
            </p>
          )}
        </div>

        {!loading && (
          <>
            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "40px",
              }}
            >
              {[
                { label: "Total Joined", value: attendees.length, color: "#fff" },
                { label: "Checked In", value: checkedInIds.size, color: "#C7FF41" },
                { label: "Not Yet", value: attendees.length - checkedInIds.size, color: "#9CA3AF" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    background: "#141414",
                    border: "1px solid #232323",
                    borderRadius: "20px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <h2 style={{ color, margin: "0 0 6px" }}>{value}</h2>
                  <p style={{ color: "#9CA3AF", margin: 0, fontSize: "14px" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
              <button style={tabStyle(tab === "all")} onClick={() => setTab("all")}>
                All ({attendees.length})
              </button>
              <button style={tabStyle(tab === "checkedin")} onClick={() => setTab("checkedin")}>
                ✓ Checked In ({checkedInIds.size})
              </button>
              <button style={tabStyle(tab === "pending")} onClick={() => setTab("pending")}>
                Pending ({attendees.length - checkedInIds.size})
              </button>
            </div>

            {/* Attendee List */}
            {filteredAttendees.length === 0 ? (
              <p style={{ color: "#9CA3AF" }}>No attendees in this category.</p>
            ) : (
              filteredAttendees.map((attendee) => {
                const isCheckedIn = checkedInIds.has(attendee.user_id);
                return (
                  <div
                    key={attendee.id}
                    style={{
                      background: "#141414",
                      border: `1px solid ${isCheckedIn ? "#2a3d00" : "#232323"}`,
                      borderRadius: "20px",
                      padding: "20px",
                      marginBottom: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 4px" }}>
                        {attendee.users?.full_name}
                      </h3>
                      <p style={{ color: "#9CA3AF", margin: "0 0 10px", fontSize: "14px" }}>
                        {attendee.users?.email}
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <div style={pillStyle}>{attendee.users?.sex}</div>
                        <div style={pillStyle}>
                          {calculateAge(attendee.users?.date_of_birth)} yrs
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: isCheckedIn ? "#1E2A00" : "#1A1A1A",
                        color: isCheckedIn ? "#C7FF41" : "#9CA3AF",
                        border: `1px solid ${isCheckedIn ? "#C7FF41" : "#232323"}`,
                      }}
                    >
                      {isCheckedIn ? "✓ Checked In" : "Not Yet"}
                    </div>
                  </div>
                );
              })
            )}

            {/* Back button */}
            <button
              onClick={() => navigate(`/host-event/${id}`)}
              style={{
                marginTop: "40px",
                width: "100%",
                height: "52px",
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "16px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              ← Back to Event
            </button>
          </>
        )}
      </div>
    </>
  );
}