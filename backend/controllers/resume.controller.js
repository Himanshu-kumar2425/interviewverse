import pdfParse from "pdf-parse";
import fetch from "node-fetch"; // used to fetch the PDF from Cloudinary URL
import Resume from "../models/Resume.model.js";
import cloudinary from "../config/cloudinary.js";
import { parseResumeWithGemini } from "../utils/geminiHelpers.js";
import { asyncHandler } from "../middleware/error.middleware.js";

/**
 * POST /api/resumes/upload
 * Multipart/form-data — field name: "resume"
 */
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Deactivate old resumes for this user
  await Resume.updateMany({ user: req.user._id }, { isActive: false });

  // Create a new Resume document (unparsed)
  const resume = await Resume.create({
    user: req.user._id,
    fileUrl: req.file.path,        // Cloudinary URL
    filePublicId: req.file.filename, // Cloudinary public_id
    originalName: req.file.originalname,
    isActive: true,
  });

  // Kick off async parsing — respond immediately, parse in background
  parseInBackground(resume);

  res.status(201).json({
    message: "Resume uploaded. Parsing in progress.",
    resumeId: resume._id,
    fileUrl: resume.fileUrl,
  });
});

/**
 * Fetches the PDF from Cloudinary, extracts text, sends to Gemini, saves result.
 */
async function parseInBackground(resume) {
  try {
    // Fetch the PDF binary from Cloudinary
    const response = await fetch(resume.fileUrl);
    const buffer = await response.buffer();

    const { text: pdfText } = await pdfParse(buffer);

    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Could not extract meaningful text from PDF");
    }

    const parsedData = await parseResumeWithGemini(pdfText);

    await Resume.findByIdAndUpdate(resume._id, {
      parsedData,
      isParsed: true,
    });
  } catch (err) {
    console.error(`Resume parsing failed for ${resume._id}:`, err.message);
  }
}

/**
 * GET /api/resumes/active
 */
export const getActiveResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id, isActive: true });
  if (!resume) {
    return res.status(404).json({ message: "No active resume found" });
  }
  res.json({ resume });
});

/**
 * GET /api/resumes
 */
export const getAllResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ resumes });
});

/**
 * DELETE /api/resumes/:id
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({ message: "Resume not found" });
  }

  // Remove from Cloudinary
  await cloudinary.uploader.destroy(resume.filePublicId, {
    resource_type: "raw",
  });

  await resume.deleteOne();
  res.json({ message: "Resume deleted" });
});
