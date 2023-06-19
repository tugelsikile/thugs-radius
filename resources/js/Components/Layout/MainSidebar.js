import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faPowerOff} from "@fortawesome/free-solid-svg-icons";
import {SideBarBrand, SideBarMenuDashboard, SideBarUser} from "./Layout";
import {MenuIcon} from "../../Pages/Client/User/Privilege/Tools/IconTool";
import {logout} from "../Authentication";

// noinspection JSUnresolvedVariable,SpellCheckingInspection
class MainSidebar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <React.Fragment>
                <aside id="app-main-sidebar" className="main-sidebar layout-fixed sidebar-light-navy elevation-4 text-sm">
                    <SideBarBrand site={this.props.site} user={this.props.user}/>

                    <div className="sidebar">
                        <SideBarUser user={this.props.user}/>

                        <nav className="mt-2">
                            <ul className="nav nav-flat nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu" data-accordion="false">
                                <SideBarMenuDashboard route={this.props.route}/>

                                {this.props.menus.length > 0 &&
                                    this.props.menus.map((parent) =>
                                        parent.meta.childrens.length === 0 || parent.meta.childrens.length === 1 ?
                                            <li key={parent.value} className="nav-item">
                                                <a href={parent.meta.url} className={this.props.route === parent.meta.route ? 'nav-link active' : 'nav-link'}>
                                                    <FontAwesomeIcon style={{height:'12px'}} icon={MenuIcon(parent.meta.icon)} className="nav-icon" size="xs"/>
                                                    <p>{Lang.get(`${parent.meta.lang}`)}</p>
                                                </a>
                                            </li>
                                            :
                                            <li key={parent.value} className={parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'nav-item menu-open' : 'nav-item'}>
                                                <a href="#" className={parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'nav-link active' : 'nav-link'}>
                                                    <FontAwesomeIcon style={{height:'12px'}} icon={MenuIcon(parent.meta.icon)} className="nav-icon" size="xs"/>
                                                    <p>
                                                        {Lang.get(`${parent.meta.lang}`)}
                                                        <FontAwesomeIcon icon={faAngleLeft} size="xs" className="right"/>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview" style={{display:parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'block' : 'none'}}>
                                                    {parent.meta.childrens.map((children)=>
                                                        <li key={children.value} className="nav-item">
                                                            <a href={children.meta.url} className={children.meta.route === this.props.route ? 'nav-link active' : 'nav-link'}>
                                                                <FontAwesomeIcon style={{height:'12px'}} size="xs" icon={MenuIcon(children.meta.icon)} className="nav-icon"/>
                                                                <p>{Lang.get(`${children.meta.lang}`)}</p>
                                                            </a>
                                                        </li>
                                                    )}
                                                </ul>
                                            </li>
                                    )
                                }
                                <li className="nav-item">
                                    <a onClick={(e)=>{e.preventDefault();logout();}} href="#" className="nav-link">
                                        <FontAwesomeIcon style={{height:'12px'}} size="xs" icon={faPowerOff} className="nav-icon text-danger"/>
                                        <p className="text text-danger">{Lang.get('messages.users.labels.sign_out')}</p>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </aside>
            </React.Fragment>
        );
    }
}
export default MainSidebar;
