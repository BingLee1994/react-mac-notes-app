const { Router } = require('express');
const noteRoutes = require('./routes/note');
const preferenceRoutes = require('./routes/preference');
let router = Router();

router.get('*', function(_, res, nxt) {
    console.log('use');
    res.header('content-type', 'application/json');
    nxt();
});

router.get('/note/delete/:id', noteRoutes.delete);
router.get('/note/folder/delete/:id', noteRoutes.deleteFolder);
router.get('/note/folder', noteRoutes.folder);
router.get('/note/list', noteRoutes.list);
router.get('/note/create/:folderId', noteRoutes.create);
router.all('/note/text', noteRoutes.text);
router.get('/note/move', noteRoutes.move);

router.get('/preference/notes-window', preferenceRoutes.notesWindow);

module.exports = router;
