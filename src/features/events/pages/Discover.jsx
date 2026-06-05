import { useEffect, useState } from "react";

import Navbar from "../../../shared/components/Navbar";
import PageContainer from "../../../shared/components/PageContainer";

import EventCard from "../components/EventCard";

import {
  getUpcomingEvents,
  getPastEvents,
} from "../services/eventService";

import {
  getJoinedEventIds,
} from "../services/attendeeService";

import { supabase } from "../../../services/supabase";

import useMobile from "../../../hooks/useMobile";

export default function Discover() {
  const [upcomingEvents,
    setUpcomingEvents] =
    useState([]);

  const [pastEvents,
    setPastEvents] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [joinedEventIds,
    setJoinedEventIds] =
    useState(new Set());

  const isMobile =
    useMobile();

  const isSmallMobile =
    window.innerWidth <= 400;

  useEffect(() => {
    async function loadEvents() {
      const [
        upcoming,
        past,
      ] = await Promise.all([
        getUpcomingEvents(),
        getPastEvents(),
      ]);

      if (upcoming.data) {
        setUpcomingEvents(
          upcoming.data
        );
      }

      if (past.data) {
        setPastEvents(
          past.data
        );
      }

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (user) {
        const {
          data: ids,
        } =
          await getJoinedEventIds(
            user.id
          );

        if (ids) {
          setJoinedEventIds(
            new Set(ids)
          );
        }
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  const gridStyle = {
    display: "grid",

    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(380px, 1fr))",

    gap: isMobile
      ? "16px"
      : "24px",
  };

  return (
    <>
      <Navbar />

      <PageContainer>
        <div
          style={{
            minHeight:
              isMobile
                ? "80vh"
                : "65vh",

            display: "flex",

            flexDirection:
              "column",

            justifyContent:
              "center",

            alignItems:
              "center",

            textAlign:
              "center",

            position:
              "relative",

            overflow:
              "hidden",

            padding:
              isMobile
                ? "20px 16px"
                : "0",
          }}
        >
          <div
            style={{
              position:
                "absolute",

              width:
                isMobile
                  ? "300px"
                  : "600px",

              height:
                isMobile
                  ? "300px"
                  : "600px",

              left: "50%",

              top: "50%",

              transform:
                "translate(-50%, -50%)",

              background:
                "#C7FF41",

              filter:
                isMobile
                  ? "blur(120px)"
                  : "blur(220px)",

              opacity: 0.1,

              zIndex: 0,
            }}
          />

          <div
            style={{
              position:
                "relative",

              zIndex: 1,

              width:
                "100%",
            }}
          >
            <p
              style={{
                color:
                  "#C7FF41",

                fontSize:
                  isSmallMobile
                    ? "11px"
                    : isMobile
                    ? "12px"
                    : "14px",

                letterSpacing:
                  "2px",

                textTransform:
                  "uppercase",

                marginBottom:
                  isMobile
                    ? "16px"
                    : "20px",
              }}
            >
              RAVE EXPERIENCES
            </p>

            <h1
              style={{
                fontSize:
                  isSmallMobile
                    ? "42px"
                    : isMobile
                    ? "52px"
                    : "clamp(70px,10vw,140px)",

                lineHeight:
                  "0.95",

                margin: 0,

                fontWeight:
                  "800",

                wordBreak:
                  "break-word",
              }}
            >
              Find Your
              <br />
              Next
              <br />
              Experience
            </h1>

            <p
              style={{
                color:
                  "#9CA3AF",

                maxWidth:
                  isMobile
                    ? "100%"
                    : "600px",

                margin:
                  isMobile
                    ? "24px auto 0"
                    : "30px auto 0",

                fontSize:
                  isSmallMobile
                    ? "15px"
                    : isMobile
                    ? "16px"
                    : "20px",

                lineHeight:
                  "1.7",

                padding:
                  isMobile
                    ? "0 8px"
                    : "0",
              }}
            >
              Discover parties,
              communities,
              networking events
              and unforgettable
              nights around you.
            </p>

            <div
              onClick={() => {
                document
                  .getElementById(
                    "events-section"
                  )
                  ?.scrollIntoView(
                    {
                      behavior:
                        "smooth",
                    }
                  );
              }}
              style={{
                marginTop:
                  isMobile
                    ? "40px"
                    : "60px",

                cursor:
                  "pointer",

                display:
                  "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                color:
                  "#9CA3AF",

                userSelect:
                  "none",
              }}
            >
              <span
                style={{
                  fontSize:
                    isSmallMobile
                      ? "12px"
                      : "14px",

                  letterSpacing:
                    "1px",

                  textTransform:
                    "uppercase",
                }}
              >
                Scroll to Explore
              </span>

              <span
                style={{
                  fontSize:
                    isMobile
                      ? "28px"
                      : "32px",

                  marginTop:
                    "8px",
                }}
              >
                ↓
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <p>
            Loading events...
          </p>
        ) : (
          <div
            id="events-section"
          >
            <h2
              style={{
                fontSize:
                  isSmallMobile
                    ? "28px"
                    : isMobile
                    ? "32px"
                    : "42px",

                marginTop:
                  isMobile
                    ? "60px"
                    : "120px",

                marginBottom:
                  isMobile
                    ? "20px"
                    : "30px",
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
                style={
                  gridStyle
                }
              >
                {upcomingEvents.map(
                  (
                    event
                  ) => (
                    <EventCard
                      key={
                        event.id
                      }
                      event={
                        event
                      }
                      isJoined={joinedEventIds.has(
                        event.id
                      )}
                    />
                  )
                )}
              </div>
            )}

            <h2
              style={{
                marginTop:
                  isMobile
                    ? "50px"
                    : "70px",

                marginBottom:
                  isMobile
                    ? "16px"
                    : "24px",

                color:
                  "#9CA3AF",

                fontSize:
                  isSmallMobile
                    ? "24px"
                    : isMobile
                    ? "28px"
                    : "36px",
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
                style={
                  gridStyle
                }
              >
                {pastEvents.map(
                  (
                    event
                  ) => (
                    <EventCard
                      key={
                        event.id
                      }
                      event={
                        event
                      }
                      isJoined={joinedEventIds.has(
                        event.id
                      )}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}