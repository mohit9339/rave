import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import Navbar from "../../../shared/components/Navbar";
import { supabase } from "../../../services/supabase";
import { getMyTickets } from "../services/ticketService";

import useMobile from "../../../hooks/useMobile";

export default function MyTickets() {
  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const isMobile =
    useMobile();

  useEffect(() => {
    async function loadTickets() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } =
        await getMyTickets(
          user.id
        );

      if (data) {
        setTickets(data);
      }

      setLoading(false);
    }

    loadTickets();
  }, []);

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
        {/* Hero */}

        <div
          style={{
            textAlign:
              "center",

            marginBottom:
              isMobile
                ? "50px"
                : "80px",
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
            RAVE Tickets
          </p>

          <h1
            style={{
              fontSize:
                isMobile
                  ? "48px"
                  : "clamp(60px, 8vw, 110px)",

              lineHeight:
                "0.95",

              margin:
                "10px 0",
            }}
          >
            My
            <br />
            Tickets
          </h1>

          <p
            style={{
              color:
                "#9CA3AF",

              maxWidth:
                "600px",

              margin:
                "0 auto",

              fontSize:
                isMobile
                  ? "15px"
                  : "16px",
            }}
          >
            Manage all your
            event tickets in
            one place.
          </p>
        </div>

        {loading ? (
          <p>
            Loading
            tickets...
          </p>
        ) : tickets.length ===
          0 ? (
          <div
            style={{
              textAlign:
                "center",

              padding:
                isMobile
                  ? "40px 20px"
                  : "60px",

              background:
                "#141414",

              border:
                "1px solid #232323",

              borderRadius:
                "24px",
            }}
          >
            <h2>
              No Tickets Yet
            </h2>

            <p
              style={{
                color:
                  "#9CA3AF",
              }}
            >
              Join an event
              to see your
              tickets here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(350px, 1fr))",

              gap:
                "24px",
            }}
          >
            {tickets.map(
              (ticket) => {
                const qrData =
                  JSON.stringify(
                    {
                      ticketId:
                        ticket.id,

                      ticketCode:
                        ticket.ticket_code,

                      eventId:
                        ticket.event_id,

                      userId:
                        ticket.user_id,
                    }
                  );

                return (
                  <div
                    key={
                      ticket.id
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
                          : "28px",

                      position:
                        "relative",

                      overflow:
                        "hidden",
                    }}
                  >
                    {/* Accent */}

                    <div
                      style={{
                        position:
                          "absolute",

                        top: 0,

                        left: 0,

                        right: 0,

                        height:
                          "4px",

                        background:
                          "#C7FF41",
                      }}
                    />

                    {/* Status */}

                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "flex-end",

                        marginBottom:
                          "20px",
                      }}
                    >
                      <div
                        style={{
                          background:
                            ticket.payment_status ===
                            "paid"
                              ? "#1E2A00"
                              : "#2A1E00",

                          color:
                            ticket.payment_status ===
                            "paid"
                              ? "#C7FF41"
                              : "#FFD166",

                          padding:
                            isMobile
                              ? "8px 12px"
                              : "6px 14px",

                          borderRadius:
                            "999px",

                          fontSize:
                            "13px",

                          fontWeight:
                            "600",
                        }}
                      >
                        {
                          ticket.payment_status
                        }
                      </div>
                    </div>

                    {/* Event */}

                    <h3
                      style={{
                        margin:
                          "0 0 8px",

                        fontSize:
                          isMobile
                            ? "20px"
                            : "22px",
                      }}
                    >
                      {ticket
                        .events
                        ?.title ??
                        "Event"}
                    </h3>

                    <p
                      style={{
                        color:
                          "#9CA3AF",

                        margin:
                          "4px 0",
                      }}
                    >
                      📍{" "}
                      {
                        ticket
                          .events
                          ?.city
                      }
                    </p>

                    <p
                      style={{
                        color:
                          "#9CA3AF",

                        margin:
                          "4px 0 0",
                      }}
                    >
                      📅{" "}
                      {
                        ticket
                          .events
                          ?.event_date
                      }
                    </p>

                    {/* QR */}

                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "center",

                        marginTop:
                          "24px",
                      }}
                    >
                      <div
                        style={{
                          background:
                            "#fff",

                          padding:
                            "12px",

                          borderRadius:
                            "20px",
                        }}
                      >
                        <QRCodeCanvas
                          value={
                            qrData
                          }
                          size={
                            isMobile
                              ? 180
                              : 250
                          }
                        />
                      </div>
                    </div>

                    {/* Ticket Code */}

                    <p
                      style={{
                        color:
                          "#9CA3AF",

                        marginTop:
                          "20px",

                        fontSize:
                          "13px",
                      }}
                    >
                      Ticket
                      Code
                    </p>

                    <p
                      style={{
                        fontFamily:
                          "monospace",

                        fontSize:
                          "13px",

                        color:
                          "#fff",

                        wordBreak:
                          "break-all",

                        margin:
                          "4px 0 0",
                      }}
                    >
                      {
                        ticket.ticket_code
                      }
                    </p>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </>
  );
}