// import { useState, useEffect, useMemo } from "react";
// import { auth } from "../firebase";
// import { subscribeToProducts, subscribeToOrders } from "../services/firestore";
// import { getImageUrl } from "../utils/imageHelper";
// import AdminSidebar from "./AdminSidebar";
// import AdminHeader from "./AdminHeader";
// import ManageProducts from "./ManageProducts";
// import ManageOrders from "./ManageOrders";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// // ========== STATS CARD ==========
// function StatCard({ label, value, accent, isLoading, subtitle }) {
//   return (
//     <div style={{
//       background: "#fff",
//       borderRadius: 14,
//       padding: "18px 16px",
//       boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//       flex: 1,
//       minWidth: "120px",
//       transition: "all 0.3s ease",
//       border: "1px solid #e8f0ea"
//     }}>
//       <p style={{ 
//         margin: "0 0 4px", 
//         fontSize: 11, 
//         color: "#5c7a5c", 
//         fontWeight: 500,
//         letterSpacing: "0.3px"
//       }}>
//         {label}
//       </p>
//       <p style={{
//         margin: 0,
//         fontSize: 22,
//         fontWeight: 700,
//         color: accent || "#1a2e1a"
//       }}>
//         {isLoading ? "..." : value}
//       </p>
//       {subtitle && (
//         <p style={{
//           margin: "4px 0 0",
//           fontSize: 10,
//           color: "#16a34a",
//           fontWeight: 500
//         }}>
//           {subtitle}
//         </p>
//       )}
//     </div>
//   );
// }

