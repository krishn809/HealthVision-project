import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const report = await mongoose.connection.db.collection('reports').findOne({});
        if (report) {
            console.log('REAL_REPORT_ID:', report._id.toString());
        } else {
            console.log('NO_REPORTS_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
