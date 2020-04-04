import { isFunc, callFunc } from "./utils";
import React from 'react';

const DEFAULT_LANGUAGE_NAME = 'zh';
let language = DEFAULT_LANGUAGE_NAME;

const i18nData = {
    [DEFAULT_LANGUAGE_NAME]: {
        newFolder: '+ 新建文件夹',
        delete: '删除',
        reName: '重命名',
        moveTo: '移动至',
        cut: '剪切',
        copy: '复制',
        search: '使用百度搜索',
        newNote: '新建',
        more: '更多',
        emptyNoteTitle: '新建备忘录',
        confirm: '确定',
        cancel: '取消',
        ok: '好',
        emptyFolder: '无内容',
        menu: {
            bigTitle: '大标题',
            smallTitle: '小标题',
            subTitle: '副标题',
            text: '正文',
            orderList: '有序列表',
            unOrderList: '无序列表',
            blue: '蓝色',
            green: '绿色',
            indent: '增加缩进',
            outdent: '减少缩进'
        },
        title: {
            cardView: '卡片视图',
            listView: '列表视图',
            newNote: '点击以创建笔记',
            titleOption: '标题选项',
            listOption: '列表选项',
            lineThrough: '删除线',
            italic: '斜体字',
            bold: '粗体字',
            underline: '下划线',
            alighLeft: '左对齐',
            alignCenter: '居中对齐',
            alignRight: '右对齐',
            fontColor: '字体颜色',
            indentOption: '缩进选项',
            insertHr: '插入水平线',
            addLink: '添加链接',
            inertImage: '插入图片'
        },
        message: {
            plsSelectColor: '选择字体颜色',
            imageUploading: '图片上传中',
            deleteFolderAlertTitle: '确定删除此文件夹吗？',
            deleteFolderAlert: '将会永久删除此文件下的所有内容！',
            deleteNoteAlertTitle: '确定删除吗？',
            deleteNoteAlert: '将会永久删除此内容！',
            nameExist: '文件名已经存在！',
            plsInputFolderName: '请输入文件夹名'
        }

    },
    //TODO English
    en: {
        menu: {
        },
        title: {
        },
        message: {
        }
    }
}

const i18n = {};

let translationNames = Object.keys(i18nData[DEFAULT_LANGUAGE_NAME]);

translationNames.forEach(name => {
    Object.defineProperty(i18n, name, {
        get() {
            let translation = i18nData[language] || {};
            return translation[name] || ''
        }
    });
});

let languageObservers = [];

function setLanguage(newLanguage = DEFAULT_LANGUAGE_NAME) {
    if (i18nData.hasOwnProperty(newLanguage) && language !== newLanguage) {
        language = newLanguage;
        languageObservers.forEach(cb => callFunc(cb, newLanguage));
    }
}

function observeLangChange(cb) {
    if(isFunc(cb) && !languageObservers.some(o => o === cb)) {
        languageObservers.push(cb);
    }
}

function unObserveLangChange(cb) {
    remodeItemAtIdx(languageObservers, cb);
}

function i18nSync(Component) {
    class Wrapper extends React.Component{
        updateOnI18nChange = () => {
            this.forceUpdate();
        }
        componentDidMount() {
            observeLangChange(this.updateOnI18nChange);
        }
        componentWillUnmount() {
            unObserveLangChange(this.updateOnI18nChange);
        }
        render() {
            return <Component {...this.props} i18n={i18n} currentLanguage={language} />
        }
    }
    return Wrapper;
}

@i18nSync
class T extends React.Component{
    render() {
        return i18n[props.name];
    }
}

export default i18n;

window.setLanguage = setLanguage;

export {
    observeLangChange,
    unObserveLangChange,
    setLanguage,
    i18nSync,
    T
}