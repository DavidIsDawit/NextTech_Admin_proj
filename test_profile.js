import axios from 'axios';

async function checkMe() {
  try {
    const res = await axios.get("http://192.168.1.16:8000/api/getme", {
      headers: {
        Authorization: "Bearer " + process.argv[2]
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
checkMe();
