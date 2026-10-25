import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    const expiry = process.env.JWT_EXPIRY || "7d";
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: expiry,
    });
};
