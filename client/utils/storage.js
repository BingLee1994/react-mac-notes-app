export default {
    get(key, defaultVal) {
        let val = localStorage.getItem(key);
        val = val === null? defaultVal: val;
        return JSON.parse(val);
    },
    set(key, val) {
        localStorage.setItem(key, val);
    }
}