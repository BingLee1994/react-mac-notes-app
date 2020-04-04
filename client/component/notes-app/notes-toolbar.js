import React from 'react';
import Button from '../button';
import OptionButton from '../button/option-button';
import SingleChoiceBtnGroup from '../button/single-choice-button-group';
import ToolBar, { Divider } from '../title-bar/tool-bar';
import { callFunc, isPlainObject } from '../../utils';
import storage from '../../utils/storage';
import { asSubscriber } from '../evented';
import { NotesToolbarEvent as ToolbarEvent, NotesEditorEvent } from './events'
import EditorEvent from './events/editor';
import { showColorPicker } from '../picker/color-picker';
import Icon, { IconNames } from '../icon';
import { showProgressBar, showInputDialog } from '../notes-app/notes-window';
import server, { baseURL } from '../../api';
import t, { i18nSync } from '../../i18n';

const PICK_COLOR = Symbol();
const imageExtentionsFilter = '.png,.jpg,.jpeg,image/png,image/jpg,image/jpeg';

const titleOptions = [
    { text: t.menu.bigTitle, data: 'h1' },
    { text: t.menu.smallTitle, data: 'h2' },
    { text: t.menu.subTitle, data: 'h3' },
    { text: t.menu.text, data: 'span' }
];

const listStyleOptions = [
    { text: t.menu.orderList, command: NotesEditorEvent.insertOrderedlist },
    { text: t.menu.unOrderList, command: NotesEditorEvent.insertUnorderedlist }
];

const colorOptions = [
    { text: t.menu.blue, data: 'blue', },
    { text: t.menu.green, data: 'green', },
    { text: t.more, data: PICK_COLOR }
];

const indentOptions = [
    { text: t.menu.indent, command: EditorEvent.indent },
    { text: t.menu.outdent, command: EditorEvent.outdent }
];

@i18nSync
@asSubscriber
class NotesToolBar extends React.Component {
    owener = null;
    constructor(props) {
        super(...arguments);
        this.eventBus = props.eventBus;
        this._subscribeEvents();
        this.elFileUploadBtn = React.createRef();
    }

    _subscribeEvents() {
        this.eventBus.subscribe(EditorEvent.selectionChange,
            name => { console.log(name); console.log(document.getSelection()) }
        );
    }

    dispatch(name, data) {
        console.log(name, data);
        return callFunc(this.eventBus.dispatch, name, data);
    }

    dispatchEditorEvent = (editorEvent) => {
        console.log(editorEvent);
        let { command, data } = editorEvent;
        data = isPlainObject(data)? Object.assign({}, data): data;
        console.log(command, data);
        this.dispatch(command, data);
    };

    dispatchEditorEventOnClick = (_, editorEvent) => {
        return this.dispatchEditorEvent(editorEvent);
    };

    onCardListViewChange = (_,btnData) => {
        this.dispatch(ToolbarEvent.listViewStyleChange, btnData.isCardView);
    };

    onTextAlignChange = (_, data) => {
        this.dispatch(data.command);
    };

    onSelectTitleOption = option => {
        this.dispatch(EditorEvent.removeFormat);
        if (option.data) {
            this.dispatch(EditorEvent.formatBlock, option.data);
        }
    };

    pickColor = e => {
        showColorPicker(t.message.plsSelectColor, e.clientX, e.clientY).then(data => {
            let color = data.hex;
            this.dispatch(EditorEvent.fontColor, color);
        });
    };

    onSelectColorOption = (option, e) => {
        if (option.data === PICK_COLOR) return this.pickColor(e);
        this.dispatch(NotesEditorEvent.fontColor, option.data);
    };

    onSelectIndentOption = option => {
        this.dispatch(option.command);
    };

    uploadImageFile = e => {
        let selectedFiles = e.nativeEvent.target.files;
        let progress = 0,
            hasError = false,
            progressBarUpdater = () => {
                console.log(progress);
                if (!hasError) return progress;
                return false;
            },
            cancelRequest = null,
            onUploadingListener = progressEvent => {
                progress = (progressEvent.loaded / progressEvent.total);
                console.log(progress);
            };

        server.uploadImage(
            selectedFiles[0], 
            onUploadingListener,
            (c) => cancelRequest = c
        )
        .then(response => {
            let imgUrl = baseURL + response.data;
            console.log(imgUrl);
            this.dispatch(EditorEvent.insertImage, imgUrl);
        })
        .catch(e => {
            hasError = true;
        });

        showProgressBar(
            t.message.imageUploading,
            0,
            1,
            progressBarUpdater
        )
        .catch(() => callFunc(cancelRequest));
    };

