import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import {
    CardPreloader,
    formatLocalePeriode,
    formatPhone,
    responseMessage,
    siteData
} from "../../../../Components/mixedConsts";
import {crudDiscounts, crudTaxes} from "../../../../Services/ConfigService";
import {crudNas, crudProfile} from "../../../../Services/NasService";
import {crudCustomerInvoices, crudCustomers} from "../../../../Services/CustomerService";
import {CardInfoCustomer, CardInfoNas, CardInfoPrice, CardInfoProfile} from "../Tools/CardPopover";
import {confirmDialog} from "../../../../Components/Toaster";
import {FormatPrice, sortStatus, sumGrandtotalCustomer} from "../Tools/Mixed";
import PageLoader from "../../../../Components/PageLoader";
import {Popover} from "@mui/material";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import {faCheckCircle, faInfoCircle, faTicketAlt, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import MainFooter from "../../../../Components/Layout/MainFooter";
import {DataNotFound, TableAction, TableCheckBox, TablePaging} from "../../../../Components/TableComponent";
import BtnSort from "../../../Auth/User/Tools/BtnSort";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import GenerateInvoice from "./Tools/GenerateInvoice";
import moment from "moment";
import {
    CardInfoPageInvoice,
    sortStatusPaymentInvoice,
    StatusPaymentInvoice,
    sumGrandTotalInvoice,
    sumTotalPaymentInvoice, TableHeaderRow
} from "./Tools/Mixed";
import {FilterButton} from "../Hotspot/Tools/Filter";
import {FilterInvoice} from "./Tools/Filter";
import {faCashRegister} from "@fortawesome/free-solid-svg-icons/faCashRegister";
import FormPayment from "./Tools/FormPayment";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import FormInvoice from "./Tools/FormInvoice";
import InfoInvoice from "./Tools/InfoInvoice";

// noinspection DuplicatedCode
class InvoicePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, customers : true, profiles : true, taxes : true, discounts : true, invoices : true },
            privilege : null, menus : [], site : null, nas : [], profiles : [], taxes : [], discounts : [], customers : [],
            invoices : { filtered : [], unfiltered : [], selected : [] },
            filter : {
                status : [], bill_period : new Date(), paid_date : null, keywords : '',
                sort : { by : 'code', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : {
                invoice : { open : false, data : null },
                generate : { open : false },
                filter : { open : false },
                payment : { open : false, data : null },
                info : { open : false, data : null },
            },
            popover : { open : false, anchorEl : null, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
        this.handleDataPerPage = this.handleDataPerPage.bind(this);
        this.loadInvoices = this.loadInvoices.bind(this);
        this.toggleGenerate = this.toggleGenerate.bind(this);
        this.toggleFilter = this.toggleFilter.bind(this);
        this.handleSelectDate = this.handleSelectDate.bind(this);
        this.handleSelectPaidDate = this.handleSelectPaidDate.bind(this);
        this.handleSelectStatus = this.handleSelectStatus.bind(this);
        this.togglePayment = this.togglePayment.bind(this);
        this.toggleInfo = this.toggleInfo.bind(this);
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
                                {route : 'clients.customers.invoices.payment', can : false},
                                {route : 'clients.customers', can : false},
                            ])
                                .then((response)=>{
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                                })
                                .then(()=>{
                                    loadings.discounts = false; this.setState({loadings},()=>this.loadDiscounts());
                                })
                                .then(()=>{
                                    loadings.taxes = false; this.setState({loadings}, ()=>this.loadTaxes());
                                })
                                .then(()=>{
                                    loadings.profiles = false; this.setState({loadings}, ()=>this.loadProfiles());
                                })
                                .then(()=>{
                                    loadings.customers = false; this.setState({loadings}, ()=>this.loadCustomers());
                                })
                                .then(()=>{
                                    loadings.invoices = false; this.setState({loadings}, ()=>this.loadInvoices());
                                });
                        });
                    });
            }
        }
        window.addEventListener('scroll', this.handleScrollPage);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScrollPage);
    }
    toggleInfo(data = null) {
        let modal = this.state.modal;
        modal.info.open = ! this.state.modal.info.open;
        modal.info.data = data;
        if (modal.info.data === null) {
            modal.info.open = false;
        }
        this.setState({modal});
    }
    togglePayment(data = null) {
        let modal = this.state.modal;
        modal.payment.open = ! this.state.modal.payment.open;
        modal.payment.data = data;
        this.setState({modal});
    }
    handleSelectStatus(event) {
        let filter = this.state.filter;
        filter.status = event;
        filter.paid_date = null;
        this.setState({filter},()=>this.handleFilter());
    }
    handleSelectPaidDate(event) {
        let filter = this.state.filter;
        filter.status = [];
        filter.paid_date = event; this.setState({filter},()=>this.handleFilter());
    }
    handleSelectDate(event) {
        let filter = this.state.filter;
        filter.bill_period = event;
        this.setState({filter},()=>this.loadInvoices());
    }
    toggleFilter() {
        let modal = this.state.modal;
        modal.filter.open = ! this.state.modal.filter.open;
        this.setState({modal});
    }
    toggleGenerate() {
        let modal = this.state.modal;
        modal.generate.open = ! this.state.modal.generate.open;
        this.setState({modal});
    }
    handleScrollPage() {
        const element = document.getElementById('page-card-header');
        const sidebar = document.getElementById('app-main-sidebar');
        if (element !== null && sidebar !== null) {
            if (window.scrollY > 230) {
                element.style.position = 'fixed';
                element.style.background = '#fff';
                element.style.top = '0px';
                element.style.right = '0px';
                element.style.left = `${sidebar.offsetWidth}px`;
                element.style.zIndex = '1';
            } else {
                element.style.position = null;
                element.style.background = null;
                element.style.right = null;
                element.style.left = null;
                element.style.zIndex = null;
            }
        }
    }
    handleDataPerPage(event) {
        let filter = this.state.filter;
        if (event !== null) {
            filter.data_length = event.value;
        }
        this.setState({filter},()=>this.handleFilter());
    }
    handlePopOver(e) {
        let popover = this.state.popover;
        popover.open = ! this.state.popover.open;
        popover.anchorEl = e.currentTarget;
        popover.data = null;
        let index = this.state.customers.unfiltered.findIndex((f) => f.value === e.currentTarget.getAttribute('data-value'));
        if (index >= 0) {
            let type = e.currentTarget.getAttribute('data-type');
            switch (type) {
                default:
                    break;
                case 'customer' : popover.data = <CardInfoCustomer data={this.state.customers.unfiltered[index]} />; break;
                case 'nas' : popover.data = <CardInfoNas data={this.state.customers.unfiltered[index].meta.nas}/>; break;
                case 'profile' :
                    if (this.state.profiles.length > 0) {
                        if (this.state.customers.unfiltered[index].meta.profile !== null) {
                            let idx = this.state.profiles.findIndex((f) => f.value === this.state.customers.unfiltered[index].meta.profile.id);
                            if (idx >= 0) {
                                popover.data = <CardInfoProfile data={this.state.profiles[idx]}/>;
                            }
                        }
                    }
                    break;
                case 'price' :
                    popover.data = <CardInfoPrice data={this.state.customers.unfiltered[index]}/>;
                    break;
            }
        }
        this.setState({popover});
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.invoices.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/customers/invoices`,Lang.get('invoices.delete.warning'),Lang.get('invoices.delete.select'),'app.loadInvoices()','warning',Lang.get('invoices.form_input.id'));
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.invoice.open =  ! this.state.modal.invoice.open;
        modal.invoice.data = data; this.setState({modal});
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
        let invoices = this.state.invoices;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            invoices.selected = [];
            if (event.currentTarget.checked) {
                invoices.filtered.map((item)=>{
                    if (! item.meta.default) {
                        invoices.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = invoices.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                invoices.selected.splice(indexSelected,1);
            } else {
                let indexTarget = invoices.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    invoices.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({invoices});
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
        let loadings = this.state.loadings;
        let invoices = this.state.invoices;
        let filter = this.state.filter;
        loadings.invoices = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            invoices.filtered = invoices.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.order_id.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                (f.meta.customer !== null && f.meta.customer.name.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1)
            );
        } else {
            invoices.filtered = invoices.unfiltered;
        }
        if (filter.paid_date !== null) {
            invoices.filtered = invoices.filtered.filter((f) => moment(f.meta.timestamps.paid.at).isSame(filter.paid_date,'day'));
        }
        if (filter.status.length > 0) {
            let filterStatus = [];
            filter.status.map((item)=> {
                switch (item.value) {
                    case 'pending':
                        invoices.filtered.filter((f) => sumTotalPaymentInvoice(f) === 0).map((item)=>{
                            filterStatus.push(item);
                        });
                        break;
                    case 'partial':
                        invoices.filtered.filter((f) => sumTotalPaymentInvoice(f) > 0 && sumTotalPaymentInvoice(f) !== sumGrandTotalInvoice(f)).map((item)=>{
                            filterStatus.push(item);
                        });
                        break;
                    case 'paid' :
                        invoices.filtered.filter((f) => sumTotalPaymentInvoice(f) === sumGrandTotalInvoice(f)).map((item)=>{
                            filterStatus.push(item);
                        });
                        break;
                }
            });
            invoices.filtered = filterStatus;
        }
        switch (filter.sort.by) {
            case 'code' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'id' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.meta.order_id > b.meta.order_id) ? 1 : ((b.meta.order_id > a.meta.order_id) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (a.meta.order_id > b.meta.order_id) ? -1 : ((b.meta.order_id > a.meta.order_id) ? 1 : 0));
                }
                break;
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.meta.customer.name > b.meta.customer.name) ? 1 : ((b.meta.customer.name > a.meta.customer.name) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (a.meta.customer.name > b.meta.customer.name) ? -1 : ((b.meta.customer.name > a.meta.customer.name) ? 1 : 0));
                }
                break;
            case 'amount' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumGrandTotalInvoice(a) > sumGrandTotalInvoice(b)) ? 1 : ((sumGrandTotalInvoice(b) > sumGrandTotalInvoice(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (sumGrandTotalInvoice(a) > sumGrandTotalInvoice(b)) ? -1 : ((sumGrandTotalInvoice(b) > sumGrandTotalInvoice(a)) ? 1 : 0));
                }
                break;
            case 'paid' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumTotalPaymentInvoice(a) > sumTotalPaymentInvoice(b)) ? 1 : ((sumTotalPaymentInvoice(b) > sumTotalPaymentInvoice(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (sumTotalPaymentInvoice(a) > sumTotalPaymentInvoice(b)) ? -1 : ((sumTotalPaymentInvoice(b) > sumTotalPaymentInvoice(a)) ? 1 : 0));
                }
                break;
            case 'status' :
                if (filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sortStatusPaymentInvoice(a) > sortStatusPaymentInvoice(b)) ? 1 : ((sortStatusPaymentInvoice(b) > sortStatusPaymentInvoice(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b)=> (sortStatusPaymentInvoice(a) > sortStatusPaymentInvoice(b)) ? -1 : ((sortStatusPaymentInvoice(b) > sortStatusPaymentInvoice(a)) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(invoices.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        invoices.filtered = invoices.filtered.slice(indexFirst, indexLast);
        loadings.invoices = false;
        this.setState({loadings,invoices});
    }
    async loadDiscounts() {
        if (! this.state.loadings.discounts) {
            if (this.state.discounts.length === 0) {
                let loadings = this.state.loadings;
                loadings.discounts = true; this.setState({loadings});
                try {
                    let response = await crudDiscounts();
                    if (response.data.params === null) {
                        loadings.discounts = false; this.setState({loadings});
                    } else {
                        let discounts = [];
                        response.data.params.map((item)=>{
                            item.meta.label = item.label;
                            item.label = item.meta.code;
                            discounts.push(item);
                        });
                        loadings.discounts = false; this.setState({loadings,discounts});
                    }
                } catch (e) {
                    loadings.discounts = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadTaxes() {
        if (! this.state.loadings.taxes) {
            if (this.state.taxes.length === 0) {
                let loadings = this.state.loadings;
                loadings.taxes = true; this.setState({loadings});
                try {
                    let response = await crudTaxes();
                    if (response.data.params === null) {
                        loadings.taxes = false; this.setState({loadings});
                    } else {
                        let taxes = [];
                        response.data.params.map((item)=>{
                            item.meta.label = item.label;
                            item.label = item.meta.code;
                            taxes.push(item);
                        });
                        loadings.taxes = false; this.setState({loadings,taxes});
                    }
                } catch (e) {
                    loadings.taxes = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadNas () {
        if (! this.state.loadings.nas) {
            if (this.state.nas.length === 0) {
                let loadings = this.state.loadings;
                loadings.nas = true; this.setState({loadings});
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
                    } else {
                        loadings.nas = false; this.setState({loadings,nas:response.data.params});
                    }
                } catch (e) {
                    loadings.nas = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadProfiles() {
        if (! this.state.loadings.profiles ) {
            if (this.state.profiles.length === 0) {
                let loadings = this.state.loadings;
                loadings.profiles = true; this.setState({loadings});
                try {
                    let response = await crudProfile();
                    if (response.data.params === null) {
                        loadings.profiles = false; this.setState({loadings});
                    } else {
                        loadings.profiles = false; this.setState({loadings,profiles:response.data.params});
                    }
                } catch (e) {
                    loadings.profiles = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCustomers() {
        if (! this.state.loadings.customers ) {
            let loadings = this.state.loadings;
            loadings.customers = true;
            this.setState({loadings});
            try {
                let response = await crudCustomers({type:['pppoe','hotspot']});
                if (response.data.params === null) {
                    loadings.customers = false; this.setState({loadings});
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
    async loadInvoices(data = null) {
        if (! this.state.loadings.invoices ) {
            let loadings = this.state.loadings;
            let invoices = this.state.invoices;
            invoices.selected = [];
            loadings.invoices = true;
            this.setState({loadings,invoices});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    invoices.unfiltered.splice(data,1);
                } else {
                    let index = invoices.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        invoices.unfiltered[index] = data;
                    } else {
                        if (moment(data.meta.period).isSame(this.state.filter.bill_period,'month')) {
                            invoices.unfiltered.push(data);
                        } else {
                            let filter = this.state.filter;
                            filter.bill_period = moment(data.meta.period).toDate();
                            this.setState({filter},()=>this.loadInvoices());
                        }
                    }
                }
                loadings.invoices = false;
                this.setState({loadings,invoices},()=>this.handleFilter());
            } else {
                try {
                    const formData = new FormData();
                    if (this.state.filter.bill_period !== null) formData.append(Lang.get('invoices.form_input.bill_period'), moment(this.state.filter.bill_period).format('yyyy-MM-DD'));
                    let response = await crudCustomerInvoices(formData,true);
                    if (response.data.params === null) {
                        loadings.invoices = false; this.setState({loadings});
                    } else {
                        loadings.invoices = false;
                        invoices.unfiltered = response.data.params;
                        this.setState({loadings,invoices},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.invoices = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <InfoInvoice invoices={this.state.invoices} bill_period={this.state.filter.bill_period} loadings={this.state.loadings} profiles={this.state.profiles} customers={this.state.customers} taxes={this.state.taxes} discounts={this.state.discounts} open={this.state.modal.info.open} data={this.state.modal.info.data} handleClose={this.toggleInfo} handleUpdate={this.loadInvoices}/>
                <FormInvoice invoices={this.state.invoices} bill_period={this.state.filter.bill_period} loadings={this.state.loadings} profiles={this.state.profiles} customers={this.state.customers} taxes={this.state.taxes} discounts={this.state.discounts} open={this.state.modal.invoice.open} data={this.state.modal.invoice.data} handleClose={this.toggleModal} handleUpdate={this.loadInvoices}/>
                <FormPayment open={this.state.modal.payment.open} data={this.state.modal.payment.data} handleClose={this.togglePayment} handleUpdate={this.loadInvoices}/>
                <GenerateInvoice bill_period={this.state.filter.bill_period} open={this.state.modal.generate.open} handleClose={this.toggleGenerate} handleUpdate={this.loadInvoices}/>
                <PageLoader/>
                <Popover open={this.state.popover.open} onClose={this.handlePopOver} anchorEl={this.state.popover.anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }} transformOrigin={{ vertical: 'top', horizontal: 'left', }} sx={{ pointerEvents: 'none', }} disableRestoreFocus>{this.state.popover.data}</Popover>

                <HeaderAndSideBar loadings={this.state.loadings} root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus}/>

                <div className="content-wrapper">
                    <PageTitle title={`${Lang.get('customers.invoices.labels.menu')}, ${formatLocalePeriode(this.state.filter.bill_period,'MMMM yyyy')}`} childrens={[
                        {url:getRootUrl() + '/customers', label : Lang.get('customers.labels.menu')}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <CardInfoPageInvoice loading={this.state.loadings.invoices}
                                                 invoices={this.state.invoices}
                                                 filter={this.state.filter}/>

                            <FilterInvoice filter={this.state.filter}
                                           loading={this.state.loadings.invoices}
                                           handleDate={this.handleSelectDate}
                                           handleStatus={this.handleSelectStatus}
                                           handlePaidDate={this.handleSelectPaidDate}
                                           open={this.state.modal.filter.open}/>

                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.invoices && <CardPreloader/>}
                                <div className="card-header pl-2" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.invoices}
                                                   langs={{create:Lang.get('invoices.create.button'),delete:Lang.get('invoices.delete.button')}}
                                                   selected={this.state.invoices.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}
                                                   filter={<FilterButton onReload={this.loadInvoices} onClick={this.toggleFilter} loading={this.state.loadings.invoices}/>}
                                                   others={[
                                                       {lang : Lang.get('invoices.generate.button'), icon : faTicketAlt, handle : ()=>this.toggleGenerate() }
                                                   ]}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('invoices.labels.search')}/>
                                </div>
                                <div className="card-body p-0 table-responsive-sm">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <TableHeaderRow filter={this.state.filter} invoices={this.state.invoices} loading={this.state.loadings.customers} onCheck={this.handleCheck} onSort={this.handleSort}/>
                                        </thead>
                                        <tbody>
                                        {this.state.invoices.filtered.length === 0 ?
                                            <DataNotFound colSpan={7} message={Lang.get('invoices.labels.not_found')}/>
                                            :
                                            this.state.invoices.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item} className="pl-2"
                                                                   checked={this.state.invoices.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.invoices} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle text-sm">{item.label}</td>
                                                    <td className="align-middle text-sm">{item.meta.order_id}</td>
                                                    <td className="align-middle text-sm">{item.meta.customer.name}</td>
                                                    <td className="align-middle text-sm">{FormatPrice(sumGrandTotalInvoice(item))}</td>
                                                    <td className="align-middle text-sm">{FormatPrice(sumTotalPaymentInvoice(item))}</td>
                                                    <td className="align-middle text-center">{StatusPaymentInvoice(item)}</td>
                                                    <TableAction others={[
                                                        { handle : ()=>this.toggleInfo(item), icon : faInfoCircle, lang : Lang.get('invoices.info.button') },
                                                        this.state.privilege === null ? null :
                                                            ! this.state.privilege.payment ? null :
                                                                { handle : ()=>this.togglePayment(item), color : 'text-info', icon : faCashRegister, lang : Lang.get('invoices.payments.button') }
                                                    ]} className="pr-1" privilege={this.state.privilege} item={item} langs={{update: Lang.get('invoices.update.button'), delete: Lang.get('invoices.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                        <tfoot>
                                        <TableHeaderRow filter={this.state.filter} invoices={this.state.invoices} loading={this.state.loadings.customers} onCheck={this.handleCheck} onSort={this.handleSort}/>
                                        </tfoot>
                                    </table>
                                </div>
                                <TablePaging showDataPerPage={true}
                                             handelSelectDataPerPage={this.handleDataPerPage}
                                             customers={this.state.invoices}
                                             filter={this.state.filter} handleChangePage={this.handleChangePage}/>
                            </div>
                        </div>
                    </section>
                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }
}
export default InvoicePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><InvoicePage route="clients.customers.invoices"/></React.StrictMode>)
