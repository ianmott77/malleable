import React from 'react';
import Base from './Base';
import PlayerView from './PlayerView'
class MediaHoverTab extends Base {
    constructor(props) {
        super(props);
        this.updateHoverContent = this.updateHoverContent.bind(this)
    }

    updateHoverContent(hoverState, hoverPerc, slider) {
        if (hoverState) {
            let preview = window[this.props.id].malleable.mediaPlayer.view.ele.querySelector('[data-current-hover]').querySelector('.video-preview');
            if (window[this.props.id].malleable.mediaPlayer.getCurrentTrack().type == 'video') {
                if (!preview) {
                    preview = document.createElement('video');
                    preview.src = window[this.props.id].malleable.mediaPlayer.getCurrentTrack().src;
                    preview.className = 'video-preview';
                    preview.setAttribute('data-video-preview', true);
                    window[this.props.id].malleable.mediaPlayer.view.ele.querySelector('[data-current-hover]').insertBefore(preview, window[this.props.id].malleable.mediaPlayer.view.ele.querySelector('[data-info="time-preview"]'));
                }
                preview.currentTime = window[this.props.id].malleable.mediaPlayer.getCurrentTrack().duration * (hoverPerc / 100);
            } else {
                if (preview) {
                    preview.parentElement.removeChild(preview);
                }
            }
            if (window[this.props.id].malleable.mediaPlayer.getCurrentTrack().ele) {
                let inner = PlayerView.convertDuration(window[this.props.id].malleable.mediaPlayer.getCurrentTrack().ele.duration * (hoverPerc / 100));
                window[this.props.id].malleable.mediaPlayer.view.ele.querySelector('[data-info="time-preview"]').innerHTML = inner;
                window[this.props.id].malleable.mediaPlayer.view.ele.querySelector('[data-info="time-preview"]').parentElement.style.left = slider.outer.getBoundingClientRect().width * (hoverPerc / 100) + 'px';
            }
        }
    }

    render() {
        return (
            <div className={this.props.className} data-info="time-preview" >
            </div>
        )
    }
}

export default MediaHoverTab;