import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Replace with valid credentials if you have them, or we can rely on manual testing if this fails.
// Assuming we can register/login a test user.
const testUser = {
    name: {
        first: "Test",
        last: "User"
    },
    email: `test.dashboard.${Date.now()}@example.com`,
    password: "Password123!",
    role: "patient",
    phone: "1234567890",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    bloodGroup: "O+",
    height: 175,
    weight: 70,
    emergencyContact: {
        name: "Emergency Contact",
        phone: "0987654321",
        relation: "Sibling"
    }
};

const verifyStats = async () => {
    try {
        console.log("Checking server connectivity...");
        try {
            await axios.get('http://localhost:3000/');
            console.log("Server is reachable.");
        } catch (e) {
            console.error("Server unreachable:", e.message);
            return;
        }

        // 1. Register/Login
        let token;
        try {
            console.log("Attempting login...");
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            token = loginRes.data.token;
            console.log("Login successful");
        } catch (error) {
            console.log("Login failed, attempting registration...");
            try {
                const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
                token = registerRes.data.token;
                console.log("Registration successful");
            } catch (regError) {
                console.error("Registration Failed:", JSON.stringify(regError.response ? regError.response.data : regError.message, null, 2));
                throw new Error("Registration failed");
            }
        }

        if (!token) throw new Error("Could not get token");

        // 2. Get Stats
        console.log("Fetching dashboard stats...");
        const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Stats Response:", JSON.stringify(statsRes.data, null, 2));

        if (statsRes.data.success && statsRes.data.data.appointments && statsRes.data.data.reports) {
            console.log("✅ Verification Passed: Stats structure is correct.");
        } else {
            console.error("❌ Verification Failed: Invalid stats structure.");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
};

verifyStats();
