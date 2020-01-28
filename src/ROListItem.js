import React from 'react'
import Base from './Base'

class ROListItem extends Base {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <li className={this.props.className + ' ro-list-item'} data-src-num={this.props.srcNum} data-src={this.props.src} data-num={this.props.num} data-queue-num={this.props.queuePos} data-background={this.props.background} data-name={this.props.name} data-type={this.props.type} data-artist={this.props.artist}>
                {this.props.listItemContent}
            </li>
        )
    }
}

export default ROListItem;