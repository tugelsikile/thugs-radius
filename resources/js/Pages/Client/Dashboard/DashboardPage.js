import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {customPreventDefault, responseMessage, siteData} from "../../../Components/mixedConsts";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {DashboardCardStatus, DashboardStatusServer, TableExpiredCustomer, TableOnlineCustomer} from "./Tools/Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCashRegister, faUsers} from "@fortawesome/free-solid-svg-icons";
import {onlineCustomers, serverStatus, topCards} from "../../../Services/DasboardService";
import {showError} from "../../../Components/Toaster";
import {faCalendarXmark} from "@fortawesome/free-regular-svg-icons";
import {crudCustomers} from "../../../Services/CustomerService";
import FormPayment from "../Customer/Invoice/Tools/FormPayment";
import {crudPaymentGatewayClient} from "../../../Services/ConfigService";
import OnlinePayment from "./Tools/OnlinePayment";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, servers : true, online : true, expired : true, cards : true, payment_gateways : true },
            privilege : null, menus : [], site : null, nas : [], servers : [], online : [], expired : [], payment_gateways : [],
            cards : {customers:[],payments:[],vouchers:[],pendings:[]},
            filter : { keywords : '', sort : { by : 'type', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : {
                payment : { open : false, data : null }
            },
            popover : { open : false, anchorEl : null, data : null },
        };
        this.loadServers = this.loadServers.bind(this);
        this.handleReloadServer = this.handleReloadServer.bind(this);
        this.loadOnline = this.loadOnline.bind(this);
        this.loadCard = this.loadCard.bind(this);
        this.loadExpired = this.loadExpired.bind(this);
        this.togglePayment = this.togglePayment.bind(this);
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
                                {route : 'clients.customers.invoices.payment', can: false },
                            ])
                                .then((response)=>{
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.servers = false; this.setState({loadings},()=>this.loadServers());
                                })
                                .then(()=>{
                                    loadings.online = false; this.setState({loadings},()=>this.loadOnline());
                                })
                                .then(()=>{
                                    loadings.expired = false; this.setState({loadings},()=>this.loadExpired());
                                })
                                .then(()=>{
                                    loadings.cards = false; this.setState({loadings},()=>this.loadCard());
                                })
                                .then(()=>{
                                    loadings.payment_gateways = false; this.setState({loadings},()=>this.loadPaymentGateway());
                                });
                        });
                    });
            }
        }
    }
    togglePayment(data = null){
        let modal = this.state.modal;
        modal.payment.open = ! this.state.modal.payment.open;
        modal.payment.data = data;
        this.setState({modal});
    }
    async loadPaymentGateway() {
        if (! this.state.loadings.payment_gateways) {
            if (this.state.payment_gateways.length === 0) {
                let loadings = this.state.loadings;
                loadings.payment_gateways = true; this.setState({loadings});
                try {
                    let response = await crudPaymentGatewayClient();
                    if (response.data.params === null) {
                        loadings.payment_gateways = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.payment_gateways = false;
                        this.setState({loadings,payment_gateways:response.data.params});
                    }
                } catch (e) {
                    loadings.payment_gateways = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCard() {
        if (! this.state.loadings.cards) {
            let loadings = this.state.loadings;
            loadings.cards = true; this.setState({loadings});
            try {
                let response = await topCards();
                if (response.data.params === null) {
                    loadings.cards = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.cards = false;
                    this.setState({loadings,cards:response.data.params});
                }
            } catch (e) {
                loadings.cards = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadExpired(data = null) {
        if (data !== null) {
            this.loadCard();
        }
        if (! this.state.loadings.expired) {
            let loadings = this.state.loadings;
            loadings.expired = true; this.setState({loadings});
            try {
                let response = await crudCustomers({expired:true,invoice:true});
                if (response.data.params === null) {
                    loadings.expired = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.expired = false; this.setState({loadings,expired:response.data.params});
                }
            } catch (e) {
                loadings.expired = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadOnline() {
        if (! this.state.loadings.online ) {
            let loadings = this.state.loadings;
            loadings.online = true; this.setState({loadings});
            try {
                let response = await onlineCustomers();
                if (response.data.params === null) {
                    loadings.online = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.online = false;
                    this.setState({loadings,online:response.data.params});
                }
            } catch (e) {
                loadings.online = false; this.setState({loadings});
                responseMessage(e);
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
                <FormPayment open={this.state.modal.payment.open} data={this.state.modal.payment.data} handleClose={this.togglePayment} handleUpdate={this.loadExpired}/>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>

                <div className="content-wrapper">
                    <PageTitle title={"Dashboard"} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <DashboardCardStatus onClick={this.loadCard} loading={this.state.loadings.cards} cards={this.state.cards}/>

                            <div className="row">
                                <div className="col-md-3">
                                    <DashboardStatusServer onReload={this.handleReloadServer} loading={this.state.loadings.servers} servers={this.state.servers}/>
                                </div>
                                <div className="col-md-9">
                                    <div className="card card-primary card-outline card-outline-tabs">
                                        <div className="card-header p-0 border-bottom-0">
                                            <ul className="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
                                                <li className="nav-item">
                                                    <a onClick={customPreventDefault} className="nav-link active" id="custom-tabs-four-home-tab" data-toggle="pill" href="#custom-tabs-four-home" role="tab" aria-controls="custom-tabs-four-home" aria-selected="true"><FontAwesomeIcon className="mr-1" icon={faUsers} size="sm"/> {Lang.get('labels.online',{Attribute:Lang.get('customers.labels.menu')})}</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a onClick={customPreventDefault} className="nav-link" id="custom-tabs-four-profile-tab" data-toggle="pill" href="#custom-tabs-four-profile" role="tab" aria-controls="custom-tabs-four-profile" aria-selected="false"><FontAwesomeIcon className="mr-1" icon={faCalendarXmark} size="sm"/> {Lang.get('labels.expired',{Attribute:Lang.get('customers.labels.menu')})}</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className="nav-link" id="custom-tabs-four-payment-tab" data-toggle="pill" href="#custom-tabs-four-payment" role="tab" aria-controls="custom-tabs-four-payment" aria-selected="false"><FontAwesomeIcon icon={faCashRegister} size="sm" className="mr-1"/> {Lang.get('labels.payment',{Attribute:"Online"})}</a>
                                                </li>
                                                {/*<li className="nav-item">
                                                    <a className="nav-link" id="custom-tabs-four-settings-tab" data-toggle="pill" href="#custom-tabs-four-settings" role="tab" aria-controls="custom-tabs-four-settings" aria-selected="false">Settings</a>
                                                </li>*/}
                                            </ul>
                                        </div>
                                        <div className="p-0 card-body" style={{minHeight:300}}>
                                            <div className="tab-content" id="custom-tabs-four-tabContent">
                                                <div className="active show tab-pane fade table-responsive" id="custom-tabs-four-home" role="tabpanel" aria-labelledby="custom-tabs-four-home-tab">
                                                    <TableOnlineCustomer privilege={this.state.privilege} onClick={this.loadOnline} loading={this.state.loadings.online} data={this.state.online}/>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-four-profile" role="tabpanel" aria-labelledby="custom-tabs-four-profile-tab">
                                                    <TableExpiredCustomer onPayment={this.togglePayment} privilege={this.state.privilege} onClick={this.loadExpired} loading={this.state.loadings.expired} data={this.state.expired}/>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-four-payment" role="tabpanel" aria-labelledby="custom-tabs-four-payment-tab">
                                                    <OnlinePayment loadings={this.state.loadings} user={this.state.user} privilege={this.state.privilege} payment_gateways={this.state.payment_gateways} onUpdate={this.loadExpired}/>
                                                </div>
                                                {/*<div className="tab-pane fade " id="custom-tabs-four-settings" role="tabpanel" aria-labelledby="custom-tabs-four-settings-tab">
                                                </div>*/}
                                            </div>
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
