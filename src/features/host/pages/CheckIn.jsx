import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getEventById } from "../../events/services/eventService";
import { getTicketByCode, checkInTicket } from "../../tickets/services/ticketService";
import {
  getEventTickets,
} from "../../tickets/services/ticketService";
import useMobile from "../../../hooks/useMobile";

export default function CheckIn() {
  const { id } = useParams(); // event id
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [scanResult, setScanResult] = useState(null); // the looked-up ticket
  const [scanError, setScanError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [tickets, setTickets] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Load event and verify host
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const result = await getEventById(id);

      if (!result.data) {
        alert("Event not found");
        navigate("/host-dashboard");
        return;
      }

      if (result.data.host_id !== user?.id) {
        alert("Unauthorized");
        navigate("/");
        return;
      }

      setEvent(result.data);

      const ticketResult = await getEventTickets(id);
      if (ticketResult.data) {
        setTickets(ticketResult.data);
      }
    }

    load();
  }, [id, navigate]);


  

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      startScanning();
    } catch {
      setCameraError("Camera access denied or not available.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  }

  function startScanning() {
    // Use BarcodeDetector API if available (Chrome/Edge), fallback to manual input
    if (!("BarcodeDetector" in window)) return;

    const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          stopCamera();
          await processQrData(raw);
        }
      } catch {
        // detector may fail on some frames — that's fine
      }
    }, 500);
  }

  async function processQrData(raw) {
    setScanResult(null);
    setScanError(null);
    setCheckedIn(false);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setScanError("Invalid QR code — not a RAVE ticket.");
      return;
    }

    const ticketCode = parsed.ticketCode;
    if (!ticketCode) {
      setScanError("QR code missing ticket code.");
      return;
    }

    // Security: ensure ticket belongs to this event
    if (parsed.eventId !== id) {
      setScanError("This ticket is for a different event.");
      return;
    }

    const { data: ticket, error } = await getTicketByCode(ticketCode);

    if (error || !ticket) {
      setScanError("Ticket not found.");
      return;
    }

    const [{ data: userData }, { data: eventData }] = await Promise.all([
      supabase.from("users").select("*").eq("id", ticket.user_id).single(),
      supabase.from("events").select("*").eq("id", ticket.event_id).single(),
    ]);

    const enriched = { ...ticket, users: userData, events: eventData };

    setScanResult(enriched);
    if (ticket.checked_in) setCheckedIn(true);
  }

  async function handleManualLookup() {
    if (!manualCode.trim()) return;

    setScanResult(null);
    setScanError(null);
    setCheckedIn(false);

    const { data: ticket, error } = await getTicketByCode(manualCode.trim());

    console.log("Ticket lookup result:", { ticket, error, code: manualCode.trim() });

    if (error || !ticket) {
      setScanError(`Ticket not found. Error: ${error?.message || "No data returned"}`);
      setManualCode("");
      return;
    }

    // Security: ticket must belong to this event
    if (ticket.event_id !== id) {
      setScanError("This ticket belongs to a different event.");
      setManualCode("");
      return;
    }

    // Fetch user and event separately
    const [{ data: userData }, { data: eventData }] = await Promise.all([
      supabase.from("users").select("*").eq("id", ticket.user_id).single(),
      supabase.from("events").select("*").eq("id", ticket.event_id).single(),
    ]);

    const enriched = {
      ...ticket,
      users: userData,
      events: eventData,
    };

    setScanResult(enriched);
    if (ticket.checked_in) setCheckedIn(true);
    setManualCode("");
  }

  async function handleCheckIn() {
    if (!scanResult) return;
    setCheckingIn(true);

    const { error } = await checkInTicket(scanResult.id);

    if (error) {
      alert(error.message);
    } else {
      setCheckedIn(true);
      setScanResult((prev) => ({ ...prev, checked_in: true }));

      const ticketResult = await getEventTickets(id);
      if (ticketResult.data) {
        setTickets(ticketResult.data);
      }
    }

    setCheckingIn(false);
  }

  const checkedInGuests = tickets.filter((ticket) => ticket.checked_in);
  const pendingGuests = tickets.filter((ticket) => !ticket.checked_in);

  const pillStyle = {
    background: "#1A1A1A",
    border: "1px solid #232323",
    padding:
    isMobile
      ? "6px 10px"
      : "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth: "800px",
          margin: isMobile ? "20px auto" : "40px auto",
          padding: isMobile ? "16px" : "20px",
        }}
      >

        {/* Hero */}
        <div style={{ marginBottom: "50px" }}>
          <p style={{ color: "#C7FF41", letterSpacing: "2px", textTransform: "uppercase", fontSize: "14px" }}>
            Host · Check-In
          </p>

          <h1 style={{ fontSize: isMobile  ? "42px"  : "clamp(48px, 6vw, 80px)", lineHeight: "0.95", margin: "10px 0" }}>
            Scan
            <br />
            Tickets
          </h1>

          {event && (
            <p style={{ color: "#9CA3AF" }}>
              {event.title} · {event.event_date}
            </p>
          )}
        </div>

        {/* Camera Section */}
        <div
          style={{
            background: "#141414",
            border: "1px solid #232323",
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>QR Scanner</h2>

          {!cameraActive ? (
            <button
              onClick={startCamera}
              style={{
                background: "#C7FF41",
                color: "#000",
                border: "none",
                width:
                isMobile
                  ? "100%"
                  : "auto",
                padding: "14px 28px",
                borderRadius: "999px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Open Camera
            </button>
          ) : (
            <div>
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  background: "#000",
                  maxHeight: "360px",
                  objectFit: "cover",
                }}
                muted
                playsInline
              />
              <button
                onClick={stopCamera}
                style={{
                  marginTop: "12px",
                  background: "#1A1A1A",
                  width:
                  isMobile
                    ? "100%"
                    : "auto",
                  border: "1px solid #232323",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "999px",
                  cursor: "pointer",
                }}
              >
                Close Camera
              </button>
            </div>
          )}

          {cameraError && (
            <p style={{ color: "#ff6b6b", marginTop: "12px" }}>{cameraError}</p>
          )}

          {!("BarcodeDetector" in window) && cameraActive && (
            <p style={{ color: "#FFD166", marginTop: "12px", fontSize: "13px" }}>
              Auto-scan not supported in this browser. Use manual code entry below.
            </p>
          )}
        </div>

        {/* Manual Entry */}
        <div
          style={{
            background: "#141414",
            border: "1px solid #232323",
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginBottom: "16px" }}>Manual Code Entry</h2>
          <p style={{ color: "#9CA3AF", marginBottom: "16px", fontSize: "14px" }}>
            Paste or type the ticket code if camera scan isn't available.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "12px",
            }}
          >
            <input
              type="text"
              placeholder="Paste ticket code..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
              style={{
                flex: 1,
                background: "#0F0F0F",
                border: "1px solid #232323",
                borderRadius: "14px",
                padding: "14px 16px",
                color: "white",
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={handleManualLookup}
              style={{
                background: "#C7FF41",
                color: "#000",
                border: "none",
                width: isMobile ? "100%" : "auto",
                padding: "14px 24px",
                borderRadius: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Look Up
            </button>
          </div>
        </div>

        {/* Scan Error */}
        {scanError && (
          <div
            style={{
              background: "#4b1d1d",
              border: "1px solid #ff4d4f",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "24px",
              color: "#ff6b6b",
              fontWeight: "600",
            }}
          >
            ❌ {scanError}
          </div>
        )}

        {/* Ticket Result */}
        {scanResult && (
          <div
            style={{
              background: "#141414",
              border: `1px solid ${checkedIn ? "#C7FF41" : "#232323"}`,
              borderRadius: "24px",
              padding: "28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top accent */}
            <div
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: "4px",
                background: checkedIn ? "#C7FF41" : "#232323",
              }}
            />

            <div style={{ display: "flex",flexDirection: isMobile ? "column" : "row",justifyContent: "space-between",alignItems: isMobile ? "stretch" : "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "22px" }}>
                  {scanResult.users?.full_name}
                </h3>
                <p style={{ color: "#9CA3AF", margin: "0 0 4px" }}>
                  {scanResult.users?.email}
                </p>
                <p style={{ color: "#9CA3AF", margin: "0" }}>
                  {scanResult.events?.title}
                </p>
              </div>

              <div
                style={{
                  background: checkedIn ? "#1E2A00" : "#1A1A1A",
                  color: checkedIn ? "#C7FF41" : "#9CA3AF",
                  border: `1px solid ${checkedIn ? "#C7FF41" : "#232323"}`,
                  padding: "8px 16px",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {checkedIn ? "✓ Checked In" : "Not Checked In"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
              <div style={pillStyle}>{scanResult.users?.sex}</div>
              <div style={pillStyle}>
                Ticket: {scanResult.ticket_code?.slice(0, 8)}...
              </div>
              <div style={pillStyle}>
                {scanResult.payment_status === "paid" ? "✓ Paid" : scanResult.payment_status}
              </div>
            </div>

            {!checkedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  height: "56px",
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  borderRadius: "16px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: checkingIn ? "not-allowed" : "pointer",
                  opacity: checkingIn ? 0.7 : 1,
                }}
              >
                {checkingIn ? "Checking In..." : "Check In Guest"}
              </button>
            ) : (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "#1E2A00",
                  borderRadius: "16px",
                  color: "#C7FF41",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Guest Successfully Checked In
              </div>
            )}

            {/* Scan another */}
            <button
              onClick={() => { setScanResult(null); setScanError(null); setCheckedIn(false); }}
              style={{
                marginTop: "12px",
                width: "100%",
                height: "48px",
                background: "#1A1A1A",
                border: "1px solid #232323",
                color: "#fff",
                borderRadius: "16px",
                cursor: "pointer",
              }}
            >
              Scan Another
            </button>
          </div>
        )}

        {/* Guest Lists */}
        <div style={{ marginTop: "50px" }}>
          <h2 style={{ marginBottom: "20px" }}>Guests</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
              isMobile
                ? "1fr"
                : "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Pending */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "24px",
                padding: "24px",
              }}
            >
              <h3>Not Checked In ({pendingGuests.length})</h3>

              {pendingGuests.length === 0 ? (
                <p style={{ color: "#9CA3AF" }}>Everyone has checked in.</p>
              ) : (
                pendingGuests.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #232323",
                    }}
                  >
                    <div>{ticket.users?.full_name}</div>
                    <div style={{ color: "#9CA3AF", fontSize: "14px" }}>
                      {ticket.users?.email}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checked In */}
            <div
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "24px",
                padding: "24px",
              }}
            >
              <h3>Checked In ({checkedInGuests.length})</h3>

              {checkedInGuests.length === 0 ? (
                <p style={{ color: "#9CA3AF" }}>No guests have checked in yet.</p>
              ) : (
                checkedInGuests.map((ticket) => (
                  <div
                    key={ticket.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #232323",
                    }}
                  >
                    <div>{ticket.users?.full_name}</div>
                    <div style={{ color: "#C7FF41", fontSize: "14px" }}>✓ Checked In</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}