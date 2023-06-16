import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSort,faSortDown,faSortUp} from "@fortawesome/free-solid-svg-icons";
import Tooltip from '@mui/material/Tooltip';

// noinspection DuplicatedCode
class BtnSort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            typeof this.props.title === 'undefined' ?
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
                : this.props.title === null ?
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
                :
                <Tooltip title={this.props.title}>
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
                </Tooltip>
        )
    }
}
export default BtnSort;
