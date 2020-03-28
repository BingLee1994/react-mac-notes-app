import React from 'react';
import { callFunc } from '../../utils';

export default React.memo(function(props) {
    let { className, disabled, children, widen, tinted, onClick, name, title, data, active, selected } = props;
    let validClassName = ['mc-button'];
    className && validClassName.push(props.className);
    disabled && validClassName.push('mc-button_disabled');
    active && validClassName.push('mc-button_active');
    selected && validClassName.push('mc-button_selected');
    widen && validClassName.push('mc-button_widen');
    tinted && validClassName.push('mc-button_tinted');

    var onClickButton = e => {
        !disabled && callFunc(onClick, e, data);
    }

    var sendRef = ref => {
        callFunc(props.onRef, ref);
    }

    return (
        <button 
            className={validClassName.join(' ')}
            onClick={onClickButton}
            ref={sendRef}
            name={name}
            title={title}
        >
            {children}
        </button>
    )
})