import './style/app.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

document.addEventListener('contextmenu', e => e.preventDefault());
let htmlFontSize = getComputedStyle(document.documentElement).fontSize;
document.documentElement.style.fontSize = `${10 / parseInt(htmlFontSize) * 100}%`;

ReactDOM.render(<App />, document.getElementById('root'));