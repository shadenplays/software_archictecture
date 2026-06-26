// import { AdminNavIcon, CloseIcon } from "../components/Icons";

// const adminNavItems = [
//   { label: "Dashboard", key: "dashboard", icon: "dashboard" },
//   { label: "Products", key: "products", icon: "products" },
//   { label: "Orders", key: "orders", icon: "orders" },
// ];

// export default function AdminSidebar({ 
//   activeKey, 
//   setAdminPage, 
//   onLogout, 
//   isMobile,
//   sidebarOpen,
//   setSidebarOpen 
// }) {
//   // ========== HANDLE NAV CLICK ==========
//   const handleNavClick = (key) => {
//     setAdminPage(key);
//     // Close sidebar on mobile after click
//     if (isMobile && setSidebarOpen) {
//       setSidebarOpen(false);
//     }
//   };

//   // ========== HANDLE LOGOUT ==========
//   const handleLogout = () => {
//     if (onLogout) {
//       onLogout();
//     }
//     // Close sidebar on mobile after logout
//     if (isMobile && setSidebarOpen) {
//       setSidebarOpen(false);
//     }
//   };

//   // ========== SIDEBAR STYLES ==========
//   const sidebarStyles = {
//     width: isMobile ? 280 : 250,
//     minHeight: "100vh",
//     height: "100%",
//     background: "#f0f7f1",
//     display: "flex",
//     flexDirection: "column",
//     padding: "20px 0",
//     color: "#1a2e1a",
//     flexShrink: 0,
//     position: isMobile ? "fixed" : "sticky",
//     top: 0,
//     left: isMobile ? (sidebarOpen ? 0 : "-280px") : 0,
//     overflowY: "auto",
//     borderRight: "1px solid #e8f0ea",
//     zIndex: 1000,
//     boxShadow: isMobile ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
//     transition: isMobile ? "left 0.3s ease" : "none"
//   };

//   return (
//     <div 
//       className="admin-sidebar"
//       style={sidebarStyles}
//     >
//       {/* ===== MOBILE CLOSE BUTTON ===== */}
//       {isMobile && (
//         <div style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           padding: "8px 16px",
//           borderBottom: "1px solid #e8f0ea"
//         }}>
//           <button
//             onClick={() => setSidebarOpen && setSidebarOpen(false)}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: 24,
//               cursor: "pointer",
//               color: "#1a2e1a",
//               padding: "4px 8px",
//               borderRadius: "8px",
//               transition: "background 0.2s"
//             }}
//             onMouseEnter={(e) => e.currentTarget.style.background = "#e8f3eb"}
//             onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
//           >
//             <CloseIcon size={20} color="#1a2e1a" />
//           </button>
//         </div>
//       )}

//       {/* ===== BRAND ===== */}
//       <div style={{ 
//         padding: isMobile ? "0 16px 16px 16px" : "0 20px 20px 20px", 
//         borderBottom: isMobile ? "none" : "1px solid #e8f0ea"
//       }}>
//         <h2 style={{ 
//           margin: 0, 
//           fontSize: isMobile ? 16 : 18, 
//           fontWeight: 700, 
//           color: "#1a2e1a" 
//         }}>
//           Your Local Shop
//         </h2>
//         <p style={{ 
//           margin: 0, 
//           fontSize: isMobile ? 10 : 12, 
//           color: "#5c7a5c" 
//         }}>
//           Online Convenience Store
//         </p>
//       </div>

//       {/* ===== HEADER ===== */}
//       <div style={{
//         padding: isMobile ? "16px 16px 12px 16px" : "20px 20px 16px 20px",
//         fontSize: isMobile ? 11 : 13,
//         fontWeight: 700,
//         letterSpacing: 1,
//         color: "#5c7a5c",
//         textTransform: "uppercase"
//       }}>
//         Admin Panel
//       </div>

//       {/* ===== NAV ITEMS ===== */}
//       <div style={{ flex: 1, padding: isMobile ? "0 8px" : "0 12px" }}>
//         {adminNavItems.map((item) => {
//           const isActive = activeKey === item.key;

//           return (
//             <div
//               key={item.key}
//               onClick={() => handleNavClick(item.key)}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: isMobile ? "10px 14px" : "12px 16px",
//                 margin: "4px 0",
//                 borderRadius: 10,
//                 cursor: "pointer",
//                 background: isActive ? "#2d6a4f" : "transparent",
//                 color: isActive ? "#fff" : "#5c7a5c",
//                 fontWeight: isActive ? 700 : 500,
//                 transition: "all 0.2s ease",
//                 boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
//               }}
//               onMouseEnter={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.background = "#e8f3eb";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isActive) {
//                   e.currentTarget.style.background = "transparent";
//                 }
//               }}
//             >
//               <span style={{ 
//                 width: 24, 
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: isActive ? "#fff" : "#5c7a5c"
//               }}>
//                 <AdminNavIcon 
//                   type={item.icon} 
//                   size={isMobile ? 16 : 18} 
//                   color={isActive ? "#fff" : "#5c7a5c"} 
//                 />
//               </span>
//               <span style={{ fontSize: isMobile ? 13 : 14 }}>{item.label}</span>
//               {isActive && (
//                 <span style={{
//                   marginLeft: "auto",
//                   fontSize: 9,
//                   background: "rgba(255,255,255,0.2)",
//                   padding: "2px 8px",
//                   borderRadius: 10,
//                   color: "#fff"
//                 }}>
//                   Active
//                 </span>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* ===== LOGOUT ===== */}
//       <div style={{ 
//         padding: isMobile ? "8px" : "12px", 
//         borderTop: "1px solid #e8f0ea" 
//       }}>
//         <div
//           onClick={handleLogout}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//             padding: isMobile ? "10px 14px" : "12px 16px",
//             borderRadius: 10,
//             cursor: "pointer",
//             color: "#e63946",
//             fontWeight: 500,
//             transition: "all 0.2s ease"
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.background = "#fee2e2";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.background = "transparent";
//           }}
//         >
//           <span style={{ 
//             width: 24, 
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}>
//             <AdminNavIcon type="logout" size={isMobile ? 16 : 18} color="#e63946" />
//           </span>
//           <span style={{ fontSize: isMobile ? 13 : 14 }}>Logout</span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { AdminNavIcon, CloseIcon } from "../components/Icons";

