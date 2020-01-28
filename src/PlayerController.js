class PlayerController {
    constructor(player) {
        this.player = player;
        this.playing = false;
        this.muted = false;
        this.shuffled = false;
    }

    play() {
        if (!this.playing) {
            if(this.getCurrentTrack()){
                this.getCurrentTrack().play()
             }else{
                this.goToTrack(0)
                this.getCurrentTrack().play()
             }
            this.playing = true;
            return true;
        }
        return false;
    }

    pause() {
        if (this.playing) {
            this.player.getCurrentQueueItem().pause();
            this.playing = false;
            return true;
        }
        return false;
    }

    load() {
        this.player.getCurrentQueueItem().load();
    }

    mute() {
        if (!this.muted) {
            (this.player.queueNumber > -1) ? this.player.getCurrentQueueItem().mute() : this.getTrack(0).mute();
            this.muted = true;
        }
    }

    unmute() {
        if (this.muted) {
            (this.player.queueNumber > -1) ? this.player.getCurrentQueueItem().unmute() : this.getTrack(0).unmute();
            this.muted = false;
        }
    }

    seek(time) {
        return (this.player.queueNumber > -1) ? this.getCurrentTrack().seek(time) : this.getTrack(0).seek(time);
    }

    setVolume(volume) {
        if (this.player.queueNumber >= 0 && this.player.queueNumber < this.player.queue.length)
            return this.player.getCurrentQueueItem().setVolume(volume);
        else if(this.player.queue.length > 0)
            return this.player.getQueueItem(0).setVolume(volume);
        return true;
    }

    hasMoreTracks() {
        return this.player.hasMoreTracks();
    }

    getCurrentTrack() {
        return this.player.getCurrentQueueItem();
    }

    goToTrack(i) {
        if (this.player.goToTrack(i)) {
            if (this.getCurrentTrack().ele.src != this.getCurrentTrack().src) {
                this.getCurrentTrack().ele.src = this.getCurrentTrack().src;
            }
            this.getCurrentTrack().ele.setAttribute('data-num', this.getCurrentTrack().num);

            return true;
        } else {
            return false;
        }
    }

    shuffle() {
        if (!this.shuffled) {
            this.player.shuffle();
            this.shuffled = true;
        }
    }

    unshuffle() {
        if (this.shuffled) {
            this.player.unshuffle();
            this.shuffled = false;
        }
    }

    isShuffled() {
        if (this.shuffled) {
            return true;
        }
        return false;
    }

    delete(index) {
        return this.player.delete(index);
    }

    getTrack(index) {
        return this.player.getQueueItem(index);
    }

    addSource(source, position) {
        return this.player.add(source, position);
    }

    move(from, to){
        return this.player.move(from, to);
    }
}

export default PlayerController;