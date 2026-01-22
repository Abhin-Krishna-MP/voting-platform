"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Users, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard({ metrics }) {
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const pieData = metrics.candidates.map((c, idx) => ({
    name: c.name,
    value: c.votes,
    percentage: c.percentage,
  }));

  const barData = metrics.candidates.map(c => ({
    name: c.name.split(' ')[0], // First name only for chart
    votes: c.votes,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Live Analytics
          </h2>
          <p className="text-gray-600 mt-1">Real-time voting insights and trends</p>
        </div>
        {metrics.votingVelocity > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Activity className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm font-medium text-green-700">
              {metrics.votingVelocity} votes in last hour
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Voters"
          value={metrics.totalVoters}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Votes"
          value={metrics.totalVotes}
          color="purple"
        />
        <StatCard
          icon={Activity}
          label="Participation"
          value={metrics.participationRate}
          color="green"
        />
        <StatCard
          icon={BarChart3}
          label="Leading By"
          value={metrics.winner ? `${metrics.winner.votes - (metrics.candidates[1]?.votes || 0)} votes` : 'N/A'}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vote Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Vote Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Bar 
                dataKey="votes" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Winner Card */}
      {metrics.winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Leader</p>
              <h3 className="text-3xl font-bold text-gray-900">{metrics.winner.name}</h3>
              <p className="text-lg text-gray-700 mt-2">
                {metrics.winner.votes} votes ({metrics.winner.percentage}%)
              </p>
            </div>
            <div className="text-right">
              {metrics.isCloseRace ? (
                <div className="px-4 py-2 bg-yellow-100 rounded-lg border border-yellow-300">
                  <p className="text-sm font-bold text-yellow-800">Close Race!</p>
                  <p className="text-xs text-yellow-700">Within 5%</p>
                </div>
              ) : (
                <div className="px-4 py-2 bg-green-100 rounded-lg border border-green-300">
                  <p className="text-sm font-bold text-green-800">Strong Lead</p>
                  <p className="text-xs text-green-700">Clear Favorite</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-md border border-gray-100">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${colors[color]} opacity-10 rounded-full -mr-12 -mt-12`} />
      
      <div className="relative">
        <div className={`inline-flex p-3 rounded-lg bg-linear-to-br ${colors[color]} shadow-md mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
