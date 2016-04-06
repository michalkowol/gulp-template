import Stateful from 'component/Components.react';
import React from 'react';
import ReactDOM from 'react-dom';
import director from 'director';

window.$ = window.jQuery = require('jquery');
require('bootstrap');

console.log("Hello, World!")

ReactDOM.render(<Stateful />, document.getElementById('demo'));

var router = new director.Router({
  '/': () => console.log("Hello, World from Router!")
}).configure({strict: false});

router.init();
router.dispatch('on', window.location.pathname);