import Base from './Base'

class SearchBar extends Base{
    constructor(props){
        super(props);
        this.state = {
            link: Enterwayment.website
        }
    }
    
    render(){
        return (
            <div className="input-group search-wrapper">
                <span className="input-group-btn serach-btn-wrap">
                    <a href="" className="search-btn btn btn-secondary" type="button">
                        <i class="material-icons">
                            search
                        </i>
                    </a>
                </span>
                <input type="text" className="form-control search-txt" value="" placeholder="Search" aria-label="Search" />
            </div>
        )
    }
}