import nanoid from 'nanoid';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppClassNames } from './app-ui-prop';

export function uuid(size=5) {
    return nanoid(size);
}

const EMPTY_FUNC = function() {}

function isType(val, type) {
    return typeof val === type;
}

export function isObject(val) {
    return val && typeof val === 'object';
}

export function isString(val) {
    return isType(val, 'string');
}

function isFunc(val) {
    return isType(val, 'function');
}

export { isFunc }

export function isArray(val) {
    return val instanceof Array;
}

export function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null || obj === void 0) return false

    let proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
}

function callFunc(func, ...args) {
    func = isFunc(func)? func: EMPTY_FUNC;
    return func.apply(null, args);
}

export { callFunc }

export function enableSimpleDrag(el, onStart, onDrag, onCancel) {
    let element = el;
    let canDrag = false;
    let startX = null, startY = null;
    let init = e => {
        let { target } = e;
        if (target === element || (element.contains && element.contains(target))) {
            canDrag = true; startX=e.pageX; startY = e.pageY;
        } else {
            canDrag = false;
        }
        callFunc(onStart, e);
    };

    let enable = (e) => {
        if (canDrag) {
            console.log('can');
            let curX = e.pageX, curY = e.pageY;
            let deltaX = curX - startX, deltaY = curY - startY;
            callFunc(onDrag, deltaX, deltaY, e);
        }
    }

    let cancel = e => {
        if (canDrag) {
            canDrag = false;
            callFunc(onCancel, e);
        }
    };

    let removeListener = () => {
        document.removeEventListener('mouseup', init);
        document.removeEventListener('mousedown', cancel);
        document.removeEventListener('mousemove', enable);
    };

    document.addEventListener('mousedown', init);
    document.addEventListener('mouseup', cancel);
    document.addEventListener('mousemove', enable);

    return removeListener;
}

export function replaceClass(el, classA, classB) {
    if (el && classA && classB) {
        let { classList } = el
        if (classList.contains(classB)) {
            classList.remove(classB);
            classList.add(classA);
        }
    }
}

export function isNone(val) {
    return val === void 0 || val === null;
}

export function isNumber(val) {
    return !isNaN(val) && isType(val, 'number');
}

export function mapObj(obj, cb) {
    if (isPlainObject(obj)) {
        for (let name in obj) {
            let val = obj[name];
            obj[name] = callFunc(cb, val, name);
        }
    }
    return obj;
}

//日期格式化
export function formatYMDHM(val) {
    let date = new Date(val);
    let minutes = date.getMinutes(), hour = date.getHours();
    minutes = minutes< 10? '0'+minutes: minutes;
    hour = hour< 10? '0'+hour: hour;
    return `${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日 ${hour}:${minutes}`
}

export function formatYMD(val, divider='/') {
    let date = new Date(val);
    return [date.getFullYear(), date.getMonth(), date.getDate()].join(divider)
}

export function classNames(comName) {
    let classNames = AppClassNames[comName];
    if (comName !== 'common') {
        classNames['common'] = AppClassNames['common']
    }
    return Component => class WrappedComponent extends React.Component {
        render() {
            return <Component {...this.props} classNames={classNames}/>
        }
    }
}

export function addOnBlurListener(eventName, mapFlagToProp = 'componentIsBlur', defaultVal = true) {
    return function(Component) {
        class WrappedComponent extends React.Component {
            constructor(props) {
                super(props);
                this.el = null;
                this.state = {
                    isBlur: defaultVal
                };
            }

            isEventInSelf = e => {
                let { isBlur } = this.state;
                let { el } = this,
                    newFlag = !el.contains(e.target);
                (isBlur !== newFlag) && this.setState({ isBlur: newFlag });
            };

            componentWillUnMount() {
                document.removeEventListener(eventName, this.isEventInSelf);
            }
            componentDidMount() {
                this.el = ReactDOM.findDOMNode(this.refs.self);
                document.addEventListener(eventName, this.isEventInSelf);
            }
            render() {
                let { isBlur } = this.state;
                let composedProp = Object.assign(
                    {
                        [mapFlagToProp]: isBlur,
                        ref: "self"
                    },
                    this.props
                );
                return React.createElement(Component, composedProp);
            }
        }
        return WrappedComponent;
    }
}

export function mapDisplayName(obj, prefix = '') {
    let result = {};
    for (let propName in obj) {
        result[propName] = prefix + '.' + propName + '-' + obj[propName];
    }
    return result;
}

//格式化用
export function _if(exp, returnVal) {
    if(exp) return returnVal;
}

export function pipe(...cb) {
    let validCb = cb.filter(_ => isFunc(_));
    if (validCb.length === 0) return EMPTY_FUNC;
    return function(initialData) {
        let start = 0,
            length = validCb.length;
        let next = function() {
            if (start < length) {
                let currentPosition = start;
                start = start+1;
                validCb[currentPosition].call(null, initialData, next);
            }
        }
        next();
    }
}

function debounce(cb, interval) {
    if (isFunc(cb) && isNumber(interval)) {
        let timer = null;
        return function(...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                callFunc(cb, ...args);
            }, interval);
        }
    }
    return cb;
}

export { debounce }

function throttle(cb, interval) {
    if (isFunc(cb) && isNumber(interval)) {
        let last = Date.now();
        return function(...args) {
            let now = Date.now();
            if ((now - last) >= interval) {
                last = now;
                callFunc(cb, ...args);
            }
        }
    }
    return cb;
}

export { throttle }

export function filterPureTextFromHTML(html, shouldTrim) {
    let result = html.replace(/<[^>]*>|/g,"");
    result = shouldTrim? result.replace(/[\r\n]/g, ' ').replace(/\ +/g, ' ') : result
    return result;
}

export function getTranslate(el) {
    let result = { x:0, y:0 };
    if (el && el.nodeType === 1) {
        let transform = getComputedStyle(el).transform;
        transform = transform.split(',');
        result.x = parseInt(transform[transform.length - 2]);
        result.y = parseInt(transform[transform.length - 1]);
    }
    return result;
}

export function remodeItemAtIdx(arrayLike, cb) {
    let i = 0, length = arrayLike.length;
    for (; i < length; i++) {
        let shouldRemove = false;
        if (isFunc(cb)) {
            if(cb(arrayLike[i], i)) {
                shouldRemove = true;
            }
        } else if (arrayLike[i] === cb) {
            shouldRemove = true;
        }
        shouldRemove && [].splice.call(arrayLike, i, 1); 
    }
}