import React from 'react';
import Base from './Base';

class Toggle extends Base {
    constructor(props) {
        super(props);
        this.state = {
            option: props.first
        };
        this.toggle = this.toggle.bind(this);
    }

    toggle(event) {
        if (this.props.action) {
            if ((this.props.object) ? this.props.object[this.props.action](event, this) : this.props.action(event, this)) {
                this.setState((prev, props) => ({
                    option: (prev.option == props.first) ? props.second : props.first
                }));
            }
        }else{
            this.setState((prev, props) => ({
                option: (prev.option == props.first) ? props.second : props.first
            }));
        }
    }
}

export default Toggle;