export default function PageContainer({
    children,
  }) {
    return (
      <div
        style={{
          maxWidth:
            "1280px",
  
          margin:
            "40px auto",
  
          padding:
            "0 24px",
        }}
      >
        {children}
      </div>
    );
  }