import { Server } from "socket.io";
import { Consultation } from "../models/consultation.model.js";

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                "https://www.healthviz.in",
                "https://healthviz.in",
                "https://health-vison.vercel.app",
                "http://localhost:5173"
            ].filter(Boolean).map(url => url.replace(/\/$/, "")),
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Map to track user IDs and their socket IDs
    const users = new Map();

    io.on("connection", (socket) => {
        socket.on("register", (userId) => {
            users.set(userId, socket.id);
        });

        socket.on("join-room", async ({ roomId, appointmentId, userId }) => {
            socket.join(roomId);

            // Update/Create consultation status
            try {
                let consultation = await Consultation.findOne({ roomId });
                if (!consultation) {
                    consultation = await Consultation.create({
                        appointmentId,
                        roomId,
                        startTime: new Date(),
                        status: "active"
                    });
                }

                // Notify others in the room
                socket.to(roomId).emit("user-joined", { userId });
            } catch (error) {
                console.error("Error in join-room:", error);
            }
        });

        socket.on("offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("offer", { offer });
        });

        socket.on("answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("answer", { answer });
        });

        socket.on("ice-candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("ice-candidate", { candidate });
        });

        socket.on("leave-room", ({ roomId, userId }) => {
            socket.leave(roomId);
            socket.to(roomId).emit("user-left", { userId });
        });

        socket.on("disconnect", () => {
            // Find and remove user from users map
            for (const [userId, socketId] of users.entries()) {
                if (socketId === socket.id) {
                    users.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};
