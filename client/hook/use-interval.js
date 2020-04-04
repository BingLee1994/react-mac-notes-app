import { useState, useEffect } from 'react';
import { callFunc } from '../utils';

export default function useInterval(interval, cb, initialState) {
    let _initialState = {
        data: initialState,
        id: Date.now()
    };
    let [_state, setState] = useState(_initialState);
    let cancel = false;
    let stopUpdate = () => { cancel = true };
    useEffect(() => {
        let timer = setTimeout(() => {
            let newData = callFunc(cb, _state.data, stopUpdate);
            let newState = { ..._state };
            newState.data = newData;
            if (!cancel) {
                setState(newState);
            }
        }, interval);
        let cancelTimer = () => clearInterval(timer);
        return cancelTimer;
    });
    return _state.data;
}