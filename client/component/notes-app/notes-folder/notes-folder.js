import React from 'react';
import server from '../../../api';
import { NotesFolderEvent } from '../events';
import { asSubscriber } from '../../evented';
import { AppClassNames } from '../../../utils/app-ui-prop';
import { showInputDialog, showConfirmDialog, showAlertDialog } from '../notes-window';
import ContextMenuTrigger from '../../context-menu';
import { addOnBlurListener, _if } from '../../../utils';
import ListItem from './list-item';
import t, { i18nSync } from '../../../i18n';

const FolderClassNames = AppClassNames.notesFolder;

@i18nSync
@asSubscriber
@addOnBlurListener('mouseup', 'isListBlurred')
//@classNames('notesFolder')
class NotesFolder extends React.PureComponent {
    ctxMenu = [
        {
            text: t.reName,
            event: NotesFolderEvent.rename
        },
        {
            text: t.delete,
            event: NotesFolderEvent.delete
        },
    ]

    constructor(props) {
        super(props);
        this.state = {
            listData: [],
            selectedIdx: 0
        };
    }

    get currentFolder() {
        let { listData, selectedIdx } = this.state;
        return listData[selectedIdx];
    }

    subscibeFolderEvent() {
        let { reload } = NotesFolderEvent;
        [reload].forEach(eachEvent => {
            this.props.eventBus.subscribe(eachEvent, this.handleFolderEvent)
        })
    }

    handleFolderEvent = event => {
        let {name} = event;
        switch (name) {
            case NotesFolderEvent.reload:
                this.getFolders();
                break;
        }
    }

    async deleteFolder() {
        try {
            await showConfirmDialog(t.message.deleteFolderAlertTitle, t.message.deleteFolderAlert);
            let { currentFolder } = this;
            let response = await server.deleteFolder(currentFolder.id);
            this.setState({
                listData: response.data,
                selectedIdx: 0
            }, this.dispatchFolderEvent );
        } catch (err) { console.log(err) }
    }

    getFolders = async () => {
        try {
            let response = await server.getNotesFolders();
            let { data } = response;
            let { selectedIdx } = this.state;

            selectedIdx = selectedIdx >= data.length? 0: selectedIdx;
            this.setState({
                listData: data,
                selectedIdx
            });
            this.dispatchFolderEvent();
        } catch (err) {
            return [];
        }
    };

    validateFolderName(name) {
        if (this.state.listData.some(each => each.folderName === name)) {
            throw new Error(t.message.nameExist);
        }
    }

    createNewFolder = () => {
        showInputDialog({
            message: t.message.plsInputFolderName,
                required: true
        })
        .then(folderName => {
            try {
                this.validateFolderName(folderName)
            } catch (err) {
                showAlertDialog(err.message);
                return;
            }
            server.createFolder(folderName)
                .then(() => {
                    this.getFolders();
                });
        }).catch(err => console.log(err));
    };

    selectCtxMenu = item => {
        switch (item.event) {
            case NotesFolderEvent.delete:
                return this.deleteFolder();
        }
    };

    clickListItem = (index) => e => {
        console.log('click');
        let { selectedIdx } = this.state;
        if (selectedIdx !== index) {
            e.nativeEvent.stopImmediatePropagation();
            this.setState(
                {selectedIdx: index},
                this.dispatchFolderEvent
            );
        }
    };

    dispatchFolderEvent = () => {
        let { state: { listData }, currentFolder } = this;
        this.props.eventBus.dispatch(
            NotesFolderEvent.openFolder,
            {
                currentFolder: currentFolder,
                folderList: [...listData]
            }
        );
    }

    componentDidMount() {
        this.subscibeFolderEvent();
        this.getFolders();
    }

    render() {
        let { listData, selectedIdx } = this.state;

        return (
            <ContextMenuTrigger
                menuItems={this.ctxMenu}
                onSelectMenuItem={this.selectCtxMenu}
                className={FolderClassNames.wrapper}
            >
                <div className={FolderClassNames.list}>
                    {_if(listData.length > 0,
                        listData.map((each, index) => (
                            <ListItem
                                key={each.id}
                                selected={index===selectedIdx}
                                blurred={this.props.isListBlurred}
                                title={each.folderName}
                                count={each.count}
                                onClick={this.clickListItem(index)}
                                onContextMenu={this.clickListItem(index)}
                            />
                        ))
                    )}

                    {_if(listData.length === 0,
                        <div className="folder-empty">{t.emptyFolder}</div>
                    )}
                </div>
                <div
                    className={[AppClassNames.common.text.trimEllipsis, FolderClassNames.newButton].join(' ')}
                    onClick={this.createNewFolder}
                >+ 新建文件夹</div>
            </ContextMenuTrigger>
        );
    }
}

export default NotesFolder;