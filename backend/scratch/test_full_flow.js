const axios = require('axios');

async function testFullFlow() {
    const email = 'virinchi@gmail.com';
    const password = 'password123'; // Standard password from seed/registration
    const baseUrl = 'http://localhost:5050/api';

    try {
        console.log(`🔐 Attempting login for ${email}...`);
        const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password });
        const token = loginRes.data.token;
        console.log('✅ Login successful. Token obtained.');
        console.log('Decoded Payload ID (expected):', JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).id);

        console.log('🚀 Attempting Check In via API...');
        const checkInRes = await axios.post(`${baseUrl}/attendance/checkin`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Check In successful:', checkInRes.data);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Flow failed:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

testFullFlow();
