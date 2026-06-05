export default function EventCard({
    event,
  }) {
    return (
      <div
        style={{
          background: "#171717",
          border: "1px solid #2A2A2A",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>{event.title}</h2>
  
        <p>{event.city}</p>
  
        <p>₹{event.price}</p>
  
        <button
          style={{
            background: "#C7FF41",
            color: "#000",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          View Event
        </button>
      </div>
    );
  }