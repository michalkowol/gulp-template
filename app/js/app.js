import Stateful from './component/Components.react';
import React from 'react';
import ReactDOM from 'react-dom';

window.$ = window.jQuery = require('jquery');
require('bootstrap');

console.log("Hello, World!")

ReactDOM.render(<Stateful />, document.getElementById('demo'));
