const jwt = require("jsonwebtoken");

const JWT_Secret = "tghjk hgcfcfvgbx vx bnjkx";

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization)
    return res.status(401).json({ error: "Token is not found" });

  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decode = jwt.verify(token, JWT_Secret);

    req.user = decode;
    next();
  } catch (error) {
    console.error(error); // Log the error properly
    res.status(401).json({ error: "Invalid token" });
  }
};

const generateToken = (userData) => {
  return jwt.sign(userData, JWT_Secret, { expiresIn: "30m" });
};

module.exports = { jwtAuthMiddleware, generateToken };
