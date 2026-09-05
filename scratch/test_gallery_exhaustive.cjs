const axios = require('axios');

async function testGalleryRoutes() {
    const id = '685f8bcb7f93a34d5e4d2c11';
    const baseUrl = 'https://nexttech-back-end.onrender.com/api';
    const endpoints = [
        `PUT ${baseUrl}/galleryItem/${id}`,
        `PUT ${baseUrl}/gallery-item/${id}`,
        `PUT ${baseUrl}/gallery/item/${id}`,
        `PUT ${baseUrl}/updateGalleryItem/${id}`,
        `PUT ${baseUrl}/media/${id}`,
        `PUT ${baseUrl}/updateMedia/${id}`,
        `PUT ${baseUrl}/update-media/${id}`,
        `PUT ${baseUrl}/ImageGallery/${id}`,
        `PUT ${baseUrl}/updateImageGallery/${id}`,
        `PUT ${baseUrl}/image-gallery/${id}`,
        `PUT ${baseUrl}/update-image-gallery/${id}`,
        `PUT ${baseUrl}/gaImageGallery/${id}`,
        `PUT ${baseUrl}/updateGaImageGallery/${id}`,
        `PUT ${baseUrl}/GaImageGallery/${id}`,
        `PUT ${baseUrl}/UpdateGaImageGallery/${id}`,
        `PUT ${baseUrl}/gallery/updateGallery/${id}`,
        `PUT ${baseUrl}/gallery/update-gallery/${id}`,
        `PUT ${baseUrl}/gallery`,
        `PUT ${baseUrl}/updateGallery`,
        `PATCH ${baseUrl}/gallery`,
        `PATCH ${baseUrl}/updateGallery`,
        `PUT ${baseUrl}/gallery/`,
        `POST ${baseUrl}/gallery/${id}`,
        `POST ${baseUrl}/gallery/edit`,
        `POST ${baseUrl}/updateGallery`,
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
            if (res.status !== 404) {
                console.log(`FOUND! ${ep} -> Status: ${res.status}, Message: ${res.data?.message || JSON.stringify(res.data)}`);
            } else {
                console.log(`404: ${ep}`);
            }
        } catch (err) {
            console.log(`${ep} -> Error: ${err.message}`);
        }
    }
}

testGalleryRoutes();
