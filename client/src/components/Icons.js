import React from "react";

export function NavIcon({ type, size = 18, color = "#5c7a5c" }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    home: (
      <svg {...commonProps}>
        <path d="M3 11L12 3L21 11V20H3V11Z" />
        <path d="M9 21V14H15V21" />
      </svg>
    ),
    categories: (
      <svg {...commonProps}>
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="8" />
        <rect x="3" y="13" width="8" height="8" />
        <rect x="13" y="13" width="8" height="8" />
      </svg>
    ),
    cart: (
      <svg {...commonProps}>
        <path d="M3 6H6L8 17H19" />
        <path d="M6 6L7.5 16H18" />
        <circle cx="7" cy="20" r="1" fill={color} stroke={color} />
        <circle cx="17" cy="20" r="1" fill={color} stroke={color} />
      </svg>
    ),
    order: (
      <svg {...commonProps}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8H16" />
        <path d="M8 12H16" />
      </svg>
    ),
    profile: (
      <svg {...commonProps}>
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" />
        <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" />
      </svg>
    ),
    logout: (
      <svg {...commonProps}>
        <path d="M9 6L4 12L9 18" />
        <path d="M4 12H17" />
        <path d="M17 6H20V18H17" />
      </svg>
    ),
  };

  return icons[type] || icons.home;
}

export function SearchIcon({ size = 18, color = "#8fba9f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  );
}

export function CartIconHeader({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6H6L8 17H19" />
      <circle cx="7" cy="20" r="1" fill={color} />
      <circle cx="17" cy="20" r="1" fill={color} />
    </svg>
  );
}

export function BellIcon({ size = 22, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22Z" fill={color} />
      <path d="M18 16V11C18 7.68629 16.2091 4.83076 13.25 3.59V3C13.25 2.30964 12.6904 1.75 12 1.75C11.3096 1.75 10.75 2.30964 10.75 3V3.59C7.79086 4.83076 6 7.68629 6 11V16L4 18V19H20V18L18 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ size = 22, color = "#1a2e1a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" />
      <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" />
    </svg>
  );
}

function strokeIconProps(size, color) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

export function CloseIcon({ size = 18, color = "#1a2e1a" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function MenuIcon({ size = 24, color = "#fff" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M4 7H20" />
      <path d="M4 12H20" />
      <path d="M4 17H20" />
    </svg>
  );
}

export function EyeIcon({ size = 18, color = "#5c7a5c" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ size = 18, color = "#5c7a5c" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M3 3L21 21" />
      <path d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42" />
      <path d="M9.9 4.24C10.59 4.09 11.29 4 12 4C19 4 22 12 22 12C21.67 12.67 21.17 13.47 20.5 14.26" />
      <path d="M6.61 6.61C4.56 8.07 3 10.5 2 12C2 12 5 19 12 19C13.05 19 14.03 18.78 14.91 18.39" />
    </svg>
  );
}

export function EditIcon({ size = 16, color = "#2d6a4f" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M12 20H21" />
      <path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" />
    </svg>
  );
}

export function TrashIcon({ size = 16, color = "#e63946" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M3 6H21" />
      <path d="M8 6V4H16V6" />
      <path d="M19 6L18 20H6L5 6" />
      <path d="M10 10V16" />
      <path d="M14 10V16" />
    </svg>
  );
}

export function CalendarIcon({ size = 16, color = "#5c7a5c" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3V7" />
      <path d="M8 3V7" />
      <path d="M3 11H21" />
    </svg>
  );
}

export function ChartIcon({ size = 24, color = "#b0b0b0" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20V14" />
      <path d="M22 20V8" />
    </svg>
  );
}

export function PieChartIcon({ size = 28, color = "#b0b0b0" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3V12L18.5 16.5" />
    </svg>
  );
}

export function TrophyIcon({ size = 18, color = "#1a2e1a" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M8 4H16V8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8V4Z" />
      <path d="M6 4H4V6C4 8.20914 5.79086 10 8 10" />
      <path d="M18 4H20V6C20 8.20914 18.2091 10 16 10" />
      <path d="M12 12V15" />
      <path d="M8 20H16" />
      <path d="M10 15H14V20H10V15Z" />
    </svg>
  );
}

export function WarningIcon({ size = 16, color = "#f59e0b" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M12 9V13" />
      <path d="M12 17H12.01" />
      <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55299 18.6453 1.552 19C1.55101 19.3547 1.64146 19.6981 1.81445 20.0015C1.98744 20.3049 2.23673 20.5565 2.53773 20.7295C2.83873 20.9025 3.18082 20.9903 3.53 21H20.47C20.8192 20.9903 21.1613 20.9025 21.4623 20.7295C21.7633 20.5565 22.0126 20.3049 22.1856 20.0015C22.3585 19.6981 22.449 19.3547 22.448 19C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 16, color = "#16a34a" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12L11 15L16 9" />
    </svg>
  );
}

export function UploadCloudIcon({ size = 28, color = "#2d6a4f" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M12 16V8" />
      <path d="M8 12L12 8L16 12" />
      <path d="M20 16.58C21.24 15.78 22 14.41 22 12.83C22 10.05 19.76 7.83 17 7.83C16.68 5.55 14.7 3.83 12.3 3.83C10.02 3.83 8.08 5.4 7.6 7.5C5.09 7.86 3.17 9.98 3.17 12.58C3.17 14.45 4.12 16.09 5.58 17.02" />
    </svg>
  );
}

export function SpinnerIcon({ size = 16, color = "#2d6a4f" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p} style={{ animation: "icon-spin 1s linear infinite" }}>
      <path d="M12 3V6" />
      <path d="M12 18V21" opacity="0.3" />
      <path d="M18.36 5.64L16.24 7.76" opacity="0.7" />
      <path d="M7.76 16.24L5.64 18.36" opacity="0.3" />
      <path d="M21 12H18" opacity="0.5" />
      <path d="M6 12H3" opacity="0.3" />
      <path d="M18.36 18.36L16.24 16.24" opacity="0.3" />
      <path d="M7.76 7.76L5.64 5.64" opacity="0.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 14, color = "#333" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M15 6L9 12L15 18" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 14, color = "#333" }) {
  const p = strokeIconProps(size, color);
  return (
    <svg {...p}>
      <path d="M9 6L15 12L9 18" />
    </svg>
  );
}

export function AdminNavIcon({ type, size = 18, color = "#5c7a5c" }) {
  const p = strokeIconProps(size, color);
  const icons = {
    dashboard: (
      <svg {...p}>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="5" rx="1" />
        <rect x="13" y="12" width="8" height="9" rx="1" />
        <rect x="3" y="15" width="8" height="6" rx="1" />
      </svg>
    ),
    products: (
      <svg {...p}>
        <path d="M4 7H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z" />
        <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" />
      </svg>
    ),
    orders: (
      <svg {...p}>
        <path d="M6 4H18L16 18H8L6 4Z" />
        <path d="M8 4L9 2H15L16 4" />
      </svg>
    ),
    logout: (
      <svg {...p}>
        <path d="M9 6L4 12L9 18" />
        <path d="M4 12H17" />
        <path d="M17 6H20V18H17" />
      </svg>
    ),
  };
  return icons[type] || icons.dashboard;
}

export function IconLabel({ icon, children, gap = 8, style = {} }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap, ...style }}>
      {icon}
      {children}
    </span>
  );
}
