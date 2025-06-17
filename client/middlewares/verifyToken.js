import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // 🍪 აქედან ვიღებთ

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👉 მომხმარებლის მონაცემები ვამაგრებთ req.user-ზე
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
