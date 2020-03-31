import React from 'react';
import Dialog from './dialog';

export default props => (
    <Dialog
        {...props}
    >
        <div className="message">
            <p className="message-title bold">{props.messageTitle}</p>
            <p className="message-content">{props.messageContent}</p>
        </div>
    </Dialog>
)
