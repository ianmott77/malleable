import React from 'react';
import Base from './Base';
class MediaBackground extends Base {
    constructor(props) {
        super(props);
        this.state = {
            img: props.img
        }
    }

    setImage(img){
        this.setState((prev, props) => ({
            img: img
        }))
    }

    render() {
        return (
            <div className="media-background control" data-control="media-background">
                <img src={this.state.img} alt="no-image"></img>
                <canvas data-control="visualization-canvas" className="visualizer" />
            </div>
        )
    }
}

export default MediaBackground;