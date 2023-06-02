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
                        <FontAwesomeIcon icon="fas fa-sort fa-2xs" className="text-muted"/>
                        :
                        this.props.filter.sort.dir === 'asc' ?
                            <FontAwesomeIcon icon="fas fa-sort-down fa-2xs" className="text-dark"/>
                            :
                            <FontAwesomeIcon icon="fas fa-sort-up fa-2xs" className="text-dark"/>
                    }
                </span>
            </a>
        )
    }
}
export default BtnSort;
