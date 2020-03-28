import React from 'react';

export default React.memo(props => (
    <div
        className="divider"
        style={{width: props.width, flexGrow: props.weight}}
    >
    </div>
))