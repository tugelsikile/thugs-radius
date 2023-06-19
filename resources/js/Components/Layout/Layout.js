import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";
import React from "react";
import {getRootUrl} from "../Authentication";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTachometerAlt} from "@fortawesome/free-solid-svg-icons";
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
                if (props.user.meta.company.config.logo !== null) {
                    logo = props.user.meta.company.config.logo;
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
