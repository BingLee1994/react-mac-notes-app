import React from 'react';
import ReactDOM from 'react-dom';
import Window from '../window';
import ConnectedNotesToolBar from './notes-toolbar';
import ConnectedNotesEditor from './notes-editor/index';
import ConnectedNotesList from './notes-list/notes-list';
import ConnectedNotesFolder from './notes-folder/notes-folder';
import Resizer from './resizer';
import ConfirmDialog from '../dialog/window-confirm';
import InputDialog from '../dialog/window-input-dialog';
import server, { SimpleGet, service } from '../../api';
import { isNone, callFunc, isString, isPlainObject } from '../../utils';
import Dialog from '../dialog/dialog';

const WINDOW_CLASS = 'mc-notes-window';
const CONFIRM_WRAPPER_CLASS = 'confirm-wrapper';
let NotesAppWindow = null;
let elConfirmWrapper = null;
let elToolBar = null;
let dialogIsShowing = false;

export default class NotesWindow extends Window {
    constructor(props) {
        super(props);
        this.subscribe('confirm', this.showConfirmDialog)
    }

    componentDidMount() {
        NotesAppWindow = this;
        let { notesWindow } = this.refs;
        let width = notesWindow.offsetWidth,
            height = notesWindow.offsetHeight;
        notesWindow.style.marginTop = (-height / 2) + 'px';
        notesWindow.style.marginLeft = (-width / 2) + 'px';
    }

    componentWillUnMount() {
        NotesAppWindow = null;
    }

    savePanelWidth = name => (width) => {
        let params = {};
        params[name] = width;
        server.preferences("notesWindow", params);
    };

    render() {
        if (NotesAppWindow) {
            throw new Error('Notes window is already openned!')
        };

        return (
            <div ref={"notesWindow"} className={`window ${WINDOW_CLASS}`}>
                <div className={CONFIRM_WRAPPER_CLASS} ref={el => elConfirmWrapper=el} />

                <div className="window-content-wrapper">
                    <ConnectedNotesToolBar
                      ref={con => { elToolBar = ReactDOM.findDOMNode(con); }}>
                    </ConnectedNotesToolBar>

                    <SimpleGet
                        url={service.preferences.notesWindow}
                    >{
                        (_, response) => {
                            let sidePanelWidth = "", middlePanelWidth = "";
                            if (!isNone(response)) {
                                sidePanelWidth = response.data.sidePanelWidth;
                                middlePanelWidth = response.data.middlePanelWidth;
                            }
                            return(
                                <div className="panel-wrapper">
                                    <div 
                                        className="side-panel"
                                        style={{width: sidePanelWidth, flexBasis: sidePanelWidth}}
                                    >
                                        <ConnectedNotesFolder />
                                    </div>
                                    <Resizer name="123" width={0} onResized={this.savePanelWidth('sidePanelWidth')} />
                                    <div className="middle-panel paper-bg"
                                        style={{width: middlePanelWidth, flexBasis: middlePanelWidth}}
                                    >
                                        <ConnectedNotesList />
                                    </div>
                                    <Resizer width={0} onResized={this.savePanelWidth('middlePanelWidth')} />
                                    <ConnectedNotesEditor className="content paper-bg" />
                                </div>
                            );
                        }
                    }</SimpleGet>
                    </div>
            </div>
        );
    }
}

function showDialog(component) {
    if (!elConfirmWrapper || !elToolBar || dialogIsShowing) {
        return Promise.reject();
    }
    return new Promise((resolve, reject) => {
        let hide = () => { ReactDOM.unmountComponentAtNode(elConfirmWrapper); dialogIsShowing = false; };

        let newProps = {
            onConfirm() {
                callFunc(component.props.onConfirm, ...arguments);
                resolve(arguments[0]); hide();
            },
            onCancel() {
                callFunc(component.props.onCancel, ...arguments);
                reject(arguments[0]); hide();
            }
        }
        let dialog = React.cloneElement(component, newProps);
        ReactDOM.render(dialog, elConfirmWrapper);
        dialogIsShowing = true;
    })
}

export function showConfirmDialog() {
    let option = {};
    if (isString(arguments[0])) {
        option.title = arguments[0];
    }
    if (arguments.length === 2 &&
        isString(arguments[0]) &&
        isString(arguments[1])
    ) {
        option.title = arguments[0];
        option.message = arguments[1];
    }
    if (isPlainObject(arguments[0])) {
        option = arguments[0];
    }
    return showDialog(
        <ConfirmDialog
            messageTitle={option.title}
            messageContent={option.message}
            positiveButton={option.positiveButton || '确定'}
            negativeButton={option.negativeButton || '取消'}
        >
        </ConfirmDialog>
    );
}

export function showAlertDialog(message) {
    return showDialog(
        <Dialog
            positiveButton="确定"
        >
            <div className="message">
                <p className="message-title">{message}</p>
            </div>
        </Dialog>
    );
}

export function showInputDialog(option) {
    return showDialog(
        <InputDialog
            placeHolder={option.placeHolder}
            message={option.message}
            positiveButton={option.positiveButton || '确定'}
            negativeButton={option.negativeButton || '取消'}
            required = {option.required}
        >
        </InputDialog>
    );
}