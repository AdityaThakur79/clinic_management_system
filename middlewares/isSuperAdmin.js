export const isSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "superAdmin" || role === "director") {
    return next();
  }
  return res.status(403).json({ message: "Access denied" });
};
