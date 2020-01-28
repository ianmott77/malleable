import Visualizer from './Visualizer';

class PlayerView {
    constructor(controller, ele, integrator = 'undefined') {
        this.controller = controller;
        this.ele = ele;
        this.ele.setAttribute('tabindex', 1);
        this.ele.style.outline = 'none';
        this.lastBufferEnd = 0;
        this.fullscreen = false;
        this.controls = {};
        this.buttonControls = {};
        this.removeEvent = new Event('remove_item');
        this.started = false;
        this.isInit = false;
        this.integrator = {
            controller: this.controller,
            ele: this.ele,
            playControl: (event) => {
                if (this.controller.player.queueNumber == -1) {
                    this.goToTrack(0);
                } else {
                    (this.controller.playing) ? this.controller.pause() : this.controller.play();
                }
                if (this.visualizer && this.visualizer.isInit) {
                    (this.controller.playing) ? this.visualizer.context.suspend() : this.visualizer.context.resume();
                }
                return true;
            },

            show_visualizer_list: (event) => {
                return true;
            },

            visualizer_off: (event) => {
                return this.visualizer.visualizerOff();
            },

            visualize: (event) => {
                if (this.controller.player.queueNumber > -1 && !this.visualizer.isInit) {
                    this.visualizer.connect(event);
                    return true;
                }
                return false;
            },

            set_track_info: (index) => {
                let trackInfoWrap = this.ele.querySelector('[data-info="track-info"]');
                let track;
                if (index == 'undefined') {
                    track = (this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack() : this.controller.getTrack(0);
                } else {
                    track = this.controller.getTrack(index);
                }
                if (track) {
                    let back = this.ele.querySelector('[data-control="media-background"]');
                    if (track.ele.getAttribute('data-src') != track.src) {
                        track.ele.src = track.src;
                    }
                    track.ele.setAttribute('data-src', track.src);

                    if (trackInfoWrap) {
                        let name = trackInfoWrap.querySelector('[data-info="name"]')
                        let artist = trackInfoWrap.querySelector('[data-info="artist"]')
                        if (name && artist) {
                            if(track.artist)
                                artist.innerHTML = track.artist
                            if(track.name)
                                name.innerHTML = track.name
                        } else {
                            trackInfoWrap.innerHTML = (track.artist) ? `${track.name} - ${track.artist}` : track.name;
                        }
                    }

                    if (back) {
                        if (track.background) {
                            back.querySelector('img').setAttribute('src', track.background);
                            back.querySelector('img').setAttribute('alt', 'background-image');
                        } else {
                            back.querySelector('img').setAttribute('src', '');
                            back.querySelector('img').setAttribute('alt', 'no-image');
                        }
                    }
                    return true;
                }
                return false;
            },

            unset_track_info: () => {
                this.ele.querySelector('[data-info="track-info"]').innerHTML = '';
                this.ele.querySelector('[data-info="current-time"]').innerHTML = '00:00';
                this.ele.querySelector('[data-info="remaining-time"]').innerHTML = '00:00';
                this.ele.querySelector('[data-control="media-background"]').src = "#";
                return true;
            },

            play_item: (event) => {
                let target = event.target;
                while (!target.getAttribute('data-src'))
                    target = target.parentElement;

                let index = target.getAttribute('data-queue-num');

                if (index) {
                    if (!this.goToTrack(index)) {
                        console.error('Could not go to track ' + index + ': Outside of Bounds 0 - ' + this.controller.player.queue.length);
                        return false;
                    }
                    this.controller.play();
                    return true;
                }
                return false;
            },

            goTo: (index, start) => {
                index = parseInt(index)
                start = (start) ? start : true;

                if (index == this.controller.player.queueNumber && this.playing) {
                    console.error('Already playing track ' + index);
                    return false;
                }

                this.controller.pause();

                if (this.started) {
                    this.controller.getTrack(index).seek(0);
                }

                if (index != this.controller.player.queueNumber) {
                    if (!this.controller.goToTrack(index, start)) {
                        console.error('Could not go to track ' + index + ': Outside of Bounds 0 - ' + this.controller.player.queue.length);
                        return false;
                    }
                }

                this.setTrackInfo(index);

                if (this.controller.getCurrentTrack().type == 'video') {
                    this.controller.getCurrentTrack().ele.className = this.controller.getCurrentTrack().ele.className.replace('hide', '');
                    this.controller.getCurrentTrack().ele.className.trim();
                } else {
                    if (this.controller.getTrack(this.controller.player.prevQueueNum).type == 'video') {
                        this.controller.getTrack(this.controller.player.prevQueueNum).ele.className += ' hide';
                        this.controller.getTrack(this.controller.player.prevQueueNum).ele.className.trim();
                    }
                }

                this.controller.player.trackChange.currentTrack = this.controller.getCurrentTrack();
                window.dispatchEvent(this.controller.player.trackChange);

                if (start) {
                    this.controller.play();
                    this.started = true;
                }

                return true;
            },

            next: (event) => {
                if (this.controller.player.queue.length > this.controller.player.queueNumber + 1)
                    return this.goToTrack(this.controller.player.queueNumber + 1);
                return false;
            },

            back: (event) => {
                if (this.controller.player.queueNumber - 1 >= 0)
                    return this.goToTrack(this.controller.player.queueNumber - 1);
                return false;
            },

            muteControl: (event) => {
                (this.controller.muted) ? this.controller.unmute() : this.controller.mute();
                return true;
            },

            video_over_controls: (e) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                this.integrator.video_show_controls();
                window.clearInterval(window.vidInterval);
                controls.addEventListener('mouseout', this.integrator.video_off_controls);
                this.ele.removeEventListener('mousemove', this.integrator.video_manage_controls);
            },

            video_off_controls: (e) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                window.clearInterval(window.vidInterval);
                controls.removeEventListener('mouseout', this.integrator.video_off_controls);
                this.ele.addEventListener('mousemove', this.integrator.video_manage_controls);
            },

            video_manage_controls: (e) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                this.integrator.video_show_controls();
                window.clearInterval(window.vidInterval);

                window.vidInterval = window.setInterval(() => {
                    this.integrator.video_hide_controls();
                    window.clearInterval(window.vidInterval);
                }, 5000);

            },

