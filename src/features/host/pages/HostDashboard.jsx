import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import PageContainer from "../../../shared/components/PageContainer";
import StatCard from "../../../shared/components/StatCard";
import Card from "../../../shared/components/Card";

import { supabase } from "../../../services/supabase";
import { getHostedEvents } from "../../events/services/eventService";

import useMobile from "../../../hooks/useMobile";

const today = new Date()
  .toISOString()
  .split("T")[0];

export default function HostDashboard() {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const isMobile =
    useMobile();

  useEffect(() => {
    async function loadEvents() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const result =
        await getHostedEvents(
          user.id
        );

      if (result.data) {
        setEvents(
          result.data
        );
      }

      setLoading(false);
    }

    loadEvents();
  }, []);

  const activeEvents =
    events.filter(
      (event) =>
        event.event_date >=
          today &&
        !event.is_cancelled
    );

  const pastEvents =
    events.filter(
      (event) =>
        event.event_date <
          today &&
        !event.is_cancelled
    );

  const cancelledEvents =
    events.filter(
      (event) =>
        event.is_cancelled
    );

  const gridStyle = {
    display: "grid",

    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "repeat(auto-fit, minmax(340px, 1fr))",

    gap: "20px",

    marginBottom: "60px",
  };

  return (
    <>
      <Navbar />

      <PageContainer>
        <div
          style={{
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
            Hosting
          </p>

          <h1
            style={{
              fontSize:
                isMobile
                  ? "42px"
                  : "clamp(50px, 6vw, 90px)",

              margin:
                "10px 0",

              lineHeight:
                "0.95",
            }}
          >
            Your Events
          </h1>

          <p
            style={{
              color:
                "#9CA3AF",

              fontSize:
                isMobile
                  ? "15px"
                  : "16px",
            }}
          >
            Manage
            everything you
            host in one
            place.
          </p>
        </div>

        {loading ? (
          <p>
            Loading...
          </p>
        ) : (
          <>
            {/* Stats */}

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  isMobile
                    ? "1fr 1fr"
                    : "repeat(auto-fit, minmax(220px, 1fr))",

                gap: "16px",

                marginBottom:
                  "50px",
              }}
            >
              <StatCard
                label="Events"
                value={
                  events.length
                }
              />

              <StatCard
                label="Active"
                value={
                  activeEvents.length
                }
              />

              <StatCard
                label="Cancelled"
                value={
                  cancelledEvents.length
                }
              />
            </div>

            {/* Active Events */}

            <h2
              style={{
                marginBottom:
                  "20px",
              }}
            >
              Active Events
            </h2>

            <div
              style={
                gridStyle
              }
            >
              {activeEvents.length ===
              0 ? (
                <p>
                  No active
                  events.
                </p>
              ) : (
                activeEvents.map(
                  (
                    event
                  ) => (
                    <Card
                      key={
                        event.id
                      }
                    >
                      <Link
                        to={`/host-event/${event.id}`}
                        style={{
                          color:
                            "#C7FF41",

                          textDecoration:
                            "none",
                        }}
                      >
                        <h3>
                          {
                            event.title
                          }
                        </h3>
                      </Link>

                      <p>
                        📅{" "}
                        {
                          event.event_date
                        }
                      </p>

                      <p>
                        📍{" "}
                        {
                          event.city
                        }
                      </p>

                      <p>
                        💰 ₹
                        {
                          event.price
                        }
                      </p>

                      <p>
                        👥{" "}
                        {
                          event.capacity
                        }{" "}
                        Capacity
                      </p>
                    </Card>
                  )
                )
              )}
            </div>

            {/* Past Events */}

            <h2
              style={{
                marginBottom:
                  "20px",
              }}
            >
              Past Events
            </h2>

            <div
              style={
                gridStyle
              }
            >
              {pastEvents.length ===
              0 ? (
                <p>
                  No past
                  events.
                </p>
              ) : (
                pastEvents.map(
                  (
                    event
                  ) => (
                    <Card
                      key={
                        event.id
                      }
                    >
                      <Link
                        to={`/host-event/${event.id}`}
                        style={{
                          color:
                            "#C7FF41",

                          textDecoration:
                            "none",
                        }}
                      >
                        <h3>
                          {
                            event.title
                          }
                        </h3>
                      </Link>

                      <p>
                        Held on{" "}
                        {
                          event.event_date
                        }
                      </p>
                    </Card>
                  )
                )
              )}
            </div>

            {/* Cancelled Events */}

            <h2
              style={{
                marginBottom:
                  "20px",
              }}
            >
              Cancelled Events
            </h2>

            <div
              style={{
                ...gridStyle,

                marginBottom:
                  0,
              }}
            >
              {cancelledEvents.length ===
              0 ? (
                <p>
                  No
                  cancelled
                  events.
                </p>
              ) : (
                cancelledEvents.map(
                  (
                    event
                  ) => (
                    <Card
                      key={
                        event.id
                      }
                    >
                      <Link
                        to={`/host-event/${event.id}`}
                        style={{
                          color:
                            "#ff4d4f",

                          textDecoration:
                            "none",
                        }}
                      >
                        <h3>
                          {
                            event.title
                          }
                        </h3>
                      </Link>

                      <p>
                        Event
                        Cancelled
                      </p>
                    </Card>
                  )
                )
              )}
            </div>

            {/* Actions */}

            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  isMobile
                    ? "column"
                    : "row",

                gap: "16px",

                marginTop:
                  "60px",
              }}
            >
              <Link
                to="/create-event"
                style={{
                  background:
                    "#C7FF41",

                  color:
                    "#000",

                  padding:
                    "14px 24px",

                  borderRadius:
                    "999px",

                  textDecoration:
                    "none",

                  fontWeight:
                    "600",

                  textAlign:
                    "center",

                  width:
                    isMobile
                      ? "100%"
                      : "auto",
                }}
              >
                + Create
                Event
              </Link>

              <Link
                to="/create-community"
                style={{
                  background:
                    "#141414",

                  color:
                    "#fff",

                  border:
                    "1px solid #232323",

                  padding:
                    "14px 24px",

                  borderRadius:
                    "999px",

                  textDecoration:
                    "none",

                  textAlign:
                    "center",

                  width:
                    isMobile
                      ? "100%"
                      : "auto",
                }}
              >
                +
                Create
                Community
              </Link>
            </div>
          </>
        )}
      </PageContainer>
    </>
  );
}