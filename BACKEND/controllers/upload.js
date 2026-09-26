import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const fileFilter = function (req, file, cb) {
  const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Sadece JPG , JPEG ve PNG formatındaki resimler kabul olur"),
      false,
    );
  }
};
const limits = {
    _fileSize: 5 * 1024 * 1024,
};
const upload = multer({ storage, fileFilter, limits });
export default upload;
