const multer = require('multer');
const util = require("util");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;
        switch (file?.fieldname) {
            case "profile_picture":
                uploadPath = './resources/static/assets/uploads/profiles/';
                break;

            case "lecture_video":
                uploadPath = './resources/static/assets/uploads/profiles/';
                break;

            case "lecture_thumbnails":
                uploadPath = './resources/static/assets/uploads/profiles/';
                break;

            default:
                return cb(new Error(`Unexpected field: ${file.fieldname}`), null);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now().toString().slice(0, -3)}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const allowedTypes = [
    'image/jpeg',  
    'image/png',   
    'image/webp',  
    'image/jfif',
    'image/gif',   
    'image/tiff',  
    'image/heic',  
    'image/heif',
    'video/mp4',  
    'video/mpeg',  
    'video/quicktime',  
    'video/x-msvideo',  
    'video/x-ms-wmv',   
    'video/webm',       
    'video/3gpp',       
    'video/x-flv'
 ];

const uploadAttachments = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    },
}).fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'lecture_thumbnails', maxCount: 1 },
    { name: 'lecture_video', maxCount: 1 }
]);

let uploadAttachmentsMiddleware = util.promisify(uploadAttachments);
module.exports = uploadAttachmentsMiddleware;
