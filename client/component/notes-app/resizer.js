import React, {useEffect, useRef} from 'react';
import { callFunc, enableSimpleDrag as enableDrag, isNone } from '../../utils';
import AppUIProperty from '../../utils/app-ui-prop';

const resizerStyle = {
    width: 1, flex: '0 0 1px', backgroundColor: AppUIProperty.borderColorLight, overflow: 'visible', position: 'relative'
}

const controlBarWidth = 20;
const controlBarStyle = {
    width: controlBarWidth, background: 'transparent', position: 'absolute',
    left: -controlBarWidth/2, height: '100%', cursor: 'col-resize'
}

export default props => {
    let elControlBar= useRef();
    let style = resizerStyle;

    useEffect(() => {
        let preSlibing = elControlBar.parentElement.previousElementSibling;
        let initSlibingWidth = 0; 

        let disableDrag = enableDrag(
            elControlBar,
            () => {
                initSlibingWidth = preSlibing.offsetWidth;
            },
            moveDis => {
                preSlibing.style.width = (initSlibingWidth + moveDis) + 'px';
                preSlibing.style.flexBasis = 'auto';
            },
            () => {
                initSlibingWidth = preSlibing.offsetWidth;
                callFunc(props.onResized, initSlibingWidth);
            }
        );

        return () => {
            callFunc(disableDrag);
        }
    }, []);

    let { width } = props;

    if (!isNone(width)) {
        style = Object.assign(
            {}, 
            resizerStyle,
            {
                width,
                flexBasis: width
            }
        );
    }

    return (
        <div style={style}>
            <div ref={el => elControlBar=el} style={controlBarStyle}></div>
        </div>
    )
}