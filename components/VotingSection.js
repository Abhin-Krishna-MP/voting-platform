"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Linkedin, CheckCircle, ShieldAlert, Lock, Search, Download, BarChart3, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import LoginHelpModal from "./LoginHelpModal";
import UserAvatar from "./UserAvatar";

export default function VotingSection({ candidates, session, votersList = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Email/Password login state
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);

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

  // --- Email/Password Authentication Handlers ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthError(false);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setAuthError(true);
      setAuthMessage(result.error);
    } else {
      router.refresh();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setAuthError(false);
        setAuthMessage(data.message);
        setTimeout(() => {
          setShowRegister(false);
          setShowEmailLogin(true);
          setAuthMessage("");
        }, 2000);
      } else {
        setAuthError(true);
        setAuthMessage(data.message);
      }
    } catch (error) {
      setLoading(false);
      setAuthError(true);
      setAuthMessage("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthError(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);
      setAuthError(false);
      setAuthMessage(data.message);
    } catch (error) {
      setLoading(false);
      setAuthError(true);
      setAuthMessage("An error occurred. Please try again.");
    }
  };

  // --- 1. Login Screen ---
  if (!session) {
    // Register Form
    if (showRegister) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center border border-white/20 max-w-lg mx-auto mt-10">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Account</h2>
          <p className="text-gray-500 mb-8">Register to participate in voting</p>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
              minLength={6}
            />
            
            {authMessage && (
              <div className={`p-3 rounded-xl text-sm ${authError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
                {authMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <button
            onClick={() => {
              setShowRegister(false);
              setAuthMessage("");
              setAuthError(false);
            }}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            Already have an account? <span className="font-semibold underline">Sign In</span>
          </button>
        </div>
      );
    }

    // Forgot Password Form
    if (showForgotPassword) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center border border-white/20 max-w-lg mx-auto mt-10">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Forgot Password</h2>
          <p className="text-gray-500 mb-8">Enter your email to receive a reset link</p>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
            
            {authMessage && (
              <div className={`p-3 rounded-xl text-sm ${authError ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-800"}`}>
                {authMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setShowEmailLogin(true);
              setAuthMessage("");
              setAuthError(false);
            }}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            Remember your password? <span className="font-semibold underline">Sign In</span>
          </button>
        </div>
      );
    }

    // Email/Password Login Form
    if (showEmailLogin) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-xl text-center border border-white/20 max-w-lg mx-auto mt-10">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign In</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to continue</p>
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              required
            />
            
            {authMessage && (
              <div className="p-3 rounded-xl text-sm bg-red-50 text-red-800">
                {authMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <button
            onClick={() => {
              setShowForgotPassword(true);
              setShowEmailLogin(false);
              setAuthMessage("");
              setAuthError(false);
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Forgot Password?
          </button>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          
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
          
          <button
            onClick={() => {
              setShowEmailLogin(false);
              setAuthMessage("");
              setAuthError(false);
            }}
            className="mt-6 text-sm text-gray-600 hover:text-gray-900"
          >
            Don't have an account? <span className="font-semibold underline">Register</span>
          </button>
        </div>
      );
    }

    // Default Login Screen with Provider Options
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

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <button
            onClick={() => setShowEmailLogin(true)}
            className="w-full bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Mail size={20} />
            Continue with Email
          </button>
        </div>
        
        <button
          onClick={() => setShowRegister(true)}
          className="mt-6 text-sm text-gray-600 hover:text-gray-900"
        >
          Don't have an account? <span className="font-semibold underline">Create one</span>
        </button>

        <button onClick={() => setShowHelp(true)} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">
          Need help logging in?
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