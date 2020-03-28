import React from 'react';
import FloatingMenu from '../floating-menu/floating-menu';
import PropTypes from 'prop-types';
import DefaultOption from '../floating-menu/default-option';
import { callFunc } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

const MOUSE_RIGHT_BUTTON = 2;

export default class ContextMenuTrigger extends React.Component {
    static propTypes = {
        tagName: PropTypes.string,
        className: PropTypes.string,
        style: PropTypes.object,
        menuItems: PropTypes.array,
        onWillOpenMenu: PropTypes.func,
        onSelectMenuItem: PropTypes.func,
        onMenuClosed: PropTypes.func
    };

    static defaultProps = {
        tagName: 'div',
        className: '',
        menuItems: [],
    };

    constructor(props) {
        super(props);
        this.listener = null;
        this.state = {
            open: false,
            position: {x: 0, y: 0},
            animated: false
        };
        this.elMenu = null
    }

    onSelectMenuItem = (item) => {
        this.closeMenu();
        callFunc(this.props.onSelectMenuItem, item);
    };

    onContextMenu = e => {
        e.preventDefault();
        let next = (event) => {
            event.stopPropagation();
            let {clientX: x, clientY: y} = event;
            this.openMenu({x, y});
            e.stopPropagation();
        }
        let cancel = callFunc(this.props.onWillOpenMenu, e, next) === false;
        if (cancel) return;
        next(e);
    };

    onMenuClosed = _ => {
        this.state.open = false;
        this.state.animated = false;
    }

    componentDidMount() {
        this.bindDocumentClickListener();
    }

    bindDocumentClickListener() {
        this.listener = (e) => {
            if (!this.state.open) {
                return;
            }
            if (
                e.button !== MOUSE_RIGHT_BUTTON ||
                (this.elMenu && !this.elMenu.contains(e.target))) {
                this.closeMenu();
            }
        }
        document.addEventListener('mousedown', this.listener);
    }

    openMenu(position, animated = false) {
        this.setState({
            position,
            open: true,
            animated
        })
    }

    closeMenu = (animated=true) => {
        if (this.state.open) {
            this.setState({open: false, animated});
        }
    };

    _validateStyle() {
        let { className, style } = this.props;
        let wrapperClassName = AppClassNames.floatingMenu.wrapperClassName;

        style = Object.assign({}, style, DefaultOption.wrapperStyle);
        className = className.includes(wrapperClassName)?
            className:
            [className, wrapperClassName].join(' ').trim();

        return { className, style };
    }

    render() {
        let { tagName, children, menuItems } = this.props;
        let { className, style } = this._validateStyle();

        let attrs = {
            className,
            style,
            onContextMenu: this.onContextMenu,
            ref: e => this.elMenu = e
        };

        return React.createElement(
            tagName,
            attrs,
            children,
            <FloatingMenu
                name={this.props.name}
                onSelectItem={this.onSelectMenuItem}
                open={this.state.open}
                position={this.state.position}
                menuItems={menuItems}
                animated={this.state.animated}
                onCloseComplete={this.onMenuClosed}
            ></FloatingMenu>
        );
    }
}