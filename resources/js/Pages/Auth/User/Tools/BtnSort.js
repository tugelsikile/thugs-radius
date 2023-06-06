import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class BtnSort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <a className="btn-block" data-sort={this.props.sort} onClick={this.props.handleSort} href="#">
                <span className="text-dark">{this.props.name}</span>
                <span className="float-right ml-1">
                    {this.props.filter.sort.by !== this.props.sort ?
                        <FontAwesomeIcon size="2xs" icon="fa-sort" className="text-muted fa-2xs"/>
                        :
                        this.props.filter.sort.dir === 'asc' ?
                            <FontAwesomeIcon size="2xs" icon="fa-sort-down" className="text-dark fa-2xs"/>
                            :
                            <FontAwesomeIcon size="2xs" icon="fa-sort-up" className="text-dark fa-2xs"/>
                    }
                </span>
            </a>
        )
    }
}
export default BtnSort;
