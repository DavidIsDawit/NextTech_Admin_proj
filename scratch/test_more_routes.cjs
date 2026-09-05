const axios = require('axios');

async function testMoreRoutes() {
    const id = '685f8bcb7f93a34d5e4d2c11';
    const baseUrl = 'https://nexttech-back-end.onrender.com/api';
    const endpoints = [
        `PUT ${baseUrl}/service/${id}`,
        `PUT ${baseUrl}/services/${id}`,
        `PUT ${baseUrl}/update-service/${id}`,
        `PUT ${baseUrl}/Gallery/${id}`,
        `PUT ${baseUrl}/UpdateGallery/${id}`,
        `PUT ${baseUrl}/update-gallery/${id}`,
        `PUT ${baseUrl}/galleries/${id}`,
        `PUT ${baseUrl}/updateGalleries/${id}`,
        `PUT ${baseUrl}/gallery/edit/${id}`,
        `POST ${baseUrl}/updateGallery/${id}`,
        `POST ${baseUrl}/gallery/update/${id}`,
        `PATCH ${baseUrl}/gallery/${id}`,
        `PATCH ${baseUrl}/updateGallery/${id}`,
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
            console.log(`${ep} -> Status: ${res.status}, Message: ${res.data?.message || JSON.stringify(res.data)}`);
        } catch (err) {
            console.log(`${ep} -> Error: ${err.message}`);
        }
    }
}

testMoreRoutes();
