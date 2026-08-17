const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
	storage,

	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 5,
	},

	fileFilter: (req, file, cb) => {
		if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
			return cb(new Error("Invalid file type"), false);
		}

		cb(null, true);
	},
});

module.exports = upload;
