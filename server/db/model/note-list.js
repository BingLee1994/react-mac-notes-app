
let { isString, uuid, replaceSpace, filterPureTextFromHTML, pureObj, isNumber, isPlainObj } = require('../../utils');
let FieldValidator = require('../../utils/model');

const TITLE_LENGTH = 15;
const PREVIEW_LENGTH = 100;

const validator = new FieldValidator({
    title(val) {
        if (!isString(val)) throw new Error('The title name should be a valid string!');
    },
    previewText(val) {
        if (!isString(val)) throw new Error('The preview text name should be a valid string!');
    },
    previewImage(val) {
        if (!isString(val)) throw new Error('The preview image name should be a valid string!');
    },
    id(val) {
        if (!isString(val)) throw new Error('The id should be a valid string');
    },
    folderId(val) {
        if (!isString(val)) throw new Error('The folderId should be a valid string');
    },
    date(val) { 
        if (!isNumber(val)) throw new Error('The date should be a valid number');
    },
})

function NoteList() {
    //默认值
    let fiels = {
        id: uuid(5),
        folderId: "",
        title: "",
        date: -1,
        previewText: "",
        previewImage: ""
    };
    if (isPlainObj(arguments[0])) {
        fiels = arguments[0];
    } else {
        fiels.previewText = arguments[0]|| '';
        (arguments.length > 1) && (fiels.previewImage = arguments[1]);
        (arguments.length > 2) && (fiels.folderId = arguments[2]);
    }
    validator.validate(fiels);
    Object.assign(this, fiels);
}

NoteList.prototype = {
    toTable() {
        this.date < 0 && (this.date = new Date().valueOf());
        let { title, previewImage, folderId, previewText, id, date } = this;
        return Object.assign(pureObj(), { folderId, title, previewImage, previewText, id, date });
    },
    toJSON() {
        return this.toTable() || {};
    },
    _validateSingleField(validatorName, val) {
        let filedValidator = validator.getValidator(validatorName);
        return filedValidator.validate(val);
    },
    setDate(date) {
        this._validateSingleField('date', date);
        this.date = date;
        return this;
    },
    setPreviewText(val) {
        this._validateSingleField('previewText', val);
        this.previewText = val;
        return this;
    },
    setPreviewImage(val) {
        this._validateSingleField('previewImage', val);
        this.previewImage = val;
        return this;
    },
    setFolderId(val) {
        this._validateSingleField('folderId', val);
        this.folderId = val;
        return this;
    },
    getFolderId() {
        return this.folderId;
    },
    setFolderId(val) {
        this._validateSingleField('folderId', val);
        this.folderId = val;
    },
    getPreviewImage() {
        return this.previewImage;
    },
    getPreviewText() {
        return this.previewText;
    },
    getDate() {
        return this.date;
    },
    setId(id) {
        this._validateSingleField('id', id);
        this.id = id;
        return this;
    },
    getId() {
        return this.id;
    }
}

NoteList.parsePreviewText = function(html) {
    debugger;
    html = replaceSpace(html, ' ').trim();
    pureText = filterPureTextFromHTML(html);
    let title = pureText.substr(0, TITLE_LENGTH),
        previewText = pureText.substr(TITLE_LENGTH, PREVIEW_LENGTH);
    let matchedTag = ['<p>', '<h1>', '<h2>', '<h3>', '<h4>'].find(t => html.startsWith(t));
    if (matchedTag) {
        matchedTag = matchedTag.replace('<', '').replace('>', '');
        let pattern= `<${matchedTag}>(.*)</${matchedTag}>`;
        let reg = new RegExp(pattern);
        var res = reg.exec(html);
        if (res && res[1]) {
            title = filterPureTextFromHTML(res[1]);
            debugger;
            previewText = filterPureTextFromHTML(html.substr(res[0].length))
                .substr(0,PREVIEW_LENGTH)
                .trim();
        }
    }
    return {
        title, previewText
    }
}

module.exports = NoteList;