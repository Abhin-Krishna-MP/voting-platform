import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { linkedinUrl } = await req.json();

  // Simple validation
  if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
    return NextResponse.json({ message: "Please enter a valid LinkedIn URL" }, { status: 400 });
  }

  await connectDB();
  
  // Update the user
  await User.findOneAndUpdate(
    { email: session.user.email },
    { linkedinProfile: linkedinUrl }
  );

  return NextResponse.json({ message: "Profile updated successfully" });
}