
import React, { useRef } from 'react';

const MIN_WIDTH = 50;
const DEFAULT_HEIGHT = 8;
const DEFAULT_BG = 'rgba(0,0,0,.1)';
const DEFAULT_COLOR = 'blue';

export default props => {
    let height = props.height || DEFAULT_HEIGHT,
        progress = parseFloat(props.progress) || 0;
    progress = progress > 1? 1: progress;

    let style = {
        width: props.width || '100%',
        height,
        borderRadius: height/2,
        overflow: 'hidden',
        minWidth: MIN_WIDTH,
        display: props.inline? 'inline-block': 'block',
        backgroundColor: props.backgroundColor || DEFAULT_BG
    };

    return <div
        style={Object.assign({}, props.style, style)}
    >
        <div style={{
            height: '100%',
            transform: `translateX(${(progress-1)*100}%)`,
            backgroundColor: props.color || DEFAULT_COLOR
        }}></div>
    </div>
}