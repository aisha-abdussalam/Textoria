import { prisma } from "../config/db.js";
import { deleteImage } from "../utils/cloudinaryHelper.js";

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            // where: {
            //     name: {
            //         equals: "Brooke"
            //     }
            //     // role: "ADMIN"
            //     // AND: [
            //     //     {
            //     //         posts: {
            //     //             some: {}
            //     //         }
            //     //     },
            //     //     {
            //     //         posts: {
            //     //             every: {
            //     //                 published: true
            //     //             }
            //     //         }
            //     //     }
            //     // ]
            // },
            select: {
                id: true,
                name: true,
                createdAt: true,
                profile: {
                    select: {
                        id: true,
                        bio: true,
                        profileUrl: true,
                        createdAt: true
                    }
                }
            }
        });

        if (users.length === 0) {
            return res.status(404).json({
                error: "No users found"
            })
        }

        res.status(200).json({
            status: "success",
            data: {
                users
            }
        })
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.id,
            },
            select: { // can also use include depending on the "context"
                id: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        posts: {
                            where: {
                                published: true
                            }
                        }
                    }
                },
                profile: {
                    select: {
                        id: true,
                        bio: true,
                        profileUrl: true,
                        createdAt: true
                    }
                },
                posts: {
                    where: { published: true },
                    include: { categories: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        res.status(200).json({
            status: "success",
            data: {
                user
            }
        })
    } catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const updateUser = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({
                status: "fail",
                error: "Access denied. You can only edit your own profile."
            })
        }

        const { name } = req.body;
        const updatedUser = await prisma.user.update({
            where: {
                id: req.params.id
            },
            data: {
                name,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        })
        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser
            }
        })
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal server error"
        })
    }
}

const getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            profile: {
                select: {
                    id: true,
                    bio: true,
                    profileUrl: true,
                    createdAt: true
                }
            },
            _count: {
                select: {
                    posts: {
                        where: {
                            published: true
                        }
                    }
                }
            }
        }
    })
    if (!user) {
        return res.status(401).json({
            error: "No user found"
        })
    }

    // Destructure user
    const {_count, ...userData} = user

    res.status(200).json({
        status: "Success",
        data: {
            user: userData,
            postsCount: _count.posts,
        },
    })
}

const deleteUser = async (req, res) => {
    if (req.params.id !== req.user.id) {
        return res.status(403).json({ error: "Access denied." });
    }

    const userWithProfile = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
    });

    if (userWithProfile?.profile?.profileUrl) {
        await deleteImage(userWithProfile.profile.profileUrl);
    }

    await prisma.user.delete({ where: { id: req.user.id } });
    res.status(200).json({ message: "Account deleted." });
};

export { getUsers, getUser, updateUser, getMe, deleteUser };