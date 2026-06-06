import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { submitVerification, getVerification } from "../services/verificationService";

export default function HostVerification() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    async function checkVerification() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const existing = await getVerification(user.id);

      if (existing.data) {
        setSubmitted(true);
        setStatus(existing.data.status || "pending");
        setFullName(existing.data.full_name || "");
        setPhone(existing.data.phone || "");
        setInstagram(existing.data.instagram || "");
        setReason(existing.data.reason || "");
      }

      setLoading(false);
    }

    checkVerification();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const existing = await getVerification(user.id);

    if (existing.data) {
      alert("Verification already submitted.");
      return;
    }

    const { error } = await submitVerification({
      user_id: user.id,
      full_name: fullName,
      phone,
      instagram,
      reason,
      status: "pending",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Application submitted successfully.");
    setSubmitted(true);
    setStatus("pending");
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "white",
    boxSizing: "border-box",
  };

  const sectionStyle = {
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    color: "#9CA3AF",
    fontSize: "14px",
    marginBottom: "8px",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              color: "#C7FF41",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Host Program
          </p>

          <h1
            style={{
              fontSize: "clamp(60px, 8vw, 110px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            Become
            <br />
            A Host
          </h1>

          <p style={{ color: "#9CA3AF", maxWidth: "600px", margin: "0 auto" }}>
            Apply to host premium events on RAVE.
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "24px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2>
              {status === "approved"
                ? "🎉 Host Approved"
                : status === "rejected"
                ? "❌ Application Rejected"
                : "⏳ Application Submitted"}
            </h2>

            <p style={{ color: "#9CA3AF", marginTop: "10px" }}>
              {status === "approved"
                ? "You are now a verified RAVE host and can start creating events."
                : status === "rejected"
                ? "Your application was rejected. Contact support or apply again later."
                : "Your host verification is currently under review by the RAVE team."}
            </p>

            {status === "approved" && (
              <button
                onClick={() => navigate("/create-event")}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  height: "60px",
                  background: "#C7FF41",
                  color: "#000",
                  border: "none",
                  borderRadius: "18px",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Create Event
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Personal Details</h2>

              <label style={labelStyle}>Full Name</label>
              <input
                style={{ ...inputStyle, marginBottom: "16px" }}
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <label style={labelStyle}>Phone Number</label>
              <input
                style={inputStyle}
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Social</h2>

              <label style={labelStyle}>Instagram Username or Link</label>
              <input
                style={inputStyle}
                placeholder="@yourhandle"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>

            <div style={sectionStyle}>
              <h2 style={{ marginBottom: "20px" }}>Your Pitch</h2>

              <label style={labelStyle}>Why do you want to host events on RAVE?</label>
              <textarea
                style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }}
                placeholder="Tell us about your vision..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "60px",
                background: "#C7FF41",
                color: "#000",
                border: "none",
                borderRadius: "18px",
                fontWeight: "700",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </>
  );
}