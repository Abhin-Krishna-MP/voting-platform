import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  imageUrl: { type: String, required: true }, // We will use placeholder images
  voteCount: { type: Number, default: 0 },
});

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);