import React from 'react';
import ContextMenuTrigger from '../../context-menu';
import { asSubscriber } from '../../evented'
import { AppClassNames } from '../../../utils/app-ui-prop';
import { NotesFolderEvent as FolderEvent, NotesEditorEvent as EditorEvent , NotesListEvent, NotesToolbarEvent as ToolbarEvent } from '../events';
import server from '../../../api';
import { callFunc, isNone, pipe, classNames, addOnBlurListener, _if } from '../../../utils';
import storage from '../../../utils/storage';
import { showConfirmDialog } from '../notes-window';
import ListItem from './list-item';
import t, { i18nSync } from '../../../i18n';

const { notesList: NotesListClassNames } = AppClassNames;

@i18nSync
@asSubscriber
@addOnBlurListener('mouseup', 'isListBlurred')
//@classNames('notesList')
class NotesListView extends React.PureComponent {
    eventsHandlers = [
        [FolderEvent.openFolder, this.onFolderOpen],
        [ToolbarEvent.create, this.onCreateNote],
        [ToolbarEvent.listViewStyleChange, this.onChangeListView],
        [EditorEvent.save, this.updateNote]
    ];
    cancelLastRequest = null;

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            selectedIdx: 0,
            currentFolderId: -1,
            folderList: [],
            cardView: storage.get('listCardView', false)
        };
        this.ctxMenuItems = [
            {
                text: t.delete,
                event: NotesListEvent.delete
            },
            {
                text: t.moveTo,
                subMenuItems: this.getFolderForCxtMneu
            }
        ];
    }

    get selectedNote() {
        let { listData, selectedIdx } = this.state;
        return listData[selectedIdx];
    }

    preValidateEventHandler(e, next) {
        next();
    }

    subscribFolderEvent() {
        let events = this.eventsHandlers;
        events.forEach(([name, handler]) => {
            this.props.eventBus.subscribe(
                name,
                pipe(this.preValidateEventHandler, handler.bind(this))
            );
        });
    }

    onChangeListView(e) {
        let { cardView } = this.state,
            newViewType = e.data;
        cardView !== newViewType && this.setState({ cardView: newViewType});
        storage.set('listCardView', newViewType);
    }

    async moveToFolder(toFolder) {
        let { selectedNote } = this;
        try {
            let response = await server.moveNote(selectedNote.id, toFolder.id);
            this.setState({
                listData: response.data,
                selectedIdx: 0
            }, this.notifyListDataChange.bind(this));
        } catch (err) { console.log(err) }
    }

    async deleteNote() {
        let { selectedNote } = this;
        try {
            await showConfirmDialog(t.message.deleteNoteAlertTitle, t.message.deleteNoteAlert);
            let response = await server.deleteNote(selectedNote.id);
            this.setState({
                listData: response.data,
                selectedIdx: 0
            }, this.notifyListDataChange);
        } catch (err) { console.log(err) }
    }

    async updateNote(event) {
        let { selectedIdx, listData } = this.state,
            newNoteContent = event.data,
            id = this.selectedNote.id;
        try {
            let response = await server.saveNote(id, newNoteContent);
            listData[selectedIdx] = response.data;
            this.state.listData = listData;
            this.forceUpdate();
        } catch (err) {
            console.log('存储失败');
        }
    }

    async onCreateNote() {
        try {
            let response = await server.createNote(this.state.currentFolderId);
            let newList = response.data;
            this.setState({
                listData: newList,
                selectedIdx: newList.length - 1
            }, this.notifyListDataChange);
        } catch (err) {
        }
    }

    async onFolderOpen(event) {
        callFunc(this.cancelRequest);
        let { currentFolder, folderList } = event.data;
        this.state.folderList = folderList;
        if (isNone(currentFolder)) {
            this.setState({listData: []});
            return;
        }
        if (this.state.currentFolderId === currentFolder.id)
            return;
        try {
            let response = await server.getNotesList(currentFolder.id, (c) => this.cancelLastRequest = c),
                data = response.data || [];
            this.setState({
                listData: data,
                selectedIdx: 0,
                currentFolderId: currentFolder.id,
                folderList
            }, this.dispatchNotesListEvent);
        } catch (err) {
        } finally {
        }
    }

    selectListItemOnKeyPress = e => {
        if (!this.props.isListBlurred) {
            (e.nativeEvent || e).preventDefault();
            (e.nativeEvent || e).stopPropagation();
            let { keyCode } = e;
            if (keyCode !== 38 && keyCode !== 40) return;

            let { selectedIdx, listData } = this.state,
                length = listData.length;

            keyCode === 38 && selectedIdx--;
            keyCode === 40 && selectedIdx++;
            selectedIdx = selectedIdx === length? 0: selectedIdx;
            selectedIdx = selectedIdx === -1? length-1: selectedIdx;

            this.setState( {
                selectedIdx
            }, this.dispatchNotesListEvent);
            e.nativeEvent.returnvalue = false;
            return false;
        }
    }

    getFolderForCxtMneu = () => {
        let { folderList } = this.state;
        return folderList.map(eachFolder => {
            let text = eachFolder.folderName;
            return {
                text,
                event: NotesListEvent.move,
                data: Object.assign({}, eachFolder),
                disabled: eachFolder.id === this.state.currentFolderId
            };
        });
    };

    onSelectCtxMenuItem = async (menu = {}) => {
        let { event } = menu;
        switch(event) {
            case NotesListEvent.move:
                let toFolder = menu.data;
                return this.moveToFolder(toFolder);
            case NotesListEvent.delete:
                return this.deleteNote();
        }
    };

    onClickListItem = (_, index) => {
        return e => {
            if (index !== this.state.selectedIdx) {
                e.nativeEvent.stopImmediatePropagation();
                this.setState({selectedIdx: index}, this.dispatchNotesListEvent);
            }
        }
    };

    dispatchFolderReloadEvent() {
        this.props.eventBus.dispatch(FolderEvent.reload);
    }

    dispatchNotesListEvent = noteItem => {
        noteItem = isNone(noteItem)? this.selectedNote: noteItem;
        this.props.eventBus.dispatch(NotesListEvent.open, noteItem);
    }

    notifyListDataChange = () => {
        this.dispatchFolderReloadEvent();
        this.dispatchNotesListEvent(this.selectedNote);
    }

    componentDidMount() {
        document.addEventListener('keyup', this.selectListItemOnKeyPress);
        this.subscribFolderEvent();
    }

    componentWillUnMount() {
        document.removeEventListener('keyup', this.selectListItemOnKeyPress);
    }

    render() {
        let { listData, selectedIdx, cardView } = this.state;
        let length = listData.length;
        return (
            <div className={NotesListClassNames.wrapper}>
                {/*if*/ (length === 0) &&
                    <div className={NotesListClassNames.err}></div>
                }

                {/*if*/ (length > 0) &&
                    <ContextMenuTrigger
                        tagName="ul"
                        className={NotesListClassNames.list + (cardView?' notes-list_card': '')}
                        menuItems={this.ctxMenuItems}
                        onSelectMenuItem={this.onSelectCtxMenuItem}
                    >{
                        listData.map((eachNote, index) =>
                            <ListItem
                                key={eachNote.id}
                                model={eachNote}
                                selected={index===selectedIdx}
                                cardView={this.state.cardView}
                                blurred={this.props.isListBlurred}
                                onClick={this.onClickListItem(eachNote, index)}
                                onContextMenu={this.onClickListItem(eachNote, index)}
                            />
                        )
                    }</ContextMenuTrigger>
                }
            </div>
        )
    }
}

export default NotesListView;