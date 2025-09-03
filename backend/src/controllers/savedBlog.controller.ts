import { Request, Response } from "express";
import prisma from "../prisma";

/**
 * Save a blog post
 */
export const saveBlog = async (req: Request, res: Response): Promise<void> => {
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

    // Check if already saved
    const existingSave = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    if (existingSave) {
      res.status(400).json({
        status: "error",
        message: "Blog already saved",
      });
      return;
    }

    // Create saved blog
    const savedBlog = await prisma.savedBlog.create({
      data: {
        userId: parseInt(userId),
        blogId: blogId,
      },
    });

    res.status(201).json({
      status: "success",
      data: { savedBlog },
    });
  } catch (error) {
    console.error("Save blog error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Unsave a blog post
 */
export const unsaveBlog = async (
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

    // Check if saved blog exists
    const existingSave = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    if (!existingSave) {
      res.status(400).json({
        status: "error",
        message: "Blog not saved yet",
      });
      return;
    }

    // Delete saved blog
    await prisma.savedBlog.delete({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Blog unsaved successfully",
    });
  } catch (error) {
    console.error("Unsave blog error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Get saved blogs by user
 */
export const getSavedBlogs = async (
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

    const savedBlogs = await prisma.savedBlog.findMany({
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
      data: { savedBlogs: savedBlogs.map((save) => save.blog) },
    });
  } catch (error) {
    console.error("Get saved blogs error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Get blog save status for current user
 */
export const getBlogSaveStatus = async (
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

    const savedBlog = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId: parseInt(userId),
          blogId: blogId,
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        isSaved: !!savedBlog,
      },
    });
  } catch (error) {
    console.error("Get blog save status error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
