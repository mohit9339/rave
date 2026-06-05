import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/Navbar";
import { getEventById, updateEvent } from "../../events/services/eventService";

const AGE_OPTIONS = [0, 13, 18, 21, 25];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [minimumAge, setMinimumAge] = useState(0);

  useEffect(() => {
    async function loadEvent() {
      const result = await getEventById(id);

      if (!result.data) {
        alert("Event not found");
        navigate("/host-dashboard");
        return;
      }

      const event = result.data;

      setTitle(event.title || "");
      setDescription(event.description || "");
      setCity(event.city || "");
      setArea(event.area || "");
      setPrice(event.price || "");
      setCapacity(event.capacity || "");
      setEventDate(event.event_date || "");
      setStartTime(event.start_time || "");
      setEndTime(event.end_time || "");
      setMinimumAge(event.minimum_age || 0);

      setLoading(false);
    }

    loadEvent();
  }, [id, navigate]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await updateEvent(id, {
      title,
      description,
      city,
      area,
      price: Number(price),
      capacity: Number(capacity),
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      minimum_age: minimumAge,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Event updated!");
    navigate(`/host-event/${id}`);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <p>Loading...</p>
      </>
    );
  }

  const inputStyle = {
    width: "100%",
    background: "#0F0F0F",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "white",
    boxSizing: "border-box",
  };

  const sectionStyle = {
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    color: "#9CA3AF",
    fontSize: "14px",
    marginBottom: "8px",
  };

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p
            style={{
              color: "#C7FF41",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Host Event
          </p>

          <h1
            style={{
              fontSize: "clamp(60px, 8vw, 110px)",
              lineHeight: "0.95",
              margin: "10px 0",
            }}
          >
            Edit
            <br />
            Event
          </h1>

          <p style={{ color: "#9CA3AF" }}>
            Update event details and attendee settings.
          </p>
        </div>

        <form onSubmit={handleSave}>

          {/* Basic Information */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Basic Information</h2>

            <label style={labelStyle}>Event Title</label>
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px" }}
              required
            />

            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }}
              required
            />
          </div>

          {/* Location */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Location</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Area</label>
                <input
                  type="text"
                  placeholder="Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Date & Time</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Event Settings */}
          <div style={sectionStyle}>
            <h2 style={{ marginBottom: "20px" }}>Event Settings</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Minimum Age</label>
                <select
                  value={minimumAge}
                  onChange={(e) => setMinimumAge(Number(e.target.value))}
                  style={inputStyle}
                >
                  {AGE_OPTIONS.map((age) => (
                    <option key={age} value={age}>
                      {age === 0 ? "Everyone" : `${age}+`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Capacity</label>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              height: "60px",
              background: "#C7FF41",
              color: "#000",
              border: "none",
              borderRadius: "18px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Update Event"}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(`/host-event/${id}`)}
            style={{
              width: "100%",
              marginTop: "15px",
              height: "56px",
              background: "#141414",
              color: "#fff",
              border: "1px solid #232323",
              borderRadius: "18px",
              cursor: "pointer",
            }}
          >
            Back To Event
          </button>
        </form>
      </div>
    </>
  );
}