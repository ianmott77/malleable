import React from 'react'
import ReactDOM from 'react-dom'
import Base from './Base'
import ROListItem from './ROListItem'
import Icon from './Icon'

class ROList extends Base {
    constructor(props) {
        super(props)
        this.add = this.add.bind(this);
        this.setContainer = this.setContainer.bind(this)
        this.id = this.props.id
        this.items = new Array()
        this.state = {
            container: this.props.container,
            items: this.items

        }
    }

    componentDidMount(){
        
    }

    setContainer(container){
        this.setState((prev, props) => ( {
            container: container
        }))
    }

    static findOuterListItemElement(event){
        let target = event.target
        while(target.tagName != 'LI')
            target = target.parentElement
        
        return target;
    }

    add(listItem) {
        this.items.push(<ROListItem id={this.id} key={this.items.length} name={'listItem_' + this.items.length} src={listItem.src} srcNum={listItem.num} queuePos={listItem.queuePos} background={listItem.background} name={listItem.name} type={listItem.type} artist={listItem.artist} init={this.props.init} listItemContent={
            <div className="playlist-item" >
                <div className="playlist-item-controls">
                    <Icon className="control reorder" name="move_item" id={this.id} init={this.props.init} icon={window[this.id].icons.move_item} control="move_item" />
                    <div className="artwork-thumbnail control">
                        <img src={listItem.background} />
                    </div>
                    <span data-control="play_item">
                        <div className="item-title">
                            {listItem.name}
                        </div>
                        <div className="item-artist">
                            {listItem.artist}
                        </div>
                    </span>
                    <Icon name="remove_item" className="control" id={this.id} init={this.props.init} icon={window[this.id].icons.remove_item} control="remove_item" />
                </div>
            </div>
        } />)

        this.setState((prev, props) => ({
            items: this.items
        }))
    }

    render() {
        return (
            <ul className={this.props.className} data-info={this.props.control}>
                {this.state.items}
            </ul>
        )
    }
}

export default ROList;