import React from 'react';
import Base from './Base';

class Icon extends Base{
    constructor(props){
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(event){
        if(this.props.object || this.props.action){
            (this.props.object) ? this.props.object[this.props.action](event, this) : this.props.action(event, this);
        }
    }
    render(){
        return(
            <div className={this.props.className +' icon'} data-control={this.props.control} onClick={this.onClick} tabIndex={this.props.tabIndex} onBlur={this.props.onBlur} style={this.props.style}>
                {this.props.icon}
            </div>
        )
    }
}

export default Icon;