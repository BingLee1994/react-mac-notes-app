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

const { notesList: NotesListClassNames } = AppClassNames;

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
                text: '删除',
                event: NotesListEvent.delete
            },
            {
                text: '移动至',
                subMenuItems: this.getFolderForCxtMneu
            }
        ];
    }

    get selectedNote() {
        let { listData, selectedIdx } = this.state;
        return listData[selectedIdx];
    }

    preEventHandler(e, next) {
        console.log('收到事件：', e);
        next();
    }

    subscribFolderEvent() {
        let events = this.eventsHandlers;
        events.forEach(([name, handler]) => {
            this.props.eventBus.subscribe(
                name,
                e => { pipe(this.preEventHandler, handler.bind(this))(e) }
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
            await showConfirmDialog("确定删除？", "将会永久删除此内容！");
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
            e.nativeEvent.preventDefault();
            e.nativeEvent.stopPropagation();
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
                    <div className={NotesListClassNames.err}>还没有笔记哦</div>
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

/*const { notesList: NotesListClassNames } = AppClassNames;

export default asSubscriber(class NotesListView extends React.PureComponent {
    eventsToListen = [
        FolderEvent.openFolder,
        ToolbarEvent.create,
        ToolbarEvent.viewCard,
        ToolbarEvent.viewList
    ];

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            selectedIdx: 0,
            currentFolderId: -1,
            folderList: [],
            cardView: storage.get('listCardView', false)
        };
        this.elLastSelectedItem = null;
        this.cancelLastRequest = null;
        this.openContextMenu = null;
        this.focused = false;
        this.ctxMenuItems = [
            {
                text: '删除',
                event: NotesListEvent.delete
            },
            {
                text: '移动至',
                subMenuItems: this.getFolderForCxtMneu
            }
        ];
    }

    get selectedNote() {
        let { listData, selectedIdx } = this.state;
        return listData[selectedIdx];
    }

    handleEvents(e) {
        let handlers = {
            [FolderEvent.openFolder]: this.onFolderOpen.bind(this),
            [ToolbarEvent.create]: this.onCreateNote.bind(this),
            [ToolbarEvent.viewCard]: this.changeListView,
            [ToolbarEvent.viewList]: this.changeListView
        }
        let handFunc = handlers[e.name];
        callFunc(handFunc, e);
    }

    changeListView = e => {
        let { cardView } = this.state;
        let newViewType = e.name === ToolbarEvent.viewCard;
        cardView !== newViewType && this.setState({ cardView: newViewType});
        storage.set('listCardView', newViewType);
        console.log(storage.get('listCardView'));
    }

    selectListItemOnKeyPress = e => {
        if (this.focused) {
            e.preventDefault();
            e.stopPropagation();
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
        }
    }

    getFolderForCxtMneu = () => {
        let { folderList } = this.state;
        return folderList.map(each => {
            let text = each.folderName;
            return {
                text,
                event: NotesListEvent.move,
                data: Object.assign({}, each),
                disabled: each.id === this.state.currentFolderId
            };
        });
    };

    async moveToFolder(toFolder) {
        let { selectedNote } = this;
        try {
            let response = await server.moveNote(selectedNote.id, toFolder.id);
            this.setState({
                listData: response.data,
                selectedIdx: 0
            });
            this.dispatchFolderReloadEvent();
            this.dispatchNotesListEvent(this.selectedNote);
        } catch (err) { console.log(err) }
    }

    async deleteNote() {
        let { selectedNote } = this;
        try {
            await showConfirmDialog("确定删除？", "将会永久删除此内容！");
            let response = await server.deleteNote(selectedNote.id);
            this.setState({
                listData: response.data,
                selectedIdx: 0
            });
            this.notifyListDataChange();
        } catch (err) { console.log(err) }
    }

    async onCreateNote(event) {
        try {
            let response = await server.createNote(this.state.currentFolderId);
            let newList = response.data;
            this.setState({
                listData: newList,
                selectedIdx: newList.length - 1
            });
            this.notifyListDataChange();
        } catch (err) {

        }
    }

    async onFolderOpen(event) {
        callFunc(this.cancelRequest);
        let { currentFolder, folderList } = event.data;
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
                listData: response.data,
                selectedIdx: 0,
                currentFolderId: currentFolder.id,
                folderList
            });
            let currentNote = data.length > 0? data[0]: {};
            this.dispatchNotesListEvent(currentNote);
        } catch (err) {
        } finally {
        }
    }

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

    blur = e => {
        let { elLastSelectedItem, refs: { elNotesList } } = this;
        let elClicked = e.target;
        if (!elNotesList.contains(elClicked) && elLastSelectedItem) {
            this.elLastSelectedItem.classList.remove(AppClassNames.listItemFocused);
            this.focused = false;
        }
    }

    onClickListItem = (selectedItemData, index) => {
        return e => {
            let elClickedItem = e.currentTarget;
            if (this.elLastSelectedItem !== elClickedItem) {
                this.elLastSelectedItem = elClickedItem;
                e.nativeEvent.stopImmediatePropagation();
                this.setState({selectedIdx: index}, () => {
                    this.elLastSelectedItem.classList.add(AppClassNames.listItemFocused);
                });
                this.dispatchNotesListEvent(selectedItemData);
            } else {
                elClickedItem.classList.add(AppClassNames.listItemFocused);
            }
            this.focused = true;
        }
    };

    dispatchFolderReloadEvent() {
        this.props.eventBus.dispatch(FolderEvent.reload);
    }

    dispatchNotesListEvent(noteItem) {
        noteItem = isNone(noteItem)? this.selectedNote: noteItem;
        this.props.eventBus.dispatch(NotesListEvent.open, noteItem);
    }

    notifyListDataChange() {
        this.dispatchFolderReloadEvent();
        this.dispatchNotesListEvent(this.selectedNote);
    }

    subscribFolderEvent() {
        let events = this.eventsToListen;
        events.forEach(e => {
            this.props.eventBus.subscribe(
                e,
                this.handleEvents.bind(this)
            );
        })
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.blur);
        document.addEventListener('keyup', this.selectListItemOnKeyPress);
        this.subscribFolderEvent();
    }

    componentWillUnMount() {
        document.removeEventListener('mousedown', this.blur);
    }

    render() {
        let { listData, selectedIdx, cardView } = this.state;
        let length = listData.length;
        return (
            <div className={NotesListClassNames.wrapper}
                ref="elNotesList"
            >
                { (length === 0) &&
                    <div className={NotesListClassNames.err}>还没有笔记哦</div>
                }
                { (length > 0) &&
                    <ContextMenuTrigger
                        tagName="ul"
                        className={NotesListClassNames.list + (cardView?' notes-list_card': '')}
                        menuItems={this.ctxMenuItems}
                        onSelectMenuItem={this.onSelectCtxMenuItem}
                    >{
                        listData.map((each, index) => {
                            let className = [], isSelected = index===selectedIdx;
                            each.previewImage && className.push(NotesListClassNames.preview.image);
                            isSelected && className.push(AppClassNames.listItemSelected);
                            return (
                                <li key={each.id}
                                    onMouseOver={this.hover}
                                    onClick={this.onClickListItem(each, index)}
                                    ref={el=>isSelected && (this.elLastSelectedItem=el)}
                                    className={className.join(' ')}
                                    onContextMenu={this.onClickListItem(each, index)}
                                >
                                    <p className={`${NotesListClassNames.title} ${AppClassNames.text.primary} ${AppClassNames.text.bold}`}>
                                        {each.title || '新建备忘录'}
                                    </p>
                                    <div className={NotesListClassNames.preview.wrapper}>
                                        <span className={`${NotesListClassNames.preview.date} ${cardView? AppClassNames.text.secondary: ''}`}>
                                            {formatYMD(each.date)}
                                        </span>
                                        { !cardView &&
                                            <span className={
                                                [
                                                    NotesListClassNames.preview.text,
                                                    AppClassNames.text.trimEllipsis,
                                                    AppClassNames.text.secondary
                                                ].join(' ')
                                            }>
                                                {each.previewText}
                                            </span>
                                        }
                                        { cardView &&
                                            <div className={NotesListClassNames.preview.cardWrapper}>
                                                <span className={`${NotesListClassNames.preview.text}`}>
                                                    {each.previewText + (cardView? (each.title|| '新建备忘录'): '')}
                                                </span>
                                            </div>
                                        }
                                    </div>
                                    { each.previewImage &&
                                        <div className={NotesListClassNames.preview.image}>
                                            <image src={each.previewImage}/>
                                        </div>
                                    }
                                </li>
                            )
                        })
                    }</ContextMenuTrigger>
                }
            </div>
        )
    }
});*/