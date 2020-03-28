import React from 'react';
import Button from './index';

export default React.memo(function(props) {
    let tinted = props.positive? true: false;
    let newProp = {...props};
    let classNames = ['dialog-button'];
    props.positive && classNames.push('positive-button');
    props.className && classNames.push(props.className);
    Object.assign(
        newProp,
        {
            className: classNames.join(' '),
            tinted,
            widen:true
        }
    );
    delete newProp.positive;
    return (
        <Button
            {...newProp}
        >
        </Button>
    )
})