import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class BtnSort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <a className="link-black btn-block" data-sort={this.props.sort} onClick={this.props.handleSort} href="#">
                {this.props.name}

                <span className="float-left text-muted mr-1">
                    {this.props.filter.sort.by !== this.props.sort ?
                        <FontAwesomeIcon icon="fas fa-sort fa-2xs"/>
                        :
                        this.props.filter.sort.dir === 'asc' ?
                            <FontAwesomeIcon icon="fas fa-sort-down fa-2xs"/>
                            :
                            <FontAwesomeIcon icon="fas fa-sort-up fa-2xs"/>
                    }
                </span>
            </a>
        )
    }
}
export default BtnSort;
