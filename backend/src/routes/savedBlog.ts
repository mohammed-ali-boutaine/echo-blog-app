import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  saveBlog,
  unsaveBlog,
  getSavedBlogs,
  getBlogSaveStatus,
} from "../controllers/savedBlog.controller";

const router = Router();

// Save/unsave routes
router.post("/:blogId", authenticate, saveBlog);
router.delete("/:blogId", authenticate, unsaveBlog);

// Get saved blogs by user
router.get("/", authenticate, getSavedBlogs);

// Get save status for a specific blog
router.get("/:blogId/status", authenticate, getBlogSaveStatus);

export default router;
