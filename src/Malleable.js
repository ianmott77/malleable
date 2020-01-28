import React from 'react'
import Base from './Base'
import Source from './Source'
import AudioPlayer from './AudioPlayer'
import MediaPlayer from './MediaPlayer'
import MediaTimeSeeker from './MediaTimeSeeker'
import Icon from './Icon'
import IconToggle from './IconToggle'
import IconOnOff from './IconOnOff'
import MediaBackground from './MediaBackground'
import Drawer from './Drawer';
import Slider from './Slider';
import ROList from './ROList'

class Malleable extends Base {
    constructor(props) {
        super(props)
        this.id = this.props.id
        this.container = this.props.container
        this.addSource = this.addSource.bind(this)
        this.initialize = this.initialize.bind(this)
        this.getSourceTag = this.getSourceTag.bind(this)
        this.ready = this.ready.bind(this)
        this.playlistControl = this.playlistControl.bind(this)
        this.statusCheck = this.statusCheck.bind(this)
        this.fullscreen = this.fullscreen.bind(this)
        this.exitFullscreen = this.exitFullscreen.bind(this)
        this.adjustDrawer = this.adjustDrawer.bind(this)
        this.move_item = this.move_item.bind(this)
        this.integrator = {
            playlistControl: this.playlistControl,
            statusCheck: this.statusCheck,
            move_item: {
                events: ['mousedown', 'touchstart'],
                actions: [this.move_item, this.move_item]
            }
        }
        this.mediaPlayer = new MediaPlayer((this.props.sources) ? this.props.sources : null, this.container, this.integrator);
        this.readyEvent = new Event(this.id + '.ready');
        window.addEventListener('fullscreen', this.fullscreen);
        window.addEventListener('exit_fullscreen', this.exitFullscreen);
        window.addEventListener('resize', this.adjustDrawer);
        window.addEventListener('orientationchange', this.adjustDrawer);
    }

    initialize() {
        this.mediaPlayer.init()

    }

    adjustDrawer() {
        let max = window.innerHeight - this.container.querySelector('.media-player').getBoundingClientRect().height
        if (parseInt(this.drawer.element.style.bottom) > max) {
            this.drawer.open();
        }
        this.drawer.setMax(max)
    }

    playlistControl(event) {
        this.drawer.isOpen() ? this.drawer.close() : this.drawer.open()
    }

