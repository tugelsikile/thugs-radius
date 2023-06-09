// noinspection DuplicatedCode

import React from "react";
import ReactDOM from "react-dom/client";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import {crudCompany, crudCompanyInvoice, crudCompanyPackage} from "../../../../Services/CompanyService";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from "date-fns/locale/id";
import en from "date-fns/locale/en-US";
registerLocale("id", id);
registerLocale("en", en);
import moment from "moment";
import BtnSort from "../../User/Tools/BtnSort";
import FormInvoice from "./Tools/FormInvoice";
import {
    CardPreloader, formatLocaleString, siteData,
    sortStatusPaid, sumGrandTotalInvoiceSingle,
    sumTotalPaymentSingle
} from "../../../../Components/mixedConsts";
import FormPayment from "./Tools/FormPayment";
import InvoiceInfo from "./Tools/InvoiceInfo";
import {crudDiscounts, crudTaxes} from "../../../../Services/ConfigService";
import CardStatus from "./Tools/CardStatus";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import {PageCardSearch} from "../../../../Components/PageComponent";
import {FormatPrice} from "../../../Client/Customer/Tools/Mixed";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCashRegister, faPlus} from "@fortawesome/free-solid-svg-icons";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";


class InvoicePage extends React.Component {
    paid;
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privilege : false, companies : false, packages : false, invoices : true, discounts : false, taxes : false, site : false },
            privilege : null, menus : [], packages : [], companies : [], taxes : [], discounts : [],
            invoices : { filtered : [], unfiltered : [], selected : [], },
            filter : {
                keywords : '', periode : new Date(),
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modals : {
                invoice : { open : false, data : null },
                payment : { open : false, data : null },
                info : { open : false, data : null },
            },
        };
        this.loadCompanies = this.loadCompanies.bind(this);
        this.loadPackages = this.loadPackages.bind(this);
        this.loadInvoices = this.loadInvoices.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.togglePayment = this.togglePayment.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleDate = this.handleDate.bind(this);
        this.toggleInfo = this.toggleInfo.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.loadTaxes = this.loadTaxes.bind(this);
        this.loadDiscounts = this.loadDiscounts.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.privilege) {
            if (this.state.privilege === null) {
                siteData().then((response)=>this.setState({site:response}));
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                getPrivileges([
                    {route:this.props.route,can:false},
                    {route:'auth.clients',can:false},
                    {route:'auth.clients.packages',can:false},
                    {route:'auth.configs.taxes',can:false},
                    {route:'auth.configs.discounts',can:false},
                    {route:'auth.clients.invoices.payments',can:false},
                ])
                    .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadCompanies().then(()=>this.loadPackages().then(()=>{
                        loadings.invoices = false; this.setState({loadings},()=>this.loadInvoices());
                    })))
                    .then(()=>{
                        loadings.privilege = false; this.setState({loadings});
                    })
                    .then(()=>this.loadDiscounts())
                    .then(()=>this.loadTaxes())
            }
        }
    }
    handleChangePage(page) {
        let filter = this.state.filter;
        filter.page = {value:page,label:page}; this.setState({filter},()=>this.handleFilter());
    }
    confirmGenerate() {
        confirmDialog(this,moment(this.state.filter.periode).format('yyyy-MM-DD'),'put',`${window.origin}/api/auth/companies/invoices/generate`,Lang.get('labels.generate.label',{Attribute:Lang.get('companies.invoices.labels.menu')}),Lang.get('labels.generate.message',{Attribute:Lang.get('companies.invoices.labels.menu')}),'app.loadInvoices()');
    }
    handlePrint(event) {
        event.preventDefault();
        let url = getRootUrl() + '/clients/invoices/print/' + event.currentTarget.getAttribute('data-id');
        window.open(url, '_blank');
    }
    toggleInfo(data = null) {
        let modals = this.state.modals;
        modals.info.open = ! this.state.modals.info.open;
        modals.info.data = data; this.setState({modals});
    }
    togglePayment(data = null) {
        let modals = this.state.modals;
        modals.payment.open = ! this.state.modals.payment.open;
        modals.payment.data = data; this.setState({modals});
    }
    toggleForm(data = null) {
        let modals = this.state.modals;
        modals.invoice.open = ! this.state.modals.invoice.open;
        modals.invoice.data = data; this.setState({modals});
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
        confirmDialog(this,ids,'delete',`${window.origin}/api/auth/companies/invoices`,Lang.get('companies.invoices.delete.form'),Lang.get('companies.invoices.delete.confirm'),'app.loadInvoices()');
    }
    handleCheck(event) {
        let loadings = this.state.loadings;
        loadings.invoices = true; this.setState({loadings});
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
        loadings.invoices = false;
        this.setState({invoices,loadings});
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
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let filter = this.state.filter;
        let invoices = this.state.invoices;
        let loadings = this.state.loadings;
        loadings.invoices = true; this.setState({loadings});
        if (this.state.filter.keywords.length > 0) {
            invoices.filtered = invoices.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.company.name.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            );
        } else {
            invoices.filtered = invoices.unfiltered;
        }
        switch (this.state.filter.sort.by) {
            case 'code' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.meta.company.name > b.meta.company.name) ? 1 : ((b.meta.company.name > a.meta.company.name) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (a.meta.company.name > b.meta.company.name) ? -1 : ((b.meta.company.name > a.meta.company.name) ? 1 : 0));
                }
                break;
            case 'total' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumGrandTotalInvoiceSingle(a) > sumGrandTotalInvoiceSingle(b)) ? 1 : ((sumGrandTotalInvoiceSingle(b) > sumGrandTotalInvoiceSingle(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumGrandTotalInvoiceSingle(a) > sumGrandTotalInvoiceSingle(b)) ? -1 : ((sumGrandTotalInvoiceSingle(b) > sumGrandTotalInvoiceSingle(a)) ? 1 : 0));
                }
                break;
            case 'status' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sortStatusPaid(a) > sortStatusPaid(b)) ? 1 : ((sortStatusPaid(b) > sortStatusPaid(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sortStatusPaid(a) > sortStatusPaid(b)) ? -1 : ((sortStatusPaid(b) > sortStatusPaid(a)) ? 1 : 0));
                }
                break;
            case 'paid' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumTotalPaymentSingle(a) > sumTotalPaymentSingle(b)) ? 1 : ((sumTotalPaymentSingle(b) > sumTotalPaymentSingle(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumTotalPaymentSingle(a) > sumTotalPaymentSingle(b)) ? -1 : ((sumTotalPaymentSingle(b) > sumTotalPaymentSingle(a)) ? 1 : 0));
                }
                break;
            case 'remaining' :
                if (this.state.filter.sort.dir === 'asc') {
                    invoices.filtered = invoices.filtered.sort((a,b) => ((sumGrandTotalInvoiceSingle(a) - sumTotalPaymentSingle(a)) > (sumGrandTotalInvoiceSingle(b) - sumTotalPaymentSingle(b))) ? 1 : (((sumGrandTotalInvoiceSingle(b)-sumTotalPaymentSingle(b)) > (sumGrandTotalInvoiceSingle(a)-sumTotalPaymentSingle(a))) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => ((sumGrandTotalInvoiceSingle(a) - sumTotalPaymentSingle(a)) > (sumGrandTotalInvoiceSingle(b) - sumTotalPaymentSingle(b))) ? -1 : (((sumGrandTotalInvoiceSingle(b)-sumTotalPaymentSingle(b)) > (sumGrandTotalInvoiceSingle(a) - sumTotalPaymentSingle(a))) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(invoices.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        if (filter.paging.length === 1 && filter.page.value > 1) {
            filter.page = {value:1,label:1};
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        invoices.filtered = invoices.filtered.slice(indexFirst, indexLast);

        loadings.invoices = false;
        this.setState({invoices,loadings});
    }
    handleDate(event) {
        let filter = this.state.filter;
        filter.periode = event; this.setState({filter},()=>this.loadInvoices());
    }
    async loadTaxes(data = null) {
        if (! this.state.loadings.taxes ) {
            let loadings = this.state.loadings;
            if (data !== null) {
                if (typeof data === 'object') {
                    let taxes = this.state.taxes;
                    let index = taxes.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        taxes[index] = data;
                    } else {
                        taxes.push(data);
                    }
                    this.setState({taxes});
                }
            } else {
                if (this.state.taxes.length === 0 ) {
                    loadings.taxes = true; this.setState({loadings});
                    try {
                        let response = await crudTaxes();
                        if (response.data.params === null) {
                            loadings.taxes = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            let taxes = [];
                            if (response.data.params.length > 0) {
                                response.data.params.map((item)=>{
                                    item.meta.name = item.label;
                                    item.label = item.meta.code;
                                    taxes.push(item);
                                });
                            }
                            loadings.taxes = false; this.setState({loadings,taxes});
                        }
                    } catch (e) {
                        loadings.taxes = false; this.setState({loadings});
                        showError(e.response.data.message);
                    }
                }
            }
        }
    }
    async loadDiscounts(data = null) {
        if (! this.state.loadings.discounts) {
            let loadings = this.state.loadings;
            if (data !== null) {
                if (typeof data === 'object') {
                    let discounts = this.state.discounts;
                    let index = discounts.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        discounts[index] = data;
                    } else {
                        discounts.push(data);
                    }
                    this.setState({discounts});
                }
            } else {
                if (this.state.discounts.length === 0) {
                    loadings.discounts = true; this.setState({loadings});
                    try {
                        let response = await crudDiscounts();
                        if (response.data.params === null) {
                            loadings.discounts = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            let discounts = [];
                            if (response.data.params.length > 0) {
                                response.data.params.map((item)=>{
                                    item.meta.label = item.label;
                                    item.label = item.meta.code;
                                    discounts.push(item);
                                })
                            }
                            loadings.discounts = false; this.setState({loadings,discounts});
                        }
                    } catch (e) {
                        loadings.discounts = false; this.setState({loadings});
                        showError(e.response.data.message);
                    }
                }
            }
        }
    }
    async loadCompanies(data = null) {
        if (! this.state.loadings.companies) {
            let loadings = this.state.loadings;
            let index;
            if (data !== null) {
                if (typeof data === 'object') {
                    loadings.companies = true; this.setState({loadings});
                    let companies = this.state.companies;
                    index = companies.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        companies[index] = data;
                    } else {
                        companies.push(data);
                    }
                    loadings.companies = false;
                    this.setState({loadings,companies});
                }
            } else {
                if (this.state.companies.length === 0) {
                    loadings.companies = true; this.setState({loadings});
                    try {
                        let response = await crudCompany();
                        if (response.data.params === null) {
                            loadings.companies = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            loadings.companies = false; this.setState({loadings,companies:response.data.params});
                        }
                    } catch (e) {
                        loadings.companies = false; this.setState({loadings});
                        if (e.response.status === 401) logout();
                        showError(e.response.data.message);
                    }
                }
            }
        }
    }
    async loadPackages(data = null) {
        if (! this.state.loadings.packages) {
            let loadings = this.state.loadings;
            if (data !== null) {
                if (typeof data === 'object') {
                    loadings.packages = true; this.setState({loadings});
                    let packages = this.state.packages;
                    let index = packages.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        packages[index] = data;
                    } else {
                        packages.push(data);
                    }
                    loadings.packages = false;
                    this.setState({loadings,packages});
                }
            } else {
                if (this.state.packages.length === 0) {
                    loadings.packages = true;this.setState({loadings});
                    try {
                        let response = await crudCompanyPackage();
                        if (response.data.params === null) {
                            loadings.packages = false; this.setState({loadings});
                            showError(response.data.message);
                        } else {
                            loadings.packages = false; this.setState({loadings,packages:response.data.params});
                        }
                    } catch (e) {
                        loadings.packages = false; this.setState({loadings});
                        if (e.response.status === 401) logout();
                        showError(e.response.data.message);
                    }
                }
            }
        }
    }
    async loadInvoices(data = null) {
        if (! this.state.loadings.invoices) {
            let loadings = this.state.loadings;
            loadings.invoices = true;
            let invoices = this.state.invoices;
            invoices.selected = [];
            this.setState({invoices,loadings});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    invoices.unfiltered.splice(data, 1);
                } else {
                    let index = invoices.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        invoices.unfiltered[index] = data;
                    } else {
                        invoices.unfiltered.push(data);
                    }
                }
                loadings.invoices = false;
                this.setState({loadings,invoices},()=>this.handleFilter());
            } else {
                try {
                    const formData = new FormData();
                    if (this.state.filter.periode !== null) formData.append(Lang.get('companies.invoices.form_input.periode'), moment(this.state.filter.periode).format('yyyy-MM-DD'));
                    let response = await crudCompanyInvoice(formData);
                    if (response.data.params === null) {
                        loadings.invoices = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        invoices.unfiltered = response.data.params;
                        loadings.invoices = false; this.setState({loadings,invoices},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.invoices = false; this.setState({loadings});
                    if (e.response.status === 401) logout();
                    showError(e.response.data.message);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <InvoiceInfo open={this.state.modals.info.open} data={this.state.modals.info.data} handleClose={this.toggleInfo}/>
                <FormPayment open={this.state.modals.payment.open} data={this.state.modals.payment.data}
                             handleClose={this.togglePayment}
                             handleUpdate={this.loadInvoices}/>
                <FormInvoice open={this.state.modals.invoice.open} data={this.state.modals.invoice.data}
                             loadings={this.state.loadings} invoices={this.state.invoices.unfiltered}
                             discounts={this.state.discounts}
                             onUpdateDiscounts={this.loadDiscounts}
                             taxes={this.state.taxes}
                             onUpdateTaxes={this.loadTaxes}
                             companies={this.state.companies} periode={this.state.filter.periode}
                             onUpdateCompanies={this.loadCompanies}
                             packages={this.state.packages}
                             onUpdatePackages={this.loadPackages}
                             handleClose={this.toggleForm}
                             privilege={this.state.privilege}
                             user={this.state.user}
                             handleUpdate={this.loadInvoices}/>

                <PageLoader/>

                <HeaderAndSideBar site={this.state.site} root={this.state.root} user={this.state.user} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>

                <div className="content-wrapper">

                    <PageTitle title={Lang.get('companies.invoices.labels.menu')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <CardStatus loading={this.state.loadings.invoices} invoices={this.state.invoices.filtered}/>

                            <div className="card card-outline card-secondary">
                                {this.state.loadings.invoices &&
                                    <CardPreloader/>
                                }
                                <div className="card-header pl-2">
                                    <div className="card-title">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <DatePicker
                                                    selected={this.state.filter.periode} maxDate={new Date()} title={Lang.get('companies.invoices.labels.select_periode')}
                                                    className="form-control text-sm form-control-sm mb-1" disabled={this.state.loadings.invoices}
                                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en } showFullMonthYearPicker
                                                    onChange={this.handleDate} showMonthYearPicker dateFormat="MMMM yyyy"/>
                                            </div>
                                            <div className="col-md-8">
                                                {this.state.privilege !== null &&
                                                    <>
                                                        {this.state.privilege.create &&
                                                            <>
                                                                <button onClick={()=>this.toggleForm()} disabled={this.state.loadings.invoices} className="btn btn-outline-primary btn-sm mb-1 mr-1 text-xs"><FontAwesomeIcon icon={faPlus} size="sm" className="mr-1"/> {Lang.get('labels.create.label',{Attribute:Lang.get('companies.invoices.labels.menu')})}</button>
                                                                <button onClick={()=>this.confirmGenerate()} disabled={this.state.loadings.invoices} className="btn btn-outline-success btn-sm mr-1 mb-1 text-xs"><FontAwesomeIcon icon={faCashRegister} size="sm" className="mr-1"/> {Lang.get('companies.invoices.generate.form')}</button>
                                                            </>
                                                        }
                                                        {this.state.privilege.delete &&
                                                            this.state.invoices.selected.length > 0 &&
                                                            <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.packages} className="btn btn-outline-danger btn-sm text-xs"><FontAwesomeIcon icon={faTrashAlt} className="mr-1" size="sm"/> {Lang.get('companies.invoices.delete.select')}</button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('companies.invoices.labels.menu')})}/>
                                </div>

                                <div className="card-body p-0">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            {this.state.invoices.filtered.length > 0 &&
                                                <th className="align-middle text-center pl-2" width={30}>
                                                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                                                        <input data-id="" disabled={this.state.loadings.invoices} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className={this.state.invoices.filtered.length === 0 ? "align-middle pl-2" : "align-middle" } width={120}>
                                                <BtnSort sort="code"
                                                    name={Lang.get('companies.invoices.labels.code')}
                                                    filter={this.state.filter}
                                                    handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('companies.labels.name')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={130}>
                                                <BtnSort sort="total"
                                                         name={Lang.get('companies.invoices.labels.subtotal.main')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={130}>
                                                <BtnSort sort="paid"
                                                         name={Lang.get('companies.invoices.payments.labels.amount')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={130}>
                                                <BtnSort sort="remaining"
                                                         name={Lang.get('companies.invoices.labels.remaining')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={130}>
                                                <BtnSort sort="status"
                                                         name={Lang.get('companies.invoices.labels.status')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle pr-2" width={30}>
                                                {Lang.get('messages.action')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.invoices.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={7}>{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.invoices.filtered.map((item) =>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center pl-2">
                                                        <div style={{zIndex:0}} className="custom-control custom-checkbox">
                                                            <input id={`cbx_${item.value}`} data-id={item.value} checked={this.state.invoices.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.invoices} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`cbx_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center text-xs">{item.label}</td>
                                                    <td className="align-middle text-xs">{item.meta.company.name}</td>
                                                    <td className="align-middle text-xs">
                                                        {FormatPrice(sumGrandTotalInvoiceSingle(item))}
                                                    </td>
                                                    <td className="align-middle text-xs">
                                                        {FormatPrice(sumTotalPaymentSingle(item))}
                                                    </td>
                                                    <td className="align-middle text-xs">
                                                        {FormatPrice(sumGrandTotalInvoiceSingle(item) - sumTotalPaymentSingle(item))}
                                                    </td>
                                                    <td className="align-middle text-center text-xs">
                                                        {
                                                            sumTotalPaymentSingle(item) === 0 ?
                                                                <span className="badge badge-secondary btn-block">{Lang.get('companies.invoices.payments.labels.status.pending')}</span>
                                                                :
                                                                sumTotalPaymentSingle(item) >= sumGrandTotalInvoiceSingle(item) ?
                                                                    <span className="badge badge-success btn-block">{Lang.get('companies.invoices.payments.labels.status.success')}</span>
                                                                    :
                                                                    <span className="badge badge-warning btn-block">{Lang.get('companies.invoices.payments.labels.status.partial')}</span>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center pr-2">
                                                        {this.state.privilege !== null &&
                                                            <>
                                                                <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                    <span className="sr-only">Toggle Dropdown</span>
                                                                </button>
                                                                <div className="dropdown-menu" role="menu">
                                                                    <a href="#" data-id={item.value} onClick={this.handlePrint} className="dropdown-item"><i className="fas fa-print mr-1"/>{Lang.get('companies.invoices.labels.print')}</a>
                                                                    <button onClick={()=>this.toggleInfo(item)} className="dropdown-item"><i className="fas fa-info-circle mr-1"/>{Lang.get('companies.invoices.labels.info')}</button>
                                                                    {this.state.privilege.payments &&
                                                                        <button onClick={()=>this.togglePayment(item)} className="dropdown-item text-info"><i className="fas fa-cash-register mr-1"/> {Lang.get('companies.invoices.payments.labels.menu')}</button>
                                                                    }
                                                                    {this.state.privilege.update &&
                                                                        <button onClick={()=>this.toggleForm(item)} className="dropdown-item text-primary"><i className="fas fa-pencil-alt mr-1"/> {Lang.get('companies.invoices.update.form')}</button>
                                                                    }
                                                                    {this.state.privilege.delete &&
                                                                        <button onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fas fa-trash-alt mr-1"/> {Lang.get('companies.invoices.delete.form')}</button>
                                                                    }
                                                                </div>
                                                            </>
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                {this.state.invoices.filtered.length > 0 &&
                                    <div className="card-footer clearfix row">
                                        <div className="col-sm-2">

                                        </div>
                                        <div className="col-sm-10">
                                            <ul className="pagination pagination-sm m-0 float-right">
                                                {this.state.filter.page.value > 1 &&
                                                    <li className="page-item">
                                                        <a onClick={()=>this.handleChangePage(1)} className="page-link" href="#">«</a>
                                                    </li>
                                                }
                                                {this.state.filter.paging.map((item)=>
                                                    <li key={item} onClick={()=>this.handleChangePage(item)} className={item === this.state.filter.page.value ? "page-item active" : "page-item"}>
                                                        <a className="page-link" href="#">{item}</a>
                                                    </li>
                                                )}
                                                {this.state.filter.paging.length > 1 &&
                                                    <li className="page-item">
                                                        <a onClick={()=>this.handleChangePage(this.state.filter.paging[this.state.filter.paging.length - 1])} className="page-link" href="#">»</a>
                                                    </li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                }
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
root.render(<React.StrictMode><InvoicePage route="auth.clients.invoices"/></React.StrictMode>)
