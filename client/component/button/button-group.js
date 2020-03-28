import React, { useEffect, useRef } from 'react';
import Button from '.';

export default React.memo(function(props) {
    let validChildren = (props.children || []).filter(each => each.type === Button);
    let button = useRef();

    useEffect(() => {
        button.style.overflow = 'hidden';
    });

    return (
        <div
            className='mc-button-group'
            ref={ref => button = ref}
            style={{
                boxSizing: 'content-box',
                whiteSpace: 'nowrap'
            }}
        >
            {validChildren}
        </div>
    )
})