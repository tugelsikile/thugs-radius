import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {siteData} from "../../../Components/mixedConsts";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";

class AccountingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, petty_cashes : true },
            privilege : null, menus : [], site : null,
        }
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.site) {
            let loadings = this.state.loadings;
            loadings.site = true;
            loadings.privilege = true;
            this.setState({loadings});
            if (this.state.site === null) {
                siteData()
                    .then((response)=>{
                        loadings.site = false;
                        if (response != null) {
                            this.setState({site:response});
                        }
                        this.setState({loadings});
                    })
                    .then(()=>{
                        getPrivileges([
                            {route : this.props.route, can : false},
                        ])
                            .then((response)=>{
                                loadings.privilege = false;
                                if (response !== null) {
                                    this.setState({privilege:response.privileges,menus:response.menus})
                                }
                                this.setState({loadings});
                            })
                            .then(()=>{

                            });
                    })
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('accounting.labels.menu')} childrens={[
                    ]}/>
                    <section className="content">

                        <div className="container-fluid">
                        </div>

                    </section>
                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }
}
export default AccountingPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><AccountingPage route="clients.accounting"/></React.StrictMode>)
