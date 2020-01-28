import React from 'react';
import Base from './Base';
import MediaTimeSlider from './MediaTimeSlider';
import MediaHoverTab from './MediaHoverTab';


class MediaTimeSeeker extends Base {
    constructor(props) {
        super(props);
        this.container = this.props.container
    }

    render() {
        return (
            <div className="top-wrap control">
                <div className="current-time control time" data-info="current-time">
                    00:00
                </div>
                <div className="seek-container control">
                    <div className="seek-wrapper control" data-seek-wrapper>
                        <MediaTimeSlider container={this.container} init={this.props.init} name="mediaTimeSlider" id={this.props.id} object={window[this.props.id].malleable.mediaPlayer} action="seek" className="time-slider slider control" loading={this.props.loading} hover={this.props.hover} control="seek" hoverContent={this.props.hover && <MediaHoverTab name="mediaHoverTab" init={this.props.init} id={this.props.id} className="time-display" />} hoverContentUpdate={this.props.hover && this.props.updateHoverContent} maxValue={100} currentValue={0} loadedValue={0} />
                    </div>
                </div>
                <div className="remaining-time control time" data-info="remaining-time">
                    00:00
                </div>
            </div>
        )
    }
}

export default MediaTimeSeeker;