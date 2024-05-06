const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest;
        if (file.mimetype.startsWith('image/')) {
            dest = 'public/chat/images/';
        } else if (file.mimetype.startsWith('video/')) {
            dest = 'public/chat/videos/';
        } else if (file.mimetype.startsWith('audio/')) {
            dest = 'public/chat/audios/';
        } 
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });
module.exports = upload
