import React from "react";
import {ToastContainer} from "react-toastify";
import {showError} from "../Toaster";
import {updateLang} from "../../Services/AuthService";
import DigitalClock from "./DigitalClock";
import {customPreventDefault} from "../mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class MainHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
        }
        this.setLocaleLang = this.setLocaleLang.bind(this);
    }
    componentDidMount() {
        Lang.setLocale(localStorage.getItem('locale_lang'));
    }
    async setLocaleLang(e) {
        e.preventDefault();
        if (! this.state.loading) {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                let curLocale = localStorage.getItem('locale_lang');
                formData.append('lang', curLocale === 'id' ? 'en' : 'id');
                let response = await updateLang(formData);
                if (response.data.params === null) {
                    showError(response.data.message);
                    this.setState({loading:false});
                } else {
                    this.setState({loading:false});
                    localStorage.setItem('locale_lang', response.data.params);
                    Lang.setLocale(response.data.params);
                    window.location.reload();
                }
            } catch (e) {
                this.setState({loading:false});
                showError(e.response.data.message);
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <ToastContainer theme="light" pauseOnFocusLoss autoClose={2000} position="top-right" closeOnClick/>

                <nav className="main-header navbar layout-navbar-fixed navbar-expand navbar-white navbar-light">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" data-widget="pushmenu" href="#" role="button"><FontAwesomeIcon icon="bars"/></a>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <a title="Server Time (LIVE)" href="#" onClick={customPreventDefault} className="nav-link pl-0"><DigitalClock/></a>
                        </li>
                        {/*<li className="nav-item d-none d-sm-inline-block">
                            <a href={window.origin} className="nav-link">Contact</a>
                        </li>*/}
                    </ul>

                    <ul className="navbar-nav ml-auto">
                        {/*<li className="nav-item dropdown">
                            <a className="nav-link" data-toggle="dropdown" href="#">
                                <i className="far fa-comments"/>
                                <span className="badge badge-danger navbar-badge">3</span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                <a href="#" className="dropdown-item">
                                    <div className="media">
                                        <img src={window.origin + '/theme/adminlte/img/user1-128x128.jpg'} alt="User Avatar" className="img-size-50 mr-3 img-circle"/>
                                        <div className="media-body">
                                            <h3 className="dropdown-item-title">
                                                Brad Diesel
                                                <span className="float-right text-sm text-danger"><i className="fas fa-star"/></span>
                                            </h3>
                                            <p className="text-sm">Call me whenever you can...</p>
                                            <p className="text-sm text-muted"><i className="far fa-clock mr-1"/> 4 Hours Ago</p>
                                        </div>
                                    </div>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item">
                                    <div className="media">
                                        <img src={window.origin + '/theme/adminlte/img/user8-128x128.jpg'} alt="User Avatar" className="img-size-50 img-circle mr-3"/>
                                        <div className="media-body">
                                            <h3 className="dropdown-item-title">
                                                John Pierce
                                                <span className="float-right text-sm text-muted"><i className="fas fa-star"/></span>
                                            </h3>
                                            <p className="text-sm">I got your message bro</p>
                                            <p className="text-sm text-muted"><i className="far fa-clock mr-1"/> 4 Hours Ago</p>
                                        </div>
                                    </div>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item">
                                    <div className="media">
                                        <img src={window.origin + '/theme/adminlte/img/user3-128x128.jpg'} alt="User Avatar" className="img-size-50 img-circle mr-3"/>
                                        <div className="media-body">
                                            <h3 className="dropdown-item-title">
                                                Nora Silvester
                                                <span className="float-right text-sm text-warning"><i className="fas fa-star"/></span>
                                            </h3>
                                            <p className="text-sm">The subject goes here</p>
                                            <p className="text-sm text-muted"><i className="far fa-clock mr-1"/> 4 Hours Ago</p>
                                        </div>
                                    </div>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item dropdown-footer">See All Messages</a>
                            </div>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link" data-toggle="dropdown" href="#">
                                <i className="far fa-bell"/>
                                <span className="badge badge-warning navbar-badge">15</span>
                            </a>
                            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                                <span className="dropdown-item dropdown-header">15 Notifications</span>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item">
                                    <i className="fas fa-envelope mr-2"/> 4 new messages
                                    <span className="float-right text-muted text-sm">3 mins</span>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item">
                                    <i className="fas fa-users mr-2"/> 8 friend requests
                                    <span className="float-right text-muted text-sm">12 hours</span>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item">
                                    <i className="fas fa-file mr-2"/> 3 new reports
                                    <span className="float-right text-muted text-sm">2 days</span>
                                </a>
                                <div className="dropdown-divider"/>
                                <a href="#" className="dropdown-item dropdown-footer">See All Notifications</a>
                            </div>
                        </li>*/}
                        <li className="nav-item">
                            <a className="nav-link" data-widget="fullscreen" href="#" role="button">
                                <FontAwesomeIcon icon="expand-arrows-alt"/>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a title="Set Language" onClick={this.setLocaleLang} className="nav-link" href="#" role="button">
                                {
                                    localStorage.getItem('locale_lang') === 'id' ?
                                        <img alt="id" src={window.origin + '/flag_indonesia.png'} style={{height:20}}/>
                                        :
                                        <img alt="en" src={window.origin + '/flag_usa.png'} style={{height:20}}/>
                                }
                            </a>
                        </li>
                    </ul>
                </nav>
            </React.Fragment>
        )
    }
}

export default MainHeader;
