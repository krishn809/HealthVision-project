import { User } from "../models/user.model.js";
import imagekit from "../utils/imagekit.js";

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json({
            message: "User fetched successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                address: user.address,
                location: user.location,
                bloodGroup: user.bloodGroup,
                height: user.height,
                weight: user.weight,
                allergies: user.allergies,
                medicalHistory: user.medicalHistory,
                currentMedications: user.currentMedications,
                emergencyContact: user.emergencyContact,
                insurance: user.insurance,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (updates.avatarUrl && typeof updates.avatarUrl === 'string' && updates.avatarUrl.startsWith('data:image')) {
            try {
                const uploadResponse = await imagekit.files.upload({
                    file: updates.avatarUrl,
                    fileName: `${user.name.first}_avatar_${Date.now()}.jpg`,
                    folder: "/avatars"
                });
                updates.avatarUrl = uploadResponse.url;
            } catch (error) {
                console.error("ImageKit upload error:", error);
            }
        }

        if (updates.address && typeof updates.address === 'object') {
            updates.address = { ...(user.address ? (user.address.toObject ? user.address.toObject() : user.address) : {}), ...updates.address };
        }
        if (updates.emergencyContact && typeof updates.emergencyContact === 'object') {
            updates.emergencyContact = { ...(user.emergencyContact ? (user.emergencyContact.toObject ? user.emergencyContact.toObject() : user.emergencyContact) : {}), ...updates.emergencyContact };
        }
        if (updates.name && typeof updates.name === 'object') {
            updates.name = { ...(user.name ? (user.name.toObject ? user.name.toObject() : user.name) : {}), ...updates.name };
        }

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                user[key] = updates[key];
            }
        });

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                address: user.address,
                location: user.location,
                bloodGroup: user.bloodGroup,
                height: user.height,
                weight: user.weight,
                allergies: user.allergies,
                medicalHistory: user.medicalHistory,
                currentMedications: user.currentMedications,
                emergencyContact: user.emergencyContact,
                insurance: user.insurance,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};