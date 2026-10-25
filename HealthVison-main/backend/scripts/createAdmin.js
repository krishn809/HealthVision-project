import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1] || 'Admin@123';
    const firstName = args[2] || 'System';
    const lastName = args[3] || 'Admin';

    if (!email) {
        console.log('Usage: node scripts/createAdmin.js <email> [password] [firstName] [lastName]');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`User with email ${email} already exists. Promoting to admin...`);
            existingUser.role = 'admin';
            existingUser.isVerified = true;
            await existingUser.save();
            console.log('User promoted successfully!');
        } else {
            console.log(`Creating new admin user: ${email}`);
            await User.create({
                name: { first: firstName, last: lastName },
                email: email,
                password: password,
                phone: '0000000000',
                role: 'admin',
                isVerified: true
            });
            console.log('Admin user created successfully!');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
