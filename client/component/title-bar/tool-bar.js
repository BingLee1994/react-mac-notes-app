
import React from 'react';
import WindowActionButton from './window-action-button';
import { callFunc, isNumber, isObject } from '../../utils';
import Button from '../button';
import ButtonGroup from '../button/button-group';
import OptionButton from '../button/option-button';
import SingleChoiceBtnGroup from '../button/single-choice-button-group';

function Divider(props) {
    const baseWidth = 5;
    let style = {};
    if (isNumber(props.width)) { style.width = props.width*baseWidth }
    if (props.width === 'auto') { style.flexGrow = 1; }
    return <div style={style}></div>
}

export { Divider };

let validator = [Button, SingleChoiceBtnGroup, ButtonGroup, OptionButton, Divider]

function filterChildren(children, allowTag=[]) {
    return React.Children.map(children, child => {
        if(isObject(child)) {
            if (child.type &&
                (
                    validator.some((validType) => child.type === validType) ||
                    allowTag.some((validType) => child.type === validType)
                )
            ) {
                return child
            }
            return null;
        }
    });
}

export default React.memo(props => {
    let { title } = props;
    let validClassName = [];
    validClassName.push('mc-tool-bar');
    !title && validClassName.push('mc-tool-bar_no-title');
    props.className && validClassName.push(props.className);

    return (
        <div className={validClassName.join(' ')}
        >
            <WindowActionButton onClick={ e => callFunc(props.onClick, e) }/>
            <div className="content-wrapper">
                {title && <p className="title">{title}</p>}
                <div className="action-buttons-wrapper">
                    {filterChildren(props.children, props.allowTag)}
                </div>
            </div>
        </div>
    );
})