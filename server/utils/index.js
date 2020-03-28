const EMPTY_FUNC = function() {};
const nanoid = require('nanoid');

function isType(val, type) {
  return typeof val === type;
}

function isFunc(val) {
  return isType(val, "function");
}

function mapObj(obj, cb) {
  if (isPlainObject(obj)) {
    for (let name in obj) {
      let val = obj[name];
      obj[name] = callFunc(cb, val, name);
    }
  }
  return obj;
}

function replaceSpace(str, replaceStr='') {
  return str.replace(/[\r\n]/g, replaceStr).replace(/\ +/g, replaceStr);
}

function filterPureTextFromHTML(html, shouldTrim) {
  let result = html.replace(/<[^>]*>|/g,"");
  result = shouldTrim? replaceSpace(result, ' '): result
  return result;
}

module.exports = {
  replaceSpace,
  filterPureTextFromHTML,
  isType,
  isFunc,
  mapObj,

  isObj(val) {
    return val && typeof val === "object";
  },

  isString(val) {
    return isType(val, "string");
  },

  isNumber(val) {
     return !isNaN(val) && isType(val, "number");
  },

  isUndefined(val) {
    return val === void 0;
 },

  isArray(val) {
    return val instanceof Array;
  },

  isPlainObj(obj) {
    if (typeof obj !== "object" || obj === null || obj === void 0) return false;

    let proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
  },

  callFunc(func, ...args) {
    func = isFunc(func) ? func : EMPTY_FUNC;
    return func.apply(null, args);
  },

  isNone(val) {
    return val === void 0 || val === null;
  },

  uuid(length) {
    return nanoid(length);
  },

  pureObj() {
      return Object.create(null);
  }
};