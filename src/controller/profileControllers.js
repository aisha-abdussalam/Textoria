import { prisma } from "../config/db.js";
import { deleteImage } from "../utils/cloudinaryHelper.js";

const saveProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio } = req.body;

        const existingProfile = await prisma.profile.findUnique({
            where: { userId }
        });

        // const profileUrl = req.file ? req.file.path : undefined;
        let profileUrl = existingProfile?.profileUrl;

        if (req.file) {
            if (existingProfile?.profileUrl) {
                await deleteImage(existingProfile.profileUrl);
            }
            profileUrl = req.file.path;
        }

        const profile = await prisma.profile.upsert({
            where: { userId },
            update: {
                bio,
                profileUrl //...(profileUrl && { profileUrl })
            },
            create: {
                bio,
                profileUrl,
                userId
            },
        });

        res.status(200).json({ status: "Success", data: { profile } });
    } catch (error) {
        console.error("Save Profile Error:", error);
        res.status(500).json({ status: "error", error: "Internal server error" });
    }
};

const getProfile = async (req, res) => {
    const profile = await prisma.profile.findUnique({
        where: {
            id: req.params.id
        }
    })
    if (!profile) {
        return res.status(401).json({
            error: "No profile found"
        })
    }

    res.status(200).json({
        status: "Success",
        data: {
            profile
        }
    })
}

export { saveProfile, getProfile };