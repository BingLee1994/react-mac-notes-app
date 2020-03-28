import React from 'react';
import Dialog from './dialog';

export default props => (
    <Dialog
        onConfirm={props.onConfirm}
        onCancel={props.onCancel}
        negativeButton={props.negativeButton}
        positiveButton={props.positiveButton}
        icon={props.icon}
        iconClass={props.iconClass}
    >
        <div className="message">
            <p className="message-title bold">{props.messageTitle}</p>
            <p className="message-content">{props.messageContent}</p>
        </div>
    </Dialog>
)
