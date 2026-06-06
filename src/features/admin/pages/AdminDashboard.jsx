import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase";

import Navbar from "../../../shared/components/Navbar";
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from "../../verification/services/verificationService";

export default function AdminDashboard() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate =
  useNavigate();

  

  async function loadData() {
    const { data } = await getPendingVerifications();
    if (data) setVerifications(data);
    setLoading(false);
  }

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        navigate("/login");
        return;
      }
  
      const { data: profile } =
        await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
  
      if (
        profile?.role !==
        "admin"
      ) {
        alert(
          "Unauthorized"
        );
  
        navigate("/");
        return;
      }
  
      loadData();
    }
  
    checkAdmin();
  }, [navigate]);

  async function handleApprove(verification) {
    await approveVerification(verification.id, verification.user_id);
    loadData();
  }

  async function handleReject(verification) {
    await rejectVerification(verification.id);
    loadData();
  }

  const btnBase = {
    border: "none",
    padding: "10px 20px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>

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
            Admin
          </p>

          <h1
            style={{
              fontSize: "clamp(50px, 6vw, 90px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            Host
            <br />
            Applications
          </h1>

          <p style={{ color: "#9CA3AF" }}>Review and manage host verification requests.</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : verifications.length === 0 ? (
          <div
            style={{
              background: "#141414",
              border: "1px solid #232323",
              borderRadius: "24px",
              padding: "60px",
              textAlign: "center",
            }}
          >
            <h2>All Clear</h2>
            <p style={{ color: "#9CA3AF" }}>No pending applications.</p>
          </div>
        ) : (
          verifications.map((verification) => (
            <div
              key={verification.id}
              style={{
                background: "#141414",
                border: "1px solid #232323",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px" }}>{verification.full_name}</h3>

                  <p style={{ color: "#9CA3AF", margin: "4px 0" }}>
                    📞 {verification.phone}
                  </p>

                  {verification.instagram && (
                    <p style={{ color: "#9CA3AF", margin: "4px 0" }}>
                      📸 {verification.instagram}
                    </p>
                  )}

                  <p
                    style={{
                      color: "#fff",
                      margin: "12px 0 0",
                      lineHeight: "1.6",
                      background: "#1A1A1A",
                      border: "1px solid #232323",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                  >
                    {verification.reason}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleApprove(verification)}
                    style={{ ...btnBase, background: "#C7FF41", color: "#000" }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(verification)}
                    style={{ ...btnBase, background: "#ff4d4f", color: "#fff" }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}