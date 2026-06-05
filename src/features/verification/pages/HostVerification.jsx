import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";

import { supabase } from "../../../services/supabase";

import {
  submitVerification,
  getVerification,
} from "../services/verificationService";

export default function HostVerification() {
  const navigate =
    useNavigate();

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [phone,
    setPhone] =
    useState("");

  const [
    instagram,
    setInstagram,
  ] = useState("");

  const [reason,
    setReason] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);

  const [submitted,
    setSubmitted] =
    useState(false);

  useEffect(() => {
    async function checkVerification() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const existing =
        await getVerification(
          user.id
        );

      if (existing.data) {
        setSubmitted(true);
      }

      setLoading(false);
    }

    checkVerification();
  }, [navigate]);

  async function handleSubmit(
    e
  ) {
    e.preventDefault();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    const existing =
      await getVerification(
        user.id
      );

    if (existing.data) {
      alert(
        "Verification already submitted."
      );

      return;
    }

    const { error } =
      await submitVerification({
        user_id:
          user.id,
        full_name:
          fullName,
        phone,
        instagram,
        reason,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Application submitted successfully."
    );

    setSubmitted(true);
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border:
      "1px solid #232323",
    borderRadius:
      "14px",
    padding:
      "14px 16px",
    color: "white",
    boxSizing:
      "border-box",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p
          style={{
            textAlign:
              "center",
            marginTop:
              "40px",
          }}
        >
          Loading...
        </p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth:
            "1000px",
          margin:
            "40px auto",
          padding:
            "20px",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              "60px",
          }}
        >
          <p
            style={{
              color:
                "#C7FF41",
              letterSpacing:
                "2px",
              textTransform:
                "uppercase",
              fontSize:
                "14px",
            }}
          >
            HOST PROGRAM
          </p>

          <h1
            style={{
              fontSize:
                "clamp(60px,8vw,110px)",
              lineHeight:
                "0.95",
              margin:
                "10px 0",
            }}
          >
            Become
            <br />
            A Host
          </h1>

          <p
            style={{
              color:
                "#9CA3AF",
              maxWidth:
                "600px",
              margin:
                "0 auto",
            }}
          >
            Apply to host
            premium events on
            RAVE.
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              background:
                "#141414",
              border:
                "1px solid #232323",
              borderRadius:
                "24px",
              padding:
                "40px",
              textAlign:
                "center",
            }}
          >
            <h2>
              Application
              Submitted
            </h2>

            <p
              style={{
                color:
                  "#9CA3AF",
              }}
            >
              Your host
              verification is
              currently under
              review.
            </p>
          </div>
        ) : (
          <form
            onSubmit={
              handleSubmit
            }
          >
            <input
              style={
                inputStyle
              }
              placeholder="Full Name"
              value={
                fullName
              }
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              required
            />

            <br />
            <br />

            <input
              style={
                inputStyle
              }
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              required
            />

            <br />
            <br />

            <input
              style={
                inputStyle
              }
              placeholder="Instagram Username or Link"
              value={
                instagram
              }
              onChange={(e) =>
                setInstagram(
                  e.target.value
                )
              }
            />

            <br />
            <br />

            <textarea
              style={{
                ...inputStyle,
                minHeight:
                  "160px",
              }}
              placeholder="Why do you want to host events on RAVE?"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
              required
            />

            <br />
            <br />

            <button
              type="submit"
              style={{
                width: "100%",
                height: "60px",
                background:
                  "#C7FF41",
                color: "#000",
                border: "none",
                borderRadius:
                  "18px",
                fontWeight:
                  "700",
                fontSize:
                  "16px",
                cursor:
                  "pointer",
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