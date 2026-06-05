import { Link } from "react-router-dom";

import useMobile from "../../../hooks/useMobile";

export default function CommunityCard({
  community,
}) {
  const isMobile =
    useMobile();

  return (
    <div
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

        minHeight:
          isMobile
            ? "220px"
            : "260px",

        display:
          "flex",

        flexDirection:
          "column",

        justifyContent:
          "space-between",

        transition:
          "all .2s ease",
      }}
    >
      <div>
        <div
          style={{
            color:
              "#C7FF41",

            fontSize:
              isMobile
                ? "12px"
                : "14px",

            letterSpacing:
              "1px",

            textTransform:
              "uppercase",

            marginBottom:
              "12px",
          }}
        >
          Community
        </div>

        <h2
          style={{
            fontSize:
              isMobile
                ? "24px"
                : "32px",

            marginTop: 0,

            marginBottom:
              "16px",

            lineHeight:
              "1.1",

            wordBreak:
              "break-word",
          }}
        >
          {community.name}
        </h2>

        <p
          style={{
            color:
              "#9CA3AF",

            lineHeight:
              "1.7",

            marginBottom:
              "24px",

            fontSize:
              isMobile
                ? "14px"
                : "16px",
          }}
        >
          {
            community.description
          }
        </p>
      </div>

      <div>
        <div
          style={{
            display:
              "flex",

            gap: "10px",

            marginBottom:
              "20px",

            flexWrap:
              "wrap",
          }}
        >
          <div
            style={{
              background:
                "#1A1A1A",

              border:
                "1px solid #232323",

              padding:
                isMobile
                  ? "6px 10px"
                  : "8px 12px",

              borderRadius:
                "999px",

              fontSize:
                isMobile
                  ? "12px"
                  : "14px",
            }}
          >
            👥 Community
          </div>

          <div
            style={{
              background:
                "#1A1A1A",

              border:
                "1px solid #232323",

              padding:
                isMobile
                  ? "6px 10px"
                  : "8px 12px",

              borderRadius:
                "999px",

              fontSize:
                isMobile
                  ? "12px"
                  : "14px",
            }}
          >
            🎉 Events
          </div>
        </div>

        <Link
          to={`/community/${community.id}`}
          style={{
            textDecoration:
              "none",
          }}
        >
          <button
            style={{
              width:
                "100%",

              height:
                isMobile
                  ? "48px"
                  : "52px",

              background:
                "#C7FF41",

              color:
                "#000",

              border:
                "none",

              borderRadius:
                "14px",

              cursor:
                "pointer",

              fontWeight:
                "700",

              fontSize:
                isMobile
                  ? "14px"
                  : "15px",
            }}
          >
            View Community
          </button>
        </Link>
      </div>
    </div>
  );
}