            video_show_controls: (e) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                if (String(controls.className).match('hide')) {
                    controls.className = controls.className.replace('hide', '');
                    controls.className = controls.className.trim();
                    this.ele.style.cursor = 'default';
                }
            },

            video_hide_controls: (e) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                if (!controls.className.match('hide')) {
                    controls.className += ' hide ';
                    controls.className = controls.className.trim();
                    this.ele.style.cursor = 'none';
                }
            },

            fullscreenControl: (event) => {
                let controls = this.ele.querySelector('[data-player-wrapper]');
                if (!this.fullscreen) {
                    this.fullscreen = true;
                    this.ele.fullscreen = (this.ele.webkitRequestFullscreen || this.ele.mozRequestFullScreen || this.ele.requestFullscreen);
                    if (this.ele.fullscreen) {
                        if (this.controller.getCurrentTrack().type == 'video') {
                            this.ele.addEventListener('mousemove', this.integrator.video_manage_controls);
                            controls.addEventListener('mouseover', this.integrator.video_over_controls);
                        }
                        this.ele.fullscreen();
                        window.dispatchEvent(new Event('fullscreen'));
                    }
                } else {
                    this.fullscreen = false;
                    if (this.controller.getCurrentTrack().type == 'video') {
                        this.ele.removeEventListener('mousemove', this.integrator.video_manage_controls);
                        controls.removeEventListener('mouseover', this.integrator.video_over_controls);
                        controls.removeEventListener('mouseout', this.integrator.video_off_controls);
                        window.clearInterval(window.vidInterval);
                        this.integrator.video_show_controls();
                    }
                    document.exitFullscreen = (document.webkitExitFullscreen || document.mozExitFullScreen || document.exitFullscreen);
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                        window.dispatchEvent(new Event('exit_fullscreen'));
                    }
                }
                return true;
            },

            shuffle: (event) => {
                (this.controller.shuffled) ? this.controller.unshuffle() : this.controller.shuffle();
                let playlist = this.ele.querySelector('[data-info="playlist"]').cloneNode(false);

                this.controller.player.queue.forEach((source) => {
                    let item = this.ele.querySelector('[data-info="playlist"]').querySelector('[data-src-num="' + source.num + '"]');
                    item.setAttribute('data-queue-num', source.queuePos);
                    playlist.appendChild(item);
                });

                this.ele.querySelector('[data-info="playlist"]').parentElement.replaceChild(playlist, this.ele.querySelector('[data-info="playlist"]'));

                Array.from(this.ele.querySelectorAll('source')).forEach((source) => {
                    source.setAttribute('data-queue-num', this.controller.player.getTrackByNum(source.getAttribute('data-src-num')).queuePos);
                });

                return true;
            },

            repeat: (event) => {
                (this.controller.player.repeats) ? this.controller.player.repeat(false) : this.controller.player.repeat(true);
                return true;
            },

            repeat_one: (event) => {
                if (this.controller.getCurrentTrack()) {
                    this.controller.getCurrentTrack().ele.loop = (this.controller.getCurrentTrack().ele.loop) ? false : true;
                    return true;
                }
                return false;
            },

            show_playlist: (event) => {
                return true;
            },
            
            seek: (time, e, slider) => {
                return this.controller.seek(time);
            },

            setVolume: (level, e, slider) => {
                slider.setState((prev, props) => ({
                    currentValue: level
                }));
                return this.controller.setVolume(level);
            },

            addSource: (props) => {
                //add source to the queue, if fails return false
                if (!this.controller.addSource(props, (props.position) ? props.position : this.controller.player.queue.length)) {
                    return false;
                }

                if (this.isInit && this.controller.player.queue.length == 1) {
                    this.addTrackListeners();
                }

                let insertElement = (parent, position, element) => {
                    //find the sibling node before the position to be inserted for refrence for insertBefore
                    let prev = parent.querySelector('[data-queue-num="' + position + '"]');

                    //check if the node was found, and if it wasn't and the position is not the last position 
                    if (!prev && position < this.controller.player.queue.length && position != 'undefined' || position != this.controller.player.queue.length) {

                        //look for the closest queue number before the position desired to insert it
                        for (let i = 1; (position - i) >= 0; i++) {
                            prev = parent.querySelector('[data-queue-num="' + (position - i) + '"]');
                            if (prev)
                                break;
                        }

                        //make sure prev wasn't found in previous loop
                        if (!prev) {
                            //look for the closest node after the desired position to insert it there
                            for (let i = 1; (position + i) < this.controller.player.queue.length; i++) {
                                prev = parent.querySelector('[data-queue-num="' + (position + i) + '"]');
                                if (prev)
                                    break;
                            }
                        }
                    }
                    //if there was no node to insert it near or if the position is at the end of the queue or not defined apppend the element
                    if (!prev || position == this.controller.player.queue.length || position == 'undefined') {
                        parent.appendChild(element);
                    } else if (prev) { //check to make sure prev was found
                        if (prev.getAttribute('data-queue-num') > position) {
                            parent.insertBefore(element, prev);
                        } else {
                            if (prev.nextSibling != null) {
                                parent.insertBefore(element, prev.nextSibling);
                            } else {
                                parent.appendChild(element);
                            }
                        }
                    }

                }

                let replaceAttr = (str, attr) => {
                    if (str.match('{' + attr + '}')) {
                        if (props[attr]) {
                            return str.replace('{' + attr + '}', props[attr]);
                        }
                        return str;
                    }
                    return str;
                }
                if (props.template) {
                    props.template = new DOMParser().parseFromString(props.template, 'text/html').body.firstChild;
                    props.template.setAttribute('data-src', props.src);
                    props.template.setAttribute('data-background', props.background);
                    props.template.setAttribute('data-name', props.name);
                    props.template.setAttribute('data-src-num', props.num);
                    props.template.setAttribute('data-queue-num', props.queuePos);
                    props.template.setAttribute('data-artist', props.artist);
                    props.template.setAttribute('data-type', props.type);

                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'name');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'artist');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'background');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'src');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'src-num');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'queue-num');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'artist');
                    props.template.innerHTML = replaceAttr(props.template.innerHTML, 'type');
                    let playList = this.ele.querySelector('[data-info="playlist"]');

                    if (playList) {
                        insertElement(playList, props.position, props.template);
                    }
                }


                let sourceEle = document.createElement('source');
                if (props.src) sourceEle.setAttribute('data-src', props.src);
                if (props.type) sourceEle.setAttribute('data-type', props.type);
                if (props.background) sourceEle.setAttribute('data-background', props.background);
                if (props.num) sourceEle.setAttribute('data-src-num', props.num);
                if (props.name) sourceEle.setAttribute('data-name', props.name);
                if (props.artist) sourceEle.setAttribute('data-artist', props.artist);
                if (props.ele) {
                    insertElement((props.type == 'video') ? props.ele.parentElement : props.ele, props.position, sourceEle);
                }

                if (this.isInit) {
                    let ele = this.ele.querySelector('[data-info="playlist"]').querySelector('[data-src-num="' + props.num + '"]')
                    if (ele.getAttribute('data-control')) {
                        this.addControlListener(ele)
                    }

                    Array.from(ele.querySelectorAll('[data-toggle]')).forEach((control) => {
                        this.addButtonControl(control);
                        this.initControl(control, 'data-toggle');
                    });

                    Array.from(ele.querySelectorAll('[data-control]')).filter((control) => {
                        return !control.parentElement.getAttribute('data-toggle');
                    }).forEach((control) => {
                        this.addButtonControl(control);
                        this.initControl(control, 'data-control');
                    });
                }

                return true;
            },

            move: (from, to) => {
                if (from == to)
                    return true

                if (!this.controller.move(from, to))
                    return false

                let list = this.ele.querySelector('[data-info="playlist"]')
                let node = (from > to) ? list.querySelector(`[data-queue-num="${from - 1}"]`) : list.querySelector(`[data-queue-num="${from + 1}"]`)

                list.querySelector(`[data-queue-num="${from}"]`).setAttribute('data-queue-num', to)


                if (from > to) {
                    for (let i = from - 1; i >= to; i--) {
                        node.setAttribute('data-queue-num', i + 1)
                        node = node.previousSibling
                    }
                } else if (from < to) {
                    for (let i = from + 1; i <= to; i++) {
                        node.setAttribute('data-queue-num', i - 1)
                        node = node.nextSibling
                    }
                }

                return true
            },

            remove_item: (event) => {
                let target = event.target;

                while (!target.getAttribute('data-src'))
                    target = target.parentElement;

                let index = parseInt(target.getAttribute('data-queue-num'));
                let srcN = parseInt(target.getAttribute('data-src-num'));

                if (this.controller.player.queueNumber == index) {
                    if (this.controller.player.queue.length - 1 > this.controller.player.queueNumber) {
                        this.goToTrack(this.controller.player.queueNumber + 1);
                    } else if (this.controller.player.queue.length > 1) {
                        this.goToTrack(this.controller.player.queueNumber - 1);
                    } else {
                        this.controller.pause();
                        this.controller.seek(0);
                    }
                } else if (this.controller.player.queueNumber == -1) {
                    this.goToTrack(0);
                    this.controller.pause();
                }

                this.removeEvent.deleted = this.controller.getTrack(index);

                if (this.controller.player.queue.length == 1)
                    this.removeTrackListeners();

                (this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack().ele.setAttribute('data-num', index) : this.controller.getTrack(0).ele.setAttribute('data-num', index);

                this.controller.delete(index)

                target.parentElement.removeChild(target);

                if (this.controller.player.queue.length > 0) {
                    this.setTrackInfo((this.controller.player.queueNumber > -1) ? this.controller.player.queueNumber : 0);
                    Array.from(this.ele.querySelector('[data-info="playlist"]').querySelectorAll('[data-src]')).forEach((track, index) => {
                        if (track.getAttribute('data-queue-num') > index) {
                            track.setAttribute('data-queue-num', parseInt(track.getAttribute('data-queue-num') - 1))
                        }
                        if (track.getAttribute('data-src-num') > srcN) {
                            track.setAttribute('data-src-num', parseInt(track.getAttribute('data-src-num') - 1))
                        }
                    });
                } else {
                    this.unsetTrackInfo();
                }
                window.dispatchEvent(this.removeEvent);
                return true;
            },

            track_end: (e) => {
                this.integrator.next();
                if (!this.controller.player.hasMoreTracks() && this.controller.player.repeats) {
                    this.goToTrack(0);
                }
            },

            track_loadedmetadata: (e) => {
                let remainingTimeWrap = this.ele.querySelector('[data-info="remaining-time"]');
                if (this.controller.player.queueNumber == -1) {
                    if (remainingTimeWrap) {
                        if (this.controller.player.queue.length > 0) {
                            remainingTimeWrap.innerHTML = PlayerView.convertDuration(this.controller.getTrack(0).ele.duration);
                        } else {
                            remainingTimeWrap.innerHTML = '00:00';
                        }
                    }
                    this.controller.getTrack(0).duration = this.controller.getTrack(0).ele.duration;
                } else {
                    if (remainingTimeWrap)
                        remainingTimeWrap.innerHTML = PlayerView.convertDuration(this.controller.getCurrentTrack().ele.duration);
                    this.controller.getCurrentTrack().duration = this.controller.getCurrentTrack().ele.duration
                }
            },

            track_timeupdate: (e) => {
                let currentTimeWrap = this.ele.querySelector('[data-info="current-time"]');
                let remainingTimeWrap = this.ele.querySelector('[data-info="remaining-time"]');
                if (currentTimeWrap)
                    currentTimeWrap.innerHTML = PlayerView.convertDuration((this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack().ele.currentTime : this.controller.getTrack(0).ele.currentTime);
                if (remainingTimeWrap)
                    remainingTimeWrap.innerHTML = PlayerView.convertDuration((this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack().ele.duration - this.controller.getCurrentTrack().ele.currentTime : this.controller.getTrack(0).ele.duration - this.controller.getTrack(0).ele.currentTime);
                (this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack().ele.setAttribute('data-current-time', this.controller.getCurrentTrack().ele.currentTime) : this.controller.getTrack(0).ele.setAttribute('data-current-time', this.controller.getTrack(0).ele.currentTime);
                (this.controller.player.queueNumber > -1) ? this.controller.getCurrentTrack().currentTime = this.controller.getCurrentTrack().ele.currentTime : this.controller.getTrack(0).currentTime = this.controller.getTrack(0).ele.currentTime;
            },

            track_change: (e) => {
                if (this.ele.querySelector('[data-info="playlist"]')) {
                    Array.from(this.ele.querySelector('[data-info="playlist"]').querySelectorAll('[selected]')).forEach((item) => {
                        item.removeAttribute('selected', true);
                    });
                    Array.from(this.ele.querySelector('[data-info="playlist"]').querySelector('[data-queue-num="' + ((this.controller.getCurrentTrack().queuePos) ? this.controller.getCurrentTrack().queuePos : 0) + '"]').querySelectorAll('[data-control="play_item"]')).forEach((item) => {
                        item.setAttribute('selected', true);
                    });
                }

                if (e.previousTrack && e.previousTrack.ele != e.currentTrack.ele) {
                    this.removeTrackListeners(e.previousTrack);
                    this.addTrackListeners(e.currentTrack);
                }

                if (this.ele.querySelector('[data-control="show_visualizer"]')) {
                    if (e.currentTrack.type == 'video') {
                        this.ele.querySelector('[data-control="show_visualizer"]').className += ' hide ';
                        this.ele.querySelector('[data-control="show_visualizer"]').className = this.ele.querySelector('[data-control="show_visualizer"]').className.trim();
                    } else {
                        this.ele.querySelector('[data-control="show_visualizer"]').className = this.ele.querySelector('[data-control="show_visualizer"]').className.replace('hide', '');
                        this.ele.querySelector('[data-control="show_visualizer"]').className = this.ele.querySelector('[data-control="show_visualizer"]').className.trim();
                    }
                }
            },

            track_loading: (e) => {
                let target = this.ele.querySelector('[data-seek-wrapper]')
                if (target)
                    target.setAttribute('data-loading', true);
            },

            track_loaded: (e) => {
                let target = this.ele.querySelector('[data-seek-wrapper]');
                if (target)
                    target.removeAttribute('data-loading');
            },

            statusCheck: () => { }
        }

        if (integrator) {
            Object.keys(integrator).map((operation) => {
                this.integrator[operation] = integrator[operation];
            });
        }
    }

    init() {
        this.visualizationList = this.ele.querySelector('[data-control="visualization-list"]');
        this.canvas = this.ele.querySelector('[data-control="visualization-canvas"]');
        if (this.canvas)
            this.visualizer = new Visualizer(this);

        this.integrator.visualizer = this.visualizer

        Array.from(this.ele.querySelectorAll('[data-toggle]')).forEach((control) => {
            this.addButtonControl(control);
            this.initControl(control, 'data-toggle');
        });

        Array.from(this.ele.querySelectorAll('[data-control]')).filter((control) => {
            return !control.parentElement.getAttribute('data-toggle');
        }).forEach((control) => {
            this.addButtonControl(control);
            this.initControl(control, 'data-control');
        });

        Array.from(this.ele.querySelectorAll('[data-slider]')).forEach((control) => {
            this.controls[control.getAttribute('data-slider')] = control;
        });

        if (this.ele.querySelector('[data-info="current-time"]'))
            this.ele.querySelector('[data-info="current-time"]').innerHTML = '00:00';

        if (this.controller.player.queue.length > 0)
            this.addTrackListeners();

        this.isInit = true;
        this.integrator.statusCheck();
    }

    hasControl(control) {
        if (this.controls[control]) {
            return true;
        }
        return false;
    }

    addButtonControl(control, status) {
        let attr = (control.getAttribute('data-toggle')) ? control.getAttribute('data-toggle') : control.getAttribute('data-control');
        this.buttonControls[attr] = (!status) ? true : false;
    }

    initControl(control, selector) {
        if (!this.controls[control.getAttribute(selector)]) {
            this.controls[control.getAttribute(selector)] = control;
        } else {
            if (Array.isArray(this.controls[control.getAttribute(selector)])) {
                this.controls[control.getAttribute(selector)].push(control);
            } else {
                let previous = this.controls[control.getAttribute(selector)];
                this.controls[control.getAttribute(selector)] = Array();
                this.controls[control.getAttribute(selector)].push(previous);
                this.controls[control.getAttribute(selector)].push(control);
            }
        }
        this.addControlListener(control);
    }

    addControlListener(control) {
        let attr = (control.getAttribute('data-toggle')) ? control.getAttribute('data-toggle') : control.getAttribute('data-control');
        if (typeof this.integrator[attr] == 'object') {
            if (this.integrator[attr].events && this.integrator[attr].actions)
                if (Array.isArray(this.integrator[attr].events) && Array.isArray(this.integrator[attr].actions) && this.integrator[attr].actions.length == this.integrator[attr].events.length) {
                    for (let i = 0; i < this.integrator[attr].actions.length; i++) {
                        control.addEventListener(this.integrator[attr].events[i], this.integrator[attr].actions[i])
                    }
                } else {
                    control.addEventListener(this.integrator[attr].events, this.integrator[attr].actions);
                }
        } else {
            if (this.buttonControls[attr] || this.integrator[attr])
                control.addEventListener('click', this.integrator[attr]);
        }
    }


    addTrackListeners(track) {
        if (!track)
            track = (this.controller.player.queueNumber == -1) ? this.getTrack(0) : this.controller.getCurrentTrack();
        track.ele.addEventListener('ended', this.integrator.track_end);
        track.ele.addEventListener('loadedmetadata', this.integrator.track_loadedmetadata);
        track.ele.addEventListener('timeupdate', this.integrator.track_timeupdate);
        track.ele.addEventListener('waiting', this.integrator.track_loading);
        track.ele.addEventListener('stalled', this.integrator.track_loading);
        track.ele.addEventListener('loadeddata', this.integrator.track_loaded);
        track.ele.addEventListener('playing', this.integrator.track_loaded);
        window.addEventListener('track_change', this.integrator.track_change);
    }

    removeTrackListeners(track) {
        if (!track)
            track = (this.controller.player.queueNumber == -1) ? this.getTrack(0) : this.controller.getCurrentTrack();
        track.ele.removeEventListener('ended', this.integrator.track_end);
        track.ele.removeEventListener('loadedmetadata', this.integrator.track_loadedmetadata);
        track.ele.removeEventListener('timeupdate', this.integrator.track_timeupdate);
        track.ele.removeEventListener('waiting', this.integrator.track_loading);
        track.ele.removeEventListener('stalled', this.integrator.track_loading);
        track.ele.removeEventListener('loadeddata', this.integrator.track_loaded);
        track.ele.removeEventListener('playing', this.integrator.track_loaded);
        window.removeEventListener('track_change', this.integrator.track_change);
    }

    removeControlListener(event, control, index = 'undefined') {
        let finish = (control, event) => {
            let attr = (control.getAttribute('data-toggle')) ? control.getAttribute('data-toggle') : control.getAttribute('data-control');
            control.removeEventListener(event, this.integrator[attr]);
        }

        if (this.controls[control]) {
            if (Array.isArray(this.controls[control])) {
                if (!index) {
                    this.controls[control].forEach((control, i) => {
                        finish(control, event);
                    });
                } else {
                    this.controls[control].forEach((control, i) => {
                        if (i == index)
                            finish(control, event);
                    });
                }
            } else {
                finish(this.controls[control]);
            }
        }
    }

    play() {
        return this.controller.play()
    }

    pause() {
        return this.controller.pause()
    }

    seek(time) {
        return this.integrator.seek(time);
    }

    setVolume(level) {
        return this.integrator.setVolume(level);
    }

    goToTrack(index, start) {
        return this.integrator.goTo(index, start);
    }

    setTrackInfo(index) {
        return this.integrator.set_track_info(index);
    }

    getTrack(index) {
        return this.controller.getTrack(index);
    }

    addSource(props) {
        return this.integrator.addSource(props)
    }

    unsetTrackInfo() {
        this.integrator.unset_track_info();
    }

    static convertDuration(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10 && hours > 0) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return (hours) ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
    }
}

export default PlayerView;