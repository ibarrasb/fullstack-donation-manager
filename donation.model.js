// donation.model.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor_name: { type: String, required: true, trim: true, maxlength: 200 },
    donation_type: {
      type: String,
      enum: ["money", "food", "clothing", "supplies", "other"],
      required: true,
    },
    amount: { type: Number, min: 0, required: true },
    donated_at: { type: Date, required: true }, // ISO date
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
