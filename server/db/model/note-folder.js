
let { isString, uuid, isNumber, isPlainObj, pureObj } = require('../../utils');
let FieldValidator = require('../../utils/model');

const validator = new FieldValidator({
    folderName(val) {
        if (!isString(val)) throw new Error('The folder name shoule be a valid string!');
    },
    count(val) {
        if (!isNumber(val)) throw new Error('The count shoule be a valid number');
    },
    id(val) {
        if (!isString(val)) throw new Error('The id shoule be a valid string');
    },
    date(val) {
        if (!isNumber(val)) throw new Error('The date shoule be a valid number');
    }
})

function NoteFolder() {
    //默认值
    let fiels = {
        folderName: "",
        id: uuid(5),
        count: 0,
        date: -1
    };
    if (isPlainObj(arguments[0])) {
        fiels = arguments[0];
    } else {
        fiels.folderName = arguments[0];
    }
    validator.validate(fiels);
    Object.assign(this, fiels);
}

NoteFolder.prototype = {
    toTable() {
        let data = pureObj();
        this.date < 0 && (this.date = new Date().valueOf());
        let { folderName, count, id, date } = this;
        return Object.assign(data, { folderName, count, id, date });
    },
    toJSON() {
        return this.toTable();
    },
    setFolderName(val) {
        let folderValidator = validator.getValidator('folderName');
        folderValidator.validate(val);
        this.folderName = val;
    },
    setCount(val) {
        let validator = validator.getValidator('count');
        validator.validate(val);
        this.count = val;
    },
    getFolderName(val) {
        return this.folderName;
    },
    getDate() {
        return this.date;
    },
    getCount() {
        return this.count;
    },
    getId() {
        return this.id;
    }
}

module.exports = NoteFolder;