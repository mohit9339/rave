export default function Button({
  children,
  onClick,
  type = "button",
  variant =
    "primary",
}) {
  const styles = {
    primary: {
      background:
        "#C7FF41",

      color: "#000",
    },

    secondary: {
      background:
        "transparent",

      border:
        "1px solid #232323",

      color: "#fff",
    },

    danger: {
      background:
        "#FF4D4F",

      color: "#fff",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding:
          "12px 18px",

        borderRadius:
          "14px",

        border:
          "none",

        cursor:
          "pointer",

        fontWeight:
          "600",

        ...styles[
          variant
        ],
      }}
    >
      {children}
    </button>
  );
}