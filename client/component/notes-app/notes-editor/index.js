import React from 'react';
import { callFunc, isNone, formatYMDHM, debounce } from '../../../utils';
import ContextMenuTriggerWrapper from '../../context-menu';
import editorContextMenu from './notes-ctx-menu-items';
import { asSubscriber } from '.././../evented';
import { NotesListEvent, NotesEditorEvent } from '../events';
import server from '../../../api';
import { AppClassNames } from '../../../utils/app-ui-prop';

const EditorClassNames = AppClassNames.noteEditor;
let docExec = (cmdName, extraData) => document.execCommand(cmdName, false, extraData);
let getSelection = () => document.getSelection();

const disabledFeature = ['enableObjectResizing', 'editing', 'notEditing'];

export default asSubscriber(class NotesEditor extends React.PureComponent {
    editor = null;
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

    onSelectContextMenu = itm => {
        this._exec(itm.command, itm.data||'');
    }

    _exec(command, data) {
        console.log(command);
        let next = (c, d) => { docExec(c, d) };
        this._beforeExec(command, data, next);
    }

    _beforeExec(command, data, next) {
        let selection = getSelection();
        //console.log(selection);
        //console.log(command, data);
        next(command, data);
    }

    /*shouldComponentUpdate() {
        return false;
    }*/

    componentDidMount() {
        this._subscribe();
        //this.startAutoSaveTimer();
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
        //console.log('saving...')
        this.dispatch(NotesEditorEvent.save, html);
    }

    render() {
        return (
            <ContextMenuTriggerWrapper
                menuItems={this.contextMenu}
                onSelectMenuItem={this.onSelectContextMenu}
                className={`${EditorClassNames.wrapper} ${this.props.className || ''}`}
            >
                {
                    this.state.date &&
                    <p className={`${EditorClassNames.date} ${AppClassNames.common.text.secondary}`}>
                        {formatYMDHM(this.state.date)}
                    </p>
                }
                <div
                    ref={el => {
                        this.editor = el;
                        callFunc(this.props.onRef, el);
                    }}
                    onInput={this.onTextChange}
                    contentEditable = {!this.state.disable}
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{__html: this.state.text}}
                    onFocus={e => this.dispatch(NotesEditorEvent.editing, e)}
                    onBlur={e => this.dispatch(NotesEditorEvent.notEditing, e)}
                    className={EditorClassNames.text}
                ></div>
            </ContextMenuTriggerWrapper>
        )
    }
});