import React from 'react';
import Base from './Base';

class AudioPlayer extends Base {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <audio className="audio-sources" data-volume={1} data-audio-player></audio>
        )
    }
}

export default AudioPlayer;