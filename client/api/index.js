import axios, { CancelToken } from 'axios';
import React from 'react';
import Env from '../../env';
import { isNone, callFunc, mapObj, isString, isFunc } from '../utils';

let { host, port, serviceName } = Env;
const timeout = 5 * 1000;
const baseURL = `http://${host}:${port}`;

let concatUrl = function(obj, prefix) {
    return mapObj(obj, val => {
        if (isString(val)) return prefix + val;
        return val
    });
}

let service = {
    upload: concatUrl({
        image: '/img'
    }, '/upload'),
    notes: concatUrl({
        list: '/list',
        text: '/text',
        save: '/save',
        folders: '/folder',
        deleteFolder: '/folder/delete/:id',
        move: '/move',
        delete: '/delete/:id',
        create: '/create/:id'
    }, '/note'),
    preferences: concatUrl({
        notesWindow: '/notes-window',
        wallpaper: '/wallpaper'
    }, '/preference'),
    appVersion: 'version',
    whatIsNew: 'what-is-new'
};

const api = axios.create({
    baseURL: [baseURL, serviceName].join('/'),
    timeout: timeout
});

api.interceptors.request.use(function (config) {
    return config;
});

function addCancelFuncOption(option, onCancelToken) {
    option = isNone(option)? Object.create(null): option;
    if (isNone(option.cancelToken) && isFunc(onCancelToken)) {
        option.cancelToken = new CancelToken(onCancelToken);
    }
    return option;
}

const server = {
    getNotesFolders(onCancelToken) {
        return api.get(
            service.notes.folders,
            addCancelFuncOption(onCancelToken)
        );
    },
    deleteFolder(id, onCancelToken) {
        return this.get(
            service.notes.deleteFolder.replace(':id', id),
            addCancelFuncOption(onCancelToken)
        );
    },
    getNotesList(id, onCancelToken) {
        let params = { id };
        return api.get(
            service.notes.list,
            addCancelFuncOption({ params }, onCancelToken)
        );
    },
    moveNote(noteId, folderId, onCancelToken) {
        return api.get(
            service.notes.move,
            addCancelFuncOption(
                {
                    params: { noteId, folderId }
                },
                onCancelToken
            )
        );
    },
    getNote(id, onCancelToken) {
        let params = { id };
        return this.get(
            service.notes.text,
            addCancelFuncOption({ params }, onCancelToken)
        );
    },
    createNote(folderId, onCancelToken) {
        return this.get(
            service.notes.create.replace(':id', folderId),
            addCancelFuncOption(onCancelToken)
        );
    },
    saveNote(id, content, onCancelToken) {
        let data = { id };
        data.content = content;
        return this.post(
            service.notes.text,
            addCancelFuncOption({ data }, onCancelToken)
        );
    },
    deleteNote(id, onCancelToken) {
        return this.get(
            service.notes.delete.replace(':id', id),
            addCancelFuncOption(onCancelToken)
        );
    },
    preferences(name, params) {
        let url = service.preferences[name];
        return api.get(url, { params });
    },
    createFolder(folderName, onCancelToken) {
        let url = service.notes.folders;
        return api.get(url, addCancelFuncOption({params: { 'folder-name': folderName }}, onCancelToken));
    },
    _makeRequest(method, url, custOption, onCancelToken) {
        let option = Object.assign({ url, method }, custOption);
        option = addCancelFuncOption(option, onCancelToken);
        return api.request(option);
    },
    get(url, custOption, onCancelToken) {
        return this._makeRequest('get', url, custOption, onCancelToken)
    },
    post(url, custOption, onCancelToken) {
        return this._makeRequest('post', url, custOption, onCancelToken);
    },

    uploadImage(file, onUploadProgress, onCancelToken) {
        let data = new FormData();
        console.log(file, file.name);
        data.append("file", file, file.name);
        return this.post(
            service.upload.image,
            {
                onUploadProgress,
                data,
                timeout: 60 * 1000,
                headers: { "content-type": "multipart/form-data" }
            },
            onCancelToken
        );
    }
}

export class SimpleGet extends React.Component {
    constructor(props) {
        super(props);
        let { children, loading } = this.props;
        let realChildren = children, callback = null;
        if (isFunc(children)) {
            realChildren = isNone(loading)? '': loading;
            callback = children;
        }
        this.state = {
            realChildren, callback, cancelRequest: null
        }
    }

    async componentDidMount() {
        let { callback } = this.state;
        if (!isNone(callback)) {
            let response = null, err = null, realChildren = null;
            let { url, params } = this.props;
            try {
                response = await server.get(url, params, (cancel) => {
                    this.state.cancelRequest = cancel;
                });
            } catch (e) {
                err = e;
            } finally {
                realChildren = callFunc(callback, err, response);
                this.state.realChildren = realChildren;
                if (!isNone(realChildren)) {
                    this.forceUpdate();
                }
            }
        }
    }

    componentWillUnmount() {
        callFunc(this.state.cancelRequest);
    }

    render() {
        return this.state.realChildren;
    }
}

window.server = server;

export { api, service, baseURL };
export default server;