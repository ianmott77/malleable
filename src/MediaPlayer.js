import Player from './Player';
import PlayerController from './PlayerController';
import PlayerView from './PlayerView';

class MediaPlayer {
    constructor(sources, ele, integrator = undefined) {
        this.sources = sources;
        this.ele = ele;
        this.integrator = integrator;
        this.player = new Player(this.sources);
        this.controller = new PlayerController(this.player);
        this.view = new PlayerView(this.controller, this.ele, this.integrator);
    }

    init() {
        this.view.init();
    }
 
    play(index, start) {
        return (index == -1 || index == undefined) ? this.view.play() : this.view.goToTrack(parseInt(index), start);
    }

    playSrc(src) {
        let queue = this.view.controller.player.queue;
        for (let i = 0; i < queue.length; i++) {
            if (queue[i].src == src) {
                if (this.view.goToTrack(i, true)) {
                    return true;
                }
            }
        }
        return false;
    }

    pause() {
        this.view.pause();
    }

    load() {
        this.view.load();
    }

    addSource(src) {
        return this.view.addSource(src);
    }

    addVisualizer(name, func) {
        this.view.addVisualizer(name, func);
    }

    delete(index) {
        return this.view.delete(index);
    }

    seek(time) {
        return this.view.seek(time);
    }

    setVolume(level) {
        this.view.setVolume(level);
    }

    setTrackInfo(index = undefined) {
        this.view.setTrackInfo(index);
    }

    get(index) {
        return this.controller.getTrack(index);
    }

    getCurrentTrack() {
        return (this.player.queueNumber == -1) ? this.controller.getTrack(0) : this.controller.getCurrentTrack();
    }
}

export default MediaPlayer;