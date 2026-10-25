// Verification script for chatbot endpoints (run with node)
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
// Assuming a user login is needed to get a token. 
// If no user exists, manual creation or seed might be needed first.
// This script assumes a user exists or registration is part of the flow.
// For simplicity, let's try to login with a known user or create one.

const testChatbot = async () => {
    try {
        console.log('--- Starting Chatbot Verification ---');

        const randomEmail = `test_${Date.now()}@example.com`;
        let token;
        try {
            // Try to register a new user
            console.log(`Attempting to register with email: ${randomEmail}`);
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                name: { first: 'Test', last: 'User' },
                email: randomEmail,
                password: 'password123',
                phone: '1234567890',
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                bloodGroup: 'O+',
                height: 175,
                weight: 70,
                emergencyContact: {
                    name: 'Emergency Contact',
                    phone: '9876543210',
                    relation: 'Family'
                }
            });
            token = registerRes.data.token;
            console.log('Registration successful.');
        } catch (regError) {
            console.error('Registration failed:', regError.response?.data || regError.message);
            // If registration fails, try login with a fixed user (fallback)
            try {
                console.log('Attempting fallback login...');
                const loginRes = await axios.post(`${API_URL}/auth/login`, {
                    email: 'test@example.com',
                    password: 'password123'
                });
                token = loginRes.data.token;
                console.log('Fallback login successful.');
            } catch (loginError) {
                console.error('Fallback login failed:', loginError.response?.data || loginError.message);
                return;
            }
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Send a Message
        console.log('Sending a message...');
        const messagePayload = {
            message: 'Hello, I have a headache.',
            urgency: 'Low'
        };
        const sendRes = await axios.post(`${API_URL}/chatbot/message`, messagePayload, config);
        console.log('Message sent response:', sendRes.data);

        if (sendRes.data.success && sendRes.data.data.message === messagePayload.message) {
            console.log('✅ Send Message Passed');
        } else {
            console.error('❌ Send Message Failed');
        }

        // 3. Get History
        console.log('Fetching history...');
        const historyRes = await axios.get(`${API_URL}/chatbot/history`, config);
        console.log('History response count:', historyRes.data.count);

        if (historyRes.data.success && historyRes.data.count > 0) {
            // Check if the last message is the one we just sent
            const messages = historyRes.data.data;
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.message === messagePayload.message) {
                console.log('✅ Get History Passed');
            } else {
                console.error('❌ Get History Content Mismatch');
            }
        } else {
            console.error('❌ Get History Failed');
        }

        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
    }
};

testChatbot();
