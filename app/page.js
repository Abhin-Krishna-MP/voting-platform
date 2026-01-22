export const dynamic = 'force-dynamic';

import connectDB from "@/lib/db";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VotingSection from "@/components/VotingSection";
import UserAvatar from "@/components/UserAvatar";
import { Vote, LogOut, TrendingUp, Users, Shield } from "lucide-react";
import Link from "next/link";

async function getCandidates() {
  await connectDB();
  const candidates = await Candidate.find({}).lean();
  return candidates.map(c => ({...c, _id: c._id.toString()}));
}

async function getVoters() {
  await connectDB();
  const voters = await User.find({ hasVoted: true })
                           .select("name linkedinProfile updatedAt")
                           .sort({ updatedAt: -1 })
                           .lean();
  return voters.map(v => ({...v, _id: v._id.toString()}));
}

export default async function Home() {
  const candidates = await getCandidates();
  const session = await getServerSession(authOptions);
  
  let votersList = [];
  if (session?.user?.hasVoted) {
    votersList = await getVoters();
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      
      {/* MODERN NAVBAR with glassmorphism */}
      <nav className="backdrop-blur-xl bg-white/80 border-b border-white/20 sticky top-0 z-40 shadow-lg shadow-blue-500/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/50 transform hover:scale-105 transition-transform">
              <Vote size={24} />
            </div>
            <div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                TeamVote
              </span>
              <p className="text-xs text-gray-500 font-medium">Leadership Election 2025</p>
            </div>
          </div>
          
          {session && (
             <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col items-end bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-100">
                 <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                   {session.user.name}
                   <Shield size={14} className="text-green-500" />
                 </p>
                 <p className="text-xs text-blue-600 font-medium">Verified Voter</p>
               </div>
               
               <UserAvatar name={session.user.name} image={session.user.image} className="w-11 h-11 ring-2 ring-blue-200 ring-offset-2" />
               
               <Link href="/api/auth/signout" className="text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                 <LogOut size={20} />
               </Link>
             </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="p-6 md:p-12 grow">
        <div className="max-w-5xl mx-auto">
          
          {/* Enhanced Header with Stats */}
          {!session?.user?.hasVoted && (
            <div className="text-center mb-12 space-y-6">
              <div className="inline-block animate-in slide-in-from-top duration-700">
                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  🗳️ Active Election
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight animate-in slide-in-from-bottom-4 duration-700 delay-100">
                Cast Your <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vote</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-200">
                Select the most suitable candidate for the <strong>Team Lead</strong> position. 
                Your vote is secure, transparent, and shapes our future.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <Shield size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Secure Voting</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Real-time Results</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <TrendingUp size={16} className="text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Live Analytics</span>
                </div>
              </div>
            </div>
          )}

          <VotingSection 
            candidates={candidates} 
            session={session} 
            votersList={votersList} 
          />
          
        </div>
      </main>

      {/* ENHANCED FOOTER */}
      <footer className="bg-linear-to-r from-gray-900 to-gray-800 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm">&copy; 2025 White Matrix Internship Project</p>
              <p className="text-gray-500 text-xs mt-1">Empowering democratic decision-making</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Built with</span>
                <span className="font-bold text-blue-400">Next.js</span>
                <span className="text-gray-600">&</span>
                <span className="font-bold text-green-400">MongoDB</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}