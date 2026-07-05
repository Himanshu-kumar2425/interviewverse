import { body } from "express-validator";
import User from "../models/User.model.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const updateProfileValidators = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("bio")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Bio cannot exceed 300 characters"),
  body("college").optional().trim(),
  body("graduationYear")
    .optional()
    .isInt({ min: 2000, max: 2040 })
    .withMessage("Invalid graduation year"),
  body("targetRoles").optional().isArray(),
];

/**
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

/**
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "bio", "college", "graduationYear", "targetRoles", "avatar"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ user });
});

/**
 * GET /api/users/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("stats");
  res.json({ stats: user.stats });
});
