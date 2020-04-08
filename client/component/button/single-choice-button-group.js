import React, { useEffect, useRef, useState } from 'react';
import Button from '.';
import { callFunc } from '../../utils';

export default React.memo(function(props) {
    let validChildren = [];
    let wrapper = useRef();
    let [selected, setSelected] = useState(props.selected || 0);

    function onSelect(e, data, index) {
        if (index === selected) return
        setSelected(index);
        callFunc(props.onChange, e, data, index);
    }

    (props.children || []).forEach((child, index) => {
        if (child.type === Button) {
            let newProps = { ...child.props };
            Object.assign(
                newProps,
                {
                    selected: index === selected,
                    onClick(e, data) {
                        onSelect(e, data, index);
                    },
                    key: index
                }
            );
            validChildren.push(React.createElement(child.type, newProps));
        }
    });

    useEffect(() => {
        wrapper.style.overflow = 'hidden';
    });

    return (
        <div
            className='mc-button-group'
            ref={e => wrapper = e}
            style={{
                boxSizing: 'content-box',
                whiteSpace: 'nowrap'
            }}
        >
            {validChildren}
        </div>
    )
})