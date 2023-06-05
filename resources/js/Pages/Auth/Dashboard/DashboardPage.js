import React from "react";
import ReactDOM from "react-dom/client";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import PageLoader from "../../../Components/PageLoader";
import MainFooter from "../../../Components/Layout/MainFooter";
import {siteData} from "../../../Components/mixedConsts";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privileges : false, site : false },
            privileges : null, menus : [],
        }
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        siteData().then((response)=>this.setState({site:response}));
        getPrivileges(this.props.route)
            .then((response)=>this.setState({privileges:response.privileges,menus:response.menus}));
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>

                <MainFooter/>
            </React.StrictMode>
        )
    }
}

export default DashboardPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="auth"/></React.StrictMode>);
