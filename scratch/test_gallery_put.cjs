const axios = require('axios');

async function testPut() {
    const id = '685f8bcb7f93a34d5e4d2c11';
    const baseUrl = 'https://nexttech-back-end.onrender.com/api';
    const endpoints = [
        `PUT ${baseUrl}/updateGallery/${id}`,
        `PUT ${baseUrl}/gallery/${id}`,
        `PUT ${baseUrl}/update-gallery/${id}`,
        `PUT ${baseUrl}/gallery/update/${id}`,
        `PATCH ${baseUrl}/updateGallery/${id}`,
        `PATCH ${baseUrl}/gallery/${id}`,
        `PUT ${baseUrl}/UpdateGallery/${id}`,
        `PUT ${baseUrl}/galleryUpdate/${id}`,
        `PUT ${baseUrl}/editGallery/${id}`,
    ];

    for (const ep of endpoints) {
        const [method, url] = ep.split(' ');
        try {
            const res = await axios({
                method,
                url,
                data: { title: "test" },
                validateStatus: () => true,
                timeout: 10000
            });
            console.log(`${ep} -> Status: ${res.status}, Body: ${JSON.stringify(res.data)}`);
        } catch (err) {
            console.log(`${ep} -> Error: ${err.message}`);
        }
    }
}

testPut();
