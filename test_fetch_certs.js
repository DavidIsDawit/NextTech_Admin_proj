import axios from 'axios';

async function fetchCerts() {
  try {
    // login
    const loginRes = await axios.post("http://192.168.1.16:8000/api/user/login", {
      email: "nothing@gmail.com",
      password: "NewPas123"
    });
    
    const token = loginRes.headers.authorization.replace("Bearer ", "");
    
    // get certs
    const certsRes = await axios.get("http://192.168.1.16:8000/api/getAllCertificates", {
      headers: {
        Authorization: "Bearer " + token
      }
    });
    
    console.log(JSON.stringify(certsRes.data.certificates[0], null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
fetchCerts();
