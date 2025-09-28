export const isSuperAdmin = (req, res, next) => {
  // Checking user role for SuperAdmin access
  
  const role = req.user?.role;
  if (role === "superAdmin" || role === "director") {
    return next();
  }
  
  // Access denied for non-SuperAdmin role
  return res.status(403).json({ message: "Access denied" });
};
