import { timingSafeEqual } from "crypto";

class Player {
    constructor(sources) {
        this.sources = (sources) ? sources : Array();
        this.queue = (this.sources) ? this.sources.slice() : Array();
        this.queueNumber = -1;
        this.prevQueueNum = -1;
        this.shuffled = false;
        this.repeats = false;
        this.trackChange = new Event('track_change');
    }

    add(source, position) {
        if (position == undefined || (position <= this.sources.length && position <= this.queue.length && position >= 0)) {
            if (position == undefined) {
                this.sources.push(source);
                this.queue.push(source);
            } else if (this.shuffled) {
                this.sources.push(source);
                this.queue.splice(position, 0, source);
            } else {
                this.sources.splice(position, 0, source);
                this.queue.splice(position, 0, source);
            }
            return true;
        }
        return false;
    }

    getCurrentQueueItem() {
        return this.queue[this.queueNumber];
    }

    hasMoreTracks() {
        if (this.queueNumber + 1 < this.queue.length)
            return true;
        return false;
    }

    goToTrack(i) {
        if (i < this.queue.length && i >= 0 && i != this.queueNumber) {
            this.prevQueueNum = this.queueNumber;
            this.queueNumber = i;
            this.trackChange.previousTrack = this.getQueueItem(this.prevQueueNum);
            return true;
        }
        return false;
    }

    shuffle() {
        //http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

        var currentIndex = this.queue.length, temporaryValue, randomIndex;
        let change = false;
        if (this.queueNumber == -1) {
            this.queueNumber = 0;
            change = true;
        }

        let src = this.getCurrentQueueItem();

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            if (randomIndex == this.queueNumber) {
                this.prevQueueNum = this.queueNumber;
                this.queueNumber = currentIndex;
            }
            // And swap it with the current element.
            temporaryValue = this.queue[currentIndex];
            this.queue[currentIndex] = this.queue[randomIndex];
            this.queue[randomIndex] = temporaryValue;
            this.queue[currentIndex].queuePos = currentIndex;
        }
        this.shuffled = true;

        //make sure our current queue position is correct
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].num == src.num) {
                this.queueNumber = src.queuePos;
                break;
            }
        }

        if (change) {
            this.queueNumber = -1;
        }

    }

    getTrackByNum(num) {
        for (var i = 0; i < this.queue.length; i++) {
            if (this.queue[i].num == num)
                return this.queue[i];
        }
        return false;
    }

    unshuffle() {
        var ind = (this.queueNumber > -1) ? parseInt(this.getCurrentQueueItem().num) : this.getQueueItem(0).num;
        this.queue = this.sources.slice();
        for (var i = 0; i < this.queue.length; i++) {
            this.queue[i].queuePos = i;
        }
        this.queueNumber = ind;
        this.shuffled = false;
    }

    delete(queueIndex) {
        if (this.queue.length <= 0 || queueIndex < 0 || queueIndex >= this.queue.length) {
            return false;
        }

        let num = this.queue[queueIndex].num;
        this.sources.splice(this.queue[queueIndex].num, 1);
        this.queue.splice(queueIndex, 1);

        for (let i = queueIndex; i < this.queue.length; i++) {
            this.queue[i].queuePos--;
        }

        for (let i = 0; i < this.sources.length; i++) {
            if (this.queue[i].num > num) {
                this.queue[i].num--;
            }
        }

        if (this.queueNumber > queueIndex) {
            this.queueNumber--;
        }

        return true;
    }

    repeat(option) {
        this.repeats = option;
    }

    getQueueItem(index) {
        if (index >= 0 && index < this.queue.length)
            return this.queue[index];
        return false;
    }

    move(from, to) {
        if (from < 0 || from >= this.queue.length || to < 0 || to >= this.queue.length || from == to)
            return false
            
        let temp = this.queue[from]
        if (from > to) {
            for (let i = from - 1; i >= to; i--) {
                this.queue[i + 1] = this.queue[i]
                this.queue[i + 1].queuePos++
            }
        }else if(from < to){
            for (let i = from + 1; i <= to; i++) {
                this.queue[i - 1] = this.queue[i]
                this.queue[i - 1].queuePos--
            }
        }
        this.queue[to] = temp
        this.queue[to].queuePos = to

        if(this.queueNumber == from)
            this.queueNumber = to
        return true;
    }
}

export default Player;