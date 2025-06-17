export const verifyRole = (roles = []) => {
    // ერთ როლს თუ მიიღებს string-ად, ვაქცევ array-დ
    if (typeof roles === "string") {
      roles = [roles];
    }
  
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access Denied: Insufficient role" });
      }
      next();
    };
  };
  