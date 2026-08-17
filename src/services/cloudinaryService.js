const cloudinary = require("../config/cloudinary");

function uploadImage(buffer) {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: "ecommerce/products",
			},
			(error, result) => {
				if (error) {
					return reject(error);
				}

				resolve(result);
			},
		);

		uploadStream.end(buffer);
	});
}

async function deleteImage(publicId) {
	return cloudinary.uploader.destroy(publicId);
}

module.exports = {
	uploadImage,
	deleteImage,
};
