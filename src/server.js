import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB, disconnectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";

connectDB();

const app = express();

app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}))

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/users', userRoutes)
app.use('/profile', profileRoutes)
app.use('/comments', commentsRoutes)

const PORT = 6001;

const server = app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
})

process.on("unhandledRejection", (err) => {
    console.error("unhandled Rejection", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    })
})

process.on("uncaughtException", async (err) => {
    console.error("uncaught Exception", err);
    await disconnectDB();
    process.exit(1);
})

process.on("SIGTERM", async () => {
    console.error("SIGTERM received. Shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        console.info("Closed all connections. Goodbye!");
        process.exit(0); // Exit code 0 means "Success/Planned"
    })
})