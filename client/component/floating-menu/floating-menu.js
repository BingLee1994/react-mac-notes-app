import React from 'react';
import DefaultOption from './default-option';
import ReactDOM from 'react-dom';
import ListItem from './list-item';
import { callFunc, isFunc, isArray, uuid } from '../../utils';
import { AppClassNames } from '../../utils/app-ui-prop';

const FloatingMenuClassNames = AppClassNames.floatingMenu;

function isNone(val) {
    return val === null || val === void 0;
}

const debounce = 100;

export default class FloatingMenu extends React.Component {
    constructor(props) {
        super(props);
        this.isOpen = false;
        this.isAnimationPlaying = false;
        this.subMenus = null;
        this.subMenuMounted = false;
        this.mountedSubMenuId = null;
        this.elOpenedItem = null;
        this.animationTimer = null;
    }

    onAnimationEnd = () => {
        this.isAnimationPlaying = false;
        let { fltMenuWrapper } = this.refs;
        let isOpen = this.isOpen;
        fltMenuWrapper && (fltMenuWrapper.style.transitionProperty = 'none');
        isOpen && this.unmountSubMenu();
        this.props.animated && isOpen && callFunc(this.props.onOpenComplete);
        this.props.animated && !isOpen && callFunc(this.props.onCloseComplete);
    }

    renderSubMenu = (subMenuData, position) => {
        let subMenu = (
            <ul
                className="mac-floating-menu"
                style={{
                    left: position.x,
                    top: position.y
                }}
            >{
                subMenuData.map(itemData => {
                    if (isNone(itemData)) {
                        return null;
                    }
                    let subMenuItem = this.convertMenuData(itemData, true);
                    return <ListItem
                        onClick={this.onClickItem}
                        menuItem={subMenuItem}
                        key={subMenuItem.id}
                        onHover={this.onHoverItem}
                        onLeave={this.onLeaveItem}
                    />
                })
            }</ul>
        );
        ReactDOM.render(subMenu, this.refs.subMenuWrapper);
        this.subMenuMounted = true;
    }

    unmountSubMenu() {
        if (this.subMenuMounted) {
            ReactDOM.unmountComponentAtNode(this.refs.subMenuWrapper);
            this.subMenuMounted = false;
            this.mountedSubMenuId = null;
            this.elOpenedItem = null;
        }
    }

    onClickItem = (_, clickedMenuItem) => {
        if (!clickedMenuItem.disabled &&
            !clickedMenuItem.divider &&
            !clickedMenuItem.hasSubMenu) {
            callFunc(this.props.onSelectItem, clickedMenuItem.originData);
        }
    }

    onHoverItem = (e, selectedMenuItem) => {
        let { id, isSubmenuItem, hasSubMenu } = selectedMenuItem;
        if (isSubmenuItem) return;
        this.elOpenedItem && this.elOpenedItem.classList.remove(FloatingMenuClassNames.listItemHoverClass);
        this.elOpenedItem = null;
        this.mountedSubMenuId !== id && this.unmountSubMenu();

        if (hasSubMenu) {
            let selectedSubMenu = this.subMenus[id];
            if (isFunc(selectedSubMenu)) {
                selectedSubMenu = selectedSubMenu();
            }
            let elOpenedItem = e.currentTarget;
            if (isArray(selectedSubMenu) && selectedSubMenu.length > 0) {
                let itemBounding = elOpenedItem.getBoundingClientRect();
                let position = {
                    x: itemBounding.x + itemBounding.width,
                    y: itemBounding.y + itemBounding.height / 2
                };
                this.renderSubMenu(selectedSubMenu, position);
                this.mountedSubMenuId = id;
                this.elOpenedItem = elOpenedItem;
                elOpenedItem.classList.add(FloatingMenuClassNames.listItemHoverClass);
            }
        }
    }

    onLeaveItem = (e, menuItem) => {
        if (!menuItem.isSubmenuItem &&
            menuItem.hasSubMenu &&
            this.mountedSubMenuId !== menuItem.id) {
            e.currentTarget.classList.remove(FloatingMenuClassNames.listItemHoverClass);
        }
    }