// // ========== DATE FILTER ==========
// function DateFilter({ startDate, endDate, onStartChange, onEndChange }) {
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div style={{
//       display: "flex",
//       flexDirection: isMobile ? "column" : "row",
//       alignItems: isMobile ? "stretch" : "center",
//       gap: isMobile ? "8px" : "12px",
//       background: "#fff",
//       padding: isMobile ? "12px 14px" : "12px 20px",
//       borderRadius: "12px",
//       boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//       border: "1px solid #e8f0ea"
//     }}>
//       <span style={{ 
//         fontSize: 13, 
//         fontWeight: 600, 
//         color: "#5c7a5c",
//         marginBottom: isMobile ? 4 : 0
//       }}>
//         📅 Date Range:
//       </span>
//       <div style={{ 
//         display: "flex", 
//         alignItems: "center", 
//         gap: "6px",
//         flex: isMobile ? 1 : "auto"
//       }}>
//         <label style={{ fontSize: 12, color: "#666" }}>Start</label>
//         <input
//           type="date"
//           value={startDate}
//           onChange={onStartChange}
//           style={{
//             padding: "6px 8px",
//             borderRadius: 6,
//             border: "1px solid #d4e6d8",
//             fontSize: 12,
//             outline: "none",
//             color: "#1a2e1a",
//             background: "#f8faf8",
//             width: isMobile ? "100%" : "auto"
//           }}
//         />
//       </div>
//       <div style={{ 
//         display: "flex", 
//         alignItems: "center", 
//         gap: "6px",
//         flex: isMobile ? 1 : "auto"
//       }}>
//         <label style={{ fontSize: 12, color: "#666" }}>End</label>
//         <input
//           type="date"
//           value={endDate}
//           onChange={onEndChange}
//           style={{
//             padding: "6px 8px",
//             borderRadius: 6,
//             border: "1px solid #d4e6d8",
//             fontSize: 12,
//             outline: "none",
//             color: "#1a2e1a",
//             background: "#f8faf8",
//             width: isMobile ? "100%" : "auto"
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// // ========== INTERACTIVE LINE CHART ==========
// function InteractiveLineChart({ points, dates, isLoading }) {
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0, date: "" });
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (isLoading) {
//     return (
//       <div style={{ 
//         height: isMobile ? 150 : 200, 
//         display: "flex", 
//         alignItems: "center", 
//         justifyContent: "center",
//         color: "#b0b0b0",
//         fontSize: 14
//       }}>
//         Loading chart...
//       </div>
//     );
//   }

//   if (!points || points.length === 0) {
//     return (
//       <div style={{ 
//         height: isMobile ? 150 : 200, 
//         display: "flex", 
//         flexDirection: "column",
//         alignItems: "center", 
//         justifyContent: "center",
//         color: "#b0b0b0",
//         fontSize: 14
//       }}>
//         <span style={{ fontSize: 28, marginBottom: 8 }}>📈</span>
//         No sales data available
//         <span style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>
//           Add orders to see sales trend
//         </span>
//       </div>
//     );
//   }

//   const max = Math.max(...points, 1);
//   const w = isMobile ? 200 : 280;
//   const h = isMobile ? 120 : 170;
//   const padding = { top: isMobile ? 15 : 20, bottom: isMobile ? 15 : 20, left: isMobile ? 8 : 10, right: isMobile ? 8 : 10 };
//   const chartWidth = w - padding.left - padding.right;
//   const chartHeight = h - padding.top - padding.bottom;
//   const stepX = chartWidth / Math.max(points.length - 1, 1);

//   const getPoint = (index) => ({
//     x: padding.left + index * stepX,
//     y: padding.top + chartHeight - (points[index] / max) * chartHeight * 0.85
//   });

//   const path = points
//     .map((p, i) => {
//       const point = getPoint(i);
//       return `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`;
//     })
//     .join(" ");

//   const handleMouseMove = (e, index) => {
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
    
//     setHoveredIndex(index);
//     setTooltip({
//       show: true,
//       x: x,
//       y: y - 40,
//       value: points[index],
//       date: dates && dates[index] ? dates[index] : `Day ${index + 1}`
//     });
//   };

//   const handleMouseLeave = () => {
//     setHoveredIndex(null);
//     setTooltip({ ...tooltip, show: false });
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", height: isMobile ? 140 : 200 }}>
//       <svg 
//         viewBox={`0 0 ${w} ${h}`} 
//         width="100%" 
//         height={h}
//         style={{ cursor: "pointer" }}
//       >
//         <line x1={padding.left} y1={padding.top + chartHeight * 0.25} x2={w - padding.right} y2={padding.top + chartHeight * 0.25} stroke="#f0f0f0" strokeWidth="1" />
//         <line x1={padding.left} y1={padding.top + chartHeight * 0.5} x2={w - padding.right} y2={padding.top + chartHeight * 0.5} stroke="#f0f0f0" strokeWidth="1" />
//         <line x1={padding.left} y1={padding.top + chartHeight * 0.75} x2={w - padding.right} y2={padding.top + chartHeight * 0.75} stroke="#f0f0f0" strokeWidth="1" />
        
//         <text x={padding.left - 2} y={padding.top} textAnchor="end" fontSize="8" fill="#ccc">RM{max.toFixed(0)}</text>
//         <text x={padding.left - 2} y={padding.top + chartHeight * 0.5} textAnchor="end" fontSize="8" fill="#ccc">RM{(max/2).toFixed(0)}</text>
//         <text x={padding.left - 2} y={padding.top + chartHeight} textAnchor="end" fontSize="8" fill="#ccc">RM0</text>

//         <path
//           d={`${path} L ${padding.left + (points.length - 1) * stepX} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
//           fill="rgba(45, 106, 79, 0.1)"
//           stroke="none"
//         />
        
//         <path
//           d={path}
//           fill="none"
//           stroke="#2d6a4f"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
        
//         {points.map((p, i) => {
//           const point = getPoint(i);
//           const isHovered = hoveredIndex === i;
//           return (
//             <g
//               key={i}
//               onMouseEnter={(e) => handleMouseMove(e, i)}
//               onMouseMove={(e) => handleMouseMove(e, i)}
//               onMouseLeave={handleMouseLeave}
//               style={{ cursor: "pointer" }}
//             >
//               <circle
//                 cx={point.x}
//                 cy={point.y}
//                 r={isHovered ? 6 : 3}
//                 fill={isHovered ? "#2d6a4f" : "#2d6a4f"}
//                 stroke="#fff"
//                 strokeWidth={isHovered ? 2 : 1.5}
//                 style={{
//                   transition: "all 0.2s ease",
//                   filter: isHovered ? "drop-shadow(0 0 8px rgba(45, 106, 79, 0.4))" : "none"
//                 }}
//               />
//               {isHovered && (
//                 <>
//                   <circle
//                     cx={point.x}
//                     cy={point.y}
//                     r={10}
//                     fill="rgba(45, 106, 79, 0.15)"
//                     style={{
//                       animation: "pulse 1s ease-in-out infinite"
//                     }}
//                   />
//                   <line
//                     x1={point.x}
//                     y1={point.y}
//                     x2={point.x}
//                     y2={padding.top + chartHeight}
//                     stroke="#2d6a4f"
//                     strokeWidth="1"
//                     strokeDasharray="3,3"
//                     opacity="0.5"
//                   />
//                 </>
//               )}
//             </g>
//           );
//         })}
//       </svg>

//       {tooltip.show && (
//         <div
//           style={{
//             position: "absolute",
//             left: Math.min(tooltip.x - 35, isMobile ? 20 : 40),
//             top: tooltip.y - 30,
//             background: "#1a2e1a",
//             color: "#fff",
//             padding: "4px 10px",
//             borderRadius: 6,
//             fontSize: isMobile ? 9 : 11,
//             fontWeight: 600,
//             pointerEvents: "none",
//             boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//             zIndex: 10,
//             minWidth: 60,
//             textAlign: "center",
//             transition: "all 0.1s ease",
//             fontFamily: "'Inter','Segoe UI',sans-serif"
//           }}
//         >
//           <div style={{ fontSize: isMobile ? 11 : 14, fontWeight: 700 }}>RM {tooltip.value.toFixed(2)}</div>
//           <div style={{ fontSize: isMobile ? 8 : 10, opacity: 0.8, marginTop: 2 }}>{tooltip.date}</div>
//           <div style={{
//             position: "absolute",
//             bottom: -6,
//             left: "50%",
//             transform: "translateX(-50%)",
//             width: 0,
//             height: 0,
//             borderLeft: "6px solid transparent",
//             borderRight: "6px solid transparent",
//             borderTop: "6px solid #1a2e1a"
//           }} />
//         </div>
//       )}
//     </div>
//   );
// }

// // ========== ORDER STATUS BAR CHART ==========
// function OrderStatusBarChart({ data, isLoading }) {
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 768);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (isLoading) {
//     return (
//       <div style={{ 
//         height: isMobile ? 150 : 200, 
//         display: "flex", 
//         alignItems: "center", 
//         justifyContent: "center",
//         color: "#b0b0b0",
//         fontSize: 14
//       }}>
//         Loading chart...
//       </div>
//     );
//   }

//   const hasData = data.some(d => d.value > 0);
  
//   if (!hasData) {
//     return (
//       <div style={{ 
//         height: isMobile ? 150 : 200, 
//         display: "flex", 
//         flexDirection: "column",
//         alignItems: "center", 
//         justifyContent: "center",
//         color: "#b0b0b0",
//         fontSize: 14
//       }}>
//         <span style={{ fontSize: 28, marginBottom: 8 }}>📊</span>
//         No order data available
//       </div>
//     );
//   }

//   const max = Math.max(...data.map(d => d.value), 1);
//   const chartHeight = isMobile ? 100 : 150;
//   const colors = ["#2d6a4f", "#f4a429", "#e63946"];

//   return (
//     <div style={{ 
//       width: "100%", 
//       height: isMobile ? 150 : 200, 
//       display: "flex", 
//       flexDirection: "column",
//       alignItems: "center",
//       paddingTop: 10
//     }}>
//       <div style={{ 
//         display: "flex", 
//         alignItems: "flex-end", 
//         gap: isMobile ? 12 : 20,
//         height: chartHeight,
//         justifyContent: "center",
//         paddingLeft: 10,
//         paddingRight: 10
//       }}>
//         {data.map((item, index) => {
//           const height = Math.max((item.value / max) * chartHeight * 0.85, 4);
//           return (
//             <div key={index} style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               height: chartHeight,
//               justifyContent: "flex-end"
//             }}>
//               <span style={{
//                 fontSize: isMobile ? 10 : 12,
//                 color: colors[index],
//                 fontWeight: 700,
//                 marginBottom: 4
//               }}>
//                 {item.value}
//               </span>
              
//               <div style={{
//                 width: isMobile ? 30 : 50,
//                 height: height,
//                 background: colors[index],
//                 borderRadius: "4px 4px 0 0",
//                 transition: "height 0.5s ease",
//                 minHeight: 4,
//                 position: "relative"
//               }} />
              
//               <span style={{
//                 fontSize: isMobile ? 9 : 11,
//                 color: "#555",
//                 marginTop: 6,
//                 fontWeight: 600
//               }}>
//                 {item.label}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ========== TOP PRODUCTS ==========
// function TopProducts({ products, isLoading }) {
//   if (isLoading) {
//     return (
//       <div style={{ padding: "8px 0", color: "#b0b0b0", fontSize: 14 }}>
//         Loading products...
//       </div>
//     );
//   }

//   if (!products || products.length === 0) {
//     return (
//       <div style={{ padding: "8px 0", color: "#b0b0b0", fontSize: 14 }}>
//         No products available
//       </div>
//     );
//   }

//   return (
//     <div>
//       {products.slice(0, 5).map((p, i) => (
//         <div key={p.name || i} style={{
//           display: "flex",
//           justifyContent: "space-between",
//           padding: "8px 0",
//           borderBottom: "1px solid #f0f5f1"
//         }}>
//           <span style={{ color: "#3d5a40", fontSize: 13 }}>
//             {i + 1}. {p.name}
//           </span>
//           <b style={{ color: "#2d6a4f", fontSize: 13 }}>
//             {p.sold || 0} sold
//           </b>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ========== CATEGORY CHART ==========
// function CategoryChart({ data, isLoading }) {
//   if (isLoading) {
//     return (
//       <div style={{ padding: "20px", textAlign: "center", color: "#b0b0b0" }}>
//         Loading categories...
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div style={{ padding: "20px", textAlign: "center", color: "#b0b0b0" }}>
//         No category data available
//       </div>
//     );
//   }

//   const colors = ["#2d6a4f", "#f4a429", "#2563eb", "#e63946", "#7c3aed"];
//   const total = data.reduce((sum, d) => sum + d.value, 0);

//   return (
//     <div>
//       {data.map((item, index) => {
//         const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
//         return (
//           <div key={item.label} style={{ marginBottom: 10 }}>
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               fontSize: 12,
//               color: "#3d5a40",
//               marginBottom: 4
//             }}>
//               <span>{item.label}</span>
//               <span style={{ fontWeight: 600 }}>{percentage}%</span>
//             </div>
//             <div style={{
//               width: "100%",
//               height: 6,
//               background: "#f0f5f1",
//               borderRadius: 4,
//               overflow: "hidden"
//             }}>
//               <div style={{
//                 width: `${percentage}%`,
//                 height: "100%",
//                 background: colors[index % colors.length],
//                 borderRadius: 4,
//                 transition: "width 0.5s ease"
//               }} />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ========== MAIN DASHBOARD ==========
// export default function AdminDashboard({ onLogout }) {
//   const [adminPage, setAdminPage] = useState("dashboard");
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dataLoaded, setDataLoaded] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   const today = new Date();
//   const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
//   const [startDate, setStartDate] = useState(
//     firstDayOfMonth.toISOString().split('T')[0]
//   );
//   const [endDate, setEndDate] = useState(
//     today.toISOString().split('T')[0]
//   );

