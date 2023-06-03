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
    CardPreloader, formatLocaleString,
    sortStatusPaid,
    sumTotalInvoiceSingle,
    sumTotalPaymentSingle
} from "../../../../Components/mixedConsts";
import FormPayment from "./Tools/FormPayment";
import InvoiceInfo from "./Tools/InvoiceInfo";


class InvoicePage extends React.Component {
    paid;
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, companies : false, packages : false, invoices : true },
            privilege : null, menus : [], packages : [], companies : [],
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
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.privilege) {
            if (this.state.privilege === null) {
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                getPrivileges([
                    {route:this.props.route,can:false},
                    {route:'auth.clients.invoices.payments',can:false},
                ])
                    .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadCompanies().then(()=>this.loadPackages().then(()=>{
                        loadings.invoices = false; this.setState({loadings},()=>this.loadInvoices());
                    })))
                    .then(()=>{
                        loadings.privilege = false; this.setState({loadings});
                    });
            }
        }
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
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumTotalInvoiceSingle(a) > sumTotalInvoiceSingle(b)) ? 1 : ((sumTotalInvoiceSingle(b) > sumTotalInvoiceSingle(a)) ? -1 : 0));
                } else {
                    invoices.filtered = invoices.filtered.sort((a,b) => (sumTotalInvoiceSingle(a) > sumTotalInvoiceSingle(b)) ? -1 : ((sumTotalInvoiceSingle(b) > sumTotalInvoiceSingle(a)) ? 1 : 0));
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
    async loadCompanies() {
        if (! this.state.loadings.companies) {
            if (this.state.companies.length === 0) {
                let loadings = this.state.loadings;
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
    async loadPackages() {
        if (! this.state.loadings.packages) {
            if (this.state.packages.length === 0) {
                let loadings = this.state.loadings;
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
                             loadings={this.state.loadings}
                             companies={this.state.companies} periode={this.state.filter.periode}
                             packages={this.state.packages}
                             handleClose={this.toggleForm}
                             handleUpdate={this.loadInvoices}/>

                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('companies.invoices.labels.menu')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-secondary">
                                {this.state.loadings.invoices &&
                                    <CardPreloader/>
                                }
                                <div className="card-header">
                                    <div className="card-title">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <DatePicker
                                                    selected={this.state.filter.periode} maxDate={new Date()} title={Lang.get('companies.invoices.labels.select_periode')}
                                                    className="form-control text-sm form-control-sm" disabled={this.state.loadings.invoices}
                                                    locale={localStorage.getItem('locale_lang') === 'id' ? id : en }
                                                    onChange={this.handleDate} showMonthYearPicker dateFormat="MMMM yyyy"/>
                                            </div>
                                            <div className="col-md-8">
                                                {this.state.privilege !== null &&
                                                    <>
                                                        {this.state.privilege.create &&
                                                            <button onClick={()=>this.toggleForm()} disabled={this.state.loadings.invoices} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('companies.invoices.create.form')}</button>
                                                        }
                                                        {this.state.privilege.delete &&
                                                            this.state.invoices.selected.length > 0 &&
                                                            <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.packages} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('companies.invoices.delete.select')}</button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('companies.invoices.labels.search')}/>
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search"/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-center" width={30}>
                                                <div className="custom-control custom-checkbox">
                                                    <input data-id="" disabled={this.state.loadings.invoices} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th className="align-middle" width={120}>
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
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="total"
                                                         name={Lang.get('companies.invoices.labels.subtotal.main')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="paid"
                                                         name={Lang.get('companies.invoices.payments.labels.amount')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="status"
                                                         name={Lang.get('companies.invoices.labels.status')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={30}>
                                                {Lang.get('messages.action')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.invoices.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={6}>{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.invoices.filtered.map((item, index) =>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input id={`cbx_${item.value}`} data-id={item.value} checked={this.state.invoices.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.invoices} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`cbx_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center">{item.label}</td>
                                                    <td className="align-middle">{item.meta.company.name}</td>
                                                    <td className="align-middle">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">
                                                            {
                                                                parseFloat(sumTotalInvoiceSingle(item)).toLocaleString(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-US',{maximumFractionDigits:0})
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{formatLocaleString(sumTotalPaymentSingle(item))}</span>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {
                                                            sumTotalPaymentSingle(item) === 0 ?
                                                                <span className="badge badge-secondary btn-block">{Lang.get('companies.invoices.payments.labels.status.pending')}</span>
                                                                :
                                                                sumTotalPaymentSingle(item) >= sumTotalInvoiceSingle(item) ?
                                                                    <span className="badge badge-success btn-block">{Lang.get('companies.invoices.payments.labels.status.success')}</span>
                                                                    :
                                                                    <span className="badge badge-warning btn-block">{Lang.get('companies.invoices.payments.labels.status.partial')}</span>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
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
