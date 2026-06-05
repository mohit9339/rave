import { useEffect, useState } from "react";

import Navbar from "../../../shared/components/Navbar";
import PageContainer from "../../../shared/components/PageContainer";

import CommunityCard from "../components/CommunityCard";

import {
  getCommunities,
} from "../services/communityService";

import useMobile from "../../../hooks/useMobile";

export default function Communities() {
  const [
    communities,
    setCommunities,
  ] = useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const isMobile =
    useMobile();

  useEffect(() => {
    async function loadCommunities() {
      const { data } =
        await getCommunities();

      if (data) {
        setCommunities(
          data
        );
      }

      setLoading(false);
    }

    loadCommunities();
  }, []);

  return (
    <>
      <Navbar />

      <PageContainer>
        {/* Hero */}

        <div
          style={{
            minHeight:
              isMobile
                ? "40vh"
                : "50vh",

            display:
              "flex",

            flexDirection:
              "column",

            justifyContent:
              "center",

            alignItems:
              "center",

            textAlign:
              "center",

            marginBottom:
              isMobile
                ? "50px"
                : "80px",

            padding:
              isMobile
                ? "0 12px"
                : "0",
          }}
        >
          <p
            style={{
              color:
                "#C7FF41",

              letterSpacing:
                "2px",

              fontSize:
                isMobile
                  ? "12px"
                  : "14px",

              textTransform:
                "uppercase",

              marginBottom:
                "20px",
            }}
          >
            RAVE
            COMMUNITIES
          </p>

          <h1
            style={{
              fontSize:
                isMobile
                  ? "48px"
                  : "clamp(60px,8vw,120px)",

              margin: 0,

              lineHeight:
                "0.95",
            }}
          >
            Find Your
            <br />
            Tribe
          </h1>

          <p
            style={{
              color:
                "#9CA3AF",

              maxWidth:
                "600px",

              margin:
                "30px auto 0",

              fontSize:
                isMobile
                  ? "15px"
                  : "18px",

              lineHeight:
                "1.8",
            }}
          >
            Join
            communities
            around music,
            startups,
            gaming,
            networking and
            more.
          </p>
        </div>

        {/* Content */}

        {loading ? (
          <p>
            Loading
            communities...
          </p>
        ) : communities.length ===
          0 ? (
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
                  ? "30px 20px"
                  : "50px",

              textAlign:
                "center",
            }}
          >
            <h2>
              No
              Communities
            </h2>

            <p
              style={{
                color:
                  "#9CA3AF",
              }}
            >
              No
              communities
              found yet.
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
                  : "repeat(auto-fit,minmax(350px,1fr))",

              gap:
                isMobile
                  ? "18px"
                  : "24px",
            }}
          >
            {communities.map(
              (
                community
              ) => (
                <CommunityCard
                  key={
                    community.id
                  }
                  community={
                    community
                  }
                />
              )
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}