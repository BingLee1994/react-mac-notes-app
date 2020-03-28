import Welcome from './page/welcome';
import Home from './page/home';
import App from './App';

export default [{
    path: '/',
    component: Welcome,
    /*indexRoute: {
        component: Dashboard
    },*/
    childRoutes: [
        {
            path: 'welcome',
            component: Welcome
        },
        {
            path: 'home',
            component: Home
        },
        /*{ path: 'inbox',
            component: Inbox,
            childRoutes: [
            { path: '/messages/:id', component: Message },
            { path: 'messages/:id',
                onEnter: function (nextState, replaceState) {
                replaceState(null, '/messages/' + nextState.params.id)
                }
            }
            ]
        }*/
    ]
}]