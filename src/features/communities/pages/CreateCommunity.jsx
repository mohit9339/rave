import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";

import { supabase } from "../../../services/supabase";

import {
  createCommunity,
} from "../services/communityService";

export default function CreateCommunity() {
  const navigate =
    useNavigate();

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [category,
    setCategory] =
    useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    const { error } =
      await createCommunity({
        name,
        description,
        category,
        admin_id:
          user.id,
        creator_id:
          user.id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Community Created!"
    );

    navigate(
      "/communities"
    );
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

  const sectionStyle = {
    background:
      "#141414",
    border:
      "1px solid #232323",
    borderRadius:
      "24px",
    padding: "24px",
    marginBottom:
      "24px",
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth:
            "1200px",
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
            BUILD A COMMUNITY
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
            Create
            <br />
            Community
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
            Bring people
            together around a
            shared passion,
            hobby or goal.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div
            style={
              sectionStyle
            }
          >
            <h2>
              Community Info
            </h2>

            <input
              type="text"
              placeholder="Community Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              style={
                inputStyle
              }
              required
            />

            <br />
            <br />

            <textarea
              placeholder="Describe your community..."
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              style={{
                ...inputStyle,
                minHeight:
                  "150px",
              }}
              required
            />
          </div>

          <div
            style={
              sectionStyle
            }
          >
            <h2>
              Category
            </h2>

            <select
              value={
                category
              }
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              style={
                inputStyle
              }
              required
            >
              <option value="">
                Select Category
              </option>

              <option value="music">
                🎵 Music
              </option>

              <option value="gaming">
                🎮 Gaming
              </option>

              <option value="startup">
                🚀 Startup
              </option>

              <option value="networking">
                🤝 Networking
              </option>

              <option value="fitness">
                🏃 Fitness
              </option>

              <option value="social">
                🍻 Social
              </option>

              <option value="art">
                🎨 Art
              </option>
            </select>
          </div>

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
            Create Community
          </button>
        </form>
      </div>
    </>
  );
}