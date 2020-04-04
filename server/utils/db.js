const path = require('path');
const fileUtil = require('./file-util');
let { isPlainObj, isObj, isFunc, callFunc, isUndefined, isNone } = require('./index');
const NoteFolderModel = require('../db/model/note-folder');
const NoteListModel = require('../db/model/note-list');

const dbRootPath = path.resolve(__dirname, '../db/tabel');
const SELECT_ALL = Symbol();

function DB(tabelName, model) {
    this.path = path.resolve(dbRootPath, tabelName + '.json');
    this._cachedTabel = null;
    this._model = model;
    this.reOpen();
}

function objContains(obj1, obj2) {
    if (isObj(obj1) && isObj(obj2)) {
        let match = true;
        for (let propName in obj2) {
            if (!hasOwnProperty.call(obj1, propName) || obj1[propName] !== obj2[propName]) {
                match = false;
            }
        }
        return match;
    }
    return false;
}

DB.prototype = {
    async reOpen() {
        if (this.path) {
            try {
                let data = await fileUtil.open(this.path);
                this._cachedTabel = JSON.parse(data);
                return true;
            } catch (reason) {
                this._cachedTabel = [];
                console.log(reason); return false;
            }
        } else {
            throw new Error('Invalid tabel name!');
        }
    },
    _matches(param, target) {
        return (param === SELECT_ALL) ||(!isPlainObj(param)? (target.id === param) : (objContains(target, param)))
    },
    _iterate(cb) {
        if (this._cachedTabel) {
            let idx = 0,
                length = this._cachedTabel.length;
            for (; idx < length; idx++) {
                let row = this._cachedTabel[idx];
                if (callFunc(cb, row, idx) === false) {
                    break;
                }
            }
        }
    },
    _queryDepth(param, depth = 0, cb) {
        let result = null,
            length = Math.min(depth, this._cachedTabel.length),
            matchCount = 0;

        this._iterate(row => {
            if (matchCount > length) return false;
            isNone(result) && (result = []);
            if (this._matches(param, row)) {
                matchCount ++;
                row = !isNone(this._model)? new this._model(row): Object.assign({}, row);
                result.push(row);
                callFunc(cb, row)
            }
        });
        return result;
    },
    query(param = '', cb) {
        if (isFunc(param)) {
            cb = param; param = '';
        }
        return (this._queryDepth(param, 1, cb) || [])[0];
    },
    queryAll(param, cb) {
        if (isUndefined(param) && isUndefined(cb)) {
            return this._cachedTabel;
        }
        if (isFunc(param)) {
            cb = param; param = SELECT_ALL;
        }
        return this._queryDepth(param, Infinity, cb);
    },
    count(param) {
        return (this.queryAll(param) || []).length;
    },
    delete(param, cb) {
        let deleted = [];
        if (this._cachedTabel) {
            let idx = this._cachedTabel.length - 1;
            for (; idx > -1; idx--) {
                let row = this._cachedTabel[idx];
                if (this._matches(param, row)) {
                    row = !isNone(this._model)? new this._model(row): row;
                    callFunc(cb,row);
                    deleted.push(row);
                    this._cachedTabel.splice(idx, 1);
                }
            }
        }
        return deleted;
    },
    update(param, newValue) {
        let count = [];
        this._iterate(row => {
            debugger;
            let valid = false;
            if(!isPlainObj(param) && row.id === param) {
                valid = true;
            } else if (param instanceof this._model && param.id === row.id) {
                valid = true;
                newValue = param;
            } else if (isPlainObj(param)) {
                valid = true;
            }
            if (valid) {
                Object.assign(row, newValue);
                count.push(row);
            }
        });
        return count;
    },
    commit() {
        return fileUtil.saveText(this.path, JSON.stringify(this._cachedTabel));
    },
    insert(model) {
        if (!(model instanceof this._model)) {
            throw new Error('Invalid data format!');
        }
        let data = model.toTable();
        this._cachedTabel.push(data);
        return this._cachedTabel.length;
    }
}

let noteFolder = new DB('folder', NoteFolderModel);
let noteList = new DB('list', NoteListModel);
let noteText = {
    path: path.resolve(__dirname, '../db/row-data'),
    getText(id) {
        return fileUtil.open(path.resolve(this.path, id));
    },
    saveText(id, content) {
        return fileUtil.saveText(path.resolve(this.path, id), content);
    },
    deleteText(id) {
        return fileUtil.delete(path.resolve(this.path, id));
    }
}

let preferenceUtil = {
    path: path.resolve(__dirname, '../db/preference.json'),
    data: null,
    get(key) {
        return this.data[key];
    },
    has(key) {
        return this.data.hasOwnProperty(key);
    },
    replace(key, newVal) {
        this.data[key] = newVal;
        return this;
    },
    add(key, value) {
        let oldData = this.data[key];
        if (isObj(oldData) && isObj(value)) {
            this.data[key] = Object.assign(oldData, value);
        } else {
            this.data[key] = value;
        }
        return this;
    },
    save() {
        return fileUtil.saveText(this.path, JSON.stringify(this.data));
    }
};

fileUtil.open(preferenceUtil.path).then(data => {
    try {
        preferenceUtil.data = JSON.parse(data);
    } catch(err) {
        preferenceUtil.data = {};
    }
}).catch(err => {
    preferenceUtil.data = {};
});

module.exports = {
    noteFolder, noteList, noteText, preference: preferenceUtil
}