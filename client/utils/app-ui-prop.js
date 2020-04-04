let app = document.querySelector('.app');
let appCss = getComputedStyle(app);

let propNameMap = {
    borderColor: '--border-color',
    accentColor: '--accent-color',
    primaryTextColor: '--txt-color-primary',
    secondaryTextColor: '--txt-color-secondary',
    backgroundColor: '--background-color-main',
    borderColor: '--border-color',
    borderColorLight: '--border-color-light'
}

export { propNameMap };

class AppUIProperty {
    get borderColor() {
        return appCss.getPropertyValue(propNameMap.borderColor);
    }
    set borderColor(newColor) {
        appCss.setPropertyValue(propNameMap.borderColor, newColor);;
    }
    get borderColorLight() {
        return appCss.getPropertyValue(propNameMap.borderColorLight);
    }
    set borderColorLight(newColor) {
        appCss.setPropertyValue(propNameMap.borderColorLight, newColor);
    }
    get accentColor() {
        return appCss.getPropertyValue(propNameMap.accentColor);
    }
    set accentColor(newColor) {
        appCss.setPropertyValue(propNameMap.accentColor, newColor);
    }
}

const appUIProperty = new AppUIProperty();
let AppClassNames = {
    common: {
        listItemSelected: 'list-item-selected',
        listItemFocused: 'list-item-focused',
        text: {
            trimEllipsis: 'text-trim-ellipsis',
            secondary: 'secondary-text',
            primary: 'primary-text',
            bold: 'bold'
        }
    },
    inputBox: {
        wrapper: 'mc-input-box-wrapper',
        input: 'input-box'
    },
    dialog: {
        wrapper: 'mc-dialog-wrapper',
        show: 'dialog-body_show',
        confirm: {
            wrapper: 'mc-dialog-wrapper_confirm'
        },
        inputboxDialog: {
            wrapper: 'mc-dialog-wrapper_inputbox'
        }
    },
    notesList: {
        wrapper: "mc-notes-list-wrapper",
        list: 'notes-list',
        title: 'title',
        err: 'err-message',
        preview: {
            wrapper: 'preview',
            text: 'text',
            date: 'date',
            image: 'image-preview',
            cardWrapper: 'card-wrapper'
        }
    },
    notesFolder: {
        wrapper: 'mc-notes-folder-list-wrapper',
        list: 'notes-folder-list',
        listItem: 'folder-list-item',
        newButton: 'new-folder-button',
        title: 'title',
        numbers: 'numbers'
    },
    floatingMenu: {
        wrapperClassName: 'mc-context-wrapper',
        menuClassName: 'mc-context-menu',
        menuItemKeyPrefix: 'mctx-',
        listItemClass: 'list-item',
        listItemHoverClass: 'list-item-selected',
        menuItemWithSubMenuClass: 'has-sub-menu',
        lisItemDisabledClass: 'list-item-disabled',
        lisItemWithIconClass: 'has-icon',
        lisItemIconClass: 'icon',
        listDividerClass: 'divider',
        transitionProprty: 'opacity, visibility',
    },
    noteEditor: {
        wrapper: 'mc-notes-editor-wrapper',
        date: 'notes-date',
        text: 'notes-edit-text'
    }
}
appUIProperty.className = AppClassNames;

export { AppClassNames };

export default appUIProperty;