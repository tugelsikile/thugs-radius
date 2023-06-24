import React from "react";
import Logo from "../../../../../../public/theme/gariox/images/logo.png";
import BannerImage from "../../../../../../public/theme/gariox/images/banner-img.png";
import FooterBg from "../../../../../../public/theme/gariox/images/footer-logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser} from "@fortawesome/free-regular-svg-icons";
import {faBars, faPlus, faSearch} from "@fortawesome/free-solid-svg-icons";
import ReactHtmlParser from "react-html-parser";

export const HeaderSection = () => {
    return (
        <div className="header_section">
            <div className="container">
                <div className="main">
                    <div className="logo"><a href={window.origin}><img src={Logo}/></a></div>
                    <div className="menu_text">
                        <ul>
                            <div className="togle_">
                                <div className="menu_main">
                                    <ul>
                                        <li><FontAwesomeIcon icon={faUser}/></li>
                                        <li><a href={`${window.origin}/login`}>login</a></li>
                                    </ul>
                                </div>
                                <div className="shoping_bag"><FontAwesomeIcon icon={faSearch}/></div>
                            </div>
                            <div id="myNav" className="overlay">
                                <a href="#" className="closebtn" onClick={(e)=>{e.preventDefault();window.closeNav();}}>&times;</a>
                                <div className="overlay-content">
                                    <a href="#index.html">Home</a>
                                    <a href="#services.html">Services</a>
                                    <a href="#about.html">About</a>
                                    <a href="#stories.html">Stories</a>
                                    <a href="#team.html">Team</a>
                                    <a href="#contact.html">Contact Us</a>
                                </div>
                            </div>
                            <span className="navbar-toggler-icon"></span>
                            <span onClick={()=>window.openNav()}>
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
                            <div className="contact_bt_1"><a href="#">
                                <span className="contact_padding">
                                    <FontAwesomeIcon icon={faPlus}/>
                                </span>Discover</a></div>
                            <div className="contact_bt active"><a href="contact.html">Contact Now</a></div>
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
                    <h1 className="services_taital">Services</h1>
                    <p className="services_text">It is a long established fact that a reader will be distracted by the readable content </p>
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
                        <div className="images_1"><img src="images/img-1.png"/></div>
                        <h4 className="power_full_text">Powerfull System</h4>
                        <p className="dummy_text">It is a long established fact that a reader</p>
                        <div className="read_bt active"><a href="#">Read More</a></div>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img src="images/img-2.png"/></div>
                        <h4 className="power_full_text">Powerfull System</h4>
                        <p className="dummy_text">It is a long established fact that a reader</p>
                        <div className="read_bt"><a href="#">Read More</a></div>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img src="images/img-3.png"/></div>
                        <h4 className="power_full_text">Powerfull System</h4>
                        <p className="dummy_text">It is a long established fact that a reader</p>
                        <div className="read_bt"><a href="#">Read More</a></div>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img src="images/img-4.png"/></div>
                        <h4 className="power_full_text">Powerfull System</h4>
                        <p className="dummy_text">It is a long established fact that a reader</p>
                        <div className="read_bt"><a href="#">Read More</a></div>
                    </div>
                    <div className="box_main">
                        <div className="images_1"><img src="images/img-5.png"/></div>
                        <h4 className="power_full_text">Powerfull System</h4>
                        <p className="dummy_text">It is a long established fact that a reader</p>
                        <div className="read_bt"><a href="#">Read More</a></div>
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
                <div className="row">
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
                </div>
            </div>
        </div>
    );
}
export const WorkSection = () => {
    return (
        <div id="team.html" className="work_section layout_padding">
            <div className="container">
                <div className="work_taital_main">
                    <h1 className="work_taital">How Does This App Work</h1>
                    <p className="work_text">It is a long established fact that a readerwill be e adable content </p>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><img src="images/icon-1.png"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">Create Your Account</h3>
                            <p className="lorem_text">Lorem ipsum dolor sit amet, consectetur adipiscing dolore magna
                                aliqua. Ut enim ad minim veniam,</p>
                        </div>
                    </div>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><img src="images/icon-1.png"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">Upload Your Picture</h3>
                            <p className="lorem_text">Lorem ipsum dolor sit amet, consectetur adipiscing dolore magna
                                aliqua. Ut enim ad minim veniam,</p>
                        </div>
                    </div>
                    <div className="work_section_2">
                        <div className="account_section_left">
                            <div className="icon_1"><img src="images/icon-1.png"/></div>
                        </div>
                        <div className="account_section_right">
                            <h3 className="create_text">Get Your Own Time</h3>
                            <p className="lorem_text">Lorem ipsum dolor sit amet, consectetur adipiscing dolore magna
                                aliqua. Ut enim ad minim veniam,</p>
                            <div className="read_bt_2"><a href="#">Read More</a></div>
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
                    <h1 className="stories_taital">Latest Stories</h1>
                    <p className="stories_text">It is a long established fact that a readerwill be e adable content </p>
                    <div className="">
                        <div className="stories_section_2 layout_padding">
                            <div className="row">
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box">
                                        <div className="image_6"><img src="images/img-6.png"/></div>
                                        <h3 className="teration_text">Teration in some form</h3>
                                        <p className="date_text">( 06 Jun 2019 )</p>
                                        <p className="ipsum_text">Lorem ipsum dolor sit amet, consectetur adipiscing
                                            elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                            enim ad minim veniam,</p>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box">
                                        <div className="image_6"><img src="images/img-7.png"/></div>
                                        <h3 className="teration_text">Teration in some form</h3>
                                        <p className="date_text">( 06 Jun 2019 )</p>
                                        <p className="ipsum_text">Lorem ipsum dolor sit amet, consectetur adipiscing
                                            elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                            enim ad minim veniam,</p>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-12">
                                    <div className="image_box">
                                        <div className="image_6"><img src="images/img-8.png"/></div>
                                        <h3 className="teration_text">Teration in some form</h3>
                                        <p className="date_text">( 06 Jun 2019 )</p>
                                        <p className="ipsum_text">Lorem ipsum dolor sit amet, consectetur adipiscing
                                            elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                            enim ad minim veniam,</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="testimonial_section layout_padding">
                <div className="container">
                    <h1 className="testimonial_taital">Testimonial</h1>
                    <p className="testimonial_text">Lorem Ipsum available, but the majority</p>
                    <div className="testimonial_section_2 layout_padding">
                        <div id="main_slider" className="carousel slide" data-ride="carousel">
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <div className="image_9"><img src="images/img-9.png"/></div>
                                    <h3 className="client_name">Believable</h3>
                                    <p className="lorem_ipsum_text">There are many variations of passages of Lorem Ipsum
                                        available, but the majority have suffered alteration in some form, by injected
                                        humour, or randomised words which don't look even slightly believable. If you
                                        There are many variations of passages of Lorem Ipsum available, but the majority
                                        have suffered alteration in some form, by injected humour, or randomised words
                                        which don't look even slightly believable. If you </p>
                                    <div className="quote_icon"><img src="images/quote-icon.png"/></div>
                                </div>
                                <div className="carousel-item">
                                    <div className="image_9"><img src="images/img-9.png"/></div>
                                    <h3 className="client_name">Believable</h3>
                                    <p className="lorem_ipsum_text">There are many variations of passages of Lorem Ipsum
                                        available, but the majority have suffered alteration in some form, by injected
                                        humour, or randomised words which don't look even slightly believable. If you
                                        There are many variations of passages of Lorem Ipsum available, but the majority
                                        have suffered alteration in some form, by injected humour, or randomised words
                                        which don't look even slightly believable. If you </p>
                                    <div className="quote_icon"><img src="images/quote-icon.png"/></div>
                                </div>
                                <div className="carousel-item">
                                    <div className="image_9"><img src="images/img-9.png"/></div>
                                    <h3 className="client_name">Believable</h3>
                                    <p className="lorem_ipsum_text">There are many variations of passages of Lorem Ipsum
                                        available, but the majority have suffered alteration in some form, by injected
                                        humour, or randomised words which don't look even slightly believable. If you
                                        There are many variations of passages of Lorem Ipsum available, but the majority
                                        have suffered alteration in some form, by injected humour, or randomised words
                                        which don't look even slightly believable. If you </p>
                                    <div className="quote_icon"><img src="images/quote-icon.png"/></div>
                                </div>
                            </div>
                            <a className="carousel-control-prev" href="#main_slider" role="button" data-slide="prev">
                                <i className="fa fa-angle-left"></i>
                            </a>
                            <a className="carousel-control-next" href="#main_slider" role="button" data-slide="next">
                                <i className="fa fa-angle-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div id="contact.html" className="contact_section layout_padding">
                <div className="container">
                    <div className="contact_main">
                        <h2 className="contact_taital">Get In Touch</h2>
                        <div className="mail_section_1">
                            <input type="text" className="mail_text" placeholder="Name" name="text"/>
                            <input type="text" className="mail_text" placeholder="Email" name="Email"/>
                            <input type="text" className="mail_text" placeholder="Phone Number" name="text"/>
                            <textarea className="massage-bt" placeholder="Massage" rows="5" id="comment"
                                      name="Massage"></textarea>
                            <div className="send_bt_1"><a href="#">SEND</a></div>
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
                <h3 className="subscribe_text">Subscribe</h3>
                <div className="mail_main">
                    <input type="text" className="email_text" placeholder="Enter Your email" name="Enter Your email"/>
                    <div className="right_arrow">
                        <i className="fa fa-long-arrow-right" style={{fontSize:'24px'}}></i>
                    </div>
                </div>
                <div className="footer_taital_main">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6">
                            <div className="footer_logo"><img src="images/footer-logo.png"/></div>
                            <p className="dummy_text_1">It is a long established fact that a reader will be distracted
                                by the readable content of a page when looking at its layout. The point of </p>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <h2 className="useful_text">Navigation</h2>
                            <div className="footer_menu">
                                <ul>
                                    <li className="active"><a href="index.html">Home</a></li>
                                    <li><a href="about.html">About</a></li>
                                    <li><a href="location.html">Location</a></li>
                                    <li><a href="services.html">Services</a></li>
                                    <li><a href="features.html">Features</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <h2 className="useful_text">Contact Info</h2>
                            <h4 className="addres_link">Mantain Office Address:</h4>
                            <h4 className="addres_link_1"><a href="#"><img src="images/map-icon.png"/><span
                                className="padding_left_20"> New York, NY 36524</span></a></h4>
                            <h4 className="addres_link">Customer Service:</h4>
                            <h4 className="addres_link_1"><a href="#"><img src="images/call-icon.png"/><span
                                className="padding_left_20">+( +01 1234567890 )</span></a></h4>
                            <h4 className="addres_link_1"><a href="#"><img src="images/mail-icon.png"/><span
                                className="padding_left_20">demo@gmail.com</span></a></h4>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <h2 className="useful_text">Discover</h2>
                            <div className="discover_menu">
                                <ul>
                                    <li><a href="#">Help</a></li>
                                    <li><a href="#">How It Works</a></li>
                                    <li><a href="#">subscribe</a></li>
                                    <li><a href="#">Contact Us</a></li>
                                </ul>
                            </div>
                            <div className="social_icon">
                                <ul>
                                    <li><a href="#"><img src="images/fb-icon.png"/></a></li>
                                    <li><a href="#"><img src="images/twitter-icon.png"/></a></li>
                                    <li><a href="#"><img src="images/instagram-icon.png"/></a></li>
                                    <li><a href="#"><img src="images/linkedin-icon.png"/></a></li>
                                </ul>
                            </div>
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
                <p className="copyright_text">Copyright 2023 All Right Reserved By <a href="https://html.design">Free
                    html Templates</a> Distributed By <a href="https://themewagon.com">ThemeWagon</a></p>
            </div>
        </div>
    );
}
