import React from "react";
import ReactDOM from "react-dom/client";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import PageLoader from "../../../Components/PageLoader";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privileges : false },
            privileges : null, menus : [],
        }
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        getPrivileges(this.props.route)
            .then((response)=>this.setState({privileges:response.privileges,menus:response.menus}));
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
            </React.StrictMode>
        )
    }
}

export default DashboardPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="auth"/></React.StrictMode>);
