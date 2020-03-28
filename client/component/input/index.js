import React from 'react';
import { callFunc } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

export default props => {
    return (
        <div
            className={AppClassNames.inputBox.wrapper}
            style={{width:props.width}}
        >
            <input
                className={AppClassNames.inputBox.input}
                type={props.type || 'text'}
                value={props.value}
                disabled={props.disabled}
                readOnly={props.readonly}
                onChange={e => callFunc(props.onChange, e)}
                onFocus={e => callFunc(props.onFocus, e)}
                onInput={e => callFunc(props.onInput, e)}
                onBlur={e=> callFunc(props.onBlur, e)}
                placeholder={props.placeholder}
            />
        </div>
    )
}