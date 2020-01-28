import Slider from './Slider';

class MediaTimeSlider extends Slider {
    constructor(props) {
        super(props);
        this.load = this.load.bind(this);
        this.state.element = this.props.element;
        this.loadedMetaData = this.loadedMetaData.bind(this);
        this.timeUpdate = this.timeUpdate.bind(this);
        this.unload = this.unload.bind(this);
        this.setElement = this.setElement.bind(this);
        this.container = this.props.container
    }
    
    setElement(element){
        this.setState((prev, props) => ({
            element: element
        }), () =>{
            this.load()
        })
    }
    
    load() {
        if (this.state.element) {
            this.state.element.addEventListener('loadedmetadata', this.loadedMetaData);
            this.state.element.addEventListener('timeupdate', this.timeUpdate);
        }
    }

    unload() {
        if (this.state.element) {
            this.state.element.removeEventListener('loadedmetadata', this.loadedMetaData);
            this.state.element.removeEventListener('timeupdate', this.timeUpdate);
        }
    }

    loadedMetaData(e) {
        let maxVal = this.state.element.duration
        let loadedVal = 0;
        let lastLoaded = -1;

        this.setState((prev, props) => ({
            maxValue: maxVal
        }));

        //checks for how much of the media has been loaded
        let loadInterval = setInterval(() => {
            if (this.state.element.buffered.length) {
                loadedVal = this.state.element.buffered.end(this.state.element.buffered.length - 1);
                if (lastLoaded != loadedVal) {
                    lastLoaded = loadedVal
                    this.setState((prev, props) => ({
                        loadedValue: loadedVal
                    }));
                }

                if (loadedVal >= maxVal) {
                    clearInterval(loadInterval);
                }
            }
        }, 500);
    }

    timeUpdate() {
        this.setState((prev, props) => ({
            currentValue: this.state.element.currentTime
        }));
    }
}

export default MediaTimeSlider;