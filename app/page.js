export const dynamic = 'force-dynamic';

import connectDB from "@/lib/db";
import Candidate from "@/models/Candidate";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import VotingSection from "@/components/VotingSection";
import UserAvatar from "@/components/UserAvatar";
import { Vote, LogOut } from "lucide-react";
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
    // 1. Changed wrapper to flex-col to manage vertical spacing
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Vote size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TeamVote</span>
          </div>
          
          {session && (
             <div className="flex items-center gap-4">
               <div className="hidden md:block text-right">
                 <p className="text-sm font-bold text-gray-900">{session.user.name}</p>
                 <p className="text-xs text-gray-500">Verified Voter</p>
               </div>
               
               <UserAvatar name={session.user.name} image={session.user.image} className="w-10 h-10" />
               
               <Link href="/api/auth/signout" className="text-gray-400 hover:text-red-500 transition-colors">
                 <LogOut size={20} />
               </Link>
             </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      {/* 2. Added 'flex-grow' to push footer to the bottom */}
      <main className="p-6 md:p-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Text */}
          {!session?.user?.hasVoted && (
            <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Cast Your Vote
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the most suitable candidate for the Team Lead position. 
                Your vote is secure, transparent, and counts towards our future.
              </p>
            </div>
          )}

          <VotingSection 
            candidates={candidates} 
            session={session} 
            votersList={votersList} 
          />
          
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2025 White Matrix Internship Project.</p>
          <p className="flex items-center gap-2">
            Built with 
            <span className="font-bold text-gray-700">Next.js</span> 
            & 
            <span className="font-bold text-gray-700">MongoDB</span>
          </p>
        </div>
      </footer>
    </div>
  );
}