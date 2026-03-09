import { prisma } from "../config/db.js";

const createComment = async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: req.params.id,
                published: true
            }
        })
        if (!post) {
            return res.status(404).json({
                error: "No post found"
            })
        }

        const { content } = req.body;
        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: req.user.id,
                postId: req.params.id
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                }
            }
        })

        res.status(201).json({
            status: "Success",
            data: {
                comment
            }
        })
    } catch (error) {
        console.error("Create Comment Error:", error);
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

const getCommentsByPost = async (req, res) => {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId: req.params.id
            },
            include: {
                author: {
                    select: {
                        name: true,
                        profile: {
                            select: {
                                profileUrl: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        if (!comments) {
            return res.status(404).json({
                error: "No comment found"
            })
        }
        res.status(200).json({
            status: "Success",
            data: {
                comments
            }
        })
    } catch (error) {
        console.error("Get Comment Error:", error);
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

const deleteComment = async (req, res) => {
    try {
        const comment = await prisma.comment.findUnique({
            where: {
                id: req.params.id
            }
        })
        if (!comment) {
            return res.status(404).json({
                error: "No comment found"
            })
        }

        const post = await prisma.post.findUnique({
            where: {
                id: comment.postId
            }
        })
        if (req.user.id !== comment.authorId && req.user.id !== post.authorId) {
            return res.status(403).json({
                error: "Not authorized. You can only delete your comment"
            })
        }
        await prisma.comment.delete({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({
            status: "Success",
            message: "Comment deleted succesfully"
        })
    } catch (error) {
        console.error("Delete Comment Error:", error);
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

export { createComment, getCommentsByPost, deleteComment };