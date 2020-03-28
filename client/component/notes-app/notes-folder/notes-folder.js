import React from 'react';
import server from '../../../api';
import { NotesFolderEvent } from '../events';
import { asSubscriber } from '../../evented';
import { AppClassNames } from '../../../utils/app-ui-prop';
import { showInputDialog, showConfirmDialog, showAlertDialog } from '../notes-window';
import ContextMenuTrigger from '../../context-menu';
import { addOnBlurListener, _if } from '../../../utils';
import ListItem from './list-item';

const FolderClassNames = AppClassNames.notesFolder;

@asSubscriber
@addOnBlurListener('mouseup', 'isListBlurred')
//@classNames('notesFolder')
class NotesFolder extends React.PureComponent {
    ctxMenu = [
        {
            text: "重命名",
            event: NotesFolderEvent.rename
        },
        {
            text: "删除",
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
            await showConfirmDialog("确定删除吗？", "将会永久删除此文件下的所有内容！");
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
            throw new Error('文件名已经存在！');
        }
    }

    createNewFolder = () => {
        showInputDialog({
            message: '请输入新的文件夹名称',
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
                <div className={FolderClassNames.list + ' blur-bg'}>
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
                        <div className="mc-notes-folder-empty">没有笔记</div>
                    )}
                </div>
                <div
                    className={`${AppClassNames.common.text.trimEllipsis} ${FolderClassNames.newButton} blur-bg`}
                    onClick={this.createNewFolder}
                >新建文件夹</div>
            </ContextMenuTrigger>
        );
    }
}

export default NotesFolder;