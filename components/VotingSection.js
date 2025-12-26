"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Linkedin, CheckCircle, ShieldAlert, Lock, Search, Download, BarChart3 } from "lucide-react";
import confetti from "canvas-confetti";
import LoginHelpModal from "./LoginHelpModal";
import UserAvatar from "./UserAvatar";

export default function VotingSection({ candidates, session, votersList = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Filter Voters Logic ---
  const filteredVoters = votersList.filter(voter => 
    voter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Calculate Vote Percentages ---
  const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

  // --- Export to CSV Logic ---
  const handleExport = () => {
    const headers = "Name,LinkedIn Profile,Date\n";
    const rows = votersList.map(v => 
      `"${v.name}","${v.linkedinProfile}","${new Date(v.updatedAt).toLocaleDateString()}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voters_list.csv";
    a.click();
  };

  // --- 1. Login Screen ---
  if (!session) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center border border-white/20 max-w-lg mx-auto mt-10">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-blue-600" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
        <p className="text-gray-500 mb-8">Securely vote for your team lead using your professional identity.</p>
        
        <div className="space-y-3">
          <button
            onClick={() => signIn("google")}
            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <button
            onClick={() => signIn("linkedin")}
            className="w-full bg-[#0077b5] text-white px-6 py-3 rounded-xl hover:bg-[#006097] font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Linkedin size={20} />
            Continue with LinkedIn
          </button>
        </div>
        <button onClick={() => setShowHelp(true)} className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline">
          Forgot Password / Trouble logging in?
        </button>
        <LoginHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  // --- 2. LinkedIn Enforcement ---
  const userHasLinkedin = session.user.linkedinProfile && session.user.linkedinProfile.length > 0;
  const handleSaveLinkedin = async () => {
    if (!linkedinUrl.includes("linkedin.com")) return alert("Please enter a valid URL");
    setLoading(true);
    const res = await fetch("/api/user/update", { method: "POST", body: JSON.stringify({ linkedinUrl }) });
    if (res.ok) router.refresh();
    else setLoading(false);
  };

  if (!userHasLinkedin) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl max-w-xl mx-auto text-center mt-10 shadow-lg">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-amber-900 mb-2">One Final Step</h3>
        <p className="text-amber-800 mb-6">To ensure voting integrity, we require your LinkedIn profile link.</p>
        <input 
          type="text" 
          placeholder="https://linkedin.com/in/your-profile"
          className="w-full p-4 border border-gray-300 rounded-xl mb-4 text-black focus:ring-2 focus:ring-amber-500 outline-none"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
        <button onClick={handleSaveLinkedin} disabled={loading} className="bg-amber-600 text-white px-8 py-3 rounded-xl hover:bg-amber-700 font-bold w-full transition-all">
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
      </div>
    );
  }

  // --- 3. Voting Logic ---
  const handleVote = async (candidateId) => {
    setLoading(true);
    const res = await fetch("/api/vote", { method: "POST", body: JSON.stringify({ candidateId }) });
    if (res.ok) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      router.refresh(); 
    } else {
      setLoading(false);
      alert("Error voting");
    }
  };

  // --- 4. Render Interface ---
  return (
    <div className="animate-in fade-in duration-500">
      
      {/* CANDIDATE CARDS */}
      {!session.user.hasVoted && (
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={candidate.imageUrl} alt={candidate.name} className="w-40 h-40 rounded-full mb-6 object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{candidate.name}</h2>
              <p className="text-gray-500 text-center mb-6 leading-relaxed">{candidate.description}</p>
              <div className="mt-auto w-full space-y-4">
                <a href={candidate.linkedinUrl} target="_blank" className="flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  <Linkedin size={16} /> View Profile
                </a>
                <button onClick={() => handleVote(candidate._id)} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transform active:scale-95 transition-all">
                  {loading ? "Voting..." : "Vote For " + candidate.name.split(" ")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST-VOTING DASHBOARD */}
      {session.user.hasVoted && (
        <div className="space-y-8 mt-10">
          
          {/* FEATURE 1: VISUAL RESULTS (Progress Bars) */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Live Results</h2>
            </div>
            <div className="space-y-6">
              {candidates.map(candidate => {
                const percentage = totalVotes === 0 ? 0 : Math.round(((candidate.voteCount || 0) / totalVotes) * 100);
                return (
                  <div key={candidate._id}>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>{candidate.name}</span>
                      <span>{percentage}% ({candidate.voteCount || 0} votes)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEATURE 2 & 3: SEARCH & EXPORT */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-green-50 p-8 border-b border-green-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <CheckCircle className="text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Community Votes</h2>
                  </div>
                  <p className="text-gray-600">See who else has participated in the election.</p>
                </div>
                
                {/* Export Button */}
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-bold shadow-sm"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search voters by name..." 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Voter Name</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVoters.map((voter) => (
                      <tr key={voter._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                          <UserAvatar name={voter.name} className="w-8 h-8" />
                          {voter.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <a href={voter.linkedinProfile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                            <Linkedin size={16} /> Connect
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredVoters.length === 0 && <p className="p-8 text-center text-gray-400">No voters found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}