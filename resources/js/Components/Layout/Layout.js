import MainHeader from "./MainHeader";
import MainSidebar from "./MainSidebar";
import React from "react";

export const HeaderAndSideBar = (props) => {
    return (
        <React.Fragment>
            <MainHeader root={props.root} user={props.user} site={props.site}/>
            <MainSidebar route={props.route} site={props.site} menus={props.menus} root={props.root} user={props.user}/>
        </React.Fragment>
    )
}
