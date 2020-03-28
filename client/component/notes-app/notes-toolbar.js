import React from 'react';
import Button from '../button';
import SingleChoiceBtnGroup from '../button/single-choice-button-group';
import ToolBar, { Divider } from '../title-bar/tool-bar';
import OptionButton from '../button/option-button';
import { callFunc, isPlainObject } from '../../utils';
import storage from '../../utils/storage';
import { showConfirmDialog } from './notes-window';
import { asSubscriber } from '../evented';
import { NotesToolbarEvent as ToolbarEvent, NotesEditorEvent } from './events'
import EditorEvent from './events/editor';
import { showColorPicker } from '../picker/color-picker';

const titleOptions = [
    {
        text: '大标题',
        data: 'h1'
    },
    {
        text: '小标题',
        data: 'h2'
    },
    {
        text: '副标题',
        data: 'h3'
    },
    {
        text: '正文',
        data: 'span'
    }
].map(each=>{ each.command=NotesEditorEvent.fontSize; return each});

const listStyleOptions = [
    {
        text: '有序列表',
        command: NotesEditorEvent.insertOrderedlist
    },
    {
        text: '无序列表',
        command: NotesEditorEvent.insertUnorderedlist
    }
];

@asSubscriber
class NotesToolBar extends React.Component {
    owener = null;
    constructor(props) {
        super(...arguments);
        this.eventBus = props.eventBus;
        this._subscribeEvents();
    }

    _subscribeEvents() {
    }

    dispatch(name, data) {
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
            console.log(option.data);
            this.dispatch(EditorEvent.formatBlock, option.data);
        }
    }

    pickColor = e => {
        showColorPicker('选择字体颜色', e.clientX, e.clientY).then(color => {
            console.log(color);
        })
    };

    render() {
        let isCardView = storage.get('listCardView', false);
        return (
            <ToolBar>
                <SingleChoiceBtnGroup
                    selected={isCardView? 1: 0}
                    onChange = {this.onCardListViewChange}
                >
                    <Button data={{isCardView: false}}>
                        列表
                    </Button>
                    <Button data={{isCardView: true}}>
                        图标
                    </Button>
                </SingleChoiceBtnGroup>
                <Divider width={2} />
                <Button onClick={_ => this.dispatch(ToolbarEvent.create)}>新建</Button>
                <Divider width="auto" />

                <OptionButton
                    options={titleOptions}
                    onSelectOption={this.onSelectTitleOption}
                >
                    标题
                </OptionButton>

                <OptionButton
                    options={listStyleOptions}
                    onSelectOption={this.dispatchEditorEvent}
                >
                    列表
                </OptionButton>
                <Button data={{command: EditorEvent.textStyleStrikeThrough}}
                    onClick={this.dispatchEditorEventOnClick}>删除线</Button>
                <Button data={{command: EditorEvent.textStyleItalic}}
                    onClick={this.dispatchEditorEventOnClick}>斜体</Button>
                <Button data={{command: EditorEvent.textStyleUnderline}}
                    onClick={this.dispatchEditorEventOnClick}>下划线</Button>
                <Button data={{command: EditorEvent.fontWeightBold}}
                    onClick={this.dispatchEditorEventOnClick}>粗体</Button>
                <SingleChoiceBtnGroup
                    selected={0}
                    onChange={this.onTextAlignChange}
                >
                    <Button data={{command: EditorEvent.justifyLeft}}>左</Button>
                    <Button data={{command: EditorEvent.justifyCenter}}>中</Button>
                    <Button data={{command: EditorEvent.justifyRight}}>右</Button>
                </SingleChoiceBtnGroup>
                <Button onClick={this.pickColor}>字体颜色</Button>
                <Button data={1}>插入清单</Button>
                <Button data={1}>插入图片</Button>
                <Button data={1}>插入清单</Button>
                <Divider width="auto" />
            </ToolBar>
        )
    }
}

export default NotesToolBar;