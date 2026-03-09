import { prisma } from "../config/db.js";
import { deleteImage } from "../utils/cloudinaryHelper.js";

const createPost = async (req, res) => {
    try {
        const { title, content, categories } = req.body;
        const posterUrl = req.file ? req.file.path : null;
        let parsedCategories = [];
        if (typeof categories === 'string') {
            try {
                parsedCategories = JSON.parse(categories);
            } catch {
                parsedCategories = [categories];
            }
        }
        else {
            parsedCategories = categories || [];
        }

        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: req.user.id,
                views: 0,
                posterUrl,
                categories: {
                    connectOrCreate: parsedCategories.map((name) => ({
                        create: { name },
                        where: { name }
                    }))
                }
            },
            include: {
                categories: true
            }
        })

        res.status(201).json({
            status: "success",
            data: {
                post: newPost
            }
        })
    } catch (error) {
        console.error("Create Posts Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const getPosts = async (req, res) => {
    try {
        const title = req.query.search;
        const categories = [].concat(req.query.categories || []);

        let queryOptions = {};
        if (title) {
            queryOptions.title = {
                contains: title,
                mode: "insensitive"
            }
        }

        if (categories.length > 0) {
            queryOptions.categories = {
                some: {
                    name: {
                        in: categories
                    }
                }
            }
        }

        const page = Number(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit

        const [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: {
                    ...queryOptions,
                    published: true
                },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    },
                    categories: true
                },
                skip,
                take: limit
            }),
            prisma.post.count({
                where: {
                    ...queryOptions,
                    published: true
                }
            })
        ])

        if (posts.length === 0) {
            return res.status(404).json({
                error: "Post not found"
            })
        }

        const wordsPerMinute = 200;
        const postsWithReadTime = posts.map(post => {
            const wordCount = post.content.trim().split(/\s+/).length
            const minute = Math.ceil(wordCount / wordsPerMinute);

            return {
                ...post,
                likes: post._count.likes,
                commentsCount: post._count.comments,
                readTime: `${minute} min read`,
                _count: undefined
            };
        })

        res.status(200).json({
            status: "success",
            results: posts.length,
            totalPosts: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: {
                posts: postsWithReadTime
            }
        })
    } catch (error) {
        console.error("Fetch Posts Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const getMyDrafts = async (req, res) => {
    try {
        const userId = req.user.id

        const title = req.query.search;
        const categories = [].concat(req.query.categories || []);

        let queryOptions = {
            authorId: userId,
            published: false
        };

        if (title) {
            queryOptions.title = {
                contains: title,
                mode: "insensitive"
            }
        }

        if (categories.length > 0) {
            queryOptions.categories = {
                some: {
                    name: {
                        in: categories
                    }
                }
            }
        }

        const page = Number(req.query.page) || 1;
        const limit = 2;
        const skip = (page - 1) * limit

        const [posts, totalCount] = await Promise.all([
            prisma.post.findMany({
                where: queryOptions,
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    categories: true
                },
                skip: skip,
                take: limit
            }),
            prisma.post.count({
                where: queryOptions
            })
        ])

        if (posts.length === 0) {
            return res.status(200).json({
                error: "Drafts not available"
            })
        }

        const wordsPerMinute = 200;
        const postsWithReadTime = posts.map(post => {
            const wordCount = post.content.trim().split(/\s+/).length
            const minute = Math.ceil(wordCount / wordsPerMinute);

            return {
                ...post,
                readTime: `${minute} min read`
            };
        })

        res.status(200).json({
            status: "success",
            results: posts.length,
            totalPosts: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: {
                posts: postsWithReadTime
            }
        })
    } catch (error) {
        console.error("Fetch Posts Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const getPost = async (req, res) => {
    try {
        const userId = req.user?.id
        const post = await prisma.post.update({
            where: {
                id: req.params.id,
                published: true
            },
            data: {
                views: { increment: 1 }
            },
            include: {
                author: {
                    select: {
                        name: true
                    }
                },
                comments: {
                    select: {
                        content: true,
                        author: {
                            select: {
                                name: true,
                                profile: {
                                    select: {
                                        profileUrl: true
                                    }
                                }
                            }
                        },
                        createdAt: true,
                        updatedAt: true
                    }
                },
                likes: userId ? {
                    where: { userId: userId }
                } : false,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                categories: true
            }
        })

        const wordsPerMinute = 200;
        const wordCount = post.content.trim().split(/\s+/).length;
        const minute = Math.ceil(wordCount / wordsPerMinute);

        const isLikedByUser = userId ? post.likes.length > 0 : false;

        res.status(200).json({
            status: "success",
            data: {
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: isLikedByUser,
                readTime: minute,
                likes: undefined,
                _count: undefined
            }
        })
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                status: "fail",
                error: "Post not found"
            });
        }

        console.error("Fetch Post Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.user.id

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            })
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            })

            return res.status(200).json({
                message: "Post unliked"
            })
        }
        else {
            await prisma.like.create({
                data: {
                    userId,
                    postId
                }
            })
            return res.status(201).json({
                message: "Post liked"
            })
        }
    } catch (error) {
        console.error("Like Post Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const updatePost = async (req, res) => {
    try {
        const postExists = await prisma.post.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                categories: true
            }
        })

        if (!postExists) {
            return res.status(404).json({
                error: "Post not found"
            })
        }

        if (postExists.authorId !== req.user.id) {
            return res.status(403).json({
                error: "Not authorized. You can only edit your own post"
            })
        }

        const { title, content, comment, categories } = req.body;
        // const posterUrl = req.file ? req.file.path : null;

        let posterUrl = postExists?.posterUrl;
        if (req.file) {
            if (postExists?.posterUrl) {
                await deleteImage(postExists.posterUrl)
            }
            posterUrl = req.file.path
        }

        let parsedCategories = [];
        if (typeof categories === 'string') {
            try {
                parsedCategories = JSON.parse(categories);
            } catch {
                parsedCategories = [categories];
            }
        }
        else {
            parsedCategories = categories || [];
        }

        const updatedPost = await prisma.post.update({
            where: {
                id: req.params.id
            },
            data: {
                title,
                content,
                comments: comment,
                posterUrl,
                categories: {
                    set: [],
                    connectOrCreate: parsedCategories.map((name) => ({
                        create: { name },
                        where: { name }
                    }))
                }
            },
            include: {
                categories: true
            }
        })

        res.status(200).json({
            status: "success",
            data: {
                post: updatedPost
            }
        })
    } catch (error) {
        console.error("Update Post Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: {
                id: req.params.id
            }
        })
        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            })
        }
        if (post.authorId !== req.user.id) {
            return res.status(403).json({
                error: "Not authorized. You can only delete your own post"
            })
        }

        if (post?.posterUrl) {
            await deleteImage(post.posterUrl)
        }

        await prisma.post.delete({
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({
            status: "success",
            message: "Post deleted successfully"
        })
    } catch (error) {
        console.error("Delete Post Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

export { createPost, getPosts, getMyDrafts, getPost, toggleLike, updatePost, deletePost };