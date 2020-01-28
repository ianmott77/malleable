
class Source {
    constructor(props) {
        this.src = props.src;
        this.ele = props.ele;
        this.type = props.type
        this.artist = props.artist
        this.name = (props.name) ? props.name : props.src
        if(props.background)
            this.background = props.background
        if(props.picture || (props.tags && props.tags.picture)){
            let picture = (props.picture || props.tags.picture)
            //square brackets around Uint8Array necessary to work
            this.background = URL.createObjectURL(new Blob([new Uint8Array(picture.data)], {type: picture.format}))
        }
        let sources = this.ele.querySelectorAll('source');
        for (let i = 0; i < sources.length; i++) {
            if (sources[i].getAttribute('src') == this.src) {
                this.source = sources[i];
                this.type = sources[i].getAttribute('data-type');
                if (this.type == 'video')
                    this.ele = this.ele.querySelector('video');
                this.name = sources[i].getAttribute('data-name');
                this.artist = sources[i].getAttribute('data-artist');
                if (sources[i].getAttribute('data-background') && !this.background)
                    this.background = sources[i].getAttribute('data-background');
                this.id = sources[i].getAttribute('data-id');
                this.num = sources[i].getAttribute('data-src-num');
                this.queuePos = sources[i].getAttribute('data-queue-num');
                this.source.preload = 'metatdata';
                this.currentTime = (sources[i].getAttribute('data-current-time')) ? sources[i].getAttribute('data-current-time') : 0;
                this.duration = (sources[i].getAttribute('data-duration')) ? sources[i].getAttribute('data-duration') : 0;
                break;
            }

        }
        this.fullscreen = false;
        this.preLoaded = false;
        this.preLoadEle = null;
    }

    play() {
        if (this.currentTime != this.ele.currentTime) {
            this.seek(this.currentTime);
        }
        this.setVolume(this.getVolume());
        this.ele.play();
        return true;
    }

    pause() {
        return this.ele.pause();
    }

    load() {
        this.ele.setAttribute('preload', 'auto');
        this.ele.load();
    }

    seek(time) {
        if (time <= this.duration && time >= 0) {
            this.currentTime = time;
            this.ele.currentTime = time;
            return true;
        }
        return false;
    }

    mute() {
        this.ele.muted = true;
    }

    unmute() {
        this.ele.muted = false;
    }

    getTime() {
        return this.ele.currentTime;
    }

    getDuration() {
        return this.ele.duration;
    }

    getSource() {
        return this.ele;
    }

    setVolume(volume) {
        if (volume > 0 && volume < 1) {
            this.ele.setAttribute('data-volume', volume);
            if (this.ele.volume) {
                this.ele.volume = parseFloat(this.ele.getAttribute('data-volume'));
            }
            return true;
        }
        return false;
    }

    getVolume() {
        if (this.ele.getAttribute('data-volume')) {
            return parseFloat(this.ele.getAttribute('data-volume'));
        } else if (this.ele.volume) {
            return this.ele.volume;
        } else {
            return false;
        }
    }

    getCurrentTime() {
        return this.currentTime;
    }

    getSrc() {
        return this.src;
    }

    setSrc(src) {
        this.src = src;
    }
}

export default Source;