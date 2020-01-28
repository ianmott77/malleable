import React from 'react';
import Base from './Base';

class IonIcon extends Base{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <ion-icon name={this.props.name}></ion-icon>
        )
    }
}

export default IonIcon;