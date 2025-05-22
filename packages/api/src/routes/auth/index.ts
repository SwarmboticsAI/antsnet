import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Type definitions
interface User {
  id: number;
  username: string;
  password: string;
}

interface UserPayload {
  id: number;
  username: string;
}

interface JwtPayload {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Config constants
const JWT_SECRET = "your-super-secret-key-change-this-in-production";
// Token expiration - 30 days in seconds (30 * 24 * 60 * 60)
const TOKEN_EXPIRATION = 2592000;

// In-memory user store (replace with database later)
const users: User[] = [];

const router = Router();

// Auth middleware
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
};

// Login route
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  // Validation
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  // Find user
  const user = users.find((u) => u.username === username);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username } as UserPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

// Register route
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  // Validation
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
    return;
  }

  // Check if user already exists
  if (users.find((u) => u.username === username)) {
    res.status(409).json({ error: "Username already exists" });
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const newUser: User = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };

  users.push(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username } as UserPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
    },
  });
});

// Logout route (client-side handling)
router.post("/logout", (_req: Request, res: Response): void => {
  // With JWT, logout is typically handled client-side by removing the token
  res.json({
    message: "Logout successful",
  });
});

// Protected route example
router.get("/me", authenticateToken, (req: Request, res: Response): void => {
  res.json({
    user: req.user,
  });
});

export default router;
