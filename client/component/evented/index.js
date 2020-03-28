import React from 'react';
import { callFunc, isFunc, isObject, isArray, isNone } from '../../utils';
import PropTypes from 'prop-types';

class EventedCom extends React.Component {
    static childContextTypes = {
        eventBus: PropTypes.object
    };

   getChildContext() {
        return { eventBus: this };
   }

    __$listeners__ = Object.create(null);
    subscribe(eventName, callback) {
        if (isNone(eventName)) return;
        if (isFunc(callback)) {
            if (isArray(eventName)) {
                eventName.forEach(eachName => {
                    let name = String(eachName);
                    !this.__$listeners__[name] && (this.__$listeners__[name] = []);
                    this.__$listeners__[name].push(callback);
                });
                return;
            }
            eventName = String(eventName);
            !this.__$listeners__[eventName] && (this.__$listeners__[eventName] = []);
            this.__$listeners__[eventName].push(callback);
        }
        return eventName;
    }

    unsubscribe(eventName, callback) {
        if (isNone(eventName)) return;
        eventName = String(eventName);
        let eventListeners = this.__$listeners__[eventName] || [],
            length = listener.length;
        for (let i = 0; i < length; i++) {
            callback === eventListeners[i] && eventListeners.splice(i, 1);
            return callback;
        }
    }

    dispatch(eventName, data) {
        if (isNone(eventName)) return;
        eventName = String(eventName);
        isObject(data) && (data = Object.assign({}, data));
        let eventListeners = this.__$listeners__[eventName] || [],
            length = eventListeners.length;
        for (let i = 0; i < length; i++) {
            let event = {
                name: eventName,
                data
            }
            callFunc(eventListeners[i], event);
        }
        return data;
    }
}

export function asSubscriber(Component) {
    return class Subscriber extends React.Component {
        static contextTypes = {
            eventBus: PropTypes.object
        };

        render() {
            let _eventBus = this.context.eventBus;
            let eventBusProp = {
                dispatch() {
                    _eventBus.dispatch.call(_eventBus, ...arguments);
                },
                subscribe() {
                    _eventBus.subscribe.call(_eventBus, ...arguments);
                },
                unsubscribe() {
                    _eventBus.unsubscribe.call(_eventBus, ...arguments);
                }
            }
            return <Component  {...this.props} eventBus={eventBusProp}/>
        }
    }
}

export default EventedCom;