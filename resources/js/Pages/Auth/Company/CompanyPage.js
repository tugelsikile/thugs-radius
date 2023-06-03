import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {confirmDialog, showError} from "../../../Components/Toaster";
import {crudCompany, crudCompanyPackage} from "../../../Services/CompanyService";
import PageLoader from "../../../Components/PageLoader";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import MainFooter from "../../../Components/Layout/MainFooter";
import PageTitle from "../../../Components/Layout/PageTitle";
import BtnSort from "../User/Tools/BtnSort";
import {CardPreloader, formatLocaleDate, sortActiveCompany, ucFirst} from "../../../Components/mixedConsts";
import {allProvinces} from "../../../Services/RegionService";
import FormCompany from "./Tools/FormCompany";
import moment from "moment";

// noinspection DuplicatedCode
class CompanyPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, companies : false, packages : false, provinces : false },
            privilege : null, menus : [], packages : [], provinces : [],
            companies : { filtered : [], unfiltered : [], selected : [] },
            filter : {
                keywords : '',
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.loadCompanies = this.loadCompanies.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.toggleForm = this.toggleForm.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.confirmActive = this.confirmActive.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.privilege) {
            if (this.state.privilege === null) {
                let loadings = this.state.loadings;
                loadings.privilege = true; this.setState({loadings});
                getPrivileges(this.props.route)
                    .then((response) => this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadCompanies().then(()=>this.loadPackages().then(()=>this.loadProvinces())))
                    .then(()=>{
                        loadings.privilege = false; this.setState({loadings});
                    });
            }
        }
    }
    confirmActive(data) {
        confirmDialog(this, data.value,'patch',`${window.origin}/api/auth/companies/active`,'Warning', Lang.get('companies.active.confirm'),'app.loadCompanies(response.data.params)');
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.companies.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/auth/companies`,Lang.get('companies.delete.form'),Lang.get('companies.delete.confirm'),'app.loadCompanies()');
    }
    toggleForm(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data; this.setState({modal});
    }
    handleCheck(event) {
        let companies = this.state.companies;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            companies.selected = [];
            if (event.currentTarget.checked) {
                companies.filtered.map((item)=>{
                    if (! item.meta.default) {
                        companies.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = companies.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                companies.selected.splice(indexSelected,1);
            } else {
                let indexTarget = companies.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    companies.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({companies});
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
        let companies = this.state.companies;
        if (this.state.filter.keywords.length > 0) {
            companies.filtered = companies.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.address.email.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.code.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            )
        } else {
            companies.filtered = companies.unfiltered;
        }
        console.log(this.state.filter.sort.by);
        switch (this.state.filter.sort.by) {
            case 'code' :
                if (this.state.filter.sort.dir === 'asc') {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.code > b.meta.code) ? 1 : ((b.meta.code > a.meta.code) ? -1 : 0));
                } else {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.code > b.meta.code) ? -1 : ((b.meta.code > a.meta.code) ? 1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    companies.filtered = companies.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    companies.filtered = companies.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'email' :
                if (this.state.filter.sort.dir === 'asc') {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.address.email > b.meta.address.email) ? 1 : ((b.meta.address.email > a.meta.address.email) ? -1 : 0));
                } else {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.address.email > b.meta.address.email) ? -1 : ((b.meta.address.email > a.meta.address.email) ? 1 : 0));
                }
                break;
            case 'expired' :
                if (this.state.filter.sort.dir === 'asc') {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.expiry > b.meta.expiry) ? 1 : ((b.meta.expiry > a.meta.expiry) ? -1 : 0));
                } else {
                    companies.filtered = companies.filtered.sort((a,b) => (a.meta.expiry > b.meta.expiry) ? -1 : ((b.meta.expiry > a.meta.expiry) ? 1 : 0));
                }
                break;
            case 'active' :
                if (this.state.filter.sort.dir === 'asc') {
                    companies.filtered = companies.filtered.sort((a,b) => (sortActiveCompany(a) > sortActiveCompany(b)) ? 1 : ((sortActiveCompany(b) > sortActiveCompany(a)) ? -1 : 0));
                } else {
                    companies.filtered = companies.filtered.sort((a,b) => (sortActiveCompany(a) > sortActiveCompany(b)) ? -1 : ((sortActiveCompany(b) > sortActiveCompany(a)) ? 1 : 0));
                }
                break;
        }
        this.setState({companies});
    }
    async loadProvinces() {
        if (! this.state.loadings.provinces) {
            if (this.state.provinces.length === 0) {
                let loadings = this.state.loadings;
                loadings.provinces = true; this.setState({loadings});
                try {
                    let response = await allProvinces();
                    if (response.data.params === null) {
                        loadings.provinces = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.provinces = false; this.setState({loadings,provinces:response.data.params});
                    }
                } catch (e) {
                    loadings.provinces = false; this.setState({loadings});
                    showError(e.response.data.message);
                }
            }
        }
    }
    async loadPackages() {
        if (! this.state.loadings.packages) {
            if (this.state.packages.length === 0) {
                let loadings = this.state.loadings;
                loadings.packages = true; this.setState({loadings});
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
                    showError(e.response.data.message);
                }
            }
        }
    }
    async loadCompanies(data = null) {
        if (! this.state.loadings.companies) {
            let companies = this.state.companies;
            let loadings = this.state.loadings;
            loadings.companies = true; this.setState({loadings});
            companies.selected = [];
            if (data !== null) {
                if (Number.isInteger(data)) {
                    companies.unfiltered.splice(data, 1);
                } else {
                    let indexCompany = companies.unfiltered.findIndex((f) => f.value === data.value);
                    if (indexCompany >= 0) {
                        companies.unfiltered[indexCompany] = data;
                    } else {
                        companies.unfiltered.push(data);
                    }
                }
                loadings.companies = false;
                this.setState({companies,loadings},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudCompany();
                    if (response.data.params === null) {
                        loadings.companies = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        companies.unfiltered = response.data.params;
                        loadings.companies = false; this.setState({loadings,companies},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.companies = false; this.setState({loadings});
                    showError(e.response.data.message);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>

                <FormCompany open={this.state.modal.open} data={this.state.modal.data} loadings={this.state.loadings} provinces={this.state.provinces} packages={this.state.packages} handleClose={this.toggleForm} handleUpdate={this.loadCompanies}/>

                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('companies.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-secondary">
                                {this.state.loadings.companies &&
                                    <CardPreloader/>
                                }
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {this.state.privilege !== null &&
                                            <>
                                                {this.state.privilege.create &&
                                                    <button onClick={()=>this.toggleForm()} disabled={this.state.loadings.levels} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('companies.create.form')}</button>
                                                }
                                                {this.state.privilege.delete &&
                                                    this.state.companies.selected.length > 0 &&
                                                    <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.levels} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('companies.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </h3>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('companies.labels.search')}/>
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
                                                    <input data-id="" disabled={this.state.loadings.companies} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th width={80}>
                                                <BtnSort sort="code"
                                                         name={Lang.get('companies.labels.table_columns.code')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th>
                                                <BtnSort sort="name"
                                                         name={Lang.get('companies.labels.table_columns.name')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th>
                                                <BtnSort sort="email"
                                                         name={Lang.get('companies.labels.table_columns.email')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th>
                                                {Lang.get('companies.packages.labels.table_columns.name')}
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="active"
                                                         name={Lang.get('companies.labels.table_columns.active')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="expired"
                                                         name={Lang.get('companies.labels.table_columns.expired.at')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" width={50}>{Lang.get('messages.users.labels.table_action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.companies.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={6}>Tidak ada data</td></tr>
                                            :
                                            this.state.companies.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input id={`cbx_${item.value}`} data-id={item.value} checked={this.state.companies.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.companies} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                            <label htmlFor={`cbx_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center">{item.meta.code}</td>
                                                    <td className="align-middle">
                                                        <strong className="text-primary"><i className="fas fa-info-circle mr-1"/>{item.label}</strong><br/>
                                                        <span className="small text-muted">
                                                            <i className="fas fa-building mr-1"/>{item.meta.address.street}, {ucFirst(item.meta.address.village.name)} {ucFirst(item.meta.address.district.name)} {ucFirst(item.meta.address.city.name)} {ucFirst(item.meta.address.province.name)} {item.meta.address.postal}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle">{item.meta.address.email}</td>
                                                    <td className="align-middle">
                                                        <ul className="list-unstyled">
                                                            {item.meta.packages.map((pack)=>
                                                                <li key={pack.package.value}><i className="fas fa-minus mr-1"/> {pack.package.label}</li>
                                                            )}
                                                        </ul>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.timestamps.active.at === null ?
                                                            <button onClick={()=>this.confirmActive(item)} type="button" className="btn btn-xs btn-block btn-outline-warning text-sm">{Lang.get('companies.labels.status.inactive')}</button>
                                                            :
                                                            <>
                                                                <button onClick={()=>this.confirmActive(item)} type="button" className="btn btn-xs btn-block btn-outline-success text-sm">{Lang.get('companies.labels.status.active')}</button>
                                                                <span className="small">{formatLocaleDate(item.meta.timestamps.active.at)}</span>
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="align-middle">
                                                        {item.meta.expiry === null ?
                                                            <span className="badge badge-success">Unlimited</span>
                                                            :
                                                            moment().isBefore(moment(item.meta.expiry)) ?
                                                                <span className="badge badge-primary">{moment(item.meta.expiry).locale(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-EN').format(localStorage.getItem('locale_date_format'))}</span>
                                                                :
                                                                <span className="badge badge-danger">{moment(item.meta.expiry).locale(localStorage.getItem('locale_lang') === 'id' ? 'id-ID' : 'en-EN').format(localStorage.getItem('locale_date_format'))}</span>

                                                        }
                                                    </td>
                                                    <td className="align-top text-center">
                                                        {this.state.privilege !== null &&
                                                            <>
                                                                <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                    <span className="sr-only">Toggle Dropdown</span>
                                                                </button>
                                                                <div className="dropdown-menu" role="menu">
                                                                    {this.state.privilege.update &&
                                                                        <>
                                                                            <button onClick={()=>this.toggleForm(item)} className="dropdown-item text-primary"><i className="fa fa-pen-alt mr-1"/> {Lang.get('companies.update.form')}</button>
                                                                            <button onClick={()=>this.confirmActive(item)} className={item.meta.timestamps.active.at === null ? "dropdown-item text-success" : "dropdown-item text-warning"}><i className={item.meta.timestamps.active.at === null ? "fa fa-check-circle mr-1" : "fa fa-times-circle mr-1"}/> {item.meta.timestamps.active.at === null ? Lang.get('companies.active.status.active') : Lang.get('companies.active.status.inactive')}</button>
                                                                        </>
                                                                    }
                                                                    {this.state.privilege.delete &&
                                                                        <button onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fa fa-trash-alt mr-1"/> {Lang.get('companies.delete.form')}</button>
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
export default CompanyPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><CompanyPage route="auth.clients"/></React.StrictMode>);
