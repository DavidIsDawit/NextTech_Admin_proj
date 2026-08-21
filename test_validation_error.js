import axios from 'axios';

async function testValidationError() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post("http://192.168.1.16:8000/api/user/login", {
      email: "nothing@example.com",
      password: "123456Abcd"
    });
    
    const token = loginRes.headers.authorization.replace("Bearer ", "");
    console.log("Logged in successfully. Token obtained.");
    
    console.log("Sending request to /api/news with empty payload...");
    const res = await axios.post("http://192.168.1.16:8000/api/news", {}, {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    console.log("Success response (unexpected):", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

testValidationError();
