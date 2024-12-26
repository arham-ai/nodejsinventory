const util = require("util");
const multer = require("multer");
const fs = require("fs").promises;

let storageposts = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./resources/static/assets/uploads/inventoryImages/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString().slice(0, -3)}-${file.originalname}`);
    },
});
let uploadInventory = multer({
    storage: storageposts,
}).single("file");
let uploadInventorysMiddleware = util.promisify(uploadInventory);
module.exports = uploadInventorysMiddleware;