    move_item(event) {
        event.stopPropagation()
        let shadowItem;

        let cursorCorrection = 0;
        let topHeight = 0

        let createShadowItem = (target) => {
            let shadow = document.createElement('li')
            let showRect = target.getBoundingClientRect()
            shadow.style.height = showRect.height + 'px'
            shadow.style.width = showRect.width + 'px'
            shadow.style.position = 'relative'
            return shadow;
        }

        let moveShadowItemDown = () => {
            let shadowParent = shadowItem.parentElement
            let nextPosition = (shadowItem.nextSibling.nextSibling) ? shadowItem.nextSibling.nextSibling : null
            let tempShadow = shadowParent.removeChild(shadowItem)
            shadowParent.insertBefore(tempShadow, nextPosition)
        }

        let moveShadowItemUp = () => {
            let shadowParent = shadowItem.parentElement
            let nextPosition = shadowItem.previousSibling
            let tempShadow = shadowParent.removeChild(shadowItem)
            shadowParent.insertBefore(tempShadow, nextPosition)
        }

        let itemMove = (ev) => {
            ev.preventDefault()
            ev.stopPropagation()
            let target = ROList.findOuterListItemElement(ev)
            let y = (ev.clientY || ev.changedTouches[0].clientY)
            let nextItemRect;
            let previousItemRect;
            if (y <= target.parentElement.getBoundingClientRect().bottom) {
                target.style.top = (y - topHeight) + (topHeight - target.parentElement.getBoundingClientRect().top) - cursorCorrection + 'px'

                if (shadowItem.nextSibling && shadowItem.nextSibling !== target)
                    nextItemRect = shadowItem.nextSibling.getBoundingClientRect()

                if (shadowItem.previousSibling && shadowItem.previousSibling !== target)
                    previousItemRect = shadowItem.previousSibling.getBoundingClientRect()

                if (nextItemRect && y > nextItemRect.top - (nextItemRect.height / 3)) {
                    moveShadowItemDown()
                } else if (previousItemRect && y < previousItemRect.top + (previousItemRect.height / 3)) {
                    moveShadowItemUp()
                }

                let scrollTollerance = (nextItemRect || previousItemRect).height / 2
                let parent = target.parentElement.parentElement
                let parentRect = parent.getBoundingClientRect()

                if (parentRect.top > y - scrollTollerance) {
                    parent.scrollTop = parent.scrollTop - (scrollTollerance/3)
                } else if (parentRect.height < y + scrollTollerance) {
                    parent.scrollTop = parent.scrollTop + (scrollTollerance/3)
                }
            }
        }

        let itemDrop = (ev) => {
            ev.preventDefault()
            ev.stopPropagation()
            let target = ROList.findOuterListItemElement(ev)
            let parentNode = shadowItem.parentElement
            let siblingNode = null
            if (shadowItem.nextSibling && shadowItem.nextSibling !== target)
                siblingNode = shadowItem.nextSibling

            shadowItem.parentElement.removeChild(shadowItem)
            target = parentNode.removeChild(target)

            parentNode.insertBefore(target, siblingNode)

            let from = parseInt(target.getAttribute('data-queue-num'))
            let to;

            if (siblingNode)
                to = (parseInt(siblingNode.getAttribute('data-queue-num')) < from) ? parseInt(siblingNode.getAttribute('data-queue-num')) : parseInt(siblingNode.getAttribute('data-queue-num') - 1)
            else
                to = this.mediaPlayer.player.queue.length - 1

            if (!this.mediaPlayer.view.integrator.move(from, to))
                console.error('Move Failed')


            target.removeAttribute('style')
            target.removeEventListener('mousemove', itemMove)
            target.removeEventListener('mouseup', itemDrop)
            target.removeEventListener('mouseleave', itemDrop)
            target.removeEventListener('touchmove', itemMove)
            target.removeEventListener('touchend', itemDrop)
            target.removeEventListener('touchcancel', itemDrop)
        }

        let cancelHold = () => {
            clearInterval(hold)
        }

        let i = 0;

        let hold = setInterval(() => {
            if (i >= 3) {
                i = 0
                navigator.vibrate([100])
                let y = (event.clientY || event.changedTouches[0].clientY)
                let target = ROList.findOuterListItemElement(event)
                shadowItem = createShadowItem(target)
                let siblingNode = (target.nextSibling) ? target.nextSibling : null
                let parentNode = target.parentElement
                let origRect = target.getBoundingClientRect()
                topHeight = this.container.querySelector('.media-player').getBoundingClientRect().height + this.container.querySelector('.control-bar-wrap').getBoundingClientRect().height
                cursorCorrection = (y - origRect.top)
                let top = (y - topHeight) + (topHeight - parentNode.getBoundingClientRect().top) - cursorCorrection + 'px'
                let originalNode = parentNode.removeChild(target)
                originalNode.style.position = 'absolute'
                originalNode.style.width = '100%'
                originalNode.style.top = top
                originalNode.style.borderTop = 'solid 1px'
                parentNode.appendChild(originalNode)
                originalNode.addEventListener('mousemove', itemMove)
                originalNode.addEventListener('mouseup', itemDrop)
                originalNode.addEventListener('mouseleave', itemDrop)
                originalNode.addEventListener('touchmove', itemMove)
                originalNode.addEventListener('touchend', itemDrop)
                originalNode.addEventListener('touchcancel', itemDrop)
                if (siblingNode)
                    parentNode.insertBefore(shadowItem, siblingNode)
                else
                    parentNode.insertBefore(shadowItem, originalNode)
                clearInterval(hold)
            }
            i++;
        }, 100)
        event.target.addEventListener('mouseup', cancelHold)
        event.target.addEventListener('touchend', cancelHold)
        event.target.addEventListener('touchcancel', cancelHold)
        event.target.addEventListener('mouseleave', cancelHold)
    }



