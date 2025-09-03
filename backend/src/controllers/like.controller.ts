import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * Like a blog post
 */
export const likeBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const blogId = parseInt(req.params.blogId);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    if (isNaN(blogId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid blog ID",
      });
      return;
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      res.status(404).json({
        status: "error",
        message: "Blog not found",
      });
      return;
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    if (existingLike) {
      res.status(400).json({
        status: "error",
        message: "Blog already liked",
      });
      return;
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId: parseInt(userId),
        blogId: blogId,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { blogId: blogId },
    });

    res.status(201).json({
      status: "success",
      data: { like, likeCount },
    });
  } catch (error) {
    console.error("Like blog error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Unlike a blog post
 */
export const unlikeBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const blogId = parseInt(req.params.blogId);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    if (isNaN(blogId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid blog ID",
      });
      return;
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    if (!existingLike) {
      res.status(400).json({
        status: "error",
        message: "Blog not liked yet",
      });
      return;
    }

    // Delete like
    await prisma.like.delete({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { blogId: blogId },
    });

    res.status(200).json({
      status: "success",
      data: { likeCount },
    });
  } catch (error) {
    console.error("Unlike blog error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Get liked blogs by user
 */
export const getLikedBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    const likedBlogs = await prisma.like.findMany({
      where: { userId: parseInt(userId) },
      include: {
        blog: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            tags: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      status: "success",
      data: { likedBlogs: likedBlogs.map((like) => like.blog) },
    });
  } catch (error) {
    console.error("Get liked blogs error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Get blog like status for current user
 */
export const getBlogLikeStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const blogId = parseInt(req.params.blogId);

    if (!userId) {
      res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
      return;
    }

    if (isNaN(blogId)) {
      res.status(400).json({
        status: "error",
        message: "Invalid blog ID",
      });
      return;
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    const likeCount = await prisma.like.count({
      where: { blogId: blogId },
    });

    res.status(200).json({
      status: "success",
      data: {
        isLiked: !!like,
        likeCount,
      },
    });
  } catch (error) {
    console.error("Get blog like status error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
