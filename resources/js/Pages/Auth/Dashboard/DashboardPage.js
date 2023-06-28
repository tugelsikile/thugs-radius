import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import PageLoader from "../../../Components/PageLoader";
import MainFooter from "../../../Components/Layout/MainFooter";
import {siteData} from "../../../Components/mixedConsts";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";

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
                <HeaderAndSideBar user={this.state.user} site={this.state.site} menus={this.state.menus} route={this.props.route} loadings={this.state.loadings}/>

                <MainFooter/>
            </React.StrictMode>
        )
    }
}

export default DashboardPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="auth"/></React.StrictMode>);