    fullscreen() {
        let temp = setInterval(() => {
            if ((document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)) {
                this.adjustDrawer()
                clearInterval(temp)
            }
        }, 1);
    }

    exitFullscreen() {
        let temp = setInterval(() => {
            if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)) {
                this.adjustDrawer()
                clearInterval(temp)
            }
        }, 1);
    }

    statusCheck() {
        let statusInterval = setInterval(() => {
            if (this.mediaPlayer.controller.playing && window[this.id].playControl.state.option == 'play') {
                window[this.id].playControl.toggle()
            }
            if (!this.mediaPlayer.controller.playing && window[this.id].playControl.state.option == 'pause') {
                window[this.id].playControl.toggle()
            }
            if (window[this.id].fullscreenControl.state.option == 'exit-fullscreen' && !(document.fullscreenElement || document.webkitFullscreenElement ||
                document.mozFullScreenElement)) {
                window[this.id].fullscreenControl.toggle()
                this.mediaPlayer.view.fullscreen = false
            }
            if (window[this.id].fullscreenControl.state.option == 'fullscreen' && (document.fullscreenElement || document.webkitFullscreenElement ||
                document.mozFullScreenElement)) {
                window[this.id].fullscreenControl.toggle()
                this.mediaPlayer.view.fullscreen = true
            }
            if (window[this.id].playlistControl.state.option == 'hide_playlist' && !this.drawer.isOpen()) {
                window[this.id].playlistControl.toggle()
            }
            if (window[this.id].playlistControl.state.option == 'show_playlist' && this.drawer.isOpen()) {
                window[this.id].playlistControl.toggle()
            }
        }, 100)
    }

    addSource(props) {
        if (!props.ele)
            props.ele = this.container.querySelector('[data-audio-player]')
        let source = new Source(props)
        Object.keys(props).forEach(key => {
            if (!source[key]) {
                source[key] = props[key]
            }
        })
        window[this.id].playlist.add(source)
        return this.mediaPlayer.addSource(source);
    }

    ready() {
        let playlist = this.container.querySelector('[data-info="playlist"]')

        if (this.container.querySelector('[data-audio-player]'))
            window[this.id].mediaTimeSlider.setElement(this.container.querySelector('[data-audio-player]'))
        else if (this.container.querySelector('[data-video-player]'))
            window[this.id].mediaTimeSlider.setElement(this.container.querySelector('[data-video-player]'))

        let stopProp = (e) => {
            e.stopPropagation();
        }

        let preventAndriodRefresh = (e) => {
            e.stopPropagation()
            let lastMove = 0

            let endTouch = (e) => {
                playlist.removeEventListener('touchmove', move)
                playlist.removeEventListener('touchend', endTouch)
                playlist.removeEventListener('touchcancel', endTouch)
            }

            let move = (e) => {
                if (lastMove < e.changedTouches[0].clientY) {
                    if (playlist.parentElement.scrollTop == 0) {
                        e.preventDefault()
                    }
                }
                lastMove = e.changedTouches[0].clientY
            }

            playlist.addEventListener('touchmove', move)
            playlist.addEventListener('touchend', endTouch)
            playlist.addEventListener('touchcancel', endTouch)
        }

        window[this.id].icons = this.props.icons

        this.container.querySelector('.volume-controller').addEventListener('mousedown', stopProp);
        this.container.querySelector('.volume-controller').addEventListener('touchstart', stopProp);
        playlist.addEventListener('mousedown', stopProp);
        playlist.addEventListener('touchstart', preventAndriodRefresh);

        this.drawer = new Drawer({
            element: this.container.querySelector('.media-player'),
            min: 0,
            max: window.innerHeight - this.container.querySelector('.media-player').getBoundingClientRect().height - 10,
            start: 'bottom',
            measurement: 'px'
        });
        this.drawer.init()
        window.dispatchEvent(this.readyEvent)
    }

    componentDidMount() {
        let readyInterval = setInterval(() => {
            if (this.container.querySelector('[data-audio-player]') || this.container.querySelector('[data-video-player]')) {
                this.ready()
                clearInterval(readyInterval)
            }
        }, 1)
    }

    getSourceTag(url) {
        return new Promise((resolve, reject) => {
            window.jsmediatags.read(url, {
                onSuccess: (tag) => {
                    resolve(tag)
                },
                onError: (error) => {
                    reject(error)
                }
            })
        })
    }

    render() {
        return (
            <div className="media-player">
                <AudioPlayer name="audioPlayer" id={this.id} init={this.props.init} />
                <MediaBackground name="mediaBackground" id={this.id} init={this.props.init} />
                <div className="top-half">
                    <div className="topWrap">
                        <div className="middle-controls">
                            <Icon name="back" init={this.props.init} id={this.id} control="back" icon={this.props.icons.back} />
                            <IconToggle name="playControl" id={this.id} init={this.props.init} control="playControl" toggle="playControl" icon={this.props.icons.playControl} first={this.props.icons.playControl.first} second={this.props.icons.playControl.second} />
                            <Icon name="next" init={this.props.init} id={this.id} control="next" icon={this.props.icons.next} />
                        </div>
                        <div className="right-controls">
                            <IconToggle name="playlistControl" init={this.props.init} id={this.id} control="playlistControl"  toggle="playlistControl" icon={this.props.icons.playlistControl} first={this.props.icons.playlistControl.first} second={this.props.icons.playlistControl.second}/>
                            <IconToggle name="fullscreenControl" id={this.id} init={this.props.init} control="fullscreenControl" toggle="fullscreenControl" icon={this.props.icons.fullscreenControl} first={this.props.icons.fullscreenControl.first} second={this.props.icons.fullscreenControl.second} />
                        </div>
                    </div>
                </div>
                <div className="bottom-half">
                    <div data-info="track-info">
                        <div data-info="name">

                        </div>
                        <div data-info="artist">
                            
                        </div>
                    </div>
                    <MediaTimeSeeker name="mediaTimeSeeker" id={this.id} init={this.props.init} container={this.container} hover={true} loading={true} updateHoverContent={(hoverState, hoverPerc, slider) => { window[this.id].mediaHoverTab.updateHoverContent(hoverState, hoverPerc, slider) }} />
                </div>
                <div className="control-bar-wrap">
                    <div className="volume-control">
                        <IconToggle name="muteControl" id={this.id} init={this.props.init} icon={this.props.icons.muteControl} first={this.props.icons.muteControl.first} second={this.props.icons.muteControl.second} toggle="muteControl" />
                        <Slider name="volumeSlider" id={this.id} init={this.props.init} control="setVolume" className="volume-controller" maxValue={1} currentValue={1} object={window[this.id].malleable.mediaPlayer.view.integrator} action="setVolume" />
                    </div>
                    <div className="playlist-controls">
                        <IconOnOff name="repeatButton" id={this.id} init={this.props.init} icon={this.props.icons.repeat} first="black" second="orange" toggle="repeat" />
                        <IconOnOff name="shuffle" id={this.id} init={this.props.init} icon={this.props.icons.shuffle} first="black" second="orange" toggle="shuffle" />
                        <IconOnOff name="repeatOneButton" id={this.id} init={this.props.init} icon={this.props.icons.repeat_one} first="black" second="orange" toggle="repeat_one" />
                    </div>
                </div>
                <div className="playlist-wrap">
                    <ROList name="playlist" id={this.id} init={this.props.init} control="playlist" className="playlist" container={this.container} />
                </div>
            </div>
        );
    }
}

export default Malleable;