import React from 'react';
import Base from './Base';
class VideoPlayer extends Base {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="video-wrapper">
                <video className="hide" data-video-player>
                </video>
            </div>
        )
    }
}

export default VideoPlayer;