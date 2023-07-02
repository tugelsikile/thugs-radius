import React from "react";
import ReactDOM from "react-dom/client";
import {MainNavbar, MainSidebar} from "../../../Components/Layout/PlusAdmin/PlusAdminLayout";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadings : { },
            user : JSON.parse(localStorage.getItem('user')),
        }
    }
    componentDidMount() {

    }
    render() {
        return (
            <React.StrictMode>
                <MainSidebar route={this.props.route} user={this.state.user}/>
                <div className="container-fluid page-body-wrapper">
                    <MainNavbar user={this.state.user}/>

                    <div className="main-panel">
                        <div className="content-wrapper pb-0">
                            <div className="page-header flex-wrap">
                                <div className="header-left">
                                    <button className="btn btn-primary mb-2 mb-md-0 mr-2"> Create new document</button>
                                    <button className="btn btn-outline-primary bg-white mb-2 mb-md-0"> Import
                                        documents
                                    </button>
                                </div>
                                <div className="header-right d-flex flex-wrap mt-2 mt-sm-0">
                                    <div className="d-flex align-items-center">
                                        <a href="#">
                                            <p className="m-0 pr-3">Dashboard</p>
                                        </a>
                                        <a className="pl-3 mr-4" href="#">
                                            <p className="m-0">ADE-00234</p>
                                        </a>
                                    </div>
                                    <button type="button" className="btn btn-primary mt-2 mt-sm-0 btn-icon-text">
                                        <i className="mdi mdi-plus-circle"></i> Add Prodcut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="dashboard"/></React.StrictMode>);
