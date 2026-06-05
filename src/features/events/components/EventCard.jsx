import { Link } from "react-router-dom";

import Card from "../../../shared/components/Card";

import useMobile from "../../../hooks/useMobile";

export default function EventCard({
  event,
  isJoined = false,
}) {
  const isMobile =
    useMobile();

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const isPast =
    event.event_date <
    today;

  return (
    <Card
      style={{
        overflow:
          "hidden",

        padding:
          isMobile
            ? "16px"
            : "24px",

        height: "100%",
      }}
    >
      {/* Cover Image */}

      <div
        style={{
          height:
            isMobile
              ? "220px"
              : "260px",

          background:
            "#1A1A1A",

          borderRadius:
            "18px",

          marginBottom:
            "18px",

          overflow:
            "hidden",
        }}
      >
        {event.cover_image ? (
          <img
            src={
              event.cover_image
            }
            alt={
              event.title
            }
            style={{
              width:
                "100%",

              height:
                "100%",

              objectFit:
                "cover",

              display:
                "block",
            }}
          />
        ) : (
          <div
            style={{
              width:
                "100%",

              height:
                "100%",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              color:
                "#666",

              fontSize:
                "14px",
            }}
          >
            No Cover Image
          </div>
        )}
      </div>

      {/* Title */}

      <Link
        to={`/event/${event.id}`}
        style={{
          textDecoration:
            "none",

          color:
            "#fff",
        }}
      >
        <h3
          style={{
            margin:
              "0 0 12px",

            fontSize:
              isMobile
                ? "22px"
                : "28px",

            lineHeight:
              "1.2",
          }}
        >
          {event.title}
        </h3>
      </Link>

      {/* Event Info */}

      <div
        style={{
          display:
            "flex",

          flexDirection:
            "column",

          gap: "8px",

          color:
            "#B5B5B5",

          fontSize:
            isMobile
              ? "14px"
              : "15px",
        }}
      >
        <div>
          📍{" "}
          {event.area}
        </div>

        <div>
          📅{" "}
          {
            event.event_date
          }
        </div>

        <div>
          💰 ₹
          {event.price}
        </div>
      </div>

      {/* Age Badge */}

      {event.minimum_age >
        0 && (
        <div
          style={{
            display:
              "inline-block",

            marginTop:
              "14px",

            padding:
              isMobile
                ? "6px 10px"
                : "8px 12px",

            background:
              "#1E2A00",

            color:
              "#C7FF41",

            border:
              "1px solid #2F4300",

            borderRadius:
              "999px",

            fontSize:
              "13px",

            fontWeight:
              "600",
          }}
        >
          {event.minimum_age}
          +
        </div>
      )}

      {/* CTA */}

      <div
        style={{
          marginTop:
            "20px",
        }}
      >
        <Link
          to={`/event/${event.id}`}
          style={{
            display:
              "block",

            width:
              "100%",

            textAlign:
              "center",

            background:
              isJoined
                ? "#1E2A00"
                : "#C7FF41",

            color:
              isJoined
                ? "#C7FF41"
                : "#000",

            border:
              isJoined
                ? "1px solid #C7FF41"
                : "none",

            padding:
              isMobile
                ? "12px"
                : "14px",

            borderRadius:
              "14px",

            textDecoration:
              "none",

            fontWeight:
              "700",

            fontSize:
              "15px",

            transition:
              "all .2s ease",
          }}
        >
          {isPast
            ? "View Event"
            : isJoined
            ? "Joined"
            : "Join Event"}
        </Link>
      </div>
    </Card>
  );
}