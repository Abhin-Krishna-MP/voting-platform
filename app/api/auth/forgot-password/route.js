import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = User.normalizeEmail(email);
    const user = await User.findOne({ normalizedEmail });

    if (!user || !user.password) {
      // For security, don't reveal if user exists
      return NextResponse.json({ 
        message: "If an account exists with this email, a password reset link has been sent." 
      }, { status: 200 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: "TeamVote - Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password for your TeamVote account.</p>
            <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link:</p>
            <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">TeamVote - Secure Voting Platform</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json({ 
        message: "Error sending reset email. Please contact support." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "If an account exists with this email, a password reset link has been sent." 
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