//   // ========== CHECK MOBILE ==========
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       if (!mobile) {
//         setSidebarOpen(false);
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ========== FETCH DATA FROM FIREBASE ==========
//   useEffect(() => {
//     setLoading(true);
    
//     const unsubProducts = subscribeToProducts((data) => {
//       setProducts(data);
//       setDataLoaded(true);
//       setLoading(false);
//     });

//     const unsubOrders = subscribeToOrders((data) => {
//       setOrders(data);
//       setDataLoaded(true);
//       setLoading(false);
//     });

//     return () => {
//       unsubProducts();
//       unsubOrders();
//     };
//   }, []);

//   // ========== FILTER ORDERS BY DATE ==========
//   const filteredOrders = useMemo(() => {
//     if (!startDate || !endDate) return orders;
    
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
    
//     return orders.filter(order => {
//       const orderDate = order.createdAt?.toDate 
//         ? order.createdAt.toDate() 
//         : new Date(order.createdAt);
//       return orderDate >= start && orderDate <= end;
//     });
//   }, [orders, startDate, endDate]);

//   // ========== STATS ==========
//   const stats = useMemo(() => {
//     const totalProducts = products.length;
//     const totalOrders = filteredOrders.length;

//     const totalRevenue = filteredOrders
//       .filter(o => (o.status || "").toLowerCase() === "paid")
//       .reduce((sum, o) => sum + (o.total || 0), 0);

//     const lowStock = products.filter(p => (p.stock || 0) <= 5).length;

//     const customers = new Set(
//       filteredOrders.map(o => o.userId || o.userID || "guest")
//     );

//     const paidOrders = filteredOrders.filter(o => (o.status || "").toLowerCase() === "paid");
//     const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

//     return {
//       totalProducts,
//       totalOrders,
//       totalRevenue,
//       lowStock,
//       totalCustomers: customers.size,
//       avgOrderValue
//     };
//   }, [products, filteredOrders]);

//   // ========== SALES CHART DATA ==========
//   const salesData = useMemo(() => {
//     const map = {};
//     const dateMap = {};

//     filteredOrders.forEach(o => {
//       if ((o.status || "").toLowerCase() !== "paid") return;
//       try {
//         const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
//         const day = date.getDate();
//         const month = date.toLocaleString('default', { month: 'short' });
//         const key = `${month} ${day}`;
        
//         map[day] = (map[day] || 0) + (o.total || 0);
//         dateMap[day] = key;
//       } catch (e) {
//         // Skip invalid dates
//       }
//     });

//     const values = Object.values(map);
//     const dates = Object.values(dateMap);
    
//     return { values, dates };
//   }, [filteredOrders]);

//   // ========== ORDER STATUS ==========
//   const orderStatus = useMemo(() => {
//     const counts = { Paid: 0, Pending: 0, Cancelled: 0 };

//     filteredOrders.forEach(o => {
//       const s = (o.status || "Pending").toLowerCase();
//       if (s === "paid") counts.Paid++;
//       else if (s === "pending") counts.Pending++;
//       else if (s === "cancelled") counts.Cancelled++;
//       else counts.Pending++;
//     });

//     return [
//       { label: "Paid", value: counts.Paid, color: "#2d6a4f" },
//       { label: "Pending", value: counts.Pending, color: "#f4a429" },
//       { label: "Cancelled", value: counts.Cancelled, color: "#e63946" }
//     ];
//   }, [filteredOrders]);

//   // ========== TOP PRODUCTS ==========
//   const topProducts = useMemo(() => {
//     const salesCount = {};
//     filteredOrders.forEach(order => {
//       if (order.items && Array.isArray(order.items)) {
//         order.items.forEach(item => {
//           const name = item.name || item.productName || "Unknown";
//           salesCount[name] = (salesCount[name] || 0) + (item.quantity || 1);
//         });
//       }
//     });

//     const sortedProducts = Object.entries(salesCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5)
//       .map(([name, count]) => {
//         const product = products.find(p => p.name === name);
//         return { 
//           name, 
//           sold: count,
//           image: product?.image || null
//         };
//       });

//     return sortedProducts;
//   }, [filteredOrders, products]);

//   // ========== CATEGORY DATA ==========
//   const categoryData = useMemo(() => {
//     const categoryMap = {};
    
//     filteredOrders.forEach(order => {
//       if (order.items && Array.isArray(order.items)) {
//         order.items.forEach(item => {
//           const product = products.find(p => p.id === item.id || p.productId === item.productId);
//           const category = product?.category || item.category || "Other";
//           categoryMap[category] = (categoryMap[category] || 0) + ((item.price || 0) * (item.quantity || 1));
//         });
//       }
//     });

//     return Object.entries(categoryMap)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 4)
//       .map(([label, value]) => ({ label, value }));
//   }, [filteredOrders, products]);

//   // ========== TITLE ==========
//   const getTitle = () => {
//     if (adminPage === "dashboard") return "Dashboard";
//     if (adminPage === "products") return "Manage Products";
//     if (adminPage === "orders") return "Manage Orders";
//     return "Admin Panel";
//   };

//   // ========== LOADING STATE ==========
//   if (loading && !dataLoaded) {
//     return (
//       <div style={{ 
//         display: "flex", 
//         minHeight: "100vh", 
//         background: "#f5f5f5",
//         alignItems: "center",
//         justifyContent: "center"
//       }}>
//         <div style={{ textAlign: "center", color: "#888" }}>
//           <span style={{ fontSize: 24, marginBottom: 8 }}>📊</span>
//           <div>Loading Dashboard...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ 
//       display: "flex", 
//       minHeight: "100vh", 
//       background: "#f5f5f5",
//       fontFamily: "'Inter','Segoe UI',sans-serif",
//       position: "relative"
//     }}>
//       {/* ===== SIDEBAR ===== */}
//       <div
//         style={{
//           position: isMobile ? "fixed" : "relative",
//           top: 0,
//           left: isMobile ? (sidebarOpen ? 0 : "-280px") : "auto",
//           width: isMobile ? 280 : 240,
//           height: "100vh",
//           zIndex: isMobile ? 1000 : "auto",
//           transition: isMobile ? "left 0.3s ease" : "none",
//           boxShadow: isMobile ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
//           overflowY: "auto",
//           flexShrink: 0
//         }}
//       >
//         <AdminSidebar
//           activeKey={adminPage}
//           setAdminPage={setAdminPage}
//           onLogout={onLogout}
//           isMobile={isMobile}
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={setSidebarOpen}
//         />
//       </div>

//       {/* ===== OVERLAY FOR MOBILE ===== */}
//       {isMobile && sidebarOpen && (
//         <div
//           onClick={() => setSidebarOpen(false)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.5)",
//             zIndex: 999,
//             animation: "fadeIn 0.3s ease"
//           }}
//         />
//       )}

//       {/* ===== MAIN CONTENT ===== */}
//       <div style={{ 
//         flex: 1, 
//         display: "flex", 
//         flexDirection: "column",
//         minHeight: "100vh",
//         width: isMobile ? "100%" : "calc(100% - 240px)",
//         overflowX: "hidden"
//       }}>
//         {/* HEADER */}
//         <AdminHeader
//           title={getTitle()}
//           adminName={auth.currentUser?.displayName || "Admin"}
//           isMobile={isMobile}
//           onMenuClick={() => setSidebarOpen(!sidebarOpen)}
//         />

//         <main style={{ 
//           flex: 1, 
//           padding: isMobile ? "12px" : "28px 36px",
//           overflowY: "auto",
//           background: "#f5f5f5",
//           width: "100%",
//           boxSizing: "border-box"
//         }}>
//           {adminPage === "dashboard" && (
//             <>
//               {/* Date Filter */}
//               <DateFilter
//                 startDate={startDate}
//                 endDate={endDate}
//                 onStartChange={(e) => setStartDate(e.target.value)}
//                 onEndChange={(e) => setEndDate(e.target.value)}
//               />

//               {/* Top Stats Cards */}
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
//                 gap: isMobile ? "10px" : "20px",
//                 marginTop: "16px",
//                 marginBottom: isMobile ? "16px" : "24px"
//               }}>
//                 <StatCard
//                   label="Total Revenue"
//                   value={`RM ${stats.totalRevenue.toFixed(2)}`}
//                   accent="#16a34a"
//                   isLoading={loading}
//                   subtitle={`${filteredOrders.length} orders`}
//                 />

//                 <StatCard
//                   label="Total Orders"
//                   value={stats.totalOrders}
//                   accent="#2563eb"
//                   isLoading={loading}
//                 />

//                 <StatCard
//                   label="Total Customers"
//                   value={stats.totalCustomers}
//                   accent="#7c3aed"
//                   isLoading={loading}
//                 />

//                 <StatCard
//                   label="Avg Order Value"
//                   value={`RM ${stats.avgOrderValue.toFixed(2)}`}
//                   accent="#f4a429"
//                   isLoading={loading}
//                 />
//               </div>

//               {/* Best Selling & Low Stock */}
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
//                 gap: isMobile ? "12px" : "20px",
//                 marginBottom: isMobile ? "16px" : "24px"
//               }}>
//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 10px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     🏆 Best Selling Product
//                   </h3>
//                   {topProducts.length > 0 ? (
//                     <div style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: isMobile ? "12px" : "16px"
//                     }}>
//                       <div style={{
//                         width: isMobile ? 48 : 64,
//                         height: isMobile ? 48 : 64,
//                         borderRadius: 8,
//                         overflow: "hidden",
//                         background: "#f5f5f5",
//                         flexShrink: 0,
//                         border: "1px solid #e8f0ea"
//                       }}>
//                         <img
//                           src={getImageUrl(topProducts[0].image)}
//                           alt={topProducts[0].name}
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "cover"
//                           }}
//                           onError={(e) => {
//                             e.target.src = "/images/default.png";
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <p style={{
//                           fontSize: isMobile ? 16 : 20,
//                           fontWeight: 700,
//                           color: "#2d6a4f",
//                           margin: "0"
//                         }}>
//                           {topProducts[0].name}
//                         </p>
//                         <p style={{
//                           fontSize: isMobile ? 12 : 14,
//                           color: "#5c7a5c",
//                           margin: "4px 0 0"
//                         }}>
//                           {topProducts[0].sold} units sold
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <p style={{ color: "#b0b0b0", fontSize: isMobile ? 13 : 14 }}>
//                       No sales data available
//                     </p>
//                   )}
//                 </div>

//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 10px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     ⚠️ Low Stock Alert
//                   </h3>
//                   {stats.lowStock > 0 ? (
//                     <div>
//                       <p style={{
//                         fontSize: isMobile ? 18 : 22,
//                         fontWeight: 700,
//                         color: "#e63946",
//                         margin: "4px 0"
//                       }}>
//                         {stats.lowStock} products
//                       </p>
//                       <p style={{
//                         fontSize: isMobile ? 12 : 14,
//                         color: "#5c7a5c",
//                         margin: "4px 0"
//                       }}>
//                         Need to restock soon
//                       </p>
//                     </div>
//                   ) : (
//                     <p style={{ 
//                       color: "#16a34a", 
//                       fontSize: isMobile ? 14 : 16, 
//                       fontWeight: 600 
//                     }}>
//                       ✅ All products in stock
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Charts Row */}
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
//                 gap: isMobile ? "12px" : "20px",
//                 marginBottom: isMobile ? "16px" : "24px",
//                 minHeight: isMobile ? "auto" : "220px"
//               }}>
//                 {/* Sales Trend Chart */}
//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 12px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     Sales Trend
//                   </h3>
//                   <InteractiveLineChart 
//                     points={salesData.values} 
//                     dates={salesData.dates}
//                     isLoading={loading}
//                   />
//                 </div>

//                 {/* Order Status Chart */}
//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 12px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     Order Status
//                   </h3>
//                   <OrderStatusBarChart 
//                     data={orderStatus} 
//                     isLoading={loading}
//                   />
//                 </div>
//               </div>

//               {/* Bottom Row */}
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
//                 gap: isMobile ? "12px" : "20px"
//               }}>
//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 12px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     Top Products
//                   </h3>
//                   <TopProducts 
//                     products={topProducts} 
//                     isLoading={loading}
//                   />
//                 </div>

//                 <div style={{
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: isMobile ? "16px" : "24px",
//                   boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
//                   border: "1px solid #e8f0ea"
//                 }}>
//                   <h3 style={{ 
//                     margin: "0 0 12px", 
//                     fontSize: isMobile ? "14px" : "16px",
//                     color: "#1a2e1a",
//                     fontWeight: 600
//                   }}>
//                     Top Categories
//                   </h3>
//                   <CategoryChart 
//                     data={categoryData} 
//                     isLoading={loading}
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {adminPage === "products" && (
//             <ManageProducts />
//           )}

//           {adminPage === "orders" && (
//             <ManageOrders />
//           )}
//         </main>
//       </div>

//       {/* ===== CSS ANIMATION ===== */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes pulse {
//           0% { transform: scale(1); opacity: 0.6; }
//           50% { transform: scale(1.5); opacity: 0.2; }
//           100% { transform: scale(1); opacity: 0.6; }
//         }
//       `}</style>
//     </div>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { auth } from "../firebase";
import { subscribeToProducts, subscribeToOrders } from "../services/firestore";
import { getImageUrl } from "../utils/imageHelper";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ManageProducts from "./ManageProducts";
import ManageOrders from "./ManageOrders";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ========== STATS CARD ==========
function StatCard({ label, value, accent, isLoading, subtitle }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: isMobile ? "14px 12px" : "18px 16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      flex: 1,
      minWidth: isMobile ? "100px" : "120px",
      transition: "all 0.3s ease",
      border: "1px solid #e8f0ea"
    }}>
      <p style={{ 
        margin: "0 0 4px", 
        fontSize: isMobile ? 10 : 11, 
        color: "#5c7a5c", 
        fontWeight: 500,
        letterSpacing: "0.3px"
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: isMobile ? 18 : 22,
        fontWeight: 700,
        color: accent || "#1a2e1a"
      }}>
        {isLoading ? "..." : value}
      </p>
      {subtitle && (
        <p style={{
          margin: "4px 0 0",
          fontSize: isMobile ? 9 : 10,
          color: "#16a34a",
          fontWeight: 500
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ========== DATE FILTER ==========
function DateFilter({ startDate, endDate, onStartChange, onEndChange }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "8px" : "12px",
      background: "#fff",
      padding: isMobile ? "12px 14px" : "12px 20px",
      borderRadius: "12px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      border: "1px solid #e8f0ea"
    }}>
      <span style={{ 
        fontSize: isMobile ? 12 : 13, 
        fontWeight: 600, 
        color: "#5c7a5c",
        marginBottom: isMobile ? 4 : 0
      }}>
        📅 Date Range:
      </span>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "6px",
        flex: isMobile ? 1 : "auto"
      }}>
        <label style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>Start</label>
        <input
          type="date"
          value={startDate}
          onChange={onStartChange}
          style={{
            padding: isMobile ? "4px 8px" : "6px 8px",
            borderRadius: 6,
            border: "1px solid #d4e6d8",
            fontSize: isMobile ? 11 : 12,
            outline: "none",
            color: "#1a2e1a",
            background: "#f8faf8",
            width: isMobile ? "100%" : "auto"
          }}
        />
      </div>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "6px",
        flex: isMobile ? 1 : "auto"
      }}>
        <label style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>End</label>
        <input
          type="date"
          value={endDate}
          onChange={onEndChange}
          style={{
            padding: isMobile ? "4px 8px" : "6px 8px",
            borderRadius: 6,
            border: "1px solid #d4e6d8",
            fontSize: isMobile ? 11 : 12,
            outline: "none",
            color: "#1a2e1a",
            background: "#f8faf8",
            width: isMobile ? "100%" : "auto"
          }}
        />
      </div>
    </div>
  );
}

