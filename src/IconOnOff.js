import React from 'react';
import Toggle from './Toggle';
import Icon from './Icon';

class IconOnOff extends Toggle {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.className} data-toggle={this.props.toggle}>
                <Icon icon={this.props.icon} style={{ color: this.state.option }} control={this.state.option} action={this.toggle} />
            </div>
        )
    }
}

export default IconOnOff;