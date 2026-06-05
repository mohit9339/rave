import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signIn } from "../services/authService";

import logo from "../../../assets/logo/rave-logo.png";

import useMobile from "../../../hooks/useMobile";

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const navigate =
    useNavigate();

  const isMobile =
    useMobile();

  async function handleLogin(e) {
    e.preventDefault();

    const { error } =
      await signIn(
        email,
        password
      );

    if (error) {
      alert(
        error.message
      );
      return;
    }

    navigate("/");
  }

  const inputStyle = {
    width: "100%",

    background:
      "#0F0F0F",

    border:
      "1px solid #232323",

    borderRadius:
      "14px",

    padding:
      "14px 16px",

    color: "white",

    marginBottom:
      "16px",

    boxSizing:
      "border-box",
  };

  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        flexDirection:
          isMobile
            ? "column"
            : "row",

        background:
          "#0B0B0C",
      }}
    >
      {/* Hero */}

      <div
        style={{
          flex: 1,

          display:
            "flex",

          flexDirection:
            "column",

          justifyContent:
            "center",

          padding:
            isMobile
              ? "40px 24px"
              : "80px",

          position:
            "relative",

          overflow:
            "hidden",

          minHeight:
            isMobile
              ? "auto"
              : "100vh",
        }}
      >
        <div
          style={{
            position:
              "absolute",

            width:
              isMobile
                ? "250px"
                : "500px",

            height:
              isMobile
                ? "250px"
                : "500px",

            background:
              "#C7FF41",

            filter:
              "blur(180px)",

            opacity:
              0.08,
          }}
        />

        <img
          src={logo}
          alt="RAVE"
          style={{
            width:
              isMobile
                ? "180px"
                : "300px",

            marginBottom:
              "30px",

            position:
              "relative",
          }}
        />

        <h1
          style={{
            fontSize:
              isMobile
                ? "48px"
                : "72px",

            lineHeight:
              "0.95",

            margin: 0,

            position:
              "relative",
          }}
        >
          Welcome
          <br />
          Back To
          <br />
          RAVE
        </h1>

        <p
          style={{
            color:
              "#9CA3AF",

            maxWidth:
              "500px",

            marginTop:
              "30px",

            lineHeight:
              "1.8",

            fontSize:
              isMobile
                ? "15px"
                : "16px",

            position:
              "relative",
          }}
        >
          Discover parties,
          join communities,
          meet new people
          and create
          unforgettable
          experiences.
        </p>
      </div>

      {/* Login Form */}

      <div
        style={{
          width:
            isMobile
              ? "100%"
              : "520px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          padding:
            isMobile
              ? "20px"
              : "40px",
        }}
      >
        <div
          style={{
            width: "100%",

            background:
              "#141414",

            border:
              "1px solid #232323",

            borderRadius:
              isMobile
                ? "24px"
                : "32px",

            padding:
              isMobile
                ? "24px"
                : "40px",
          }}
        >
          <h2
            style={{
              fontSize:
                isMobile
                  ? "30px"
                  : "36px",

              marginBottom:
                "10px",
            }}
          >
            Login
          </h2>

          <p
            style={{
              color:
                "#9CA3AF",

              marginBottom:
                "30px",
            }}
          >
            Enter your
            account
          </p>

          <form
            onSubmit={
              handleLogin
            }
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(
                e
              ) =>
                setEmail(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={
                password
              }
              onChange={(
                e
              ) =>
                setPassword(
                  e.target
                    .value
                )
              }
              style={
                inputStyle
              }
              required
            />

            <button
              type="submit"
              style={{
                width:
                  "100%",

                height:
                  "56px",

                border:
                  "none",

                borderRadius:
                  "16px",

                background:
                  "#C7FF41",

                color:
                  "#000",

                fontWeight:
                  "700",

                cursor:
                  "pointer",

                marginTop:
                  "10px",
              }}
            >
              Login
            </button>
          </form>

          <p
            style={{
              textAlign:
                "center",

              marginTop:
                "20px",

              color:
                "#9CA3AF",

              fontSize:
                isMobile
                  ? "14px"
                  : "16px",
            }}
          >
            Don't have an
            account?{" "}
            <Link
              to="/register"
              style={{
                color:
                  "#C7FF41",
              }}
            >
              Join RAVE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}