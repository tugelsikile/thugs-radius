import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";
import React from "react";
import {getRootUrl, logout} from "../Authentication";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faBars,
    faExpandArrowsAlt,
    faList,
    faPowerOff,
    faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";
import {ToastContainer} from "react-toastify";
import DigitalClock from "./DigitalClock";
import {listSupportedLanguage} from "../mixedConsts";
import {Skeleton} from "@mui/material";
import {MenuIcon} from "../../Pages/Client/User/Privilege/Tools/IconTool";
const changeFavIcon = (props) => {
    let logo = `${window.origin}/images/logo-1.png`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    if (props.user !== null) {
        if (props.user.meta.company !== null) {
            if (props.user.meta.company.config !== null) {
                if (typeof props.user.meta.company.config.logo !== 'undefined') {
                    if (props.user.meta.company.config.logo !== null) {
                        logo = props.user.meta.company.config.logo;
                    }
                }
            }
        }
    }
    link.href = logo;
}
export const HeaderAndSideBar = (props) => {
    changeFavIcon(props);
    return (
        <React.Fragment>
            <MainHeader loadings={props.loadings} root={props.root} user={props.user} site={props.site}/>
            <MainSidebar loadings={props.loadings} route={props.route} site={props.site} menus={props.menus} root={props.root} user={props.user}/>
        </React.Fragment>
    )
}
export const EmptyMainSidebar2 = () => {

}
export const EmptyMainSidebar = (props) => {
    return (
        <React.Fragment>
            <aside id="app-main-sidebar" className="main-sidebar layout-fixed sidebar-light-navy elevation-4 text-sm">
                {typeof props.loadings === 'undefined' ?
                    <EmptySidebarBrand/>
                    :
                    props.loadings !== null &&
                    props.loadings.site ?
                        <Skeleton animation="wave" variant="rectangular" height={50} />
                        :
                        <SideBarBrand site={props.site} user={props.user}/>
                }
                <div className="sidebar">
                    {typeof props.user !== "undefined" && <SideBarUser user={props.user}/>}

                    <nav className="mt-2">
                        <ul className="nav nav-flat nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu" data-accordion="false">
                            {typeof props.steps !== 'undefined' && props.steps !== null &&
                                [0,1,2,3,4,5,6,7,8,9].map((item)=>
                                    item <= props.steps.max &&
                                    <li key={`sbMenu_${item}`} className="nav-item">
                                        <a onClick={props.onStep} data-step={item} href="#" className={props.steps.current === item ? 'nav-link active' : 'nav-link'}>
                                            <FontAwesomeIcon style={{height:'12px'}} icon={MenuIcon(Lang.get(`wizard.steps.${item}.icon`))} className="nav-icon" size="xs"/>
                                            <p>{Lang.get(`wizard.steps.${item}.menu`)}</p>
                                        </a>
                                    </li>
                                )
                            }
                            {typeof props.loadings === 'undefined' ? null :
                                props.loadings !== null &&
                                props.loadings.privilege ?
                                    <Skeleton className="mx-2" animation="wave" variant="rectangular" height={30}/>
                                    :
                                    <li className="nav-item">
                                        <a onClick={(e)=>{e.preventDefault();logout();}} href="#" className="nav-link">
                                            <FontAwesomeIcon style={{height:'12px'}} size="xs" icon={faPowerOff} className="nav-icon text-danger"/>
                                            <p className="text text-danger text-sm">{Lang.get('messages.users.labels.sign_out')}</p>
                                        </a>
                                    </li>
                            }
                        </ul>
                    </nav>
                </div>
            </aside>
        </React.Fragment>
    )
}
export const EmptyMainHeader = (props)=> {
    return (
        <React.Fragment>
            <ToastContainer theme="light" pauseOnFocusLoss autoClose={10000} position="top-right" closeOnClick/>
            <nav className="main-header navbar layout-navbar-fixed navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button"><FontAwesomeIcon icon={faBars}/></a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">

                    </li>
                </ul>
                <ul className="navbar-nav ml-auto">
                </ul>
            </nav>
        </React.Fragment>
    )
}
export const EmptyHeaderAndSideBar = (props) => {
    return (
        <React.Fragment>
            <EmptyMainHeader/>
            <EmptyMainSidebar onStep={props.onStep} steps={props.steps} loadings={props.loadings} user={props.user}/>
        </React.Fragment>
    )
}
export const SideBarBrand = (props) => {
    return (
        props.user === null ?
            <DefaultSideBarBrand site={props.site}/>
            :
            props.user.meta.company === null ?
                <DefaultSideBarBrand site={props.site}/>
                :
                props.user.meta.company.config === null ?
                    <CompanySideBarBrand site={props.site} user={props.user}/>
                    :
                    typeof props.user.meta.company.config.logo === 'undefined' ?
                        <DefaultSideBarBrand site={props.site}/>
                        :
                        props.user.meta.company.config.logo === null ?
                            <CompanySideBarBrand site={props.site} user={props.user}/>
                            :
                            <CompanySideBarBrandLogo site={props.site} user={props.user}/>
    );
}
export const CompanySideBarBrandLogo = (props) => {
    return (
        <a href={getRootUrl()} className="brand-link bg-navy">
            <img src={props.user.meta.company.config.logo} alt={props.user.meta.company.name} className="brand-image img-circle elevation-3" style={{opacity:.8}}/>
            <span className="brand-text font-weight-light">{props.user.meta.company.name}</span>
        </a>
    )
}
export const EmptySidebarBrand = () => {
    return (
        <a href={window.origin} className="brand-link bg-navy">
            <img src={`${window.origin}/images/logo-1.png`} alt="" className="brand-image img-circle elevation-3" style={{opacity:.8}}/>
            <span className="brand-text font-weight-light">&nbsp;</span>
        </a>
    );
}
export const CompanySideBarBrand = (props) => {
    return (
        <a href={getRootUrl()} className="brand-link bg-navy">
            <img src={`${window.origin}/images/logo-1.png`} alt={props.user.meta.company.name} className="brand-image img-circle elevation-3" style={{opacity:.8}}/>
            <span className="brand-text font-weight-light">{props.user.meta.company.name}</span>
        </a>
    )
}
export const DefaultSideBarBrand = (props) => {
    return (
        <a href={getRootUrl()} className="brand-link bg-navy">
            <img src={`${window.origin}/images/logo-1.png`} alt={props.site !== null ? props.site.name : 'app-name'} className="brand-image img-circle elevation-3" style={{opacity:.8}}/>
            <span className="brand-text font-weight-light">{props.site !== null && props.site.name}</span>
        </a>
    )
}
export const SideBarUser = (props) => {
    return (
        props.user === null ? null
            :
            <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                <div className="image">
                    <img src={props.user.meta.avatar} className="img-circle elevation-2" alt={props.user.label}/>
                </div>
                <div className="info">
                    <a href={`${window.origin}/profile/${props.user.value}`} className="d-block">{props.user.label}</a>
                </div>
            </div>
    )
}
export const SideBarMenuDashboard = (props) => {
    return (
        <li className={['auth','clients'].indexOf(props.route) !== -1 ? 'nav-item active' : 'nav-item'}>
            <a href={getRootUrl()} className={['auth','clients'].indexOf(props.route) !== -1 ? 'nav-link active' : 'nav-link'}>
                <FontAwesomeIcon style={{height:'12px'}} icon={faTachometerAlt} className="nav-icon mr-1"/>
                <p>Dashboard</p>
            </a>
        </li>
    );
}
