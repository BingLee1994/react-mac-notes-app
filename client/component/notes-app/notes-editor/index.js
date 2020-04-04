import React from 'react';
import { callFunc, isNone, formatYMDHM, debounce, remodeItemAtIdx } from '../../../utils';
import ContextMenuTriggerWrapper from '../../context-menu';
import editorContextMenu from './notes-ctx-menu-items';
import { asSubscriber } from '.././../evented';
import { NotesListEvent, NotesEditorEvent } from '../events';
import server from '../../../api';
import { AppClassNames } from '../../../utils/app-ui-prop';

const EditorClassNames = AppClassNames.noteEditor;
let docExec = (cmdName, extraData) => document.execCommand(cmdName, false, extraData);
let getSelection = () => document.getSelection();

const disabledFeature = ['selectionChange', 'enableObjectResizing', 'editing', 'notEditing'];

const COMMAND_OPEN_LINK = Symbol();
const openInNewTabMenuItm = { text: '在新窗口打开链接', command: COMMAND_OPEN_LINK }

export default asSubscriber(class NotesEditor extends React.PureComponent {
    editor = null;
    editorDomObserver = null;
    contextMenu = editorContextMenu;

    constructor(props) {
        super(...arguments);
        this.eventBus = props.eventBus;
        this.state = {
            text: props.text || '',
            date: props.date || '',
            disable: true
        }
        this.handleTextChange = debounce(this.handleTextChange, 300);
    }

    onWillOpenCtxMenu = e => {
        let { target } = e;
        let openTabItm = this.contextMenu.find(i => i === openInNewTabMenuItm);
        if (target.tagName === 'A') {
            let { href } = target;
            if (href && isNone(openTabItm)) {
                openInNewTabMenuItm.href = href;
                this.contextMenu.push(openInNewTabMenuItm);
            }
        } else {
            remodeItemAtIdx(this.contextMenu, i => i === openInNewTabMenuItm);
        }
    };

    onSelectContextMenu = itm => {
        if (itm.command === COMMAND_OPEN_LINK) {
            return window.open(itm.href);
        }
        if (itm.command === 'rate') {
            return window.open('https://github.com/BingLee1994/react-mac-notes-app');
        }
        this._exec(itm.command, itm.data||'');
    }

    _exec(command, data) {
        let next = (c, d) => { docExec(c, d) };
        this._preValidate(command, data, next);
    }

    _preValidate(command, data, next) {
        let selection = getSelection();
        next(command, data);
    }

    changeImageSize(e) {
        let elImg = e.currentTarget || e.target;
        let size = parseInt(elImg.dataset['size']) || 0;
        if (size === 0) {
            elImg.style.width = 'initial';
        }

        if (size === 1) {
            elImg.style.width = 'calc(50% - 10px)';
        }

        if (size === 2) {
            elImg.style.width = 'calc(100% - 10px)';
        }

        elImg.dataset['size'] = (size + 1) % 3;
        this.dispatch(NotesEditorEvent.save, this.editor.innerHTML);
    }

    _handleEditorDomChange(mutationsList) {
        for(var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                let addedNodes = mutation.addedNodes;
                setTimeout(() => {
                    let onClickImge = debounce(this.changeImageSize.bind(this), 100);

                    function addImageClickListener(nodeList) {
                        if (isNone(nodeList) || nodeList.length < 1) {
                            return;
                        }
                        [].forEach.call(nodeList, eachNode => {
                            if (eachNode.nodeType !== 1)  return;
                            if (eachNode.tagName === 'IMG') {
                                !eachNode.onclick && (eachNode.onclick = onClickImge);
                            } else {
                                let elImgsChildren = eachNode.querySelectorAll('img');
                                addImageClickListener(elImgsChildren);
                            }
                        })
                    }

                    addImageClickListener(addedNodes);

                })
            }
        }
    }

    enableEditorDomObserver() {
        if (!isNone(this.editor)) {
            let config = {
                childList: true,
                subtree: true
            };

            let cb = this._handleEditorDomChange.bind(this);
            this.editorDomObserver = new MutationObserver(cb);
            this.editorDomObserver.observe(this.editor, config);
        }
    }

    disableEditorDomObserver() {
        if (!isNone(this.editor) && !isNone(this.editorDomObserver)) {
            this.editorDomObserver.disconnect();
        }
    }

    componentDidMount() {
        this._subscribe();
        this.enableEditorDomObserver();
        document.addEventListener('click', this.enableSelectionObserver);
    }

    componentWillUnMount() {
        this.disableEditorDomObserver();
        document.removeEventListener('click', this.enableSelectionObserver);
    }

    getNote = async event => {
        let noteItem = event.data;
        if (isNone(noteItem) || isNone(noteItem.id)) {
            this.setState({
                date: '',
                text: '',
                disable: true
            });
            return;
        }
        let { id, date } = noteItem;
        let text = '';
        try {
            let response = await server.getNote(id);
            text = response.data;
        } catch (err) {

        } finally {
            this.setState({
                date,
                text,
                disable: false
            });
        }
    }

    _subscribe() {
        if (!this.eventBus) return;
        for (let featureName in NotesEditorEvent) {
            if (!disabledFeature.some(f => f === featureName)) {
                let feature = NotesEditorEvent[featureName];
                this.eventBus.subscribe(feature, ({data: editorActionData}) => {
                    this._exec(feature, editorActionData);
                });
            }
        }
        this.eventBus.subscribe(NotesListEvent.open, this.getNote);
    }

    dispatch = (eventName, extra) => {
        return callFunc(this.eventBus.dispatch, eventName, extra);
    };

    onTextChange = e => {
        let html = e.target.innerHTML;
        this.handleTextChange(html);
    }

    handleTextChange = html => {
        this.dispatch(NotesEditorEvent.save, html);
    }

    render() {
        return (
            <ContextMenuTriggerWrapper
                menuItems={this.contextMenu}
                onWillOpenMenu={this.onWillOpenCtxMenu}
                onSelectMenuItem={this.onSelectContextMenu}
                className={`${EditorClassNames.wrapper} ${this.props.className || ''}`}
            >
                {/*if*/ (this.state.date) &&
                    <p className={`${EditorClassNames.date} ${AppClassNames.common.text.secondary}`}>
                        {formatYMDHM(this.state.date)}
                    </p>
                }
                <div
                    ref={el => {
                        this.editor = el;
                        callFunc(this.props.onRef, el);
                    }}
                    spellCheck={false}
                    onInput={this.onTextChange}
                    contentEditable = {!this.state.disable}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{__html: this.state.text}}
                    onFocus={e => {}}
                    onBlur={e => {}}
                    className={EditorClassNames.text}
                ></div>
            </ContextMenuTriggerWrapper>
        )
    }
});