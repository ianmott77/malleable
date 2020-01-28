import React from 'react';

class Base extends React.Component{
    constructor(props){
        super(props);
        this.init = this.init.bind(this);
        this.init();
    }

    init(){
        if(this.props.init) this.props.init(this);
    }
}

export default Base;