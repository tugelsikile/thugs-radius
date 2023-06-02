// noinspection DuplicatedCode

import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import {crudCompany, crudCompanyPackage} from "../../../../Services/CompanyService";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import BtnSort from "../../User/Tools/BtnSort";
import {durationBy} from "../../../../Components/mixedConsts";
import FormPackage from "./Tools/FormPackage";

class PackagePage extends React.Component {
    routers;
    vouchers;
    customers;
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, companies : false, packages : false },
            privilege : null, menus : [], companies : [],
            packages : { filtered : [], unfiltered : [], selected : [] },
            filter : {
                keywords : '',
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.loadPackages = this.loadPackages.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.privilege) {
            if (this.state.privilege === null) {
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                getPrivileges(this.props.route)
                    .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadPackages().then(()=>this.loadCompanies()))
                    .then(()=>{
                        loadings.privilege = false; this.setState({loadings});
                    });
            }
        }
    }
    handleChangePage(page) {
        let filter = this.state.filter;
        filter.page = {value:page,label:page}; this.setState({filter},()=>this.handleFilter());
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.packages.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/auth/companies/packages`,Lang.get('companies.packages.delete.form'),Lang.get('companies.packages.delete.confirm'),'app.loadPackages()');
    }
    toggleForm(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data; this.setState({modal});
    }
    handleCheck(event) {
        let packages = this.state.packages;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            packages.selected = [];
            if (event.currentTarget.checked) {
                packages.filtered.map((item)=>{
                    if (! item.meta.default) {
                        packages.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = packages.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                packages.selected.splice(indexSelected,1);
            } else {
                let indexTarget = packages.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    packages.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({packages});
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
        let loadings =this.state.loadings;
        loadings.packages = true; this.setState({loadings});
        let packages = this.state.packages;
        if (this.state.filter.keywords.length > 0) {
            packages.filtered = packages.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.code.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            )
        } else {
            packages.filtered = packages.unfiltered;
        }
        switch (this.state.filter.sort.by) {
            case 'code' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.code > b.meta.code) ? 1 : ((b.meta.code > a.meta.code) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.code > b.meta.code) ? -1 : ((b.meta.code > a.meta.code) ? 1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'price' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices.base > b.meta.prices.base) ? 1 : ((b.meta.prices.base > a.meta.prices.base) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices.base > b.meta.prices.base) ? -1 : ((b.meta.prices.base > a.meta.prices.base) ? 1 : 0));
                }
                break;
            case 'vat' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices.percent > b.meta.prices.percent) ? 1 : ((b.meta.prices.percent > a.meta.prices.percent) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices.percent > b.meta.prices.percent) ? -1 : ((b.meta.prices.percent > a.meta.prices.percent) ? 1 : 0));
                }
                break;
            case 'duration':
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (durationBy(a.meta.duration.ammount, a.meta.duration.string) > durationBy(b.meta.duration.ammount, b.meta.duration.string)) ? 1 : ((durationBy(b.meta.duration.ammount, b.meta.duration.string) > durationBy(a.meta.duration.ammount, b.meta.duration.string)) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (durationBy(a.meta.duration.ammount, a.meta.duration.string) > durationBy(b.meta.duration.ammount, b.meta.duration.string)) ? -1 : ((durationBy(b.meta.duration.ammount, b.meta.duration.string) > durationBy(a.meta.duration.ammount, a.meta.duration.string)) ? 1 : 0));
                }
                break;
            case 'user' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.users > b.meta.max.users) ? 1 : ((b.meta.max.users > a.meta.max.users) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.users > b.meta.max.users) ? -1 : ((b.meta.max.users > a.meta.max.users) ? 1 : 0));
                }
                break;
            case 'customer' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.customers > b.meta.max.customers) ? 1 : ((b.meta.max.customers > a.meta.max.customers) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.customers > b.meta.max.customers) ? -1 : ((b.meta.max.customers > a.meta.max.customers) ? 1 : 0));
                }
                break;
            case 'voucher' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.vouchers > b.meta.max.vouchers) ? 1 : ((b.meta.max.vouchers > a.meta.max.vouchers) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.vouchers > b.meta.max.vouchers) ? -1 : ((b.meta.max.vouchers > a.meta.max.vouchers) ? 1 : 0));
                }
                break;
            case 'router' :
                if (this.state.filter.sort.dir === 'asc') {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.routers > b.meta.max.routers) ? 1 : ((b.meta.max.routers > a.meta.max.routers) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.max.routers > b.meta.max.routers) ? -1 : ((b.meta.max.routers > a.meta.max.routers) ? 1 : 0));
                }
                break;
        }
        filter.paging = [];
        for (let page = 1; page <= Math.ceil(packages.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        if (filter.paging.length === 1 && filter.page.value > 1) {
            filter.page = {value:1,label:1};
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        packages.filtered = packages.filtered.slice(indexFirst, indexLast);
        loadings.packages = false;
        this.setState({packages,filter,loadings});
    }
    async loadCompanies() {
        if (! this.state.loadings.companies) {
            let loadings = this.state.loadings;
            loadings.companies = true; this.setState({loadings});
            try {
                let response = await crudCompany();
                if (response.data.params === null) {
                    loadings.companies = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.companies = false; this.setState({loadings,companies:response.data.params},()=>this.handleFilter());
                }
            } catch (e) {
                loadings.companies = false; this.setState({loadings});
                showError(e.response.data.message);
            }
        }
    }
    async loadPackages(data = null) {
        if (! this.state.loadings.packages) {
            let packages = this.state.packages;
            let loadings = this.state.loadings;
            packages.selected = [];
            loadings.packages = true; this.setState({loadings});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    packages.unfiltered.splice(data, 1);
                } else {
                    let indexCompany = packages.unfiltered.findIndex((f) => f.value === data.value);
                    if (indexCompany >= 0) {
                        packages.unfiltered[indexCompany] = data;
                    } else {
                        packages.unfiltered.push(data);
                    }
                }
                loadings.packages = false;
                this.setState({packages,loadings},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudCompanyPackage();
                    if (response.data.params === null) {
                        loadings.packages = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.packages = false;
                        packages.unfiltered = response.data.params;
                        this.setState({loadings,packages},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.packages = false; this.setState({loadings});
                    showError(e.response.data.message);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>

                <FormPackage open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleForm} handleUpdate={this.loadPackages}/>

                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('companies.packages.labels.menu')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients'}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-secondary">
                                {this.state.loadings.packages &&
                                    <div className="overlay"><i className="fa-spin fas fa-3x fa-sync-alt"/></div>
                                }
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {this.state.privilege !== null &&
                                            <>
                                                {this.state.privilege.create &&
                                                    <button onClick={()=>this.toggleForm()} disabled={this.state.loadings.packages} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('companies.packages.create.form')}</button>
                                                }
                                                {this.state.privilege.delete &&
                                                    this.state.packages.selected.length > 0 &&
                                                    <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.packages} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('companies.packages.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </h3>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('companies.packages.labels.search')}/>
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
                                            <th rowSpan={2} className="align-middle text-center" width={30}>
                                                <div className="custom-control custom-checkbox">
                                                    <input data-id="" disabled={this.state.loadings.packages} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={90}>
                                                <BtnSort sort="code"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.code')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle">
                                                <BtnSort sort="name"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.name')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={120}>
                                                <BtnSort sort="price"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.price')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={70}>
                                                <BtnSort sort="vat"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.vat')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={100}>
                                                <BtnSort sort="duration"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.duration')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th colSpan={4} className="align-middle text-center">
                                                {Lang.get('companies.packages.labels.table_columns.max.main')}
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={30}>
                                                {Lang.get('messages.users.labels.table_action')}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="align-middle" width={120}>
                                                <BtnSort sort="user"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.max.user')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="customer"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.max.customer')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="voucher"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.max.voucher')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={70}>
                                                <BtnSort sort="router"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.max.router')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.packages.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={11}>Tidak ada data</td></tr>
                                            :
                                            this.state.packages.filtered.map((item,index)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input checked={this.state.packages.selected.findIndex((f) => f === item.value) >= 0} id={`pack_${item.value}`} data-id={item.value} disabled={this.state.loadings.packages} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`pack_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center">{item.meta.code}</td>
                                                    <td>{item.label}</td>
                                                    <td className={item.meta.prices.base === 0 ? 'align-middle text-center' : 'align-middle'}>
                                                        {item.meta.prices.base === 0 ?
                                                            <span className="badge badge-success">FREE</span>
                                                            :
                                                            <>
                                                                <span className="float-left">Rp.</span>
                                                                <span className="float-right">{parseFloat(item.meta.prices.base).toLocaleString('id-ID',{maximumFractionDigits:0})}</span>
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">{parseFloat(item.meta.prices.percent).toLocaleString('id-ID',{maximumFractionDigits:2})}%</td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.duration.ammount === 0 ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            <>{item.meta.duration.ammount} {Lang.get(`durations.${item.meta.duration.string}`)}</>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max.users === 0 ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            parseFloat(item.meta.max.users).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max.customers === 0 ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            parseFloat(item.meta.max.customers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max.vouchers === 0 ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            parseFloat(item.meta.max.vouchers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max.vouchers === 0 ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            parseFloat(item.meta.max.routers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {this.state.privilege !== null &&
                                                            <>
                                                                <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                    <span className="sr-only">Toggle Dropdown</span>
                                                                </button>
                                                                <div className="dropdown-menu" role="menu">
                                                                    {this.state.privilege.update &&
                                                                        <button onClick={()=>this.toggleForm(item)} className="dropdown-item text-primary"><i className="fe fe-edit mr-1"/> {Lang.get('companies.packages.update.form')}</button>
                                                                    }
                                                                    {this.state.privilege.delete &&
                                                                        <button onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fe fe-trash-2 mr-1"/> {Lang.get('companies.packages.delete.form')}</button>
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
                                {this.state.packages.filtered.length > 0 &&
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
                                                    this.state.filter.page.value !== this.state.filter.paging.length &&
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
export default PackagePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PackagePage route="auth.clients.packages"/></React.StrictMode>);
