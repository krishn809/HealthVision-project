const mongoose = require("mongoose");
let mongoMemoryServer = null;

module.exports = async () => {
    mongoose.set("strictQuery", false);
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000,
    };

    const targetUri = process.env.MONGODB_URI;

    // 1. Attempt connection to configured external MONGODB_URI if valid
    if (targetUri && targetUri.startsWith("mongodb") && !targetUri.includes("127.0.0.1:27017") && !targetUri.includes("localhost:27017")) {
        try {
            await mongoose.connect(targetUri, connectionParams);
            console.log("Connected to external MongoDB successfully");
            return targetUri;
        } catch (err) {
            console.warn(`External MongoDB connection failed (${err.message}). Falling back to embedded in-memory MongoDB...`);
        }
    }

    // Also try local 27017 with short timeout if explicitly specified
    if (targetUri && (targetUri.includes("127.0.0.1:27017") || targetUri.includes("localhost:27017"))) {
        try {
            await mongoose.connect(targetUri, connectionParams);
            console.log("Connected to local MongoDB (27017) successfully");
            return targetUri;
        } catch (err) {
            console.warn("Local MongoDB (port 27017) not running. Starting embedded in-memory database...");
        }
    }

    // 2. Embedded in-memory MongoDB fallback
    try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        process.env.MONGODB_URI = memoryUri;
        await mongoose.connect(memoryUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to embedded in-memory MongoDB successfully at:", memoryUri);
        return memoryUri;
    } catch (memErr) {
        console.error("Failed to start embedded in-memory MongoDB:", memErr.message);
        throw memErr;
    }
};
