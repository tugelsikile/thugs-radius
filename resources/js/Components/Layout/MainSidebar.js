import React from "react";
import {logout} from "../Authentication";

// noinspection JSUnresolvedVariable,SpellCheckingInspection
class MainSidebar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <React.Fragment>
                <aside className="main-sidebar layout-fixed sidebar-light-navy elevation-4 text-sm">
                    <a href={this.props.root} className="brand-link bg-navy">
                        <img src={window.origin + '/theme/adminlte/img/AdminLTELogo.png'} alt="AdminLTE Logo" className="brand-image img-circle elevation-3" style={{opacity:.8}}/>
                        <span className="brand-text font-weight-light">AdminLTE 3</span>
                    </a>

                    <div className="sidebar">
                        {this.props.user !== null &&
                            <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                                <div className="image">
                                    <img src={this.props.user.meta.avatar} className="img-circle elevation-2" alt="User Image"/>
                                </div>
                                <div className="info">
                                    <a href={window.origin + '/profile/' + this.props.user.value} className="d-block">{this.props.user.label}</a>
                                </div>
                            </div>
                        }

                        <nav className="mt-2">
                            <ul className="nav nav-flat nav-pills nav-sidebar flex-column nav-child-indent" data-widget="treeview" role="menu" data-accordion="false">
                                <li className={this.props.route === 'auth' || this.props.route === 'clients' ? 'nav-item active' : 'nav-item'}>
                                    <a href={this.props.root} className={this.props.route === 'auth' || this.props.route === 'clients' ? 'nav-link active' : 'nav-link'}>
                                        <i className="nav-icon fas fa-tachometer-alt"/>
                                        <p>Dashboard</p>
                                    </a>
                                </li>
                                {this.props.menus.length > 0 &&
                                    this.props.menus.map((parent) =>
                                        parent.meta.childrens.length === 0 ?
                                            <li key={parent.value} className="nav-item">
                                                <a href={parent.meta.url} className={this.props.route === parent.meta.route ? 'nav-link active' : 'nav-link'}>
                                                    <i className={`nav-icon ${parent.meta.icon}`}/>
                                                    <p>{Lang.get(`${parent.meta.lang}`)}</p>
                                                </a>
                                            </li>
                                            :
                                            <li key={parent.value} className={parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'nav-item menu-open' : 'nav-item'}>
                                                <a href="#" className={parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'nav-link active' : 'nav-link'}>
                                                    <i className={`nav-icon ${parent.meta.icon}`}/>
                                                    <p>
                                                        {Lang.get(`${parent.meta.lang}`)}
                                                        <i className="right fas fa-angle-left"/>
                                                    </p>
                                                </a>
                                                <ul className="nav nav-treeview" style={{display:parent.meta.childrens.findIndex((f) => f.meta.route === this.props.route) >= 0 ? 'block' : 'none'}}>
                                                    {parent.meta.childrens.map((children)=>
                                                        <li key={children.value} className="nav-item">
                                                            <a href={children.meta.url} className={children.meta.route === this.props.route ? 'nav-link active' : 'nav-link'}>
                                                                <i className={`nav-icon ${children.meta.icon}`}/>
                                                                <p>{Lang.get(`${children.meta.lang}`)}</p>
                                                            </a>
                                                        </li>
                                                    )}
                                                </ul>
                                            </li>
                                    )
                                }
                                <li className="nav-item">
                                    <a onClick={()=>logout()} href="#" className="nav-link">
                                        <i className="nav-icon fe fe-log-out text-danger"></i>
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
