import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  // We will fill this if they log in via LinkedIn, or ask them to enter it manually later
  linkedinProfile: { type: String, default: "" }, 
  hasVoted: { type: Boolean, default: false },
  votedCandidateId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);