import React from 'react';
import { callFunc } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

export default props => {
    let { menuItem } = props;
    let {
        listItemClass, 
        menuItemWithSubMenuClass,
        lisItemDisabledClass,
        lisItemWithIconClass,
        lisItemIconClass,
        listDividerClass
    } = AppClassNames.floatingMenu;

    let {text, hasSubMenu, iconClass, disabled, hasIcon, divider} = menuItem;

    let className = [disabled? lisItemDisabledClass: listItemClass];

    hasSubMenu && className.push(menuItemWithSubMenuClass);
    hasIcon && className.push(lisItemWithIconClass);

    let sendEvent = (e, eventName, ...data) => {
        e.nativeEvent.stopImmediatePropagation();
        callFunc(props[eventName], e, ...data);
    }
    let el = (
        <li onClick={ e => sendEvent(e, 'onClick', menuItem) }
            onMouseDown={ e => sendEvent(e) }
            onMouseEnter={ e => sendEvent(e, 'onHover', menuItem) }
            onMouseLeave={ e => sendEvent(e, 'onLeave', menuItem) }
            className={className.join(' ')}
        >
            {hasIcon && <span className={`${lisItemIconClass} ${iconClass}`}></span>}
            {text}
        </li>
    );

    if (divider) {
        el = <div className={listDividerClass}></div>
    };
    return el;
};