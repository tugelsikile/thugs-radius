import React from "react";
import {getRootUrl} from "../Authentication";

class PageTitle extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>{this.props.title}</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item"><a href={getRootUrl()}>Home</a></li>
                                {this.props.childrens.length > 0 &&
                                    this.props.childrens.map((item, index)=>
                                        <li key={index} className="breadcrumb-item"><a href={item.url}>{item.label}</a></li>
                                    )
                                }
                                <li className="breadcrumb-item active">{this.props.title}</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}
export default PageTitle;
