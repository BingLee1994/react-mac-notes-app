import React from 'react';
import { callFunc } from '../../utils';

export default React.memo(props => (
    <div
        className="mc-window-action-button-wrapper"
        ref={e => callFunc(props.onRef, e)}
    >
        <a className="mc-window-action-button mc-window-action-button_close"
            onClick={e => {
                callFunc(props.onClose, e);
            }}
        ></a>
    </div>
))