//核心：reducer:处理数据，返回数据
//combineReduce，多业务reducer合并成一个reducer
//subscribe, subscribe: 订阅者，发布者模式
//applyMiddleware是异步

function combineReduce(reducerMap) {
    return function(state = {}, action) {
        let finaleState = {};
        for (let name in reducerMap) {
            finaleState[name] = reducerMap[name].call(null, state[name], action);
        }
        return finaleState;
    }
}

function createStore(reducer, defaultState) {
    let state = defaultState,
        listeners = [],
        subscribe = (callback) => {
            listeners.push(callback);
        },
        dispatch = (action) => {
            state = reducer.call(null, state, action);
            //通知订阅者
            listeners.forEach(l => l.call(null, action));
        },
        getState = () => state;

    return {
        subscribe, dispatch, getState
    }
}

export { combineReduce }
export default createStore;