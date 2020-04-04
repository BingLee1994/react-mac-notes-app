const dbUtil = require('../utils/db');
const { isNone } = require('../utils');
const config = require('../config');

const path = require('path');
const fs = require('fs');
const imagePath = config.noteImagePath;

module.exports = {
    storege: {
        destination: function (req, file, cb) {
            console.log('收到请求');
            cb(null, imagePath);
        },
        filename: function (req, file, cb) {
            let { originalname } = file;
            if (fs.existsSync(path.resolve(imagePath, file.originalname))) {
                originalname = originalname+Date.now();
            }
            cb(null, originalname);
        }
    },
    image(req, res) {
        debugger;
        let fileName = req.files[0].originalname;
        let url = [config.noteImagePathUrlPrefix, fileName].join('/');
        console.log(url);
        res.send(url);
    }
};