    onClickToInsertLink = async _ => {
        try {
            let curRange = document.getSelection().getRangeAt(0);
            let link = await showInputDialog({
                message: t.message.plsInputLink,
                required: true
            });
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(curRange);
            this.dispatch(EditorEvent.createLink, link);
        } catch (err) {
        }
    }

    onClickUploadImage = _ => {
        this.elFileUploadBtn.current && this.elFileUploadBtn.current.click();
    };

    render() {
        let isCardView = storage.get('listCardView', false);
        console.log(document.getSelection());
        return (
            <ToolBar
                allowTag={["input"]}
            >
                <SingleChoiceBtnGroup
                    selected={isCardView? 1: 0}
                    onChange = {this.onCardListViewChange}
                >
                    <Button title={t.title.listView} data={{isCardView: false}}>
                        <Icon name={IconNames.listView}/>
                    </Button>
                    <Button title={t.title.cardView} data={{isCardView: true}}>
                        <Icon name={IconNames.cardView}/>
                    </Button>
                </SingleChoiceBtnGroup>

                <Divider width={2} />

        <Button title={t.title.newNote} onClick={_ => this.dispatch(ToolbarEvent.create)}>{t.newNote}</Button>

                <Divider width="auto" />

                <OptionButton
                    title={t.title.titleOption} 
                    options={titleOptions}
                    onSelectOption={this.onSelectTitleOption}
                >
                    <Icon name={IconNames.titleOption}/>
                </OptionButton>

                <OptionButton
                    title={t.title.listOption}
                    options={listStyleOptions}
                    onSelectOption={this.dispatchEditorEvent}
                >
                    <Icon name={IconNames.listOption}/>
                </OptionButton>

                <Button title={t.title.lineThrough} data={{command: EditorEvent.textStyleStrikeThrough}}
                    onClick={this.dispatchEditorEventOnClick}
                >
                    <Icon name={IconNames.lineThrough}/>
                </Button>

                <Button title={t.title.italic} data={{command: EditorEvent.textStyleItalic}}
                    onClick={this.dispatchEditorEventOnClick}
                >
                    <Icon name={IconNames.italics}/>
                </Button>

                <Button title={t.title.underLine} data={{command: EditorEvent.textStyleUnderline}}
                    onClick={this.dispatchEditorEventOnClick}
                >
                    <Icon name={IconNames.underLine}/>
                </Button>

                <Button title={t.title.bold} data={{command: EditorEvent.fontWeightBold}}
                    onClick={this.dispatchEditorEventOnClick}
                >
                    <Icon name={IconNames.fontBold}/>
                </Button>

                <SingleChoiceBtnGroup
                    selected={0}
                    onChange={this.onTextAlignChange}
                >
                    <Button title={t.title.alignLeft} data={{command: EditorEvent.justifyLeft}}>
                        <Icon name={IconNames.alignLeft}/>
                    </Button>
                    <Button title={t.title.alignCenter} data={{command: EditorEvent.justifyCenter}}>
                        <Icon name={IconNames.alignCenter}/>
                    </Button>
                    <Button title={t.title.alignRight} data={{command: EditorEvent.justifyRight}}>
                        <Icon name={IconNames.alighRight}/>
                    </Button>
                </SingleChoiceBtnGroup>

                <OptionButton
                    title={t.title.fontColor} 
                    options={colorOptions}
                    onSelectOption={this.onSelectColorOption}
                >
                    <Icon name={IconNames.fontColor}/>
                </OptionButton>

                <OptionButton
                    title={t.title.indentOption} 
                    options={indentOptions}
                    onSelectOption={this.onSelectIndentOption}
                >
                    <Icon name={IconNames.indent}/>
                </OptionButton>

                <Button title={t.title.insertHr}  data={{command: EditorEvent.insertHorizontalrule}}
                    onClick={this.dispatchEditorEventOnClick}
                >
                    <Icon name={IconNames.insertHr} />
                </Button>

                <Button title={t.title.addLink}
                    onClick={this.onClickToInsertLink}
                >
                    <Icon name={IconNames.link} />
                </Button>
    
                <Button title={t.title.insertImage} onClick={this.onClickUploadImage}><Icon name={IconNames.image} /></Button>

                <input
                    type="file"
                    ref={this.elFileUploadBtn}
                    onChange={this.uploadImageFile}
                    style={{display: "none"}}
                    accept={imageExtentionsFilter}
                    name="noteImage"
                />

                <Divider width="auto" />
            </ToolBar>
        )
    }
}

export default NotesToolBar;