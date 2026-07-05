import { validationResult } from "express-validator";

/**
 * Drop-in middleware to check express-validator results.
 * Place after your validator chain in the route definition.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
