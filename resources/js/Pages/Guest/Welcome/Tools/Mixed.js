import React from "react";
import Logo from "../../../../../../public/images/logo-1.png";
import BannerImage from "../../../../../../public/theme/gariox/images/banner-img.png";
import FooterBg from "../../../../../../public/theme/gariox/images/footer-logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faThumbsDown, faThumbsUp, faTimesCircle, faUser} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowsAltV,
    faBars,
    faHouseCircleCheck,
    faPlus,
    faSearch, faTimes,
    faUserCheck,
    faUserPen
} from "@fortawesome/free-solid-svg-icons";
import ReactHtmlParser from "react-html-parser";
import ServiceImg1 from "../../../../../../public/images/server-icon.svg";
import ServiceImg2 from "../../../../../../public/images/cloud-computing.png";
import ServiceImg3 from "../../../../../../public/images/payment-method.png";
import ServiceImg4 from "../../../../../../public/images/easy.png";
import ServiceImg5 from "../../../../../../public/images/24-hours-support.png";
import {MenuIcon} from "../../../Client/User/Privilege/Tools/IconTool";

export const HeaderSection = () => {
    return (
        <div className="header_section">
            <div className="container">
                <div className="main">
                    <div className="logo"><a href={window.origin}><img alt="logo" style={{height:50}} src={Logo}/></a></div>
                    <div className="menu_text">
                        <ul>
                            <div className="togle_">
                                <div className="menu_main">
                                    <ul>
                                        <li>
                                            <a href={`${window.origin}/login`}>
                                                <FontAwesomeIcon className="mr-3" icon={faUser}/>
                                                login
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                {/*<div className="shoping_bag"><FontAwesomeIcon icon={faSearch}/></div>*/}
                            </div>
                            <div id="myNav" className="overlay">
                                <a href="#" className="closebtn" onClick={(e)=>{e.preventDefault();window.closeNav();}}>
                                    <FontAwesomeIcon icon={faTimes}/>
                                </a>
                                <div className="overlay-content mt-5">
                                    <a href="#index.html">Home</a>
                                    <a href="#services.html">{Lang.get('home.services.label')}</a>
                                    <a href="#stories.html">{Lang.get('home.package.title')}</a>
                                    <a href="#team.html">{Lang.get('home.register-step.title')}</a>
                                    <a href={`${window.origin}/login`}>{Lang.get('messages.users.labels.signin_button')}</a>
                                </div>
                            </div>
                            <span className="navbar-toggler-icon"/>
                            <span style={{cursor:'pointer'}} onClick={()=>window.openNav()}>
                                <FontAwesomeIcon icon={faBars} className="toggle_menu"/>
                            </span>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const BannerSection = () => {
    return (
        <div className="banner_section layout_padding">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <h1 className="banner_taital">{ReactHtmlParser(Lang.get('home.banners.title'))}</h1>
                        <p className="banner_text">
                            {Lang.get('home.banners.text')}
                        </p>
                        <div className="btn_main">
                            {/*<div className="contact_bt_1"><a href="#">
                                <span className="contact_padding">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </span>Discover</a></div>
                            <div className="contact_bt active"><a href="contact.html">Contact Now</a></div>*/}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div><img src={BannerImage} className="image_1"/></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const ServiceSection = () => {
    return (
        <React.Fragment>
            <div id="services.html" className="services_section layout_padding">
                <div className="container">
                    <h1 className="services_taital">{Lang.get('home.services.label')}</h1>
                </div>
            </div>
            <ServiceSection2/>
        </React.Fragment>
    )
}
export const ServiceSection2 = () => {
    return (
        <div className="services_section_2">
            <div className="container">
                <div className="box_section_main">
                    <div className="box_main">
                        <div className="images_1"><img alt="img-1" src={ServiceImg1}/></div>
                        <h4 className="power_full_text">{Lang.get('home.services.router.title')}</h4>
                        <p className="dummy_text">{Lang.get('home.services.router.text')}</p>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img alt="img-2" src={ServiceImg2}/></div>
                        <h4 className="power_full_text">{Lang.get('home.services.database.title')}</h4>
                        <p className="dummy_text">{Lang.get('home.services.database.text')}</p>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img  alt="img-2" src={ServiceImg3}/></div>
                        <h4 className="power_full_text">{Lang.get('home.services.payment.title')}</h4>
                        <p className="dummy_text">{Lang.get('home.services.payment.text')}</p>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img alt="img-4" src={ServiceImg4}/></div>
                        <h4 className="power_full_text">{Lang.get('home.services.easy.title')}</h4>
                        <p className="dummy_text">{Lang.get('home.services.easy.text')}</p>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img alt="img-5" src={ServiceImg5}/></div>
                        <h4 className="power_full_text">{Lang.get('home.services.support.title')}</h4>
                        <p className="dummy_text">{Lang.get('home.services.support.text')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export const AboutSection = () => {
    return (
        <div id="about.html" className="about_section layout_padding">
            <div className="container">
                {/*<div className="row">
                    <div className="col-md-4">
                        <div className="about_taital_main">
                            <h1 className="about_taital">About Us</h1>
                            <p className="about_text">It is a long established fact that a reader will be e readable content</p>
                            <div className="read_bt_1"><a href="#">Read More</a></div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="images_main">
                            <div className="mobile_img1"><img src="images/mobile-img-1.png"/></div>
                            <div className="mobile_img1"><img src="images/mobile-img-2.png"/></div>
                            <div className="mobile_img1"><img src="images/mobile-img-1.png"/></div>
                        </div>
                    </div>
                </div>*/}
            </div>
        </div>
    );
}
export const WorkSection = () => {
    return (
        <div id="team.html" className="work_section layout_padding">
            <div className="container">
                <div className="work_taital_main">
                    <h1 className="work_taital">{Lang.get('home.register-step.title')}</h1>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><FontAwesomeIcon className="text-dark" icon={faUserPen} size="3x"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">{Lang.get('home.register-step.one.title')}</h3>
                            <p className="lorem_text">{Lang.get('home.register-step.one.text')}</p>
                        </div>
                    </div>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><FontAwesomeIcon className="text-dark" icon={faUserCheck} size="3x"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">{Lang.get('home.register-step.two.title')}</h3>
                            <p className="lorem_text">{Lang.get('home.register-step.two.text')}</p>
                        </div>
                    </div>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><FontAwesomeIcon className="text-dark" icon={faHouseCircleCheck} size="3x"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">{Lang.get('home.register-step.three.title')}</h3>
                            <p className="lorem_text">{Lang.get('home.register-step.three.text')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const FooterSectionMain = () => {
    return (
        <div className="footer_section_main">
            <div className="footer_bg">
                <img src={FooterBg}/>
            </div>
            <div id="stories.html" className="stories_section layout_padding">
                <div className="container">
                    <h1 className="stories_taital">{Lang.get('home.package.title')}</h1>
                    <div className="">
                        <div className="stories_section_2 layout_padding">
                            <div className="row">
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box" style={{minHeight:350}}>
                                        <div className="image_6"><img alt="logo" style={{height:100}} src={Logo}/></div>
                                        <h3 className="teration_text">{Lang.get('home.package.basic.title')}</h3>
                                        <p className="date_text">{Lang.get('home.package.basic.price',{Attribute:'75.000'})}</p>
                                        <p className="ipsum_text">
                                            {Lang.get('home.package.basic.text')}
                                        </p>
                                        <ul className="mt-2 ipsum_text">
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.basic.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.basic.list.color')}`}/> {Lang.get('home.package.basic.list.one')}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.basic.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.basic.list.color')}`}/> {Lang.get('home.package.basic.list.two',{Attribute:'2'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.basic.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.basic.list.color')}`}/> {Lang.get('home.package.basic.list.three',{Attribute:'2'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.basic.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.basic.list.color')}`}/> {Lang.get('home.package.basic.list.four',{Attribute:'200'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.basic.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.basic.list.color')}`}/> {Lang.get('home.package.basic.list.five',{Attribute:'2.000'})}</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box" style={{minHeight:350}}>
                                        <div className="image_6"><img alt="logo" style={{height:100}} src={Logo}/></div>
                                        <h3 className="teration_text">{Lang.get('home.package.intermediate.title')}</h3>
                                        <p className="date_text">{Lang.get('home.package.intermediate.price',{Attribute:'200.000'})}</p>
                                        <p className="ipsum_text">
                                            {Lang.get('home.package.intermediate.text')}
                                        </p>
                                        <ul className="mt-2 ipsum_text">
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.intermediate.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.intermediate.list.color')}`}/> {Lang.get('home.package.intermediate.list.one')}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.intermediate.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.intermediate.list.color')}`}/> {Lang.get('home.package.intermediate.list.two',{Attribute:'5'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.intermediate.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.intermediate.list.color')}`}/> {Lang.get('home.package.intermediate.list.three',{Attribute:'5'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.intermediate.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.intermediate.list.color')}`}/> {Lang.get('home.package.intermediate.list.four',{Attribute:'700'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.intermediate.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.intermediate.list.color')}`}/> {Lang.get('home.package.intermediate.list.five',{Attribute:'10.000'})}</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box bg-info" style={{minHeight:350}}>
                                        <div className="image_6"><img alt="logo" style={{height:100}} src={Logo}/></div>
                                        <h3 className="teration_text">{Lang.get('home.package.isp.title')}</h3>
                                        <p className="date_text">{Lang.get('home.package.isp.price')}</p>
                                        <p className="ipsum_text">
                                            {Lang.get('home.package.isp.text')}
                                        </p>
                                        <ul className="mt-2 ipsum_text">
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.isp.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.isp.list.color')}`}/> {Lang.get('home.package.isp.list.one')}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.isp.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.isp.list.color')}`}/> {Lang.get('home.package.isp.list.two',{Attribute:'5'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.isp.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.isp.list.color')}`}/> {Lang.get('home.package.isp.list.three',{Attribute:'5'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.isp.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.isp.list.color')}`}/> {Lang.get('home.package.isp.list.four',{Attribute:'700'})}</li>
                                            <li><FontAwesomeIcon icon={MenuIcon(Lang.get('home.package.isp.list.icon'))} size="sm" className={`mr-2 ${Lang.get('home.package.isp.list.color')}`}/> {Lang.get('home.package.isp.list.five',{Attribute:'10.000'})}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const FooterSectionPadding = () => {
    return (
        <div className="footer_section layout_padding">
            <div className="container">
                <div className="footer_taital_main">
                    <div className="row">
                        <div className="col-lg-4 col-sm-6">
                            <div className="footer_logo"><img alt="logo" style={{height:70}} src={Logo}/></div>
                            <p className="dummy_text_1">{Lang.get('home.banners.text')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export const FooterSection = ()=> {
    return (
        <React.Fragment>
            <FooterSectionMain/>
            <FooterSectionPadding/>
        </React.Fragment>
    )
}
export const CopyRightSection = () => {
    return (
        <div className="copyright_section">
            <div className="container">
                <p className="copyright_text">
                    Copyright 2023 All Right Reserved By <a href="https://html.design">Free html Templates</a> Distributed By <a href="https://themewagon.com">ThemeWagon</a> Created by <a href="https://github.com/tugelsikile">Tugelsikile</a>
                </p>
            </div>
        </div>
    );
}
