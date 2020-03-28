let { isPlainObj, callFunc, isNone } = require('./index');

function FieldValidator(validatorObj) {
    if (!isPlainObj(validatorObj)) {
        throw new Error('Invalid validator');
    }
    Object.defineProperty( this, "validatorObj", {
        get() { return validatorObj },
        set() { throw new Error('The ValidatorObj is read only!') }
    });
}

FieldValidator.prototype = {
    validate(params) {
        if (!isPlainObj(params)) {
            throw new Error('Invalid arguments');
        }
        for (let fieldName in params) {
            if (!this.validatorObj.hasOwnProperty(fieldName)) {
                throw new Error(`The field '${fieldName}' is not expected!`);
            }
            let validator = this.validatorObj[fieldName],
                fieldVal = params[fieldName];
            callFunc(validator, fieldVal);
        }
    },
    getValidator(name) {
        let validator = this.validatorObj[name];
        if (!isNone(validator)) {
            return {
                validate(val) {
                    return callFunc(validator, val);
                }
            }
        }
        return null;
    }
}

module.exports = FieldValidator;