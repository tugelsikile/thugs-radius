import React from "react";
import {getRootUrl, logout} from "../../Authentication";

export const MainSidebar = (props) => {
    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
                {props.user !== null &&
                    <React.Fragment>
                        <li className="nav-item nav-profile border-bottom">
                            <a href="#" className="nav-link flex-column">
                                <div className="nav-profile-image">
                                    <img src={props.user.meta.avatar} alt="profile" style={{width:65,height:65}}/>
                                </div>
                                <div className="nav-profile-text d-flex ml-0 mb-3 flex-column">
                                    <span className="font-weight-semibold mb-1 mt-2 text-center">{props.user.label}</span>
                                    <span className="text-secondary icon-sm text-center">$3499.00</span>
                                </div>
                            </a>
                        </li>
                        <li className="nav-item pt-3">
                            <a className="nav-link d-block" href={getRootUrl()}>

                            </a>
                        </li>
                        <li className="nav-item nav-dashboard">
                            <a className="nav-link" href={getRootUrl()}>
                                <i className="mdi mdi-compass-outline menu-icon"></i>
                                <span className="menu-title">Dashboard</span>
                            </a>
                        </li>
                        <li className="nav-item nav-service">
                            <a className="nav-link" href={getRootUrl() + '/service'}>
                                <i className="mdi mdi-room-service menu-icon"></i>
                                <span className="menu-title">{Lang.get('customers.menus.service')}</span>
                            </a>
                        </li>
                        <li className="nav-item nav-invoice">
                            <a className="nav-link" href={getRootUrl() + '/invoice'}>
                                <i className="mdi mdi-cash-multiple menu-icon"></i>
                                <span className="menu-title">{Lang.get('customers.menus.invoice')}</span>
                            </a>
                        </li>
                    </React.Fragment>
                }
            </ul>
        </nav>
    )
}
import Logo from "../../../../../public/images/logo-1.png";
export const MainNavbar = (props) => {
    return (
        <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
            <div className="navbar-menu-wrapper d-flex align-items-stretch">
                <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
                    <span className="mdi mdi-chevron-double-left"></span>
                </button>
                <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
                    {props.user === null ?
                        <a className="navbar-brand brand-logo-mini" href={getRootUrl()}><img src={Logo} alt="logo"/></a>
                        :
                        props.user.meta.company === null ?
                            <a className="navbar-brand brand-logo-mini" href={getRootUrl()}><img src={Logo} alt="logo"/></a>
                            : props.user.meta.company.config === null ?
                                <a className="navbar-brand brand-logo-mini" href={getRootUrl()}><img src={Logo} alt="logo"/></a>
                                :
                                props.user.meta.company.config.logo === null ?
                                    <a className="navbar-brand brand-logo-mini" href={getRootUrl()}><img src={Logo} alt="logo"/></a>
                                    :
                                    <a className="navbar-brand brand-logo-mini img-circle" href={getRootUrl()}><img className="img-fluid img-circle" style={{height:30}} src={props.user.meta.company.config.logo} alt="logo"/></a>
                    }
                </div>
                <ul className="navbar-nav">
                    <li className="nav-item dropdown">
                        <a className="nav-link" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
                            <i className="mdi mdi-email-outline"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-left navbar-dropdown preview-list" aria-labelledby="messageDropdown">
                            <h6 className="p-3 mb-0 font-weight-semibold">Messages</h6>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <img src="../assets/images/faces/face1.jpg" alt="image" className="profile-pic"/>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject ellipsis mb-1 font-weight-normal">Mark send you a message</h6>
                                    <p className="text-gray mb-0"> 1 Minutes ago </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <img src="../assets/images/faces/face6.jpg" alt="image" className="profile-pic"/>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject ellipsis mb-1 font-weight-normal">Cregh send you a message</h6>
                                    <p className="text-gray mb-0"> 15 Minutes ago </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <img src="../assets/images/faces/face7.jpg" alt="image" className="profile-pic"/>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject ellipsis mb-1 font-weight-normal">Profile picture updated</h6>
                                    <p className="text-gray mb-0"> 18 Minutes ago </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <h6 className="p-3 mb-0 text-center text-primary font-13">4 new messages</h6>
                        </div>
                    </li>
                    <li className="nav-item dropdown ml-3">
                        <a className="nav-link" id="notificationDropdown" href="#" data-toggle="dropdown">
                            <i className="mdi mdi-bell-outline"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-left navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
                            <h6 className="px-3 py-3 font-weight-semibold mb-0">Notifications</h6>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-success">
                                        <i className="mdi mdi-calendar"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject font-weight-normal mb-0">New order recieved</h6>
                                    <p className="text-gray ellipsis mb-0"> 45 sec ago </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-warning">
                                        <i className="mdi mdi-settings"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject font-weight-normal mb-0">Server limit reached</h6>
                                    <p className="text-gray ellipsis mb-0"> 55 sec ago </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-info">
                                        <i className="mdi mdi-link-variant"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                                    <h6 className="preview-subject font-weight-normal mb-0">Kevin karvelle</h6>
                                    <p className="text-gray ellipsis mb-0"> 11:09 PM </p>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <h6 className="p-3 font-13 mb-0 text-primary text-center">View all notifications</h6>
                        </div>
                    </li>
                </ul>
                <ul className="navbar-nav navbar-nav-right">
                    <li className="nav-item nav-profile dropdown d-none d-md-block">
                        <a className="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
                            <div className="nav-profile-text">{localStorage.getItem('locale_lang') === 'id' ? 'Bahasa Indonesia' : 'English US'}</div>
                        </a>
                        <div className="dropdown-menu center navbar-dropdown" aria-labelledby="profileDropdown">
                            {localStorage.getItem('locale_lang') !== 'id' &&
                                <a lang="id" onClick={langSwitch} className="dropdown-item" href="#"><i className="flag-icon flag-icon-id mr-3"/> Bahasa Indonesia </a>
                            }
                            {localStorage.getItem('locale_lang') !== 'en' &&
                                <a lang="en" onClick={langSwitch} className="dropdown-item" href="#"><i className="flag-icon flag-icon-us mr-3"/> English US</a>
                            }
                        </div>
                    </li>
                    <li className="nav-item nav-logout d-none d-lg-block">
                        <a onClick={()=>logout()} className="nav-link" href="#">
                            <i className="mdi mdi-logout-variant mr-2"/> LOGOUT
                        </a>
                    </li>
                </ul>
                <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
                    <span className="mdi mdi-menu"></span>
                </button>
            </div>
        </nav>
    )
}
export const langSwitch = (event)=> {
    if (event.currentTarget.getAttribute('lang') !== null) {
        localStorage.setItem('locale_lang', event.currentTarget.getAttribute('lang'));
        window.location.reload();
    }
}
