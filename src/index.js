import css from '../css/style.css';
import themeCss from '../css/theme.css';
import React from 'react';
import ReactDOM from 'react-dom';
import MalleableFactory from './MalleableFactory';
import Icons from './Icons';
import Drawer from './Drawer'

window.icons = Icons.getIcons();

window.newMediaPlayer = function(config) {
    ReactDOM.render(MalleableFactory.newPlayer(config.id, config.container, (config.icons) ? config.icons : window.icons, config), config.container)
    window[config.id].initialize = window[config.id].malleable.initialize
    window[config.id].addSource = window[config.id].malleable.addSource
    window[config.id].getSourceTag = window[config.id].malleable.getSourceTag
}

window.newDrawer = function(props){
    let drawer = new Drawer(props);
    window[props.id] = {
        open: drawer.open,
        close: drawer.close,
        init: drawer.init
    }
}

