const Express = require('express');
const App = new Express();
const Env = require('../env');
const fs = require('fs');
const path = require('path');

App.use(Express.static('mock'));

App.use((_, res, nxt) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
    nxt();
});

App.get('/billy-app/note/folder', (_, res) => {
    let data = require('../mock/folder');
    res.header('content-type', 'application/json');
    res.send(JSON.stringify(data));
});

App.get('/billy-app/note/list', (_, res) => {
    let data = require('../mock/list');
    res.header('content-type', 'application/json');
    res.send(JSON.stringify(data));
});

App.get('/billy-app/note/text', (_, res) => {
    let data =fs.readFileSync(path.resolve('mock/note.txt'));
    res.send(data.toString());
});

App.get('/billy-app/preference/notes-window', (req, res) => {
    let query = req.query;
    let data = fs.readFileSync(path.resolve('mock/window.json'));
    data = JSON.parse(data);
    data = Object.assign({}, data, query);
    res.header('content-type', 'application/json');
    fs.writeFileSync(path.resolve('mock/window.json'), JSON.stringify(data, null, 2));
    res.send(JSON.stringify(data));
});

App.listen(Env.port, () => {
    console.log('running at:' + Env.port);
})