// ========== INTERACTIVE LINE CHART ==========
function InteractiveLineChart({ points, dates, isLoading }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0, date: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        height: isMobile ? 120 : 200, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "#b0b0b0",
        fontSize: isMobile ? 12 : 14
      }}>
        Loading chart...
      </div>
    );
  }

  if (!points || points.length === 0) {
    return (
      <div style={{ 
        height: isMobile ? 120 : 200, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        color: "#b0b0b0",
        fontSize: isMobile ? 12 : 14
      }}>
        <span style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>📈</span>
        No sales data available
        <span style={{ fontSize: isMobile ? 10 : 11, color: "#ccc", marginTop: 4 }}>
          Add orders to see sales trend
        </span>
      </div>
    );
  }

  const max = Math.max(...points, 1);
  const w = isMobile ? 180 : 280;
  const h = isMobile ? 100 : 170;
  const padding = { top: isMobile ? 12 : 20, bottom: isMobile ? 12 : 20, left: isMobile ? 6 : 10, right: isMobile ? 6 : 10 };
  const chartWidth = w - padding.left - padding.right;
  const chartHeight = h - padding.top - padding.bottom;
  const stepX = chartWidth / Math.max(points.length - 1, 1);

  const getPoint = (index) => ({
    x: padding.left + index * stepX,
    y: padding.top + chartHeight - (points[index] / max) * chartHeight * 0.85
  });

  const path = points
    .map((p, i) => {
      const point = getPoint(i);
      return `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setHoveredIndex(index);
    setTooltip({
      show: true,
      x: x,
      y: y - 40,
      value: points[index],
      date: dates && dates[index] ? dates[index] : `Day ${index + 1}`
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltip({ ...tooltip, show: false });
  };

  return (
    <div style={{ position: "relative", width: "100%", height: isMobile ? 120 : 200 }}>
      <svg 
        viewBox={`0 0 ${w} ${h}`} 
        width="100%" 
        height={h}
        style={{ cursor: "pointer" }}
      >
        <line x1={padding.left} y1={padding.top + chartHeight * 0.25} x2={w - padding.right} y2={padding.top + chartHeight * 0.25} stroke="#f0f0f0" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top + chartHeight * 0.5} x2={w - padding.right} y2={padding.top + chartHeight * 0.5} stroke="#f0f0f0" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top + chartHeight * 0.75} x2={w - padding.right} y2={padding.top + chartHeight * 0.75} stroke="#f0f0f0" strokeWidth="1" />
        
        <text x={padding.left - 2} y={padding.top} textAnchor="end" fontSize={isMobile ? 7 : 9} fill="#ccc">RM{max.toFixed(0)}</text>
        <text x={padding.left - 2} y={padding.top + chartHeight * 0.5} textAnchor="end" fontSize={isMobile ? 7 : 9} fill="#ccc">RM{(max/2).toFixed(0)}</text>
        <text x={padding.left - 2} y={padding.top + chartHeight} textAnchor="end" fontSize={isMobile ? 7 : 9} fill="#ccc">RM0</text>

        <path
          d={`${path} L ${padding.left + (points.length - 1) * stepX} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
          fill="rgba(45, 106, 79, 0.1)"
          stroke="none"
        />
        
        <path
          d={path}
          fill="none"
          stroke="#2d6a4f"
          strokeWidth={isMobile ? 2 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {points.map((p, i) => {
          const point = getPoint(i);
          const isHovered = hoveredIndex === i;
          return (
            <g
              key={i}
              onMouseEnter={(e) => handleMouseMove(e, i)}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 6 : 3}
                fill={isHovered ? "#2d6a4f" : "#2d6a4f"}
                stroke="#fff"
                strokeWidth={isHovered ? 2 : 1.5}
                style={{
                  transition: "all 0.2s ease",
                  filter: isHovered ? "drop-shadow(0 0 8px rgba(45, 106, 79, 0.4))" : "none"
                }}
              />
              {isHovered && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={10}
                    fill="rgba(45, 106, 79, 0.15)"
                    style={{
                      animation: "pulse 1s ease-in-out infinite"
                    }}
                  />
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={point.x}
                    y2={padding.top + chartHeight}
                    stroke="#2d6a4f"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {tooltip.show && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(tooltip.x - 35, 10), isMobile ? 120 : 200),
            top: tooltip.y - 30,
            background: "#1a2e1a",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: isMobile ? 8 : 11,
            fontWeight: 600,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 10,
            minWidth: 50,
            textAlign: "center",
            transition: "all 0.1s ease",
            fontFamily: "'Inter','Segoe UI',sans-serif"
          }}
        >
          <div style={{ fontSize: isMobile ? 10 : 14, fontWeight: 700 }}>RM {tooltip.value.toFixed(2)}</div>
          <div style={{ fontSize: isMobile ? 7 : 10, opacity: 0.8, marginTop: 2 }}>{tooltip.date}</div>
          <div style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #1a2e1a"
          }} />
        </div>
      )}
    </div>
  );
}

