class Drawer {
    constructor(props) {
        this.element = props.element
        this.min = props.min
        this.max = props.max
        this.start = props.start
        this.snap = (props.snap) ? props.snap : false;
        this.speed = (props.speed) ? props.speed : 0.5
        this.measurement = (props.measurement) ? props.measurement : '%'
        this.progress = (props.progress) ? props.progress : 100
        this.distance = this.max - this.min
        this.percentage = 0
        this.pixels = 0
        this.DIRECTION_VERTICAL = 'DIRECTION_VERTICAL'
        this.DIRECTION_HORIZONTAL = 'DIRECTION_HORIZONTAL'
        if (this.start == 'left' || this.start == 'right') {
            this.direction = this.DIRECTION_HORIZONTAL
        } else if (this.start == 'top' || this.start == 'bottom') {
            this.direction = this.DIRECTION_VERTICAL
        }
        this.cursorCorrection = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.init = this.init.bind(this)
        this.swipe = this.swipe.bind(this)
        this.mouseUp = this.mouseUp.bind(this)
        this.mouseDown = this.mouseDown.bind(this)
        this.mouseLeave = this.mouseLeave.bind(this)
        this.touchStart = this.touchStart.bind(this)
        this.touchEnd = this.touchEnd.bind(this)
        this.pointerMove = this.pointerMove.bind(this)
        this.calculateOpenSpeed = this.calculateOpenSpeed.bind(this)
        this.calculateCloseSpeed = this.calculateCloseSpeed.bind(this)
        this.progressFromStart = this.progressFromStart.bind(this)
        this.progressFromEnd = this.progressFromEnd.bind(this)
        this.snapIt = this.snapIt.bind(this)
        this.setMax = this.setMax.bind(this)
        this.setMin = this.setMin.bind(this)
    }

    isOpen(){
        if(this.progress == 0)
            return true
        return false
    }

    setMax(max){
        this.max = max
        this.distance = this.max - this.min
    }

    setMin(min){
        this.min = min
        this.distance = this.max - this.min
    }

    init(){
        this.hammer = new Hammer.Manager(this.element, {
            recognizers: [
                [Hammer.Swipe, { direction: Hammer[this.direction] }],
            ],
        })
        this.hammer.on('swipe', this.swipe)
        this.element.addEventListener('mousedown', this.mouseDown)
        this.element.addEventListener('touchstart', this.touchStart)
    }

    swipe(event) {
        let velocityDirection = (this.direction == this.DIRECTION_VERTICAL) ? 'overallVelocityY' : 'overallVelocityX'
        if (event[velocityDirection] > -1 && event[velocityDirection] < 1) {
            if (this.start == 'top' || this.start == 'bottom') {
                if (event.direction == 16) {
                    //down
                    this.element.style.transition = (1 - event[velocityDirection]) * (this.progressFromStart() / 100) + 's ease-in-out'
                } else if (event.direction == 8) {
                    //up
                    this.element.style.transition = (1 + event[velocityDirection]) * (this.progressFromStart() / 100) + 's ease-in-out'
                }
            } else if (this.start == 'right' || this.start == 'left') {
                if (event.direction == 4) {
                    //left
                    this.element.style.transition = (1 - event[velocityDirection]) * (this.progressFromStart() / 100) + 's ease-in-out'
                } else if (event.direction == 2) {
                    //right
                    this.element.style.transition = (1 + event[velocityDirection]) * (this.progressFromStart() / 100) + 's ease-in-out'
                }
            }
        }

        if (this.start == 'left' || this.start == 'bottom') {
            this.progress = (event.direction == 8 || event.direction == 4) ? 0 : 100
            this.element.style[this.start] = ((event.direction == 8 || event.direction == 4) ? this.max : this.min) + this.measurement;
        } else if (this.start == 'right' || this.start == 'top') {
            this.progress = (event.direction == 16 || event.direction == 2) ? 0 : 100
            this.element.style[this.start] = ((event.direction == 16 || event.direction == 2) ? this.max : this.min) + this.measurement;
        }
    }

