import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    techStack: [String],
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: String,
    role: String,
    duration: String,
    description: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    field: String,
    year: String,
    cgpa: String,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Cloudinary file info
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String, // Cloudinary public_id for deletion
      required: true,
    },
    originalName: {
      type: String,
    },
    // Gemini-parsed structured data
    parsedData: {
      skills: { type: [String], default: [] },
      projects: { type: [projectSchema], default: [] },
      experience: { type: [experienceSchema], default: [] },
      education: { type: [educationSchema], default: [] },
      summary: { type: String, default: "" },
    },
    isParsed: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true, // only one active resume per user (enforced in controller)
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
