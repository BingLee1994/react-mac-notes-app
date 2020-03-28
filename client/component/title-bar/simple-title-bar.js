
import React, { useRef, useEffect } from 'react';
import WindowActionButton from './window-action-button';
import { callFunc } from '../../utils';

export default React.memo(props => {
    let actionWrapper = useRef();
    let toolBarWrapper = useRef();

    useEffect(() => {
        toolBarWrapper.style.paddingRight = actionWrapper.offsetWidth;
    });

    return(
        <div className="mc-title-bar mc-title-bar_simple" ref={el => {
            toolBarWrapper = el;
            callFunc(props.onRef, el);
        }}>
            <WindowActionButton
                onClose={
                    e => callFunc(props.onClose, e)
                }
                onRef={el => actionWrapper=el}
            />
            {props.title && <p className="title">{props.title}</p>}
        </div>
    )
})