import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/tmp");
        // cb(null, "/tmp/temp");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

export const upload=multer({storage});