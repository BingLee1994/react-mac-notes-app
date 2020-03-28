const Express = require('express');
const childProcess = require('child_process');
const path = require('path');
const App = Express();
const Env = require('../env');
const rootRouter = require('./router');
const nanoid = require('nanoid');
const dbUtil = require('./utils/db');

App.use(Express.static(path.resolve(Env.clientAppPath)));

App.use(function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (request.method.toLowerCase() === 'option') {
        response.send('');
        return;
    }
    next();
});

/*App.all('*', function(request, response) {
    console.log(request.url);
    response.send('ok');
});*/

console.log('/'+Env.serviceName);

//App.use('/'+Env.serviceName, router);

//App.use('/birds', router);

App.use('/'+Env.serviceName, rootRouter);

App.listen(Env.port, () => {
    console.log(`App is running at ${Env.port}`);
    //childProcess.exec(`start http://localhost:${Env.port}`);
    //childProcess.exec(`open http://localhost:${Env.port}`);
});