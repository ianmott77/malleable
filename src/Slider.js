import React from 'react';
import Base from './Base';

class Slider extends Base {
    constructor(props) {
        super(props);
        this.state = {
            maxValue: this.props.maxValue,
            currentValue: this.props.currentValue,
            loadedValue: this.props.loadedValue,
            displayHover: false,
            hoverValue: 0,
            hover: this.props.hover
        }
        this.update = this.update.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
        this.mouseOver = this.mouseOver.bind(this);
        this.hoverMove = this.hoverMove.bind(this);
        this.outer = undefined;
    }

    //returns the element that has the data-slider attribute
    getOuterTarget(e) {
        let target = e.target
        while (!target.getAttribute('data-slider'))
            target = target.parentElement;

        this.outer = target;
        return target;
    }

    update(e) {
        let target = this.getOuterTarget(e);
        let newValue = this.state.maxValue * (((e.changedTouches) ? e.changedTouches[0].clientX : e.clientX) - target.getBoundingClientRect().left) / target.getBoundingClientRect().width;

        if (newValue < this.state.maxValue && newValue >= 0)
            return newValue;
        else if (newValue > this.state.maxValue)
            return this.state.maxValue;
        else if (newValue < 0)
            return 0;
        else
            return this.state.currentValue;
    }

    mouseDown(e) {
        e.preventDefault();
        let targets = Array();
        let outer = this.getOuterTarget(e);

        let updateState = (e) => {
            let updatedValue = this.update(e);
            if (this.props.action) {
                if ((this.props.object) ? this.props.object[this.props.action](updatedValue, e, this) : this.props.action(updatedValue, e, this)) {
                    this.setState((prev, props) => ({
                        currentValue: updatedValue
                    }));
                }
            } else {
                this.setState((prev, props) => ({
                    currentValue: updatedValue
                }));
            }
        }

        let mouseMove = (e) => {
            e.preventDefault();
            updateState(e);
        }

        let removeMove = (e) => {
            e.preventDefault();
            targets.forEach((target) => {
                target.removeEventListener('mousemove', mouseMove);
                target.removeEventListener('mouseup', removeMove);
            });
            outer.removeEventListener('mouseleave', removeMove);
        }

        updateState(e);

        targets.push(outer);

        if (outer.querySelector('[data-loaded-value]'))
            targets.push(outer.querySelector('[data-loaded-value]'));
        if (outer.querySelector('[data-hover-cursor]'))
            targets.push(outer.querySelector('[data-hover-cursor]'));

        targets.push(outer.querySelector('[data-current-value]'));
        targets.push(outer.querySelector('[data-seek-value]'));

        targets.forEach((target) => {
            target.addEventListener('mousemove', mouseMove);
            target.addEventListener('touchmove', mouseMove);
            target.addEventListener('touchend', removeMove);
            target.addEventListener('mouseup', removeMove);
        });

        outer.addEventListener('mouseleave', removeMove);
    }

    hoverMove(event) {
        let newValue = this.update(event);
        if (this.state.currentValue <= this.state.maxValue && this.state.currentValue >= 0) {
            this.setState((prev, props) => ({
                hoverValue: newValue
            }), () => {
                this.props.hoverContentUpdate(this.state.displayHover, (this.state.hoverValue / this.state.maxValue) * 100, this, event);
            });
        }else{
            this.setState((prev, props) => ({
                displayHover: false
            }));
        }
    }

    mouseEnter(event) {
        event.persist();
        let target = this.getOuterTarget(event);
        target.addEventListener('mousedown', this.mouseDown);
        if (this.state.hover) {
            target.addEventListener('mousemove', this.hoverMove);
            this.setState((prev, props) => ({
                displayHover: true
            }), () => {
                this.props.hoverContentUpdate(this.state.displayHover, (this.state.hoverValue / this.state.maxValue) * 100, this, event);
            });
        }
    }

    mouseLeave(event) {
        event.persist();
        let target = this.getOuterTarget(event);
        target.removeEventListener('mousedown', this.mouseDown);
        if (this.state.hover) {
            target.removeEventListener('mousemove', this.hoverMove);
            this.setState((prev, props) => ({
                displayHover: false
            }), () => {
                this.props.hoverContentUpdate(this.state.displayHover, (this.state.hoverValue / this.state.maxValue) * 100, this, event);
            });
        }
    }

    mouseOver(e) {
        if (this.state.currentValue <= this.state.maxValue && this.state.currentValue >= 0) {
            this.setState((prev, props) => ({
                displayHover: true
            }));
        } else {
            this.setState((prev, props) => ({
                displayHover: false
            }));
        }
    }

    render() {
        return (
            <div className={this.props.className} data-slider={this.props.control} onMouseEnter={this.mouseEnter} onTouchStart={this.mouseDown} onMouseLeave={this.mouseLeave}>
                <div className="max-value-slider" data-max-value={this.state.maxValue}>
                    {this.props.loading &&
                        <div className="loaded-value-slider" data-loaded-value={this.state.loadedValue} style={{ width: (this.state.loadedValue / this.state.maxValue) * 100 + '%' }}>
                        </div>
                    }
                    <div className="current-value-slider" data-current-value={this.state.currentValue} style={{ width: (this.state.currentValue / this.state.maxValue) * 100 + '%' }}>
                    </div>
                    <div className="seeker" data-seek-value={this.state.currentValue} style={{ left: (this.state.currentValue / this.state.maxValue) * 100 + '%' }}>
                    </div>
                </div>
                {this.props.hover &&
                    <React.Fragment>
                        <div className={(this.state.displayHover) ? 'hover-content' : 'hover-content hide'} data-hover-content>
                            <div className="preview-wrapper" data-current-hover={(this.state.hoverValue / this.state.maxValue) * 100}>
                                {this.props.hoverContent}
                            </div>
                        </div>
                        <div className={(this.state.displayHover) ? 'hover-cursor' : 'hover-cursor hide'} style={{ left: (this.state.hoverValue / this.state.maxValue) * 100 + '%' }} onMouseOver={this.mouseOver} data-hover-cursor>
                        </div>
                    </React.Fragment>
                }
            </div>
        )
    }
}

export default Slider;