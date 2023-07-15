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
import {crudNas, kickOnlineUser} from "../../../Services/NasService";
import moment from "moment";

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
            online_customer_nas : [], intervalId : null, online_errors : 0,
            chart_online_customer : {
                labels : [],
                customers : [],
            },
        };
        this.loadServers = this.loadServers.bind(this);
        this.handleReloadServer = this.handleReloadServer.bind(this);
        this.loadOnline = this.loadOnline.bind(this);
        this.loadCard = this.loadCard.bind(this);
        this.loadExpired = this.loadExpired.bind(this);
        this.togglePayment = this.togglePayment.bind(this);
        this.handleKickUser = this.handleKickUser.bind(this);
        this.timer = null;
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
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus},()=>{
                                        if (typeof this.state.privilege.select !== 'undefined') {
                                            if (this.state.privilege.select) {
                                                this.loadNas();
                                            }
                                        }
                                    });
                                })
                                .then(()=>{
                                    loadings.servers = false; this.setState({loadings},()=>this.loadServers());
                                })
                                .then(()=>{
                                    loadings.online = false; this.setState({loadings},()=>this.refreshOnlineTimer());
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
    componentWillUnmount() {
        clearInterval(this.state.intervalId);
    }
    refreshOnlineTimer() {
        this.loadOnline().then(()=>{
            const intervalId = setInterval(()=>{
                this.setState({intervalId},()=>this.loadOnline());
            },10000);
        });
    }
    handleChartOnline() {
        if (this.state.online.length > 0) {
            let index;
            let online = this.state.online;
            let chart_online_customer = this.state.chart_online_customer;
            if (chart_online_customer.labels.length === 0) {
                chart_online_customer.labels = [0,0,0,0,0];
            }
            chart_online_customer.labels.push(moment().format('mm:ss'));
            if (chart_online_customer.labels.length > 5) chart_online_customer.labels.splice(0,1);
            online.map((item)=>{
                index = chart_online_customer.customers.findIndex((f)=> f.customer === item.label);
                if (index >= 0) {
                    chart_online_customer.customers[index].datasets[0].data.push(item.meta.bytes.split('/').length === 2 ? parseInt(item.meta.bytes.split('/')[0]) : 0 );
                    chart_online_customer.customers[index].datasets[1].data.push(item.meta.bytes.split('/').length === 2 ? parseInt(item.meta.bytes.split('/')[1]) : 0 );
                    if (chart_online_customer.customers[index].datasets[0].data.length > 5) chart_online_customer.customers[index].datasets[0].data.splice(0,1);
                    if (chart_online_customer.customers[index].datasets[1].data.length > 5) chart_online_customer.customers[index].datasets[1].data.splice(0,1);
                    //console.log(chart_online_customer.customers[index].datasets);
                } else {
                    let data1,data2;
                    let bytes = item.meta.bytes.split('/');
                    data1 = [0,0,0,0];
                    data2 = [0,0,0,0];
                    if (typeof item.meta.last_bytes !== 'undefined') {
                        if (item.meta.last_bytes.length > 0) {
                            item.meta.last_bytes.map((dataByte)=>{
                                data1.push(dataByte.split('/').length === 2 ? parseInt(dataByte.split('/')[0]) : 0 );
                                data2.push(dataByte.split('/').length === 2 ? parseInt(dataByte.split('/')[1]) : 0 );
                                if (data1.length >= 5) data1.splice(0,1);
                                if (data2.length >= 5) data2.splice(0,1);
                            });
                        }
                    }
                    if (bytes.length === 2) {
                        data1.push(bytes[0]);
                        data2.push(bytes[1]);
                    } else {
                        data1.push(0);
                        data2.push(0);
                    }
                    chart_online_customer.customers.push({
                        customer : item.label,
                        datasets : [
                            {
                                label : 'Input',
                                data : data1,
                                backgroundColor: 'rgba(25, 118, 210,.5)', //#1976d2
                            },
                            {
                                label : 'Output',
                                data : data2,
                                backgroundColor: 'rgba(255, 82, 82, .5)', //'#ff5252',
                            }
                        ]
                    });
                }
            });
            this.setState({chart_online_customer});
        }
    }
    togglePayment(data = null){
        let modal = this.state.modal;
        modal.payment.open = ! this.state.modal.payment.open;
        modal.payment.data = data;
        this.setState({modal});
    }
    async handleKickUser(event) {
        event.preventDefault();
        if (! this.state.loadings.online) {
            let loadings = this.state.loadings;
            loadings.online = true; this.setState({loadings});
            try {
                const formData = new FormData();
                formData.append('username', event.currentTarget.getAttribute('data-value'));
                let response = await kickOnlineUser(formData);
                if (response.data.params === null) {
                    loadings.online = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.online = false; this.setState({loadings},()=>this.loadOnline());
                }
            } catch (e) {
                loadings.online = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadNas() {
        if (this.state.user !== null) {
            if (typeof this.state.user.meta.locale.finish_wizard === 'undefined' || ! this.state.user.meta.locale.finish_wizard) {
                window.location.href = getRootUrl() + '/wizard';
            } else {
                try {
                    let response = await crudNas();
                    if (response.data.params !== null) {
                        if (response.data.params.length === 0) {
                            window.location.href = getRootUrl() + '/wizard';
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
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
            if (this.state.online_errors < 5) {
                let loadings = this.state.loadings;
                loadings.online = true; this.setState({loadings});
                try {
                    let response = await onlineCustomers();
                    if (response.data.params === null) {
                        loadings.online = false; this.setState({loadings,online_errors:this.state.online_errors + 1});
                        showError(response.data.message);
                    } else {
                        loadings.online = false;
                        this.setState({loadings,online:response.data.params,online_errors:0},()=>this.handleChartOnline());
                    }
                } catch (e) {
                    loadings.online = false; this.setState({loadings});
                    this.setState({online_errors:this.state.online_errors + 1});
                    responseMessage(e);
                }
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
                loadings.servers = true; this.setState({loadings});
                try {
                    let response = await serverStatus();
                    if (response.data.params === null) {
                        loadings.servers = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        let online_customer_nas = this.state.online_customer_nas;
                        loadings.servers = false;
                        if (response.data.params.length > 0) {
                            response.data.params.map((item)=>{
                                if (item.type === 'nas') {
                                    if (typeof item.onlines !== 'undefined') {
                                        if (item.onlines.length > 0) {
                                            item.onlines.map((online)=>{
                                                online_customer_nas.push(online);
                                            })
                                        }
                                    }
                                }
                            });
                        }
                        this.setState({loadings,servers:response.data.params,online_customer_nas});
                    }
                } catch (e) {
                    loadings.servers = false; this.setState({loadings});
                    responseMessage(e);
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
                                    <DashboardStatusServer onRefresh={this.loadServers} onReload={this.handleReloadServer} loading={this.state.loadings.servers} servers={this.state.servers}/>
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
                                                    <TableOnlineCustomer chart={this.state.chart_online_customer} onKick={this.handleKickUser} nas_online={this.state.online_customer_nas} privilege={this.state.privilege} onClick={this.loadOnline} loading={this.state.loadings.online} data={this.state.online}/>
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
