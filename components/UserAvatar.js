"use client";

import { useState } from "react";

// Deterministic color picker based on name
const getColor = (name) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500",
    "bg-green-500", "bg-emerald-500", "bg-teal-500",
    "bg-cyan-500", "bg-blue-500", "bg-indigo-500",
    "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
    "bg-pink-500", "bg-rose-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function UserAvatar({ name, image, className = "w-10 h-10" }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name || "User");
  const bgColor = getColor(name || "User");

  if (image && !imgError) {
    return (
      <img 
        src={image} 
        alt={name} 
        className={`${className} rounded-full object-cover border border-gray-200`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${className} ${bgColor} rounded-full flex items-center justify-center text-white font-bold text-sm border border-white shadow-sm`}>
      {initials}
    </div>
  );
}