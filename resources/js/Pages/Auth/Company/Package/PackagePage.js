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
import {CardPreloader, durationBy, siteData} from "../../../../Components/mixedConsts";
import FormPackage from "./Tools/FormPackage";
import {crudDiscounts, crudTaxes} from "../../../../Services/ConfigService";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import {TableAction} from "../../../../Components/TableComponent";
import {FormatPrice} from "../../../Client/Customer/Tools/Mixed";

class PackagePage extends React.Component {
    routers;
    vouchers;
    customers;
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privilege : false, companies : false, packages : false, discounts : false, taxes : false, site : false },
            privilege : null, menus : [], companies : [], discounts : [], taxes : [],
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
                siteData().then((response)=>this.setState({site:response}));
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                getPrivileges(this.props.route)
                    .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadPackages().then(()=>this.loadCompanies()))
                    .then(()=>this.loadDiscounts())
                    .then(()=>this.loadTaxes())
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
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices > b.meta.prices) ? 1 : ((b.meta.prices > a.meta.prices) ? -1 : 0));
                } else {
                    packages.filtered = packages.filtered.sort((a,b) => (a.meta.prices > b.meta.prices) ? -1 : ((b.meta.prices > a.meta.prices) ? 1 : 0));
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
    async loadTaxes() {
        if (! this.state.loadings.taxes ) {
            let loadings = this.state.loadings;
            loadings.taxes = true; this.setState({loadings});
            try {
                let response = await crudTaxes();
                if (response.data.params === null) {
                    loadings.taxes = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.taxes = false; this.setState({loadings,taxes:response.data.params});
                }
            } catch (e) {
                loadings.taxes = false; this.setState({loadings});
                showError(e.response.data.message);
            }
        }
    }
    async loadDiscounts() {
        if (! this.state.loadings.discounts) {
            let loadings = this.state.loadings;
            loadings.discounts = true; this.setState({loadings});
            try {
                let response = await crudDiscounts();
                if (response.data.params === null) {
                    loadings.discounts = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.discounts = false; this.setState({loadings,discounts:response.data.params});
                }
            } catch (e) {
                loadings.discounts = false; this.setState({loadings});
                showError(e.response.data.message);
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

                <FormPackage discounts={this.state.discounts} taxes={this.state.taxes} open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleForm} handleUpdate={this.loadPackages}/>

                <PageLoader/>
                <HeaderAndSideBar site={this.state.site} root={this.state.root} user={this.state.user} route={this.props.route} menus={this.state.menus}/>

                <div className="content-wrapper">

                    <PageTitle title={Lang.get('companies.packages.labels.menu')} childrens={[
                        {label : Lang.get('companies.labels.menu'), url : getRootUrl() + '/clients'}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-secondary">
                                {this.state.loadings.packages &&
                                    <CardPreloader/>
                                }
                                <div className="card-header pl-2">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.packages}
                                                   langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('companies.packages.labels.menu')}),delete:Lang.get('labels.delete.select',{Attribute:Lang.get('companies.packages.labels.menu')})}}
                                                   selected={this.state.packages.selected}
                                                   handleModal={this.toggleForm}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('companies.packages.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            {this.state.packages.filtered.length > 0 &&
                                                <th rowSpan={2} className="align-middle text-center pl-2" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input data-id="" disabled={this.state.loadings.packages} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th rowSpan={2} className={this.state.packages.filtered.length === 0 ? "align-middle pl-2" : "align-middle"} width={90}>
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
                                            <th rowSpan={2} className="align-middle" width={100}>
                                                <BtnSort sort="duration"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.duration')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th colSpan={4} className="align-middle text-xs text-center">
                                                {Lang.get('companies.packages.labels.table_columns.max.main')}
                                            </th>
                                            <th rowSpan={2} className="align-middle" width={120}>
                                                <BtnSort sort="price"
                                                         filter={this.state.filter}
                                                         name={Lang.get('companies.packages.labels.table_columns.price')}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle text-xs pr-2" width={30}>
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
                                            <tr><td className="align-middle text-center" colSpan={9}>Tidak ada data</td></tr>
                                            :
                                            this.state.packages.filtered.map((item,index)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center pl-2">
                                                        <div className="custom-control custom-checkbox">
                                                            <input checked={this.state.packages.selected.findIndex((f) => f === item.value) >= 0} id={`pack_${item.value}`} data-id={item.value} disabled={this.state.loadings.packages} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`pack_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center text-xs">{item.meta.code}</td>
                                                    <td colSpan={item.meta.additional ? 6 : 1} className="align-middle text-xs">{item.label}</td>
                                                    {! item.meta.additional &&
                                                        <React.Fragment>
                                                            <td className="align-middle text-xs text-center">
                                                                {item.meta.duration.amount === 0 ?
                                                                    <span className="badge badge-success">Unlimited</span>
                                                                    :
                                                                    <>{item.meta.duration.amount} {Lang.get(`durations.${item.meta.duration.string}`)}</>
                                                                }
                                                            </td>
                                                            <td className="align-middle text-center text-xs">
                                                                {item.meta.max.users === 0 ?
                                                                    <span className="badge badge-success">Unlimited</span>
                                                                    :
                                                                    parseFloat(item.meta.max.users).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                                }
                                                            </td>
                                                            <td className="align-middle text-center text-xs">
                                                                {item.meta.max.customers === 0 ?
                                                                    <span className="badge badge-success">Unlimited</span>
                                                                    :
                                                                    parseFloat(item.meta.max.customers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                                }
                                                            </td>
                                                            <td className="align-middle text-center text-xs">
                                                                {item.meta.max.vouchers === 0 ?
                                                                    <span className="badge badge-success">Unlimited</span>
                                                                    :
                                                                    parseFloat(item.meta.max.vouchers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                                }
                                                            </td>
                                                            <td className="align-middle text-center text-xs">
                                                                {item.meta.max.vouchers === 0 ?
                                                                    <span className="badge badge-success">Unlimited</span>
                                                                    :
                                                                    parseFloat(item.meta.max.routers).toLocaleString('id-ID',{maximumFractionDigits:0})
                                                                }
                                                            </td>
                                                        </React.Fragment>
                                                    }
                                                    <td className={item.meta.prices.base === 0 ? 'align-middle text-xs text-center' : 'text-xs align-middle'}>
                                                        {item.meta.prices.base === 0 ?
                                                            <span className="badge badge-success">FREE</span>
                                                            :
                                                            FormatPrice(item.meta.prices)
                                                        }
                                                    </td>
                                                    <TableAction
                                                                 privilege={this.state.privilege} item={item} className="pr-2"
                                                                 langs={{update:Lang.get('labels.update.label',{Attribute:Lang.get('companies.packages.labels.menu')}), delete:Lang.get('labels.delete.label',{Attribute:Lang.get('companies.packages.labels.menu')})}} toggleModal={this.toggleForm} confirmDelete={this.confirmDelete}/>
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
