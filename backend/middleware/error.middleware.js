/**
 * Async wrapper — eliminates try/catch boilerplate in controllers.
 * Usage: router.get("/path", asyncHandler(myController))
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
