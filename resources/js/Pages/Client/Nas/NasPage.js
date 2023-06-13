import React from "react";
import ReactDOM from "react-dom/client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../Components/mixedConsts";
import {crudNas, reloadNasStatus} from "../../../Services/NasService";
import {confirmDialog, showError} from "../../../Components/Toaster";
import PageLoader from "../../../Components/PageLoader";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import MainFooter from "../../../Components/Layout/MainFooter";
import PageTitle from "../../../Components/Layout/PageTitle";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {crudCompany} from "../../../Services/CompanyService";
import FormNas from "./Tools/FormNas";
import StatusNas from "./Tools/StatusNas";

// noinspection DuplicatedCode
class NasPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : false, companies : false },
            privilege : null, menus : [], site : null, companies : [],
            nas : { filtered : [], unfiltered : [], selected : [], },
            filter : {
                keywords : '',
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.loadNas = this.loadNas.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.reloadRouterStatus = this.reloadRouterStatus.bind(this);
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
                    .then(()=>this.loadNas())
                    .then(()=>this.loadCompanies());
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.nas.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/nas`,Lang.get('nas.delete.warning'),Lang.get('nas.delete.select'),'app.loadNas()');
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
        let nas = this.state.nas;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            nas.selected = [];
            if (event.currentTarget.checked) {
                nas.filtered.map((item)=>{
                    if (! item.meta.default) {
                        nas.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = nas.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                nas.selected.splice(indexSelected,1);
            } else {
                let indexTarget = nas.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    nas.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({nas});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let nas = this.state.nas;
        let filter = this.state.filter;
        loadings.nas = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            nas.filtered = nas.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.description.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.auth.method.indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.auth.host.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            nas.filtered = nas.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    nas.filtered = nas.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    nas.filtered = nas.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'status' :
                if (filter.sort.dir === 'asc') {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.status.success ? 1 : 0 > b.meta.status.success ? 1 : 0) ? 1 : ((b.meta.status.success ? 1 : 0 > a.meta.status.success ? 1 : 0) ? -1 : 0));
                } else {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.status.success ? 1 : 0 > b.meta.status.success ? 1 : 0) ? -1 : ((b.meta.status.success ? 1 : 0 > a.meta.status.success ? 1 : 0) ? 1 : 0));
                }
                break;
            case 'host' :
                if (filter.sort.dir === 'asc') {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.auth.method === 'api' ? a.meta.auth.ip : a.meta.auth.host > b.meta.auth.method === 'api' ? b.meta.auth.ip : b.meta.auth.host) ? 1 : ((b.meta.auth.method === 'api' ? b.meta.auth.ip : b.meta.auth.host > a.meta.auth.method === 'api' ? a.meta.auth.ip : a.meta.auth.host) ? -1 : 0));
                } else {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.auth.method === 'api' ? a.meta.auth.ip : a.meta.auth.host > b.meta.auth.method === 'api' ? b.meta.auth.ip : b.meta.auth.host) ? -1 : ((b.meta.auth.method === 'api' ? b.meta.auth.ip : b.meta.auth.host > a.meta.auth.method === 'api' ? a.meta.auth.ip : a.meta.auth.host) ? 1 : 0));
                }
                break;
            case 'method' :
            case 'port' :
            case 'user' :
            case 'pass' :
                if (filter.sort.dir === 'asc') {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.auth[filter.sort.by] > b.meta.auth[filter.sort.by]) ? 1 : ((b.meta.auth[filter.sort.by] > a.meta.auth[filter.sort.by]) ? -1 : 0));
                } else {
                    nas.filtered = nas.filtered.sort((a,b) => (a.meta.auth[filter.sort.by] > b.meta.auth[filter.sort.by]) ? -1 : ((b.meta.auth[filter.sort.by] > a.meta.auth[filter.sort.by]) ? 1 : 0));
                }
                break;

        }
        loadings.nas = false;
        this.setState({loadings,nas});
    }
    async reloadRouterStatus(data) {
        let nas = this.state.nas;
        let index = nas.unfiltered.findIndex((f) => f.value === data.value);
        if (index >= 0) {
            nas.unfiltered[index].loading = true;
            this.setState({nas},()=>this.handleFilter());
            try {
                const formData = new FormData();
                formData.append(Lang.get('nas.form_input.name'), data.value);
                let response = await reloadNasStatus(formData);
                if (response.data.params === null) {
                    nas.unfiltered[index].meta.status.success = false;
                    nas.unfiltered[index].meta.status.message = response.data.message;
                    nas.unfiltered[index].loading = false; this.setState({nas},()=>this.handleFilter());
                    showError(response.data.message);
                } else {
                    nas.unfiltered[index].loading = false;
                    nas.unfiltered[index].meta.status = response.data.params;
                    this.setState({nas},()=>this.handleFilter());
                }
            } catch (e) {
                nas.unfiltered[index].meta.status.message = e.response.data.message;
                nas.unfiltered[index].meta.status.success = false;
                nas.unfiltered[index].loading = false;
                this.setState({nas},()=>this.handleFilter());
                responseMessage(e);
            }
        }
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
                    responseMessage(e);
                }
            }
        }
    }
    async loadNas(data = null) {
        if (! this.state.loadings.nas) {
            let loadings = this.state.loadings;
            let nas = this.state.nas;
            loadings.nas = true; nas.selected = [];
            this.setState({loadings,nas});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    nas.unfiltered.splice(data,1);
                } else {
                    let index = nas.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        nas.unfiltered[index] = data;
                        nas.unfiltered[index].loading = false;
                    } else {
                        data.loading = false;
                        nas.unfiltered.push(data);
                    }
                }
                loadings.nas = false;
                this.setState({loadings,nas},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.nas = false;
                        nas.unfiltered = response.data.params;
                        nas.unfiltered.map((item, index)=>{
                            nas.unfiltered[index].loading = false;
                        });
                        this.setState({loadings,nas},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.nas = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormNas open={this.state.modal.open}
                         data={this.state.modal.data}
                         user={this.state.user} nasCounter={this.state.nas.unfiltered.length}
                         companies={this.state.companies} handleClose={this.toggleModal} handleUpdate={this.loadNas}
                         loadings={this.state.loadings}/>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('nas.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <StatusNas loading={this.state.loadings.nas} nas={this.state.nas}/>

                            <div className="card card-outline card-primary">
                                {this.state.loadings.nas && <CardPreloader/>}
                                <div className="card-header">
                                    <div className="card-title">
                                        {this.state.privilege !== null &&
                                            <>
                                                {this.state.privilege.create &&
                                                    <button type="button" onClick={()=>this.toggleModal()} disabled={this.state.loadings.nas} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('nas.create.btn')}</button>
                                                }
                                                {this.state.privilege.delete &&
                                                    this.state.nas.selected.length > 0 &&
                                                    <button type="button" onClick={()=>this.confirmDelete()} disabled={this.state.loadings.nas} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('nas.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </div>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('nas.labels.search')}/>
                                            <div className="input-group-append"><button type="submit" className="btn btn-default"><i className="fas fa-search"/></button></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            {this.state.nas.filtered.length > 0 &&
                                                <th rowSpan={2} className="align-middle text-center" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input data-id="" disabled={this.state.loadings.nas} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th rowSpan={2} className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('nas.labels.name')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th colSpan={5} className="align-middle">{Lang.get('nas.labels.method.label')}</th>
                                            <th rowSpan={2} className="align-middle">
                                                <BtnSort sort="status"
                                                         name={Lang.get('nas.labels.status.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle text-center" width={30}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        <tr>
                                            <th className="align-middle">
                                                <BtnSort sort="method"
                                                         name={Lang.get('nas.labels.method.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="host"
                                                         name={Lang.get('nas.labels.ip.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="port"
                                                         name={Lang.get('nas.labels.port.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="user"
                                                         name={Lang.get('nas.labels.user.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="pass"
                                                         name={Lang.get('nas.labels.pass.short')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.nas.filtered.length === 0 ?
                                            <tr><td colSpan={8} className="align-middle text-center">{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.nas.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input id={`cbx_${item.value}`} data-id={item.value} checked={this.state.nas.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.nas} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" />
                                                            <label htmlFor={`cbx_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle">{item.label}</td>
                                                    <td className="align-middle">{item.meta.auth.method}</td>
                                                    <td className="align-middle">
                                                        {item.meta.auth.method === 'api' ? item.meta.auth.ip : item.meta.auth.host}
                                                    </td>
                                                    <td className="align-middle">{item.meta.auth.port}</td>
                                                    <td className="align-middle text-center">*****</td>
                                                    <td className="align-middle text-center">*****</td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.status.success ?
                                                            <span onClick={()=>this.reloadRouterStatus(item)} style={{cursor:'pointer'}} title={item.meta.status.message} className="badge badge-success">
                                                                {item.loading && <FontAwesomeIcon icon="circle-notch" spin={true} className="mr-1"/> }
                                                                CONNECTED
                                                            </span>
                                                            :
                                                            <span onClick={()=>this.reloadRouterStatus(item)} style={{cursor:'pointer'}} title={item.meta.status.message} className="badge badge-warning">
                                                                {item.loading && <FontAwesomeIcon icon="circle-notch" spin={true} className="mr-1"/> }
                                                                NOT CONNECTED
                                                            </span>
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
                                                                        <button type="button" onClick={()=>this.toggleModal(item)} className="dropdown-item text-primary"><i className="fa fa-pencil-alt mr-1"/> {Lang.get('nas.update.btn')}</button>
                                                                    }
                                                                    {this.state.privilege.delete &&
                                                                        <button type="button" onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fa fa-trash-alt mr-1"/> {Lang.get('nas.delete.btn')}</button>
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
export default NasPage ;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><NasPage route="clients.nas"/></React.StrictMode>)
