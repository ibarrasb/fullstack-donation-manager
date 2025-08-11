// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { z } from "zod";
import { connectDB } from "./db.js";
import Donation from "./donation.model.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Zod schema for input validation (trust boundary)
const DonationInput = z.object({
  donor_name: z.string().min(1).max(200),
  donation_type: z.enum(["money", "food", "clothing", "supplies", "other"]),
  amount: z.number().finite().nonnegative(),
  // accept either full ISO or date-only; normalize to Date
  donated_at: z
    .string()
    .refine((s) => /^\d{4}-\d{2}-\d{2}/.test(s), "Use YYYY-MM-DD or ISO datetime"),
});

// --- Routes ---
app.get("/api/donations", async (_req, res, next) => {
  try {
    const rows = await Donation.find().sort({ donated_at: -1, _id: -1 });
    res.json(rows);
  } catch (e) { next(e); }
});

app.get("/api/donations/:id", async (req, res, next) => {
  try {
    const row = await Donation.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e) { next(e); }
});

app.post("/api/donations", async (req, res, next) => {
  try {
    const parsed = DonationInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
    }
    // normalize date to JS Date
    const data = { ...parsed.data, donated_at: new Date(parsed.data.donated_at) };
    const created = await Donation.create(data);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

app.put("/api/donations/:id", async (req, res, next) => {
  try {
    const parsed = DonationInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.format() });
    }
    const data = { ...parsed.data, donated_at: new Date(parsed.data.donated_at) };
    const updated = await Donation.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) { next(e); }
});

app.delete("/api/donations/:id", async (req, res, next) => {
  try {
    const deleted = await Donation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) { next(e); }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// Boot
const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`🚀 Backend on http://localhost:${PORT}`));
};
start();
