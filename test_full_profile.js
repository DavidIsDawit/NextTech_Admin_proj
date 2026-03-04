import axios from 'axios';

async function test() {
  const token = "PASTE_TOKEN_HERE";
  const userId = "699c3dd7b0634e24a1d1642a";
  try {
    const res = await axios.get("http://192.168.1.16:8000/api/getUser/" + userId, {
      headers: { Authorization: "Bearer " + token }
    });
    console.log("Full Profile:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
