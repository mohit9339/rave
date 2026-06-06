export default function ExitDialog({
    open,
    onExit,
    onCancel,
  }) {
    if (!open) return null;
  
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: "380px",
            background: "#141414",
            border: "1px solid #232323",
            borderRadius: "24px",
            padding: "24px",
          }}
        >
          <p
            style={{
              color: "#C7FF41",
              letterSpacing: "2px",
              fontSize: "12px",
              marginBottom: "12px",
            }}
          >
            RAVE
          </p>
  
          <h2
            style={{
              margin: 0,
              marginBottom: "12px",
            }}
          >
            Exit App?
          </h2>
  
          <p
            style={{
              color: "#9CA3AF",
              marginBottom: "24px",
            }}
          >
            Are you sure you want to leave RAVE?
          </p>
  
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                height: "52px",
                background: "#1A1A1A",
                color: "#fff",
                border: "1px solid #232323",
                borderRadius: "14px",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
  
            <button
              onClick={onExit}
              style={{
                flex: 1,
                height: "52px",
                background: "#C7FF41",
                color: "#000",
                border: "none",
                borderRadius: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }