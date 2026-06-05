import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import EventCard from "../../events/components/EventCard";

import {
  getCommunityById,
  getCommunityEvents,
} from "../services/communityService";

import {
  joinCommunity,
  getMembers,
} from "../services/communityMemberService";

import { supabase } from "../../../services/supabase";

export default function CommunityDetails() {
  const { id } = useParams();

  const [community, setCommunity] =
    useState(null);

  const [upcomingEvents,
    setUpcomingEvents] =
    useState([]);

  const [pastEvents,
    setPastEvents] =
    useState([]);

  const [members,
    setMembers] =
    useState([]);

  const [user,
    setUser] =
    useState(null);

  const [joined,
    setJoined] =
    useState(false);

  useEffect(() => {
    async function loadCommunity() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      setUser(user);

      const communityResult =
        await getCommunityById(id);

      const eventResult =
        await getCommunityEvents(id);

      const memberResult =
        await getMembers(id);

      if (communityResult.data) {
        setCommunity(
          communityResult.data
        );
      }

      if (eventResult.data) {
        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        const upcoming =
          eventResult.data.filter(
            (event) =>
              event.event_date >=
              today
          );

        const past =
          eventResult.data.filter(
            (event) =>
              event.event_date <
              today
          );

        setUpcomingEvents(
          upcoming
        );

        setPastEvents(
          past
        );
      }

      if (memberResult.data) {
        setMembers(
          memberResult.data
        );

        if (user) {
          const alreadyJoined =
            memberResult.data.some(
              (member) =>
                member.user_id ===
                user.id
            );

          setJoined(
            alreadyJoined
          );
        }
      }
    }

    loadCommunity();
  }, [id]);

  async function handleJoin() {
    if (!user) {
      alert(
        "Please login first"
      );

      return;
    }

    if (joined) {
      alert(
        "Already joined"
      );

      return;
    }

    const { error } =
      await joinCommunity(
        id,
        user.id
      );

    if (error) {
      alert(error.message);

      return;
    }

    setJoined(true);

    const memberResult =
      await getMembers(id);

    if (memberResult.data) {
      setMembers(
        memberResult.data
      );
    }

    alert(
      "Joined Community!"
    );
  }

  if (!community) {
    return (
      <>
        <Navbar />

        <h2
          style={{
            textAlign:
              "center",
            marginTop:
              "40px",
          }}
        >
          Loading...
        </h2>
      </>
    );
  }

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
              "80px",
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
            Community
          </p>

          <h1
            style={{
              fontSize:
                "clamp(60px,8vw,110px)",
              lineHeight:
                "0.95",
              margin:
                "20px 0",
            }}
          >
            {community.name}
          </h1>

          <p
            style={{
              color:
                "#9CA3AF",
              maxWidth:
                "700px",
              margin:
                "0 auto",
              lineHeight:
                "1.8",
              fontSize:
                "18px",
            }}
          >
            {
              community.description
            }
          </p>

          <div
            style={{
              marginTop:
                "30px",
              display:
                "flex",
              justifyContent:
                "center",
              gap: "20px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              style={{
                background:
                  "#141414",
                border:
                  "1px solid #232323",
                padding:
                  "10px 18px",
                borderRadius:
                  "999px",
              }}
            >
              👥{" "}
              {
                members.length
              }{" "}
              Members
            </div>

            <div
              style={{
                background:
                  "#141414",
                border:
                  "1px solid #232323",
                padding:
                  "10px 18px",
                borderRadius:
                  "999px",
              }}
            >
              🎉{" "}
              {
                upcomingEvents.length
              }{" "}
              Upcoming
              Events
            </div>
          </div>

          <button
            onClick={
              handleJoin
            }
            disabled={
              joined
            }
            style={{
              marginTop:
                "30px",
              background:
                joined
                  ? "#666"
                  : "#C7FF41",
              color:
                "#000",
              border:
                "none",
              padding:
                "16px 30px",
              borderRadius:
                "999px",
              cursor:
                "pointer",
              fontWeight:
                "700",
              fontSize:
                "15px",
            }}
          >
            {joined
              ? "Joined Community"
              : "Join Community"}
          </button>
        </div>

        <h2
          style={{
            fontSize:
              "42px",
            marginBottom:
              "30px",
          }}
        >
          Upcoming Events
        </h2>

        {upcomingEvents.length ===
        0 ? (
          <p>
            No upcoming
            events.
          </p>
        ) : (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(340px,1fr))",
              gap: "24px",
            }}
          >
            {upcomingEvents.map(
              (event) => (
                <EventCard
                  key={
                    event.id
                  }
                  event={
                    event
                  }
                />
              )
            )}
          </div>
        )}

        <h2
          style={{
            fontSize:
              "42px",
            marginTop:
              "80px",
            marginBottom:
              "30px",
            color:
              "#9CA3AF",
          }}
        >
          Past Events
        </h2>

        {pastEvents.length ===
        0 ? (
          <p>
            No past
            events.
          </p>
        ) : (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(340px,1fr))",
              gap: "24px",
            }}
          >
            {pastEvents.map(
              (event) => (
                <EventCard
                  key={
                    event.id
                  }
                  event={
                    event
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}