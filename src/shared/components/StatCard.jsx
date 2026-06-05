import Card from "./Card";

export default function StatCard({
  label,
  value,
}) {
  return (
    <Card
      style={{
        minWidth:
          "220px",
      }}
    >
      <div
        style={{
          color:
            "#9CA3AF",

          fontSize:
            "14px",
        }}
      >
        {label}
      </div>

      <h2>
        {value}
      </h2>
    </Card>
  );
}