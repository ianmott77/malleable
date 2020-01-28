import React from 'react';
import Toggle from './Toggle';
import Icon from './Icon';

class IconToggle extends Toggle{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className={this.props.className} data-toggle={this.props.toggle} onClick={this.toggle} >
               <Icon icon={this.props.icon[this.state.option]} control={this.state.option} className="icon-wrap"/>
            </div> 
        )
    }
}

export default IconToggle;