const dbUtil = require('../utils/db');
const NoteFolder = require('../db/model/note-folder');
const NoteList = require('../db/model/note-list');
const { isNone } = require('../utils');

module.exports = {
    folder(req, res) {
        let { query } = req;
        if (!isNone(query['folder-name'])) {
            let noteFolder = new NoteFolder(query['folder-name']);
            dbUtil.noteFolder.insert(noteFolder);
            dbUtil.noteFolder.commit().then(newFolder => res.send(newFolder));
            return;
        }
        let folders = dbUtil.noteFolder.queryAll(row => {
            row.count = dbUtil.noteList.count({ folderId: row.id });
        });

        res.send(folders||[]);
    },

    deleteFolder(req, res) {
        let { id } = req.params || {};
        if (!isNone(id)) {
            let deletedNotes = dbUtil.noteFolder.delete(id);
            if (deletedNotes.length > 0) {
                let latestList = dbUtil.noteFolder.queryAll(row => {
                    row.count = dbUtil.noteList.count({ folderId: row.id });
                });
                dbUtil.noteList.delete({folderId: id});
                dbUtil.noteFolder.commit().then(() => res.send(latestList||[]));
            } else {
                res.status(500).send('id Not Found');
            }
        } else {
            res.status(500).send('Invalid request');
        }
    },

    list(req, res) {
        let { query } = req;
        let result = dbUtil.noteList.queryAll({folderId: query.id});
        res.send(result);
    },

    text(req, res) {
        let { method } = req;
        switch(method.toLowerCase()) {
            case 'get':
                let { id } = req.query;
                dbUtil.noteText.getText(id).then(text => {
                    res.send(text);
                })
                .catch(err => {
                    res.status(500).send('File not found')
                });
                break;
            case 'post':
                let reqData = '';
                req.on('data', (data) => {
                    reqData += data;
                });
                req.on('end', () => {
                    reqData = JSON.parse(reqData);
                    let { id, content } = reqData;
                    let { title, previewText } = NoteList.parsePreviewText(content, true);
                    let [result] = dbUtil.noteList.update(id, { title, previewText, date: Date.now() });
                    //console.log(result);
                    Promise.all([
                        dbUtil.noteText.saveText(id, content),
                        dbUtil.noteList.commit()
                    ]).then(_ => {
                        res.send(result);
                    });
                });
                break;
            default:
                res.send('');
        }
    },

    move(req, res) {
        let { query } = req;
        if (!isNone(query.folderId) &&
            !isNone(query.noteId)
        ) {
            let note = dbUtil.noteList.query(query.noteId);
            let oldFolderId = note.getFolderId();
            note.setFolderId(query.folderId);
            dbUtil.noteList.update(note);
            dbUtil.noteList.commit()
                .then(() => {
                    let latestList = dbUtil.noteList.queryAll({ folderId: oldFolderId });
                    res.send(latestList);
                }
            );
            return;
        }
        res.send('Invalid request');
    },

    delete(req, res) {
        let { id } = req.params || {};
        if (!isNone(id)) {
            let deletedNotes = dbUtil.noteList.delete(id);
            if (deletedNotes.length !== 0) {
                let note = deletedNotes[0];
                dbUtil.noteText.deleteText(note.getId());
                let latestList = dbUtil.noteList.queryAll({ folderId: note.folderId });
                dbUtil.noteList.commit().then(() => res.send(latestList));
            } else {
                res.status(500).send('id Not Found');
            }
        } else {
            res.status(500).send('Invalid request');
        }
    },

    create(req, res) {
        let { folderId } = req.params || {};
        if (!isNone(folderId)) {
            let note = new NoteList();
            note.setFolderId(folderId);
            dbUtil.noteList.insert(note);
            dbUtil.noteText.saveText(note.getId(), '');
            if (!dbUtil.noteFolder.query(folderId)) {
                let noteFolder = new NoteFolder();
                noteFolder.setId(folderId);
                dbUtil.noteFolder.insert(noteFolder);
                dbUtil.noteFolder.commit();
            }
            dbUtil.noteList.commit().then(() => {
                let latestList = dbUtil.noteList.queryAll({ folderId });
                res.send(latestList);
            });
        } else {
            res.status(500).send('Invalid request');
        }
    }
};
