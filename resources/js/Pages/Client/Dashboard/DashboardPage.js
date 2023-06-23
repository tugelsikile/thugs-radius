import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {responseMessage, siteData} from "../../../Components/mixedConsts";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {DashboardCardStatus, DashboardStatusServer} from "./Tools/Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDatabase, faTachographDigital} from "@fortawesome/free-solid-svg-icons";
import {serverStatus} from "../../../Services/DasboardService";
import {showError} from "../../../Components/Toaster";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, servers : true  },
            privilege : null, menus : [], site : null, nas : [], servers : [],
            filter : { keywords : '', sort : { by : 'type', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : {
            },
            popover : { open : false, anchorEl : null, data : null },
        };
        this.loadServers = this.loadServers.bind(this);
        this.handleReloadServer = this.handleReloadServer.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.site) {
            let loadings = this.state.loadings;
            loadings.site = true; loadings.privilege = true;
            this.setState({loadings});
            if (this.state.site === null) {
                siteData()
                    .then((response)=>{
                        loadings.site = false;
                        this.setState({loadings,site:response},()=>{
                            getPrivileges([
                                {route : this.props.route, can : false },
                                {route : 'clients.nas', can: false },
                                {route : 'clients.nas.select', can: false },
                            ])
                                .then((response)=>{
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.servers = false; this.setState({loadings},()=>this.loadServers());
                                })
                        });
                    });
            }
        }
    }
    async handleReloadServer(event) {
        let loadings = this.state.loadings;
        let index = parseInt(event.currentTarget.getAttribute('data-index'));
        if (index !== null && index >= 0 && Number.isInteger(index)) {
            loadings.servers = true;
            this.setState({loadings});
            try {
                const formData = new FormData();
                formData.append('_method','patch');
                let type = event.currentTarget.getAttribute('data-type');
                let action = event.currentTarget.getAttribute('data-action');
                let dataValue = event.currentTarget.getAttribute('data-value');
                if (type !== null) formData.append(Lang.get('labels.form_input.type',{Attribute:'server'}).toLowerCase(), type);
                if (action !== null) formData.append(Lang.get('labels.form_input.action',{Attribute:'server'}).toLowerCase(), action);
                if (dataValue !== null) formData.append(Lang.get('labels.form_input.value',{Attribute:'server'}).toLowerCase(), dataValue);
                let response = await serverStatus(formData);
                if (response.data.params === null) {
                    loadings.servers = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.servers = false;
                    let servers = this.state.servers;
                    servers[index].value = response.data.params.status;
                    servers[index].message = response.data.params.message;
                    this.setState({loadings,servers});
                }
            } catch (e) {
                loadings.servers = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadServers(data = null) {
        if (! this.state.loadings.servers ) {
            let loadings = this.state.loadings;
            if (data !== null) {
                if (typeof data === 'object') {
                    let servers = this.state.servers;
                    let index = servers.findIndex((f)=> f.id === data.id);
                    if (index >= 0) {
                        servers[index] = data;
                    } else {
                        servers.push(data);
                    }
                    this.setState({servers});
                }
            } else {
                if (this.state.servers.length === 0) {
                    loadings.servers = true; this.setState({loadings});
                    try {
                        let response = await serverStatus();
                        if (response.data.params === null) {
                            loadings.servers = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            loadings.servers = false;
                            this.setState({loadings,servers:response.data.params});
                        }
                    } catch (e) {
                        loadings.servers = false; this.setState({loadings});
                        responseMessage(e);
                    }
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>

                <div className="content-wrapper">
                    <PageTitle title={"Dashboard"} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <DashboardCardStatus/>

                            <div className="row">
                                <div className="col-md-3">
                                    <DashboardStatusServer onReload={this.handleReloadServer} loading={this.state.loadings.servers} servers={this.state.servers}/>
                                </div>
                                <div className="col-md-9">
                                    <div className="card card-outline card-primary">
                                        <div className="card-header">
                                            <h3 className="card-title">Connected User</h3>
                                            <div className="card-tools">
                                                <span className="badge badge-danger">8 Connected Users</span>
                                                <button type="button" className="btn btn-tool" data-card-widget="collapse">
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <button type="button" className="btn btn-tool" data-card-widget="remove">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body p-0 table-responsive">
                                            supposedly from raddact table
                                        </div>
                                        <div className="card-footer">
                                            pagination
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </section>

                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }
}

export default DashboardPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="clients"/></React.StrictMode>)
