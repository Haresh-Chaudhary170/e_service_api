"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleUploadMiddleware = exports.singleUploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure Multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const { providerId, type, name } = req.body;
        if (!type) {
            return cb(new Error('Type is required to determine upload path'), '');
        }
        let uploadPath = '';
        if (providerId) {
            uploadPath = path_1.default.join('uploads', name || 'default', // Default if no name is provided
            providerId, // User ID
            type // Type of uploads
            );
        }
        else {
            uploadPath = path_1.default.join('uploads', type);
        }
        // Ensure the directory exists
        fs_1.default.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                return cb(err, '');
            }
            cb(null, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// File filter for images
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed'));
    }
};
// Multer instance
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
});
exports.singleUploadMiddleware = upload.single('image');
exports.multipleUploadMiddleware = upload.array('images', 5);
