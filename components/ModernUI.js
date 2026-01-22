"use client";

import { motion } from "framer-motion";

export function StatCard({ icon: Icon, label, value, trend, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-gray-100"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors[color]} opacity-10 rounded-full -mr-16 -mt-16`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-3 rounded-xl bg-linear-to-br ${colors[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              {trend > 0 ? '↑' : '→'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

export function ProgressBar({ percentage, color = "blue", label, votes }) {
  const colors = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{votes} votes</span>
          <span className="text-xs text-gray-500">({percentage}%)</span>
        </div>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function GlowingButton({ children, onClick, disabled, variant = "primary" }) {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/50",
    secondary: "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black shadow-lg shadow-gray-500/50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </motion.button>
  );
}
