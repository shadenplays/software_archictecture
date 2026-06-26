import { MenuIcon } from "../components/Icons";

export default function AdminHeader({ title, adminName, isMobile, onMenuClick }) {
  return (
    <header
      style={{
        background: "#1e3d2f",
        padding: isMobile ? "0 16px" : "0 32px",
        height: isMobile ? 60 : 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        borderBottom: "none",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* LEFT SIDE - Menu Button (Mobile) + Title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <MenuIcon size={24} color="#fff" />
          </button>
        )}
        
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? 16 : 20,
            fontWeight: 700,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {title}
        </h1>
      </div>

      {/* RIGHT SIDE ADMIN INFO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 6 : 10
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: isMobile ? 28 : 34,
            height: isMobile ? 28 : 34,
            borderRadius: "50%",
            background: "#fff",
            color: "#1e3d2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? 11 : 13,
            fontWeight: 700
          }}
        >
          {adminName ? adminName.charAt(0).toUpperCase() : "A"}
        </div>

        {/* Name - Hide on small mobile */}
        {!isMobile && (
          <span
            style={{
              fontSize: 14,
              color: "#fff",
              fontWeight: 600
            }}
          >
            {adminName || "Admin"}
          </span>
        )}
      </div>
    </header>
  );
}