import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists using normalized email
    const normalizedEmail = User.normalizeEmail(email);
    const existingUser = await User.findOne({ normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ 
        message: "An account with this email already exists. Please sign in instead." 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    await User.create({
      name,
      email: email.toLowerCase().trim(),
      normalizedEmail,
      password: hashedPassword,
      authProvider: 'credentials',
      linkedinProfile: "",
    });

    return NextResponse.json({ message: "Account created successfully! Please sign in." }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 });
  }
}
