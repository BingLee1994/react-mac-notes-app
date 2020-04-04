const Express = require('express');
const childProcess = require('child_process');
const path = require('path');
const App = Express();
const Env = require('../env');
const rootRouter = require('./router');
const config = require('./config');
var compression = require('compression');
const childProgess = require('child_process');

// 启用gzip
App.use(compression());
App.use(Express.static(path.resolve(Env.clientAppPath)));
App.use(config.noteImagePathUrlPrefix, Express.static(config.noteImagePath));

App.use(function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (request.method.toLowerCase() === 'option') {
        response.send('');
        return;
    }
    next();
});

App.use('/'+Env.serviceName, rootRouter);

App.listen(Env.port, () => {
    let url = `http://localhost:${Env.port}`;
    console.log(`App is running at ${url}`);
    childProgess.exec(`open ${url}`);
    childProgess.exec(`start ${url}`);
});