    pointerMove(pointerMoveEvent) {
        let point = {
            y: (pointerMoveEvent.changedTouches) ? pointerMoveEvent.changedTouches[0].clientY : pointerMoveEvent.clientY,
            x: (pointerMoveEvent.changedTouches) ? pointerMoveEvent.changedTouches[0].clientX : pointerMoveEvent.clientX,
        }
        if (this.direction == this.DIRECTION_VERTICAL) {
            if (this.start == 'bottom') {
                this.pixels = window.innerHeight - (point.y + this.cursorCorrection.bottom)
            } else if (this.start == 'top') {
                this.pixels = point.y - this.cursorCorrection.top
            }
            this.percentage = (this.pixels / window.innerHeight) * 100
        } else if (this.direction == this.DIRECTION_HORIZONTAL) {
            if (this.start == 'left') {
                this.pixels = point.x - this.cursorCorrection.left
                this.percentage = (this.pixels / window.innerWidth) * 100
            } else if (this.start == 'right') {
                this.pixels = window.innerWidth - (point.x + this.cursorCorrection.right)
                this.percentage = (this.pixels / window.innerWidth) * 100
            }
        }
        
        this.progress = (this.measurement == 'px') ? ((this.max - this.pixels) / this.distance) * 100 : ((this.max - this.percentage) / this.distance) * 100
       
        if ((this.measurement == '%' && this.percentage <= this.max && this.percentage >= this.min) || (this.measurement == 'px' && this.pixels <= this.max && this.pixels >= this.min)) {
            this.element.style[this.start] = ((this.measurement == '%') ? this.percentage : this.pixels) + this.measurement
        }
    }

    mouseDown(mouseDownEvent) {
        mouseDownEvent.stopPropagation()
        this.element.style.transition = 0 + 's'
        this.element.addEventListener('mousemove', this.pointerMove)
        this.element.addEventListener('mouseup', this.mouseUp)
        this.element.addEventListener('mouseleave', this.mouseLeave)
        this.cursorCorrection = {
            bottom: this.element.getBoundingClientRect().bottom - mouseDownEvent.clientY,
            left: mouseDownEvent.clientX - this.element.getBoundingClientRect().left,
            right: this.element.getBoundingClientRect().right - mouseDownEvent.clientX,
            top: mouseDownEvent.clientY - this.element.getBoundingClientRect().top
        }
    }

    calculateOpenSpeed() {
        return this.speed * this.progressFromEnd()/100
    }

    calculateCloseSpeed() {
        return this.speed * this.progressFromStart()/100
    }

    progressFromStart(){
        return 100 - this.progress
    }

    progressFromEnd(){
        return this.progress
    }

    snapIt(){
        if(this.progressFromStart() >= 50){
            this.open()
        }else if(this.progressFromStart() < 50){
            this.close()
        }
    }

    mouseLeave(mouseLeaveEvent) {
        this.element.removeEventListener('mousemove', this.pointerMove)
        this.element.removeEventListener('mouseup', this.mouseUp)
        this.element.removeEventListener('mouseleave', this.mouseLeave)
        if (this.snap) {
            this.snapIt()
        }
    }

    mouseUp(mouseUpEvent) {
        this.element.removeEventListener('mousemove', this.pointerMove)
        this.element.removeEventListener('mouseup', this.mouseUp)
        this.element.removeEventListener('mouseleave', this.mouseLeave)
        if (this.snap) {
            this.snapIt()
        }
    }


    touchStart(touchStartEvent) {
        touchStartEvent.stopPropagation()
        this.element.style.transition = 0 + 's'
        this.element.addEventListener('touchmove', this.pointerMove)
        this.element.addEventListener('touchend', this.touchEnd)
        this.element.addEventListener('touchcancel', this.touchEnd)
        this.cursorCorrection = {
            bottom: this.element.getBoundingClientRect().bottom - touchStartEvent.changedTouches[0].clientY,
            left: touchStartEvent.changedTouches[0].clientX - this.element.getBoundingClientRect().left,
            right: this.element.getBoundingClientRect().right - touchStartEvent.changedTouches[0].clientX,
            top: touchStartEvent.changedTouches[0].clientY - this.element.getBoundingClientRect().top
        }
    }

    touchEnd(touchEndEvent) {
        this.element.removeEventListener('touchmove', this.pointerMove)
        this.element.removeEventListener('touchend', this.touchEnd)
        this.element.removeEventListener('touchcancel', this.touchEnd)
        if (this.snap) {
            this.snapIt()
        }
    }

    open() {
        this.element.style.transition = this.calculateOpenSpeed() + 's ease-in-out'
        this.element.style[this.start] = this.max + this.measurement
        this.progress = 0
    }

    close() {
        this.element.style.transition = this.calculateCloseSpeed()+ 's ease-in-out'
        this.element.style[this.start] = this.min + this.measurement
        this.progress = 100
    }
}

export default Drawer;