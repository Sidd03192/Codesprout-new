export default function Layout({ children }) {
  return (
      <div className="dark text-foreground bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] "
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
  );
}
