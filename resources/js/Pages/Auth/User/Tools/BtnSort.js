import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSort,faSortDown,faSortUp} from "@fortawesome/free-solid-svg-icons";

class BtnSort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <a className={typeof this.props.center === 'undefined' ? "btn-block" : this.props.center ? "btn-block text-center" : "btn-block"} data-sort={this.props.sort} onClick={this.props.handleSort} href="#">
                <span className="text-dark">{this.props.name}</span>
                <span className="float-right ml-1">
                    {this.props.filter.sort.by !== this.props.sort ?
                        <FontAwesomeIcon size="2xs" icon={faSort} className="text-muted fa-2xs"/>
                        :
                        this.props.filter.sort.dir === 'asc' ?
                            <FontAwesomeIcon size="2xs" icon={faSortDown} className="text-dark fa-2xs"/>
                            :
                            <FontAwesomeIcon size="2xs" icon={faSortUp} className="text-dark fa-2xs"/>
                    }
                </span>
            </a>
        )
    }
}
export default BtnSort;
