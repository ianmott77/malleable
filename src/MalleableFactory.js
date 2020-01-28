import React from 'react'
import Malleable from './Malleable'

class MalleableFactory extends React.Component{
    static playerInit(obj){
        if(obj.props.name && obj.props.id){
            if(!window[obj.props.id])
                window[obj.props.id] = {}
                
            window[obj.props.id][obj.props.name] = obj;
        }
    }

    static newPlayer(id, container, icons, config){
        return <Malleable id={id} name="malleable" icons={icons} config={config} init={MalleableFactory.playerInit} container={container} />
    }
}

export default MalleableFactory;