// ========== ORDER STATUS BAR CHART ==========
function OrderStatusBarChart({ data, isLoading }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        height: isMobile ? 120 : 200, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "#b0b0b0",
        fontSize: isMobile ? 12 : 14
      }}>
        Loading chart...
      </div>
    );
  }

  const hasData = data.some(d => d.value > 0);
  
  if (!hasData) {
    return (
      <div style={{ 
        height: isMobile ? 120 : 200, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        color: "#b0b0b0",
        fontSize: isMobile ? 12 : 14
      }}>
        <span style={{ fontSize: isMobile ? 24 : 28, marginBottom: 8 }}>📊</span>
        No order data available
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.value), 1);
  const chartHeight = isMobile ? 80 : 150;
  const colors = ["#2d6a4f", "#f4a429", "#e63946"];

  return (
    <div style={{ 
      width: "100%", 
      height: isMobile ? 120 : 200, 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center",
      paddingTop: isMobile ? 4 : 10
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "flex-end", 
        gap: isMobile ? 8 : 20,
        height: chartHeight,
        justifyContent: "center",
        paddingLeft: 10,
        paddingRight: 10
      }}>
        {data.map((item, index) => {
          const height = Math.max((item.value / max) * chartHeight * 0.85, 4);
          return (
            <div key={index} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: chartHeight,
              justifyContent: "flex-end"
            }}>
              <span style={{
                fontSize: isMobile ? 9 : 12,
                color: colors[index],
                fontWeight: 700,
                marginBottom: 4
              }}>
                {item.value}
              </span>
              
              <div style={{
                width: isMobile ? 24 : 50,
                height: height,
                background: colors[index],
                borderRadius: "4px 4px 0 0",
                transition: "height 0.5s ease",
                minHeight: 4,
                position: "relative"
              }} />
              
              <span style={{
                fontSize: isMobile ? 8 : 11,
                color: "#555",
                marginTop: 6,
                fontWeight: 600
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== TOP PRODUCTS ==========
function TopProducts({ products, isLoading }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: "8px 0", color: "#b0b0b0", fontSize: isMobile ? 12 : 14 }}>
        Loading products...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div style={{ padding: "8px 0", color: "#b0b0b0", fontSize: isMobile ? 12 : 14 }}>
        No products available
      </div>
    );
  }

  return (
    <div>
      {products.slice(0, 5).map((p, i) => (
        <div key={p.name || i} style={{
          display: "flex",
          justifyContent: "space-between",
          padding: isMobile ? "6px 0" : "8px 0",
          borderBottom: "1px solid #f0f5f1"
        }}>
          <span style={{ color: "#3d5a40", fontSize: isMobile ? 12 : 13 }}>
            {i + 1}. {p.name}
          </span>
          <b style={{ color: "#2d6a4f", fontSize: isMobile ? 12 : 13 }}>
            {p.sold || 0} sold
          </b>
        </div>
      ))}
    </div>
  );
}

// ========== CATEGORY CHART ==========
function CategoryChart({ data, isLoading }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#b0b0b0", fontSize: isMobile ? 12 : 14 }}>
        Loading categories...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#b0b0b0", fontSize: isMobile ? 12 : 14 }}>
        No category data available
      </div>
    );
  }

  const colors = ["#2d6a4f", "#f4a429", "#2563eb", "#e63946", "#7c3aed"];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.label} style={{ marginBottom: isMobile ? 8 : 10 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: isMobile ? 11 : 12,
              color: "#3d5a40",
              marginBottom: 4
            }}>
              <span>{item.label}</span>
              <span style={{ fontWeight: 600 }}>{percentage}%</span>
            </div>
            <div style={{
              width: "100%",
              height: isMobile ? 5 : 6,
              background: "#f0f5f1",
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percentage}%`,
                height: "100%",
                background: colors[index % colors.length],
                borderRadius: 4,
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== MAIN DASHBOARD ==========
export default function AdminDashboard({ onLogout }) {
  const [adminPage, setAdminPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    today.toISOString().split('T')[0]
  );

  // ========== CHECK MOBILE ==========
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ========== FETCH DATA FROM FIREBASE ==========
  useEffect(() => {
    setLoading(true);
    
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setDataLoaded(true);
      setLoading(false);
    });

    const unsubOrders = subscribeToOrders((data) => {
      setOrders(data);
      setDataLoaded(true);
      setLoading(false);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // ========== FILTER ORDERS BY DATE ==========
  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      const orderDate = order.createdAt?.toDate 
        ? order.createdAt.toDate() 
        : new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, startDate, endDate]);

  // ========== STATS ==========
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = filteredOrders.length;

    const totalRevenue = filteredOrders
      .filter(o => (o.status || "").toLowerCase() === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const lowStock = products.filter(p => (p.stock || 0) <= 5).length;

    const customers = new Set(
      filteredOrders.map(o => o.userId || o.userID || "guest")
    );

    const paidOrders = filteredOrders.filter(o => (o.status || "").toLowerCase() === "paid");
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStock,
      totalCustomers: customers.size,
      avgOrderValue
    };
  }, [products, filteredOrders]);

  // ========== SALES CHART DATA ==========
  const salesData = useMemo(() => {
    const map = {};
    const dateMap = {};

    filteredOrders.forEach(o => {
      if ((o.status || "").toLowerCase() !== "paid") return;
      try {
        const date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const key = `${month} ${day}`;
        
        map[day] = (map[day] || 0) + (o.total || 0);
        dateMap[day] = key;
      } catch (e) {
        // Skip invalid dates
      }
    });

    const values = Object.values(map);
    const dates = Object.values(dateMap);
    
    return { values, dates };
  }, [filteredOrders]);

  // ========== ORDER STATUS ==========
  const orderStatus = useMemo(() => {
    const counts = { Paid: 0, Pending: 0, Cancelled: 0 };

    filteredOrders.forEach(o => {
      const s = (o.status || "Pending").toLowerCase();
      if (s === "paid") counts.Paid++;
      else if (s === "pending") counts.Pending++;
      else if (s === "cancelled") counts.Cancelled++;
      else counts.Pending++;
    });

    return [
      { label: "Paid", value: counts.Paid, color: "#2d6a4f" },
      { label: "Pending", value: counts.Pending, color: "#f4a429" },
      { label: "Cancelled", value: counts.Cancelled, color: "#e63946" }
    ];
  }, [filteredOrders]);

  // ========== TOP PRODUCTS ==========
  const topProducts = useMemo(() => {
    const salesCount = {};
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const name = item.name || item.productName || "Unknown";
          salesCount[name] = (salesCount[name] || 0) + (item.quantity || 1);
        });
      }
    });

    const sortedProducts = Object.entries(salesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => {
        const product = products.find(p => p.name === name);
        return { 
          name, 
          sold: count,
          image: product?.image || null
        };
      });

    return sortedProducts;
  }, [filteredOrders, products]);

  // ========== CATEGORY DATA ==========
  const categoryData = useMemo(() => {
    const categoryMap = {};
    
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.id || p.productId === item.productId);
          const category = product?.category || item.category || "Other";
          categoryMap[category] = (categoryMap[category] || 0) + ((item.price || 0) * (item.quantity || 1));
        });
      }
    });

    return Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({ label, value }));
  }, [filteredOrders, products]);

  // ========== TITLE ==========
  const getTitle = () => {
    if (adminPage === "dashboard") return "Dashboard";
    if (adminPage === "products") return "Manage Products";
    if (adminPage === "orders") return "Manage Orders";
    return "Admin Panel";
  };

  // ========== LOADING STATE ==========
  if (loading && !dataLoaded) {
    return (
      <div style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#f5f5f5",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center", color: "#888" }}>
          <span style={{ fontSize: 24, marginBottom: 8 }}>📊</span>
          <div>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      background: "#f5f5f5",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      position: "relative"
    }}>
      {/* ===== SIDEBAR - RENDER DIRECTLY ===== */}
      <AdminSidebar
        activeKey={adminPage}
        setAdminPage={setAdminPage}
        onLogout={onLogout}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ===== OVERLAY FOR MOBILE ===== */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease"
          }}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        minHeight: "100vh",
        width: isMobile ? "100%" : "calc(100% - 250px)",
        overflowX: "hidden"
      }}>
        {/* ===== HEADER ===== */}
        <AdminHeader
          title={getTitle()}
          adminName={auth.currentUser?.displayName || "Admin"}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* ===== MAIN CONTENT AREA ===== */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? "12px" : "28px 36px",
          overflowY: "auto",
          background: "#f5f5f5",
          width: "100%",
          boxSizing: "border-box"
        }}>
          {adminPage === "dashboard" && (
            <>
              {/* Date Filter */}
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartChange={(e) => setStartDate(e.target.value)}
                onEndChange={(e) => setEndDate(e.target.value)}
              />

              {/* Top Stats Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                gap: isMobile ? "10px" : "20px",
                marginTop: "16px",
                marginBottom: isMobile ? "16px" : "24px"
              }}>
                <StatCard
                  label="Total Revenue"
                  value={`RM ${stats.totalRevenue.toFixed(2)}`}
                  accent="#16a34a"
                  isLoading={loading}
                  subtitle={`${filteredOrders.length} orders`}
                />

                <StatCard
                  label="Total Orders"
                  value={stats.totalOrders}
                  accent="#2563eb"
                  isLoading={loading}
                />

                <StatCard
                  label="Total Customers"
                  value={stats.totalCustomers}
                  accent="#7c3aed"
                  isLoading={loading}
                />

                <StatCard
                  label="Avg Order Value"
                  value={`RM ${stats.avgOrderValue.toFixed(2)}`}
                  accent="#f4a429"
                  isLoading={loading}
                />
              </div>

              {/* Best Selling & Low Stock */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? "12px" : "20px",
                marginBottom: isMobile ? "16px" : "24px"
              }}>
                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 10px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    🏆 Best Selling Product
                  </h3>
                  {topProducts.length > 0 ? (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "12px" : "16px"
                    }}>
                      <div style={{
                        width: isMobile ? 48 : 64,
                        height: isMobile ? 48 : 64,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#f5f5f5",
                        flexShrink: 0,
                        border: "1px solid #e8f0ea"
                      }}>
                        <img
                          src={getImageUrl(topProducts[0].image)}
                          alt={topProducts[0].name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = "/images/default.png";
                          }}
                        />
                      </div>
                      <div>
                        <p style={{
                          fontSize: isMobile ? 16 : 20,
                          fontWeight: 700,
                          color: "#2d6a4f",
                          margin: "0"
                        }}>
                          {topProducts[0].name}
                        </p>
                        <p style={{
                          fontSize: isMobile ? 12 : 14,
                          color: "#5c7a5c",
                          margin: "4px 0 0"
                        }}>
                          {topProducts[0].sold} units sold
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: "#b0b0b0", fontSize: isMobile ? 13 : 14 }}>
                      No sales data available
                    </p>
                  )}
                </div>

                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 10px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    ⚠️ Low Stock Alert
                  </h3>
                  {stats.lowStock > 0 ? (
                    <div>
                      <p style={{
                        fontSize: isMobile ? 18 : 22,
                        fontWeight: 700,
                        color: "#e63946",
                        margin: "4px 0"
                      }}>
                        {stats.lowStock} products
                      </p>
                      <p style={{
                        fontSize: isMobile ? 12 : 14,
                        color: "#5c7a5c",
                        margin: "4px 0"
                      }}>
                        Need to restock soon
                      </p>
                    </div>
                  ) : (
                    <p style={{ 
                      color: "#16a34a", 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 600 
                    }}>
                      ✅ All products in stock
                    </p>
                  )}
                </div>
              </div>

              {/* Charts Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                gap: isMobile ? "12px" : "20px",
                marginBottom: isMobile ? "16px" : "24px",
                minHeight: isMobile ? "auto" : "220px"
              }}>
                {/* Sales Trend Chart */}
                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 12px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    Sales Trend
                  </h3>
                  <InteractiveLineChart 
                    points={salesData.values} 
                    dates={salesData.dates}
                    isLoading={loading}
                  />
                </div>

                {/* Order Status Chart */}
                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 12px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    Order Status
                  </h3>
                  <OrderStatusBarChart 
                    data={orderStatus} 
                    isLoading={loading}
                  />
                </div>
              </div>

              {/* Bottom Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? "12px" : "20px"
              }}>
                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 12px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    Top Products
                  </h3>
                  <TopProducts 
                    products={topProducts} 
                    isLoading={loading}
                  />
                </div>

                <div style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: isMobile ? "16px" : "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: "1px solid #e8f0ea"
                }}>
                  <h3 style={{ 
                    margin: "0 0 12px", 
                    fontSize: isMobile ? "14px" : "16px",
                    color: "#1a2e1a",
                    fontWeight: 600
                  }}>
                    Top Categories
                  </h3>
                  <CategoryChart 
                    data={categoryData} 
                    isLoading={loading}
                  />
                </div>
              </div>
            </>
          )}

          {adminPage === "products" && (
            <ManageProducts />
          )}

          {adminPage === "orders" && (
            <ManageOrders />
          )}
        </main>
      </div>

      {/* ===== CSS ANIMATIONS ===== */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}