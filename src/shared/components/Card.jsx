export default function Card({
    children,
  }) {
    return (
      <div
        style={{
          background:
            "#141414",
  
          border:
            "1px solid #232323",
  
          borderRadius:
            "24px",
  
          padding: "20px",
  
          transition:
            "all .2s ease",
        }}
      >
        {children}
      </div>
    );
  }