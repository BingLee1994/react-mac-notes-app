import React, { useEffect, useRef } from 'react';
import DialogButton from '../button/dialog-button';
import { callFunc } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

const TRANSITION_DURATION = .3;

export default props => {
    let elDialogBody = useRef();
    useEffect(() => {
        setTimeout(() => {
            try {
                elDialogBody.classList.add(AppClassNames.dialog.show);
            } catch (err) {
                console.log(err);
            }
        });
    });

    let closeConfirm = isPositive => (_, data) => {
        elDialogBody.classList.remove(AppClassNames.dialog.show);
        setTimeout(() => {
            let callback = isPositive? props.onConfirm: props.onCancel;
            callFunc(callback, data);
        }, TRANSITION_DURATION*1000);
    };

    return (
        <div className={`${AppClassNames.dialog.wrapper} ${props.className?props.className: ''}`}>
            <div className="mask-layer"></div>
            <div className="dialog">
                <div className="dialog-body"
                    ref={el => elDialogBody=el}
                    style={{transitionDuration: TRANSITION_DURATION+'s'}}
                >
                    {(props.icon || props.iconClass) && (
                        <div className={`icon ${props.iconClass||''}`}>
                            {props.icon}
                        </div>
                    )}
                    <div className="content-wrapper">
                        {props.children}
                        <div className="dialog-button-wrapper">
                            { props.negativeButton &&
                                <DialogButton
                                    data={props.negativeButton}
                                    onClick={closeConfirm()}
                                    disabled={props.negativeButton.disabled}
                                >
                                    {props.negativeButton.text || props.negativeButton}
                                </DialogButton>
                            }
                            { props.positiveButton &&
                                <DialogButton
                                    positive
                                    data={props.positiveButton}
                                    onClick={closeConfirm(true)}
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