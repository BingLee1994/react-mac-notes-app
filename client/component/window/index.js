import React from 'react';
import Evented from '../evented';

export default class Window extends Evented {
    componentDidCatch(e) {
        this.dispatch('error', e);
    }
}