    convertMenuData(originData, isSubmenuItem = false) {
        let divider = originData.divider || false,
            text = divider? '': (originData.text || String(originData)),
            id = uuid(),
            hasSubMenu = false,
            iconClass = isNone(originData.iconClass)? '': String(originData.iconClass),
            disabled = originData.disabled || false,
            hasIcon = iconClass !== '';

        if (isArray(originData.subMenuItems) && originData.subMenuItems.length > 0 ||
            isFunc(originData.subMenuItems)
        ) {
            hasSubMenu = true;
        }

        return {
            text, id, hasSubMenu, iconClass, disabled, hasIcon, divider, isSubmenuItem, originData
        }
    }

    getMenuItemsAndSubMenus(menuData) {
        let mainMenuItems = [], subMenus = Object.create(null);
        if (isFunc(menuData)) {
            menuData = menuData();
        }
        menuData.forEach(data => {
            if (isNone(data)) {
                return;
            }
            let mainMenuItem = this.convertMenuData(data);
            mainMenuItems.push(mainMenuItem);
            if (mainMenuItem.hasSubMenu || data.subMenuItems) {
                subMenus[mainMenuItem.id] = data.subMenuItems;
            }
        })
        return { mainMenuItems, subMenus };
    }

    toggleMenu() {
        this.isAnimationPlaying = false;
        let { animated } = this.props;
        let { fltMenuWrapper } = this.refs;

        if (!fltMenuWrapper) return;
        fltMenuWrapper.style.transitionProperty = animated? FloatingMenuClassNames.transitionProprty: 'none';

        let update = () => {
            fltMenuWrapper.style.visibility = this.props.open? 'visible': 'hidden';
            fltMenuWrapper.style.opacity = this.props.open? 1: 0;
            this.isOpen = this.props.open;
        }

        if (animated) {
            requestAnimationFrame(() => {
                update();
                this.isAnimationPlaying = true;
                this.animationTimer = setTimeout(this.onAnimationEnd, DefaultOption.animationDuration * 1000);
            });
            return;
        }
        update();
        if (this.subMenuMounted) {
            this.unmountSubMenu();
        }
    }

    componentDidMount() {
        this.isOpen = this.props.open;
        this.lastUpdate = Number(new Date());
        this.toggleMenu();
    }

    /*shouldComponentUpdate() {
        let { lastUpdate } = this;
        let currentTime = Number(new Date());
        this.lastUpdate = currentTime;
        return (currentTime - lastUpdate) >= debounce;
    }*/

    componentDidUpdate() {
        this.toggleMenu();
    }

    componentWillUnmount() {
        clearTimeout(this.animationTimer);
    }

    render() {
        let { isOpen, props: { menuItems: menuItemsData, open: willOpen, animated } } = this;
        if (!menuItemsData || !menuItemsData.length) {
            return '';
        }
        let shouldDisplay = (!isOpen && willOpen) || (isOpen && !willOpen && animated);
        let { mainMenuItems, subMenus } = this.getMenuItemsAndSubMenus(menuItemsData);
        this.subMenus = subMenus;
        let position = this.props.position || {};
        return (
            <div
                ref="fltMenuWrapper"
                style= {{
                    visibility: shouldDisplay? 'visible': 'hidden',
                    transitionProperty: 'none',
                    opacity: 0,
                    transitionDuration: DefaultOption.animationDuration + 's',
                    transitionTimingFunction: 'ease'
                }}
            >
                <ul
                    ref="fltMenu"
                    className="mac-floating-menu"
                    style={{
                        left: position.x,
                        top: position.y
                    }}
                >{
                    mainMenuItems.map(data => (
                        <ListItem
                            onClick={this.onClickItem}
                            menuItem={data}
                            key={data.id}
                            onHover={this.onHoverItem}
                            onLeave={this.onLeaveItem}
                        />
                    ))
                }</ul>
                <div ref="subMenuWrapper">
                </div>
            </div>
        )
    }
}