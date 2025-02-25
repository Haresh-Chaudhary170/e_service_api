import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { providerId, type, name } = req.body;

        if (!type) {
            return cb(new Error('Type is required to determine upload path'), '');
        }
        // const providerId = req.user.providerId;
        let uploadPath = '';
        if (providerId) {
            uploadPath = path.join(
                'uploads',
                name || 'default', // Default if no name is provided
                providerId, // User ID
                type // Type of uploads
            );
        } else {
            uploadPath = path.join('uploads', type);
        }

        // Ensure the directory exists
        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                return cb(err, '');
            }
            cb(null, uploadPath);
        });
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// File filter for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
});

export const singleUploadMiddleware = upload.single('image');
export const multipleUploadMiddleware = upload.array('images', 5);