const adminNavItems = [
  { label: "Dashboard", key: "dashboard", icon: "dashboard" },
  { label: "Products", key: "products", icon: "products" },
  { label: "Orders", key: "orders", icon: "orders" },
];

export default function AdminSidebar({ 
  activeKey, 
  setAdminPage, 
  onLogout, 
  isMobile,
  sidebarOpen,
  setSidebarOpen 
}) {
  // ========== HANDLE NAV CLICK ==========
  const handleNavClick = (key) => {
    setAdminPage(key);
    // Close sidebar on mobile after click
    if (isMobile && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // ========== HANDLE LOGOUT ==========
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // Close sidebar on mobile after logout
    if (isMobile && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // ========== SIDEBAR STYLES ==========
  const sidebarStyles = {
    width: isMobile ? 280 : 250,
    minHeight: "100vh",
    height: "100%",
    background: "#f0f7f1",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    color: "#1a2e1a",
    flexShrink: 0,
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    left: isMobile ? (sidebarOpen ? 0 : "-280px") : 0,
    overflowY: "auto",
    borderRight: "1px solid #e8f0ea",
    zIndex: 1000,
    boxShadow: isMobile ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
    transition: isMobile ? "left 0.3s ease" : "none"
  };

  return (
    <div 
      className="admin-sidebar"
      style={sidebarStyles}
    >
      {/* ===== MOBILE CLOSE BUTTON ===== */}
      {isMobile && (
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 16px",
          borderBottom: "1px solid #e8f0ea"
        }}>
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#1a2e1a",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#e8f3eb"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <CloseIcon size={20} color="#1a2e1a" />
          </button>
        </div>
      )}

      {/* ===== BRAND ===== */}
      <div style={{ 
        padding: isMobile ? "0 16px 16px 16px" : "0 20px 20px 20px", 
        borderBottom: isMobile ? "none" : "1px solid #e8f0ea"
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: isMobile ? 16 : 18, 
          fontWeight: 700, 
          color: "#1a2e1a" 
        }}>
          Your Local Shop
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: isMobile ? 10 : 12, 
          color: "#5c7a5c" 
        }}>
          Online Convenience Store
        </p>
      </div>

      {/* ===== HEADER ===== */}
      <div style={{
        padding: isMobile ? "16px 16px 12px 16px" : "20px 20px 16px 20px",
        fontSize: isMobile ? 11 : 13,
        fontWeight: 700,
        letterSpacing: 1,
        color: "#5c7a5c",
        textTransform: "uppercase"
      }}>
        Admin Panel
      </div>

      {/* ===== NAV ITEMS ===== */}
      <div style={{ flex: 1, padding: isMobile ? "0 8px" : "0 12px" }}>
        {adminNavItems.map((item) => {
          const isActive = activeKey === item.key;

          return (
            <div
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "10px 14px" : "12px 16px",
                margin: "4px 0",
                borderRadius: 10,
                cursor: "pointer",
                background: isActive ? "#2d6a4f" : "transparent",
                color: isActive ? "#fff" : "#5c7a5c",
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#e8f3eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ 
                width: 24, 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "#fff" : "#5c7a5c"
              }}>
                <AdminNavIcon 
                  type={item.icon} 
                  size={isMobile ? 16 : 18} 
                  color={isActive ? "#fff" : "#5c7a5c"} 
                />
              </span>
              <span style={{ fontSize: isMobile ? 13 : 14 }}>{item.label}</span>
              {isActive && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 8px",
                  borderRadius: 10,
                  color: "#fff"
                }}>
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== LOGOUT ===== */}
      <div style={{ 
        padding: isMobile ? "8px" : "12px", 
        borderTop: "1px solid #e8f0ea" 
      }}>
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: isMobile ? "10px 14px" : "12px 16px",
            borderRadius: 10,
            cursor: "pointer",
            color: "#e63946",
            fontWeight: 500,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fee2e2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <span style={{ 
            width: 24, 
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <AdminNavIcon type="logout" size={isMobile ? 16 : 18} color="#e63946" />
          </span>
          <span style={{ fontSize: isMobile ? 13 : 14 }}>Logout</span>
        </div>
      </div>
    </div>
  );
}