import React from "react";
import ReactDOM from "react-dom/client";

import BannerBg from "../../../../../public/theme/gariox/images/banner-bg.png";
import {
    AboutSection,
    BannerSection,
    CopyRightSection,
    FooterSection,
    HeaderSection,
    ServiceSection,
    WorkSection
} from "./Tools/Mixed";

class WelcomePage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        return (
            <React.StrictMode>
                <div className="svg_section_main">
                    <div className="banner_bg">
                        <img alt="logo" src={BannerBg}/>
                    </div>
                    <HeaderSection/>
                    <BannerSection/>
                    <ServiceSection/>
                    <AboutSection/>
                    <WorkSection/>
                </div>
                <FooterSection/>
                <CopyRightSection/>
            </React.StrictMode>
        );
    }
}
export default WelcomePage;
const root = ReactDOM.createRoot(document.getElementById('welcome-container'));
root.render(<React.StrictMode><WelcomePage/></React.StrictMode>);
