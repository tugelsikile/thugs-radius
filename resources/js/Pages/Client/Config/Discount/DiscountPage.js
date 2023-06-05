import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import {CardPreloader, formatLocaleString, siteData, sortByCompany} from "../../../../Components/mixedConsts";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {crudCompany} from "../../../../Services/CompanyService";
import {crudDiscounts} from "../../../../Services/ConfigService";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import BtnSort from "../../../Auth/User/Tools/BtnSort";
import FormDiscount from "../../../Auth/Configs/Discount/Tools/FormDiscount";

// noinspection DuplicatedCode
class DiscountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, discounts : false, companies : false },
            privilege : null, menus : [], site : null, companies : [],
            discounts : {
                filtered : [], unfiltered : [], selected : [],
            },
            filter : {
                keywords : '',
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.loadDiscounts = this.loadDiscounts.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
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
                            getPrivileges(this.props.route)
                                .then((response)=>{
                                    loadings.privilege = false;
                                    this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                });
                        });
                    })
                    .then(()=>this.loadDiscounts())
                    .then(()=>this.loadCompanies());
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.discounts.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/auth/configs/discounts`,Lang.get('discounts.delete.warning'),Lang.get('discounts.delete.select'),'app.loadDiscounts()');
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
    handleFilter() {
        let discounts = this.state.discounts;
        discounts.filtered = discounts.unfiltered;
        if (this.state.filter.keywords.length > 0) {
            discounts.filtered = discounts.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.code.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.company !== null && f.meta.company.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            );
        }
        switch (this.state.filter.sort.by) {
            case 'code' :
            case 'amount' :
                if (this.state.filter.sort.dir === 'asc') {
                    discounts.filtered = discounts.filtered.sort((a,b) => (a.meta[this.state.filter.sort.by] > b.meta[this.state.filter.sort.by]) ? 1 : ((b.meta[this.state.filter.sort.by] > a.meta[this.state.filter.sort.by]) ? -1 : 0));
                } else {
                    discounts.filtered = discounts.filtered.sort((a,b) => (a.meta[this.state.filter.sort.by] > b.meta[this.state.filter.sort.by]) ? -1 : ((b.meta[this.state.filter.sort.by] > a.meta[this.state.filter.sort.by]) ? 1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    discounts.filtered = discounts.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    discounts.filtered = discounts.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'company' :
                if (this.state.filter.sort.dir === 'asc') {
                    discounts.filtered = discounts.filtered.sort((a,b) => (sortByCompany(a) > sortByCompany(b)) ? 1 : ((sortByCompany(b) > sortByCompany(a)) ? -1 : 0));
                } else {
                    discounts.filtered = discounts.filtered.sort((a,b) => (sortByCompany(a) > sortByCompany(b)) ? -1 : ((sortByCompany(b) > sortByCompany(a)) ? 1 : 0));
                }
                break;
        }
        this.setState({discounts});
    }
    handleCheck(event) {
        let discounts = this.state.discounts;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            discounts.selected = [];
            if (event.currentTarget.checked) {
                discounts.filtered.map((item)=>{
                    if (! item.meta.default) {
                        discounts.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = discounts.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                discounts.selected.splice(indexSelected,1);
            } else {
                let indexTarget = discounts.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    discounts.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({discounts});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
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
                    showError(e.response.data.message);
                    if (e.response.status === 401) logout();
                }
            }
        }
    }
    async loadDiscounts(data = null) {
        if (! this.state.loadings.discounts) {
            let loadings = this.state.loadings;
            let discounts = this.state.discounts;
            discounts.selected = [];
            loadings.discounts = true; this.setState({loadings,discounts});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    discounts.unfiltered.splice(data,1);
                } else {
                    let index = discounts.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        discounts.unfiltered[index] = data;
                    } else {
                        discounts.unfiltered.push(data);
                    }
                }
                loadings.discounts = false;
                this.setState({loadings,discounts},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudDiscounts();
                    if (response.data.params === null) {
                        loadings.discounts = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        discounts.unfiltered = response.data.params;
                        loadings.discounts = false; this.setState({loadings,discounts},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.discounts = false; this.setState({loadings});
                    showError(e.response.data.message);
                    if (e.response.status === 401) logout();
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormDiscount user={this.state.user} loadings={this.state.loadings} companies={this.state.companies} open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleModal} handleUpdate={this.loadDiscounts}/>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('discounts.labels.menu')} childrens={[
                        {label : Lang.get('configs.labels.menu'), url : getRootUrl() + '/configs' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div className="card card-outline card-primary">
                                {this.state.loadings.discounts && <CardPreloader/>}
                                <div className="card-header">
                                    <div className="card-title">
                                        {this.state.privilege !== null &&
                                            <>
                                                {this.state.privilege.create &&
                                                    <button type="button" onClick={()=>this.toggleModal()} disabled={this.state.loadings.discounts} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('discounts.create.btn')}</button>
                                                }
                                                {this.state.privilege.delete &&
                                                    this.state.discounts.selected.length > 0 &&
                                                    <button type="button" onClick={()=>this.confirmDelete()} disabled={this.state.loadings.discounts} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('discounts.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </div>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('discounts.labels.search')}/>
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
                                                    <input data-id="" disabled={this.state.loadings.discounts} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th className="align-middle" width={120}>
                                                <BtnSort sort="code"
                                                         name={Lang.get('discounts.labels.code')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('discounts.labels.name')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="amount"
                                                         name={Lang.get('discounts.labels.amount')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" width={40}>
                                                {Lang.get('messages.action')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.discounts.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={6}>{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.discounts.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input data-id={item.value} checked={this.state.discounts.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.taxes} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id={`cbx_${item.value}`}/>
                                                            <label htmlFor={`cbx_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">{item.meta.code}</td>
                                                    <td title={item.meta.description} className="align-middle">{item.label}</td>
                                                    <td className="align-middle text-center">
                                                        <span className="float-left">Rp.</span>
                                                        <span className="float-right">{formatLocaleString(item.meta.amount,2)}</span>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {this.state.privilege !== null &&
                                                            <>
                                                                <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                    <span className="sr-only">Toggle Dropdown</span>
                                                                </button>
                                                                <div className="dropdown-menu" role="menu">
                                                                    {this.state.privilege.update &&
                                                                        <button type="button" onClick={()=>this.toggleModal(item)} className="dropdown-item text-primary"><i className="fa fa-pencil-alt mr-1"/> {Lang.get('discounts.update.btn')}</button>
                                                                    }
                                                                    {this.state.privilege.delete &&
                                                                        <button type="button" onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fa fa-trash-alt mr-1"/> {Lang.get('discounts.delete.btn')}</button>
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

export default DiscountPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DiscountPage route="clients.configs.discounts"/></React.StrictMode>);
