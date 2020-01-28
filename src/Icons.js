import React from 'react'
import IonIcon from './IonIcon';

class Icons extends React.Component {
    constructor(props) {
        super(props);
        this.icons = Icons.getIcons();
    }

    static getIcons(){
        return{
            playControl: {
                'play': <IonIcon name="play" />,
                'pause': <IonIcon name="pause" />,
                'first': 'play',
                'second': 'pause'
            },
            fullscreenControl: {
                'fullscreen': <IonIcon name="expand" />,
                'exit-fullscreen': <IonIcon name="contract" />,
                'first': 'fullscreen',
                'second': 'exit-fullscreen'
            },
            muteControl: {
                'unmute': <IonIcon name="volume-mute" />,
                'mute': <IonIcon name="volume-high" />,
                'first': 'mute',
                'second': 'unmute'
            },
            playlistControl: {
                'show_playlist': <IonIcon name="musical-note" />,
                'hide_plylist': <IonIcon name="musical-note" />,
                'first': 'show_playlist',
                'second': 'hide_playlist'
            },
            'back': <IonIcon name="skip-backward" />,
            'next': <IonIcon name="skip-forward" />,
            'shuffle': <IonIcon name="shuffle" />,
            'repeat': <IonIcon name="repeat" />,
            'repeat_one': <IonIcon name="repeat" />,
            'visualizer': <IonIcon name="pulse" />,
            'visualizer_off': <IonIcon name="close-circle-outline" />,
            'remove_item': <IonIcon name="close" />,
            'move_item': <IonIcon name="reorder" />

        };   
    }
}

export default Icons;