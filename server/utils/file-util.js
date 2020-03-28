
const path = require('path');
const fs = require('fs');

module.exports = {
    open(fileName) {
        let filePath = path.resolve(fileName);
        return new Promise((r, j) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    j(err); return;
                }
                r(data);
            })
        })
    },
    saveText(fileName, content) {
        return new Promise((r, j) => {
            fs.writeFile(fileName, content, null, (err, result) => {
                if (err) {
                    j(err); return;
                }
                r(result);
            });
        })
    },
    delete(fileName) {
        return new Promise((r, j) => {
            fs.unlink(fileName, (err, result) => {
                if (err) {
                    j(err); return;
                }
                r(result);
            });
        })
    }
}