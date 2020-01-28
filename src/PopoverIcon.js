import React from 'react';
import Base from './Base';
import Icon from './Icon';

class PopoverIcon extends Base {
    constructor(props) {
        super(props)
        this.state = {
            showing: false
        }
        this.toggleShowing = this.toggleShowing.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.adjustPopupPosition = this.adjustPopupPosition.bind(this);
        this.listnersAdded = false;
    }

    toggleShowing(e) {
        if (this.props.object || this.props.action) {
            if ((this.props.object) ? this.props.object[this.props.action](event, this) : this.props.action(event, this)) {
                (!this.state.showing) ? this.show(e) : this.hide(e);
            }
        } else {
            (!this.state.showing) ? this.show(e) : this.hide(e);
        }
    }

    show(e) {
        let target = e.target;
        while (!String(target.className).match('popover-wrapper'))
            target = target.parentElement;

        this.setState((prev, props) => ({
            showing: true
        }), () => {
            let content = target.querySelector('.popover-content');
            let button = target.querySelector('.popover-button');
            this.adjustPopupPosition(content, button);
            if (!this.listnersAdded && this.props.adjustEvents) {
                this.props.adjustEvents.forEach((event)=> {
                    window.addEventListener(event, (e) => {
                        this.adjustPopupPosition(content, button)
                    });
                });
                this.listnersAdded = true;
            }
        });
    }

    adjustPopupPosition(content, button) {
        content.style.marginLeft = -(content.getBoundingClientRect().width / 2) + 15 + 'px';
        content.style.marginTop = -(content.getBoundingClientRect().height + 7.5) + 'px';
    }

    hide(e) {
        let target = e.target;
        while (!String(target.className).match('popover-wrapper'))
            target = target.parentElement;

        this.setState((prev, props) => ({
            showing: false
        }), () => {
            let content = target.querySelector('.popover-content');
            content.removeAttribute('style');
        });
    }

    render() {
        return (
            <div className={"popover-wrapper " + this.props.className} tabIndex="1" data-control={this.props.control} onBlurCapture={this.hide}>
                <div className={(!this.state.showing) ? "popover-content hide" : "popover-content"} data-popover-content>
                    {this.props.content}
                </div>
                <Icon className="popover-button control" icon={this.props.icon} control={this.props.control} action={this.toggleShowing} />
            </div>
        )
    }
}

export default PopoverIcon;