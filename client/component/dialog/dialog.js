import React, { useEffect, useRef } from 'react';
import DialogButton from '../button/dialog-button';
import { callFunc } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

const TRANSITION_DURATION = .3;

export default props => {
    let elDialogBody = useRef();
    useEffect(() => {
        setTimeout(() => {
            elDialogBody.classList.add(AppClassNames.dialog.show);
        });
    });

    let closeConfirm = (isPositive, _, data) => {
        elDialogBody.classList.remove(AppClassNames.dialog.show);
        let callback = isPositive? props.onConfirm: props.onCancel;
        callFunc(callback, data);
        setTimeout(() => {
            callFunc(props.onCloseComplete);
        }, TRANSITION_DURATION*1000);
    };

    let onClickButton = isPositive => (e, data) => {
        closeConfirm(isPositive, e, data);
    };

    callFunc(props.__forceCloce__, closeConfirm);

    return (
        <div className={`${AppClassNames.dialog.wrapper} ${props.className?props.className: ''}`}>
            <div className="mask-layer"></div>
            <div className="dialog">
                <div className="dialog-body"
                    ref={el => elDialogBody=el}
                    style={{transitionDuration: TRANSITION_DURATION+'s'}}
                >
                    {/*if*/ (props.icon || props.iconClass) &&
                        <div className={`icon ${props.iconClass||''}`}>
                            {props.icon}
                        </div>
                    }
                    <div className="content-wrapper">
                        {props.children}
                        <div className="dialog-button-wrapper">
                            {/*if*/ props.negativeButton &&
                                <DialogButton
                                    data={props.negativeButton}
                                    onClick={onClickButton()}
                                    disabled={props.negativeButton.disabled}
                                >
                                    {props.negativeButton.text || props.negativeButton}
                                </DialogButton>
                            }
                            {/*if*/ props.positiveButton &&
                                <DialogButton
                                    positive
                                    data={props.positiveButton}
                                    onClick={onClickButton(true)}
                                    disabled={props.positiveButton.disabled}
                                >
                                    {props.positiveButton.text || props.positiveButton}
                                </DialogButton>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}