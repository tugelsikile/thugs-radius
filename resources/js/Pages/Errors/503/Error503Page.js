import React from "react";
import ReactDOM from "react-dom/client";
import {EmptyHeaderAndSideBar, EmptyMainHeader} from "../../../Components/Layout/Layout";
import UnderMaintenanceImage from "../../../../../public/images/maintenance.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
class Error503Page extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <React.StrictMode>
                <EmptyHeaderAndSideBar/>
                <div className="content-wrapper" style={{minHeight:'1604.8px'}}>
                    <section className="content-header">
                        <div className="container-fluid">
                            <div className="row mb-2">
                                <div className="col-sm-6">
                                    <h1>Under Maintenance</h1>
                                </div>
                                <div className="col-sm-6">
                                    <ol className="breadcrumb float-sm-right">
                                        <li className="breadcrumb-item"><a href="">Home</a></li>
                                        <li className="breadcrumb-item active">Under Maintenance Page</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="content">
                        <div className="error-page">
                            <h2 className="headline text-danger">
                                <img src={UnderMaintenanceImage} height={100}/>
                            </h2>

                            <div className="error-content">
                                <h3>
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger mr-2"/>
                                    We Are Sorry !
                                </h3>
                                <p>
                                    Our site currently under maintenance. Please be back in other times
                                </p>
                            </div>
                        </div>

                    </section>
                </div>
            </React.StrictMode>
        )
    }
}
export default Error503Page;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><Error503Page/></React.StrictMode>);
