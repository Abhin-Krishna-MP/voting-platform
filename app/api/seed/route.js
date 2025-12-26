export const dynamic = 'force-dynamic';

import connectDB from "@/lib/db";
import Candidate from "@/models/Candidate";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  // 1. DELETE OLD DATA (Clears the previous dummy candidates)
  await Candidate.deleteMany({});

  // 2. DEFINE NEW CANDIDATES
  const candidates = [
    {
      name: "Abhin Krishna M P",
      description: "Full Stack Developer specializing in Next.js and Cloud Architecture.",
      linkedinUrl: "https://www.linkedin.com/in/abhin-krishna-m-p/", // Update this if you have the real link
      imageUrl: "/images/abhin.jpeg", // References the file in public/images
    },
    {
      name: "Merin Binoj",
      description: "Full Stack Developer specializing in Next.js and Cloud Architecture.",
      linkedinUrl: "https://www.linkedin.com/in/merin-binoj-61054332a/", // Update this if you have the real link
      imageUrl: "/images/merin.jpeg",
    },
  ];

  // 3. INSERT NEW DATA
  await Candidate.create(candidates);

  return NextResponse.json({ message: "Success! Database updated with Abhin & Merin." });
}