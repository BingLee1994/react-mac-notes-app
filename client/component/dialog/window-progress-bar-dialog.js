
import React from 'react';
import Dialog from './dialog';
import { callFunc, isNumber } from '../../utils';
import useInterval  from '../../hook/use-interval';
import ProgressBar from '../progress/progress-bar';

export default props => {
    let progress = parseFloat(props.progress || 0),
        updater= props.updater,
        interval= (isNumber(props.interval) && props.interval > 0)? props.interval: 1000/60,
        maxValue = props.maxValue || 1;

    let stopTimer = null;
    let progressState = progress;

    let closeDialog = (isPositive, event, state = progressState) => {
        callFunc(stopTimer);
        if (isPositive) {
            callFunc(forceClose, true, event, state);
        } else {
            callFunc(forceClose, false, progressState, event);
        }
    }

    progressState = useInterval(interval, (state, stop) => {
        stopTimer = stop;
        if (state >= maxValue) {
            closeDialog(true, null, state);
        }
        let newState = callFunc(updater, state);
        if (newState === false) {
            console.log('should force close');
            return closeDialog(false, null, state);
        }
        return newState;
    }, progress);

    let forceClose = null;

    return (
        <Dialog
            {...props}
            onCancel={e => callFunc(props.onCancel, progressState, event)}
            __forceCloce__={closeDialog => forceClose = closeDialog}
        >
            <div className="message">
                <p className="message-title bold">{props.title}</p>
                <ProgressBar
                    style={{marginTop: 10}}
                    progress={progressState}/>
            </div>
        </Dialog>
    )
}