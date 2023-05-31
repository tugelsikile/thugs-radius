import React from "react";
import Icon from "@mdi/react";
import {mdiSortAlphabeticalAscending, mdiSortAlphabeticalDescending, mdiSortReverseVariant} from "@mdi/js";

class BtnSort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <a className="link-black btn-block" data-sort={this.props.sort} onClick={this.props.handleSort} href="#">
                {this.props.name}
                {this.props.filter.sort.by !== this.props.sort ?
                    <span className="float-left text-muted mr-1"><Icon path={mdiSortReverseVariant} size={1} /></span>
                    :
                    this.props.filter.sort.dir === 'asc' ?
                        <span className="float-left mr-1"><Icon path={mdiSortAlphabeticalDescending} size={1} /></span>
                        :
                        <span className="float-left mr-1"><Icon path={mdiSortAlphabeticalAscending} size={1} /></span>
                }
            </a>
        )
    }
}
export default BtnSort;
