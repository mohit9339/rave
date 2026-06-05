import { useEffect, useState } from "react";

import Navbar from "../../../shared/components/Navbar";

import { supabase } from "../../../services/supabase";

import {
  getHostedEvents,
} from "../../events/services/eventService";

import {
  getJoinedEvents,
} from "../../events/services/attendeeService";

import {
  getUserCommunities,
} from "../../communities/services/communityMemberService";

import {
  signOut,
} from "../../auth/services/authService";

import useMobile from "../../../hooks/useMobile";

export default function Profile() {
  const [user, setUser] =
    useState(null);

  const [profile,
    setProfile] =
    useState(null);

  const [communities,
    setCommunities] =
    useState([]);

  const [hostedEvents,
    setHostedEvents] =
    useState([]);

  const [joinedEvents,
    setJoinedEvents] =
    useState([]);

  const isMobile =
    useMobile();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      setUser(user);

      if (!user) return;

      const {
        data: profileData,
      } = await supabase
        .from("users")
        .select("*")
        .eq(
          "id",
          user.id
        )
        .single();

      setProfile(
        profileData
      );

      const [
        hosted,
        joined,
        communityResult,
      ] = await Promise.all([
        getHostedEvents(
          user.id
        ),
        getJoinedEvents(
          user.id
        ),
        getUserCommunities(
          user.id
        ),
      ]);

      if (hosted.data)
        setHostedEvents(
          hosted.data
        );

      if (joined.data)
        setJoinedEvents(
          joined.data
        );

      if (
        communityResult.data
      )
        setCommunities(
          communityResult.data
        );
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    const { error } =
      await signOut();

    if (error) {
      alert(
        error.message
      );
      return;
    }

    window.location.href =
      "/login";
  }

  const pillStyle = {
    background:
      "#1A1A1A",

    border:
      "1px solid #232323",

    padding:
      isMobile
        ? "8px 12px"
        : "10px 16px",

    borderRadius:
      "999px",

    fontSize:
      isMobile
        ? "13px"
        : "14px",
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          maxWidth:
            "1200px",

          margin:
            isMobile
              ? "20px auto"
              : "40px auto",

          padding:
            isMobile
              ? "16px"
              : "20px",
        }}
      >
        {/* Header */}

        <div
          style={{
            display:
              "flex",

            flexDirection:
              isMobile
                ? "column"
                : "row",

            justifyContent:
              "space-between",

            alignItems:
              isMobile
                ? "stretch"
                : "center",

            gap: "16px",

            marginBottom:
              "30px",
          }}
        >
          <h1
            style={{
              fontSize:
                isMobile
                  ? "38px"
                  : "48px",

              margin: 0,
            }}
          >
            Profile
          </h1>

          <button
            onClick={
              handleLogout
            }
            style={{
              background:
                "#ff4d4f",

              color:
                "#fff",

              border:
                "none",

              padding:
                "12px 18px",

              borderRadius:
                "999px",

              cursor:
                "pointer",

              fontWeight:
                "600",

              width:
                isMobile
                  ? "100%"
                  : "auto",
            }}
          >
            Logout
          </button>
        </div>

        {/* Profile Card */}

        {profile && (
          <div
            style={{
              background:
                "#141414",

              border:
                "1px solid #232323",

              borderRadius:
                "32px",

              padding:
                isMobile
                  ? "20px"
                  : "40px",

              marginBottom:
                "40px",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                alignItems:
                  isMobile
                    ? "center"
                    : "center",

                textAlign:
                  isMobile
                    ? "center"
                    : "left",

                gap: "24px",
              }}
            >
              <div
                style={{
                  width:
                    isMobile
                      ? "80px"
                      : "100px",

                  height:
                    isMobile
                      ? "80px"
                      : "100px",

                  borderRadius:
                    "50%",

                  background:
                    "#C7FF41",

                  color:
                    "#000",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  fontSize:
                    isMobile
                      ? "28px"
                      : "36px",

                  fontWeight:
                    "700",
                }}
              >
                {profile.full_name
                  ?.split(" ")
                  .map(
                    (name) =>
                      name[0]
                  )
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <h2
                  style={{
                    margin:
                      "0 0 8px",
                  }}
                >
                  {
                    profile.full_name
                  }
                </h2>

                <p
                  style={{
                    color:
                      "#9CA3AF",
                    margin: 0,
                  }}
                >
                  {
                    profile.email
                  }
                </p>
              </div>
            </div>

            <div
              style={{
                display:
                  "flex",

                gap: "12px",

                flexWrap:
                  "wrap",

                marginTop:
                  "25px",

                justifyContent:
                  isMobile
                    ? "center"
                    : "flex-start",
              }}
            >
              <div
                style={
                  pillStyle
                }
              >
                {
                  profile.sex
                }
              </div>

              <div
                style={
                  pillStyle
                }
              >
                DOB:{" "}
                {
                  profile.date_of_birth
                }
              </div>

              <div
                style={
                  pillStyle
                }
              >
                ⭐
                Reputation:
                {" "}
                {
                  profile.reputation
                }
              </div>
            </div>
          </div>
        )}

        {/* Stats */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              isMobile
                ? "1fr"
                : "repeat(3,1fr)",

            gap: "20px",

            marginBottom:
              "50px",
          }}
        >
          {[
            {
              label:
                "Communities",
              value:
                communities.length,
            },
            {
              label:
                "Hosted Events",
              value:
                hostedEvents.length,
            },
            {
              label:
                "Joined Events",
              value:
                joinedEvents.length,
            },
          ].map(
            ({
              label,
              value,
            }) => (
              <div
                key={
                  label
                }
                style={{
                  background:
                    "#141414",

                  border:
                    "1px solid #232323",

                  borderRadius:
                    "24px",

                  padding:
                    isMobile
                      ? "20px"
                      : "30px",

                  textAlign:
                    "center",
                }}
              >
                <h2>
                  {value}
                </h2>

                <p>
                  {label}
                </p>
              </div>
            )
          )}
        </div>

        {/* Communities */}

        <Section
          title="Communities"
          items={
            communities
          }
        />

        {/* Hosted Events */}

        <Section
          title="Hosted Events"
          items={
            hostedEvents
          }
        />

        {/* Joined Events */}

        <Section
          title="Joined Events"
          items={
            joinedEvents
          }
        />
      </div>
    </>
  );
}

function Section({
  title,
  items,
}) {
  return (
    <>
      <h2
        style={{
          fontSize:
            "32px",

          marginTop:
            "50px",

          marginBottom:
            "20px",
        }}
      >
        {title}
      </h2>

      {items.length ===
      0 ? (
        <p>
          No{" "}
          {title.toLowerCase()}
          .
        </p>
      ) : (
        items.map(
          (item) => (
            <div
              key={
                item.id
              }
              style={{
                background:
                  "#141414",

                border:
                  "1px solid #232323",

                padding:
                  "18px",

                marginBottom:
                  "12px",

                borderRadius:
                  "20px",
              }}
            >
              {item.name ||
                item.title}
            </div>
          )
        )
      )}
    </>
  );
}