import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  likeBlog,
  unlikeBlog,
  getLikedBlogs,
  getBlogLikeStatus,
} from "../controllers/like.controller";

const router = Router();

// Like/unlike routes
router.post("/:blogId", authenticate, likeBlog);
router.delete("/:blogId", authenticate, unlikeBlog);

// Get liked blogs by user
router.get("/", authenticate, getLikedBlogs);

// Get like status for a specific blog
router.get("/:blogId/status", authenticate, getBlogLikeStatus);

export default router;
