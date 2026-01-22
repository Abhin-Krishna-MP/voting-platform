import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Normalized email to prevent duplicate voting via different providers
  normalizedEmail: { type: String, required: true, unique: true },
  image: String,
  password: { type: String }, // Only for email/password auth
  // We will fill this if they log in via LinkedIn, or ask them to enter it manually later
  linkedinProfile: { type: String, default: "" }, 
  hasVoted: { type: Boolean, default: false },
  votedCandidateId: { type: String, default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  authProvider: { type: String, enum: ['google', 'linkedin', 'credentials', 'multiple'], default: 'credentials' },
}, { timestamps: true });

// Helper to normalize email (remove dots, lowercase for Gmail)
UserSchema.statics.normalizeEmail = function(email) {
  const [localPart, domain] = email.toLowerCase().trim().split('@');
  // For Gmail, remove dots as they're ignored (a.b@gmail.com === ab@gmail.com)
  if (domain === 'gmail.com') {
    return localPart.replace(/\./g, '') + '@' + domain;
  }
  return localPart + '@' + domain;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);