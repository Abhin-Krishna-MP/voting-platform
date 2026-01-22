import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Candidate from "@/models/Candidate";
import { NextResponse } from "next/server";

export async function POST(req) {
  // 1. Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { candidateId } = await req.json();

  await connectDB();

  // 2. Fetch fresh user data using normalized email to prevent duplicate voting
  const normalizedEmail = User.normalizeEmail(session.user.email);
  const user = await User.findOne({ normalizedEmail });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.hasVoted) {
    return NextResponse.json({ message: "You have already voted!" }, { status: 400 });
  }

  // 3. Update Candidate (Add vote)
  await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

  // 4. Update User (Mark as voted)
  user.hasVoted = true;
  user.votedCandidateId = candidateId;
  await user.save();

  return NextResponse.json({ message: "Vote successful!" });
}