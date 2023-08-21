import React from "react";
import ReactDOM from "react-dom/client";
import {confirmDialog, showError} from "../../../Components/Toaster";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../Components/mixedConsts";
import {cancelOltService, crudOlt, getGponCustomer, losCustomer} from "../../../Services/OltService";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import {faCircleNotch, faPlay, faRefresh, faTicketAlt} from "@fortawesome/free-solid-svg-icons";
import {TableHeader, TablePopoverLos} from "./Mixed";
import {DataNotFound, TableAction, TableCheckBox} from "../../../Components/TableComponent";
import FormOlt from "./FormOlt";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DetailOLT from "./DetailOLT";
import {crudNas, crudProfile, crudProfileBandwidth, crudProfilePools} from "../../../Services/NasService";
import {crudCustomers} from "../../../Services/CustomerService";
import {crudCompany} from "../../../Services/CompanyService";
import {crudDiscounts, crudTaxes} from "../../../Services/ConfigService";
import {Popover} from "@mui/material";


class OltPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, olt : true, customers : true, nas : true, profiles : true, pools : true, bandwidths : true, companies : true, taxes : true, discounts : true, loss : true },
            privilege : null, menus : [], site : null, companies : [], taxes : [], discounts : [], loss : [],
            customers : [], nas : [], profiles : [], pools : [], bandwidths : [],
            olt : { filtered : [], unfiltered : [], selected : [] },
            filter : { olt : null, keywords : '', sort : { by : 'name', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : { open : false, data : null },
            popover : { open : false, anchorEl : null, data : null },
        }
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.loadOlt = this.loadOlt.bind(this);
        this.toggleOlt = this.toggleOlt.bind(this);
        this.loadProfiles = this.loadProfiles.bind(this);
        this.loadBandwidths = this.loadBandwidths.bind(this);
        this.loadPools = this.loadPools.bind(this);
        this.loadCustomers = this.loadCustomers.bind(this);
        this.loadNas = this.loadNas.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadDiscounts = this.loadDiscounts.bind(this);
        this.handleSearchParams = this.handleSearchParams.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
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
                                {route : 'clients.customers', can : false },
                                {route : 'clients.nas', can : false },
                                {route : 'clients.nas.profiles', can : false },
                                {route : 'clients.nas.pools', can : false },
                                {route : 'clients.nas.bandwidths', can : false },
                                {route : 'clients.olt.customers.connect', can : false },
                                {route : 'clients.olt.gpon.un_configure', can : false },
                            ])
                                .then((response)=>{
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.olt = false; this.setState({loadings}, ()=>this.loadOlt());
                                })
                                .then(()=>{
                                    loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                                })
                                .then(()=>{
                                    loadings.customers = false; this.setState({loadings},()=>this.loadCustomers());
                                })
                                .then(()=>{
                                    loadings.pools = false; this.setState({loadings},()=>this.loadPools());
                                })
                                .then(()=>{
                                    loadings.profiles = false; this.setState({loadings},()=>this.loadProfiles());
                                })
                                .then(()=>{
                                    loadings.bandwidths = false; this.setState({loadings},()=>this.loadBandwidths());
                                })
                                .then(()=>{
                                    loadings.companies = false; this.setState({loadings},()=>this.loadCompanies());
                                })
                                .then(()=>{
                                    loadings.discounts = false; this.setState({loadings},()=>this.loadDiscounts());
                                })
                                .then(()=>{
                                    loadings.taxes = false; this.setState({loadings},()=>this.loadTaxes());
                                })
                                .then(()=>{
                                    loadings.loss = false; this.setState({loadings},()=>this.loadLosCustomer());
                                });
                        });
                    });
            }
        }
    }
    handlePopOver(event) {
        let popover = this.state.popover;
        popover.open = !this.state.popover.open;
        popover.anchorEl = event.currentTarget;
        popover.data = null;
        let index = this.state.olt.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-value'));
        if (index >= 0) {
            popover.data = <TablePopoverLos data={this.state.olt.unfiltered[index]}/>;
        }
        this.setState({popover});
    }
    handleSearchParams() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString).get('manage');
        if (urlParams !== null) {
            if (urlParams.length > 0) {
                let index = this.state.olt.unfiltered.findIndex((f)=> f.value === urlParams);
                if (index >=0 ) {
                    let filter = this.state.filter;
                    filter.olt = this.state.olt.unfiltered[index];
                    this.setState({filter});
                }
            }
        }
    }
    toggleOlt(data = null) {
        let filter = this.state.filter;
        filter.olt = data;
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (filter.olt !== null) {
            urlParams.set('manage', filter.olt.value);
        } else {
            urlParams.delete('manage');
        }
        window.history.pushState(null,null,getRootUrl() + '/olt?' + urlParams.toString());
        this.setState({filter},()=>cancelOltService());
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.olt.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/olt`,Lang.get('labels.delete.confirm.title'), Lang.get('labels.delete.confirm.message',{Attribute:Lang.get('olt.labels.menu')}),'app.loadOlt()','error',Lang.get('olt.form_input.id'));
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open =  ! this.state.modal.open;
        modal.data = data; this.setState({modal});
    }
    handleSort(event) {
        event.preventDefault();
        let filter = this.state.filter;
        filter.sort.by = event.currentTarget.getAttribute('data-sort');
        if (filter.sort.dir === 'asc') {
            filter.sort.dir = 'desc';
        } else {
            filter.sort.dir = 'asc';
        }
        this.setState({filter},()=>this.handleFilter())
    }
    handleCheck(event) {
        let olt = this.state.olt;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            olt.selected = [];
            if (event.currentTarget.checked) {
                olt.filtered.map((item)=>{
                    if (! item.meta.default) {
                        olt.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = olt.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                olt.selected.splice(indexSelected,1);
            } else {
                let indexTarget = olt.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    olt.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({olt});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleChangePage(page) {
        let filter = this.state.filter;
        filter.page = {value:page,label:page}; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        this.handleSearchParams();
        let loadings = this.state.loadings;
        let olt = this.state.olt;
        let filter = this.state.filter;
        loadings.olt = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            olt.filtered = olt.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.auth.host.indexOf(filter.keywords) !== -1
            );
        } else {
            olt.filtered = olt.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'host':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.host > b.meta.auth.host) ? 1 : ((b.meta.auth.host > a.meta.auth.host) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.host > b.meta.auth.host) ? -1 : ((b.meta.auth.host > a.meta.auth.host) ? 1 : 0));
                }
                break;
            case 'port':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.port > b.meta.auth.port) ? 1 : ((b.meta.auth.port > a.meta.auth.port) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.port > b.meta.auth.port) ? -1 : ((b.meta.auth.port > a.meta.auth.port) ? 1 : 0));
                }
                break;
            case 'community':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.communities.read > b.meta.communities.read) ? 1 : ((b.meta.communities.read > a.meta.communities.read) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.communities.read > b.meta.communities.read) ? -1 : ((b.meta.communities.read > a.meta.communities.read) ? 1 : 0));
                }
                break;
            case 'uptime':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.remote.uptime > b.meta.remote.uptime) ? 1 : ((b.meta.remote.uptime > a.meta.remote.uptime) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.remote.uptime > b.meta.remote.uptime) ? -1 : ((b.meta.remote.uptime > a.meta.remote.uptime) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(olt.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        olt.filtered = olt.filtered.slice(indexFirst, indexLast);
        loadings.olt = false;
        this.setState({loadings,olt});
    }
    async loadLosCustomer() {
        if (! this.state.loadings.loss) {
            let loadings = this.state.loadings;
            let olt = this.state.olt;
            loadings.loss = true; this.setState({loadings});
            try {
                let response = await losCustomer();
                if (response.data.params === null) {
                    loadings.loss = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.loss = false;
                    let loss = response.data.params;
                    this.setState({loadings,loss},()=>{
                        if (response.data.params.length > 0) {
                            response.data.params.map((item,index)=>{
                                this.loadLosDetail(item)
                                    .then((response)=>{
                                        if (response !== null) {
                                            loss[index].name = response.name;
                                            loss[index].description = response.description;
                                            if (olt.unfiltered.length > 0) {
                                                let index = olt.unfiltered.findIndex((f)=> f.value === item.olt_id);
                                                if (index >= 0) {
                                                    if (olt.unfiltered[index].meta.loss.data.findIndex((f)=> f.onu === item.onu) < 0) {
                                                        olt.unfiltered[index].meta.loss.data.push(item);
                                                    }
                                                }
                                                index = olt.filtered.findIndex((f)=> f.value === item.olt_id);
                                                if (index >= 0) {
                                                    if (olt.filtered[index].meta.loss.data.findIndex((f)=> f.onu === item.onu) < 0) {
                                                        olt.filtered[index].meta.loss.data.push(item);
                                                    }
                                                }
                                            }
                                            this.setState({loss,olt});
                                        }
                                    })
                            })
                        }
                    });
                }
            } catch (e) {
                loadings.loss = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadLosDetail(item) {
        try {
            const formData = new FormData();
            if (this.state.olt !== null) formData.append(Lang.get('olt.form_input.id'), item.olt_id);
            formData.append(Lang.get('olt.form_input.onu'), item.onu);
            let response = await getGponCustomer(formData);
            if (response.data.params !== null) {
                return response.data.params;
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }
    async loadTaxes(data = null) {
        if (! this.state.loadings.taxes ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let taxes = this.state.taxes;
                    let index = taxes.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        taxes[index] = data;
                    } else {
                        taxes.push(data);
                    }
                    this.setState({taxes});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.taxes = true; this.setState({loadings});
                try {
                    let response = await crudTaxes();
                    if (response.data.params === null) {
                        loadings.taxes = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.taxes = false;
                        this.setState({loadings,taxes:response.data.params});
                    }
                } catch (e) {
                    loadings.taxes = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadDiscounts(data = null) {
        if (! this.state.loadings.discounts ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let discounts = this.state.discounts;
                    let index = discounts.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        discounts[index] = data;
                    } else {
                        discounts.push(data);
                    }
                    this.setState({discounts});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.discounts = true; this.setState({loadings});
                try {
                    let response = await crudDiscounts();
                    if (response.data.params === null) {
                        loadings.discounts = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.discounts = false;
                        this.setState({loadings,discounts:response.data.params});
                    }
                } catch (e) {
                    loadings.discounts = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCompanies() {
        if (! this.state.loadings.companies) {
            let loadings = this.state.loadings;
            loadings.companies = true; this.setState({loadings});
            try {
                let response = await crudCompany();
                if (response.data.params === null) {
                    loadings.companies = false; this.setState({loadings});
                    showError(response.data.params);
                } else {
                    loadings.companies = false;
                    this.setState({loadings,companies:response.data.params});
                }
            } catch (e) {
                loadings.companies = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadProfiles(data = null) {
        if (! this.state.loadings.profiles ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let profiles = this.state.profiles;
                    let index = profiles.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        profiles[index] = data;
                    } else {
                        profiles.push(data);
                    }
                    this.setState({profiles});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.profiles = true; this.setState({loadings});
                try {
                    let response = await crudProfile();
                    if (response.data.params === null) {
                        loadings.profiles = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.profiles = false;
                        this.setState({loadings,profiles:response.data.params});
                    }
                } catch (e) {
                    loadings.profiles = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadBandwidths(data = null) {
        if (! this.state.loadings.bandwidths ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let bandwidths = this.state.bandwidths;
                    let index = bandwidths.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        bandwidths[index] = data;
                    } else {
                        bandwidths.push(data);
                    }
                    this.setState({bandwidths});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.bandwidths = true; this.setState({loadings});
                try {
                    let response = await crudProfileBandwidth();
                    if (response.data.params === null) {
                        loadings.bandwidths = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.bandwidths = false;
                        this.setState({loadings,bandwidths:response.data.params});
                    }
                } catch (e) {
                    loadings.bandwidths = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadPools(data = null) {
        if (! this.state.loadings.pools ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let pools = this.state.pools;
                    let index = pools.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        pools[index] = data;
                    } else {
                        pools.push(data);
                    }
                    this.setState({pools});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.pools = true; this.setState({loadings});
                try {
                    let response = await crudProfilePools();
                    if (response.data.params === null) {
                        loadings.pools = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.pools = false;
                        this.setState({loadings,pools:response.data.params});
                    }
                } catch (e) {
                    loadings.pools = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCustomers(data = null, removeId = null) {
        if (! this.state.loadings.customers ) {
            let customers = this.state.customers;
            let index;
            if (data !== null) {
                if (typeof data === 'object') {
                    if (typeof data.details !== 'undefined') {
                        if (typeof data.details.customer !== 'undefined') {
                            index = customers.findIndex((f) => f.value === data.details.customer.value);
                            if (index >= 0) {
                                customers[index] = data.details.customer;
                                this.setState({customers});
                            }
                        }
                    }
                }
            } else if (removeId !== null) {
                if (removeId.length > 0) {
                    index = customers.findIndex((f)=> f.value === removeId);
                    if (index >= 0) {
                        customers[index].meta.olt.olt = null;
                        customers[index].meta.olt.onu = null;
                        customers[index].meta.olt.configs = null;
                        this.setState({customers});
                    }
                }
            } else {
                let loadings = this.state.loadings;
                loadings.customers = true; this.setState({loadings});
                try {
                    let response = await crudCustomers({type : 'pppoe', 'unregister' : true});
                    if (response.data.params === null) {
                        loadings.customers = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.customers = false;
                        this.setState({loadings,customers:response.data.params});
                    }
                } catch (e) {
                    loadings.customers = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadNas(data = null) {
        if (! this.state.loadings.nas ) {
            if (data !== null) {
                if (typeof data === 'object') {
                    let nas = this.state.nas;
                    let index = nas.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        nas[index] = data;
                    } else {
                        nas.push(data);
                    }
                    this.setState({nas});
                }
            } else {
                let loadings = this.state.loadings;
                loadings.nas = true; this.setState({loadings});
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
                        showError(response.data.params);
                    } else {
                        loadings.nas = false;
                        this.setState({loadings,nas:response.data.params});
                    }
                } catch (e) {
                    loadings.nas = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadOlt(data = null) {
        if (! this.state.loadings.olt) {
            let loadings = this.state.loadings;
            let olt = this.state.olt;
            if (data !== null) {
                if (Number.isInteger(data)) {
                    olt.splice(data, 1);
                } else {
                    let index = olt.unfiltered.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        olt.unfiltered[index] = data;
                    } else {
                        olt.unfiltered.push(data);
                    }
                }
                this.setState({olt},()=>this.handleFilter());
            } else {
                olt.selected = [];
                loadings.olt = true; this.setState({loadings});
                try {
                    let response = await crudOlt();
                    if (response.data.params === null) {
                        loadings.olt = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.olt = false;
                        olt.unfiltered = response.data.params;
                        this.setState({loadings,olt},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.olt = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <Popover sx={{ pointerEvents: 'none', }} open={this.state.popover.open} anchorEl={this.state.popover.anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }} transformOrigin={{ vertical: 'top', horizontal: 'left', }} onClose={this.handlePopOver} disableRestoreFocus>{this.state.popover.data}</Popover>
                <FormOlt open={this.state.modal.open} data={this.state.modal.data} onClose={this.toggleModal} onUpdate={this.loadOlt}/>

                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('olt.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            {this.state.filter.olt !== null ?
                                <DetailOLT onReloadCustomer={this.loadCustomers} discounts={this.state.discounts} onDiscount={this.loadDiscounts} taxes={this.state.taxes} onTax={this.loadTaxes} loadings={this.state.loadings} olts={this.state.olt} onToggle={this.toggleOlt} olt={this.state.filter.olt} privilege={this.state.privilege} profiles={this.state.profiles} onProfile={this.loadProfiles} customers={this.state.customers} onCustomer={this.loadCustomers} nas={this.state.nas} onNas={this.loadNas} pools={this.state.pools} onPool={this.loadPools} bandwidths={this.state.bandwidths} onBandwidth={this.loadBandwidths} companies={this.state.companies}/>
                                :
                                <div id="main-page-card" className="card card-outline card-primary">
                                    {this.state.loadings.olt && <CardPreloader/>}
                                    <div className="card-header pl-2" id="page-card-header">
                                        <PageCardTitle privilege={this.state.privilege}
                                                       filter={<button onClick={()=>this.loadOlt()} className="btn btn-sm mr-1 btn-outline-secondary" disabled={this.state.loadings.olt}><FontAwesomeIcon icon={this.state.loadings.olt ? faCircleNotch : faRefresh} spin={this.state.loadings.olt} size="xs"/></button>}
                                                       loading={this.state.loadings.olt}
                                                       langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('olt.labels.menu')}),delete:Lang.get('labels.delete.select',{Attribute:Lang.get('olt.labels.menu')})}}
                                                       selected={this.state.olt.selected}
                                                       handleModal={this.toggleModal}
                                                       confirmDelete={this.confirmDelete}/>
                                        <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('olt.labels.menu')})}/>
                                    </div>
                                    <div className="card-body p-0 table-responsive table-responsive-sm">
                                        <table className="table table-striped table-sm">
                                            <thead id="main-table-header">
                                            <TableHeader type="header" onCheck={this.handleCheck} filter={this.state.filter} onSort={this.handleSort} loading={this.state.loadings.olt} olt={this.state.olt}/>
                                            </thead>
                                            <tbody>
                                            {this.state.olt.unfiltered.length === 0 ?
                                                <DataNotFound colSpan={7} message={Lang.get('labels.not_found',{Attribute:Lang.get('olt.labels.menu')})}/>
                                                :
                                                this.state.olt.unfiltered.map((item)=>
                                                    <tr key={item.value}>
                                                        <TableCheckBox checked={this.state.olt.selected.filter((f)=> f === item.value).length > 0} className="pl-2" item={item} loading={this.state.loadings.olt} handleCheck={this.handleCheck}/>
                                                        <td className="align-middle text-xs">{item.label}</td>
                                                        <td className="align-middle text-xs">{item.meta.auth.host}</td>
                                                        <td className="align-middle text-xs">{item.meta.auth.port}</td>
                                                        <td className="align-middle text-xs">*****</td>
                                                        <td className="align-middle text-xs">{item.meta.remote.uptime}</td>
                                                        <td className="align-middle text-xs text-center">
                                                            {this.state.loadings.loss ? <FontAwesomeIcon icon={faCircleNotch} spin={true}/> :
                                                                <span onMouseOut={this.handlePopOver} onMouseOver={this.handlePopOver} data-value={item.value} className={item.meta.loss.data.length === 0 ? "py-2 badge badge-success d-block" : "py-2 badge badge-warning d-block"}>{item.meta.loss.data.length}</span>
                                                            }
                                                        </td>
                                                        <TableAction
                                                            others={[
                                                                {handle:()=>this.toggleOlt(item), icon : faPlay, lang : Lang.get('olt.labels.detail')}
                                                            ]}
                                                            privilege={this.state.privilege} item={item} className="pr-2"
                                                            langs={{update:Lang.get('labels.update.label',{Attribute:Lang.get('olt.labels.menu')}), delete:Lang.get('labels.delete.label',{Attribute:Lang.get('olt.labels.menu')})}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                            <tfoot>
                                            <TableHeader type="footer" onCheck={this.handleCheck} filter={this.state.filter} onSort={this.handleSort} loading={this.state.loadings.olt} olt={this.state.olt}/>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            }
                        </div>

                    </section>

                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }

}

export default OltPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><OltPage route="clients.olt"/></React.StrictMode>);
