const axios = require('axios');

async function testPut() {
    const id = '685f8bcb7f93a34d5e4d2c11'; // dummy mongo ID
    const endpoints = [
        `PUT http://192.168.1.16:8000/api/updateGallery/${id}`,
        `PUT http://192.168.1.16:8000/api/gallery/${id}`,
        `PUT http://192.168.1.16:8000/api/update-gallery/${id}`,
        `PUT http://192.168.1.16:8000/api/gallery/update/${id}`,
        `PATCH http://192.168.1.16:8000/api/updateGallery/${id}`,
        `PATCH http://192.168.1.16:8000/api/gallery/${id}`,
        `PUT http://192.168.1.16:8000/api/UpdateGallery/${id}`,
        `PUT http://192.168.1.16:8000/api/galleryUpdate/${id}`,
    ];

    for (const ep of endpoints) {
        const [method, url] = ep.split(' ');
        try {
            const res = await axios({
                method,
                url,
                data: { title: "test" },
                validateStatus: () => true
            });
            console.log(`${ep} -> Status: ${res.status}, Body: ${JSON.stringify(res.data)}`);
        } catch (err) {
            console.log(`${ep} -> Error: ${err.message}`);
        }
    }
}

testPut();
