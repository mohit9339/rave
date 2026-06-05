export default function Badge({
    children,
  }) {
    return (
      <span
        style={{
          background:
            "#1A1A1A",
  
          border:
            "1px solid #232323",
  
          padding:
            "6px 12px",
  
          borderRadius:
            "999px",
  
          fontSize:
            "14px",
        }}
      >
        {children}
      </span>
    );
  }