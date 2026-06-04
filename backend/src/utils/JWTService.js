const jwt = require("jsonwebtoken");

class JWTService {
  static generateToken(user, expiresIn = "24h") {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error("Invalid token format");
    }
  }
}

module.exports = JWTService;
