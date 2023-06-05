import React from "react";
import ReactDOM from "react-dom/client";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import BtnSort from "../Tools/BtnSort";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {crudPrivileges, setPrivileges} from "../../../../Services/UserService";
import {crudCompany} from "../../../../Services/CompanyService";
import FormPrivilege from "./Tools/FormPrivilege";
import {CardPreloader, siteData} from "../../../../Components/mixedConsts";

// noinspection DuplicatedCode
class PrivilegePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privilege : false, levels : false, companies : false, site : false },
            privilege : null, menus : [], companies : [],
            levels : {
                filtered : [], unfiltered : [], selected : [],
            },
            filter : {
                keywords : '',
                sort : { by : 'name', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.loadLevels = this.loadLevels.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleCheckPrivilege = this.handleCheckPrivilege.bind(this);
        this.setPrivilege = this.setPrivilege.bind(this);
        this.loadCompanies = this.loadCompanies.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        let loadings = this.state.loadings;
        if (! loadings.privilege) {
            siteData().then((response)=>this.setState({site:response}));
            loadings.privilege = true; this.setState({loadings});
            if (this.state.privilege === null) {
                getPrivileges(this.props.route)
                    .then((response)=>this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>this.loadCompanies())
                    .then(()=>this.loadLevels())
                    .then(()=>{
                        loadings.privilege = false;
                        this.setState({loadings});
                    });
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.levels.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this, ids,'delete',`${window.origin}/api/auth/users/privileges`,Lang.get('messages.privileges.delete.form'),Lang.get('messages.privileges.delete.select'),'app.loadLevels()');
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data; this.setState({modal});
    }
    handleCheckPrivilege(event) {
        let levels = this.state.levels;
        let indexLevel = parseInt(event.currentTarget.getAttribute('data-index-level'));
        if (indexLevel >= 0) {
            let type = event.currentTarget.getAttribute('data-type');
            let isChild = eval(event.currentTarget.getAttribute('data-child'));
            if (! isChild) { //is parent
                let indexMenu = parseInt(event.currentTarget.getAttribute('data-index'));
                //console.log(indexLevel, type, isChild, indexMenu, levels.filtered[indexLevel]);
                if (indexMenu >= 0) {
                    let filterMenu = levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client);
                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can[type] = ! this.state.levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can[type];
                    switch (type) {
                        case 'read' :
                            if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.read) {
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.create = false;
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.update = false;
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.delete = false;
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.childrens.map((item,index)=>{
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.childrens[index].meta.can.read = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.childrens[index].meta.can.create = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.childrens[index].meta.can.update = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.childrens[index].meta.can.delete = false;
                                });
                            }
                            break;
                        case 'create' :
                            if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.create) {
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.update = false;
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.delete = false;
                            }
                            break;
                        case 'update' :
                            if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.update) {
                                levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexMenu].meta.can.delete = false;
                            }
                            break;
                    }
                }
            } else {
                let indexParent = parseInt(event.currentTarget.getAttribute('data-index-parent'));
                if (indexParent >= 0) {
                    let indexMenu = parseInt(event.currentTarget.getAttribute('data-index'));
                    if (indexMenu >= 0) {
                        levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can[type] = ! this.state.levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can[type];
                        switch (type) {
                            case 'read' :
                                if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.read) {
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.create = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.update = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.delete = false;
                                }
                                break;
                            case 'create' :
                                if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.create) {
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.update = false;
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.delete = false;
                                }
                                break;
                            case 'update' :
                                if (! levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.update) {
                                    levels.filtered[indexLevel].meta.privileges.filter((f) => f.meta.client === levels.filtered[indexLevel].meta.client)[indexParent].meta.childrens[indexMenu].meta.can.delete = false;
                                }
                                break;
                        }
                    }
                }
            }
        }
        const formData = new FormData();
        formData.append('_method','patch');
        formData.append('id', event.currentTarget.getAttribute('data-id'));
        formData.append('type', event.currentTarget.getAttribute('data-type'));
        this.setState({levels},()=>this.setPrivilege(formData));
    }
    handleSort(event) {
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
        let levels = this.state.levels;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            levels.selected = [];
            if (event.currentTarget.checked) {
                levels.filtered.map((item)=>{
                    if (! item.meta.default) {
                        levels.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = levels.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                levels.selected.splice(indexSelected,1);
            } else {
                let indexTarget = levels.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    if (! levels.unfiltered[indexTarget].meta.default) {
                        levels.selected.push(event.currentTarget.getAttribute('data-id'));
                    }
                }
            }
        }
        this.setState({levels});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter(){
        let loadings = this.state.loadings;
        let filter = this.state.filter;
        loadings.levels = true; this.setState({loadings});
        let levels = this.state.levels;
        if (this.state.filter.keywords.length > 0) {
            levels.filtered = levels.unfiltered.filter((f) => f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1)
        } else {
            levels.filtered = levels.unfiltered;
        }
        switch (this.state.filter.sort.by) {
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    levels.filtered = levels.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                } else {
                    levels.filtered = levels.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                }
                break;
            case 'super' :
                if (this.state.filter.sort.dir === 'asc') {
                    levels.filtered = levels.filtered.sort((a,b) => (a.meta.super > b.meta.super) ? -1 : ((b.meta.super > a.meta.super) ? 1 : 0));
                } else {
                    levels.filtered = levels.filtered.sort((a,b) => (a.meta.super > b.meta.super) ? 1 : ((b.meta.super > a.meta.super) ? -1 : 0));
                }
                break;
            case 'client' :
                if (this.state.filter.sort.dir === 'asc') {
                    levels.filtered = levels.filtered.sort((a,b) => (a.meta.client > b.meta.client) ? -1 : ((b.meta.client > a.meta.client) ? 1 : 0));
                } else {
                    levels.filtered = levels.filtered.sort((a,b) => (a.meta.client > b.meta.client) ? 1 : ((b.meta.client > a.meta.client) ? -1 : 0));
                }
                break;
        }
        filter.paging = [];
        for (let page = 1; page <= Math.ceil(levels.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        levels.filtered = levels.filtered.slice(indexFirst, indexLast);
        loadings.levels = false;
        this.setState({levels,loadings});
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
    async setPrivilege(formData) {
        try {
            let response = await setPrivileges(formData);
            if (response.data.params === null) {
                showError(response.data.message);
            }
        } catch (e) {
            showError(e.response.data.message);
            if (e.response.status === 401) logout();
        }
    }
    async loadLevels(data = null) {
        if (!this.state.loadings.levels) {
            let loadings = this.state.loadings;
            let levels = this.state.levels;
            levels.selected = [];
            loadings.levels = true; this.setState({loadings,levels});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    levels.unfiltered.splice(data,1);
                } else {
                    let indexLevel = levels.unfiltered.findIndex((f) => f.value === data.value);
                    if (indexLevel >= 0) {
                        levels.unfiltered[indexLevel] = data;
                    } else {
                        levels.unfiltered.push(data);
                    }
                }
                loadings.levels = false;
                this.setState({loadings,levels},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudPrivileges();
                    if (response.data.params === null) {
                        loadings.levels = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        levels.unfiltered = response.data.params;
                        loadings.levels = false; this.setState({loadings,levels},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.levels = false; this.setState({loadings});
                    showError(e.response.data.message);
                    if (e.response.status === 401) logout();
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>

                <FormPrivilege open={this.state.modal.open} data={this.state.modal.data} companies={this.state.companies} loadings={this.state.loadings} handleClose={this.toggleModal} handleUpdate={this.loadLevels}/>

                <PageLoader/>
                <MainHeader site={this.state.site} root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>

                <div className="content-wrapper">

                    <PageTitle title={Lang.get('messages.privileges.labels.menu')} childrens={[
                        { label : Lang.get('messages.users.labels.menu'), url : getRootUrl() + '/users' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="alert alert-warning mb-3 alert-dismissible">
                                <i className="fas fa-exclamation-triangle mr-1"/>{Lang.get('messages.users.labels.warning.title')}
                                <br/>{Lang.get('messages.users.labels.warning.content')}
                                <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
                            </div>

                            <div className="card">
                                {this.state.loadings.levels &&
                                    <CardPreloader/>
                                }
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {this.state.privilege !== null &&
                                            <>
                                                {this.state.privilege.create &&
                                                    <button onClick={()=>this.toggleModal()} disabled={this.state.loadings.levels} className="btn btn-tool"><i className="fas fa-plus"/> {Lang.get('messages.privileges.create.form')}</button>
                                                }
                                                {this.state.privilege.delete &&
                                                    this.state.levels.selected.length > 0 &&
                                                    <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.levels} className="btn btn-tool"><i className="fas fa-trash-alt"/> {Lang.get('messages.privileges.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </h3>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('messages.privileges.labels.search')}/>
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search"/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-head-fixed table-sm">
                                        <thead>
                                        <tr>
                                            <th className="align-middle" width={50}>
                                                <div className="custom-control custom-checkbox">
                                                    <input data-id="" disabled={this.state.loadings.levels} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort name={Lang.get('messages.privileges.labels.name')}
                                                         sort="name"
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                {Lang.get('messages.company.labels.name')}
                                            </th>
                                            <th className="align-middle" width={50}>
                                                <BtnSort name={Lang.get('messages.privileges.labels.super')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}
                                                         sort="super"/>
                                            </th>
                                            <th className="align-middle" width={50}>
                                                <BtnSort name={Lang.get('messages.privileges.labels.client')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}
                                                         sort="client"/>
                                            </th>
                                            <th className="align-middle" width={50}>
                                                {Lang.get('messages.users.labels.table_action')}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.levels.filtered.length === 0 ?
                                            <tr><td className="align-middle text-xl-center" colSpan={5}>Tidak ada data</td></tr>
                                            :
                                            this.state.levels.filtered.map((item, indexLevel)=>
                                                <React.Fragment key={item.value}>
                                                    <tr key={item.value}>
                                                        <td className="align-middle text-center">
                                                            {! item.meta.default &&
                                                                <div className="custom-control custom-checkbox">
                                                                    <input data-id={item.value} checked={this.state.levels.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.levels} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id={`checkbox_${item.value}`}/>
                                                                    <label htmlFor={`checkbox_${item.value}`} className="custom-control-label"/>
                                                                </div>
                                                            }
                                                        </td>
                                                        <td className="align-middle">
                                                            <a href="#" onClick={(e)=>{
                                                                e.preventDefault();
                                                                let element = document.getElementById(`table_${item.value}`);
                                                                element.style.visibility = element.style.visibility === 'collapse' ? null : 'collapse';
                                                            }} title={Lang.get('messages.privileges.set.vis')} className="btn btn-xs float-left btn-block text-left">
                                                                <i className="far fa-question-circle mr-1"/>
                                                                <strong>{item.label}</strong>
                                                                {item.meta.description !== null &&
                                                                    item.meta.description.length > 0 &&
                                                                        <span className="text-muted small"><br/>{item.meta.description}</span>
                                                                }
                                                            </a>
                                                        </td>
                                                        <td className="align-middle">{item.meta.company !== null && item.meta.company.name}</td>
                                                        <td className="align-middle text-center">
                                                            {item.meta.super ?
                                                                <i className="far fa-check-square text-success"/>
                                                                :
                                                                <i className="far fa-window-close text-danger"/>
                                                            }
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            {item.meta.client ?
                                                                <i className="far fa-check-square text-success"/>
                                                                :
                                                                <i className="far fa-window-close text-danger"/>
                                                            }
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            {! item.meta.default &&
                                                                <>
                                                                    <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                        <span className="sr-only">Toggle Dropdown</span>
                                                                    </button>
                                                                    <div className="dropdown-menu" role="menu">
                                                                        {this.state.privilege.update &&
                                                                            <button onClick={()=>this.toggleModal(item)} className="dropdown-item text-primary"><i className="fe fe-edit mr-1"/> {Lang.get('messages.privileges.update.form')}</button>
                                                                        }
                                                                        {this.state.privilege.delete &&
                                                                            <button onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fe fe-trash-2 mr-1"/> {Lang.get('messages.privileges.delete.form')}</button>
                                                                        }
                                                                    </div>
                                                                </>
                                                            }
                                                        </td>
                                                    </tr>
                                                    <tr id={`table_${item.value}`} style={{visibility:'collapse'}}>
                                                        <td/>
                                                        <td className="p-0" colSpan={4}>
                                                            <table className="table table-sm mb-0 table-striped">
                                                                <thead>
                                                                <tr>
                                                                    <th>{Lang.get('messages.menu.name')}</th>
                                                                    <th width={50}>{Lang.get('messages.menu.read')}</th>
                                                                    <th width={50}>{Lang.get('messages.menu.create')}</th>
                                                                    <th width={50}>{Lang.get('messages.menu.update')}</th>
                                                                    <th width={50}>{Lang.get('messages.menu.delete')}</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {item.meta.privileges.filter((f) => f.meta.client === item.meta.client).map((menu, indexMenu)=>
                                                                    <React.Fragment key={menu.value}>
                                                                        <tr key={menu.value}>
                                                                            <td>
                                                                                <i className={`${menu.meta.icon} mr-1`}/>
                                                                                {Lang.get(menu.meta.langs.menu)}
                                                                                <br/><span className="small text-muted ml-3">{Lang.get(menu.meta.langs.description)}</span>
                                                                            </td>
                                                                            {menu.meta.function ?
                                                                                <td className="align-middle text-left" colSpan={4}>
                                                                                    <div className="custom-control custom-checkbox">
                                                                                        <input data-index-level={indexLevel}
                                                                                               data-index-parent={null}
                                                                                               data-index={indexMenu}
                                                                                               data-child={false}
                                                                                               data-type="read"
                                                                                               data-id={menu.value} checked={menu.meta.can.read}
                                                                                               disabled={this.state.loadings.levels || ! this.state.privilege.update} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id={`read_${menu.value}`}/>
                                                                                        <label htmlFor={`read_${menu.value}`} className="custom-control-label"/>
                                                                                    </div>
                                                                                </td>
                                                                                :
                                                                                <>
                                                                                    <td className="align-middle text-center">
                                                                                        <div className="custom-control custom-checkbox text-left">
                                                                                            <input data-index-level={indexLevel}
                                                                                                   data-index-parent={null}
                                                                                                   data-index={indexMenu}
                                                                                                   data-child={false}
                                                                                                   data-type="read"
                                                                                                   data-id={menu.value} checked={menu.meta.can.read} disabled={this.state.loadings.levels || ! this.state.privilege.update} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" id={`read_${menu.value}`}/>
                                                                                            <label htmlFor={`read_${menu.value}`} className="custom-control-label"/>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="align-middle text-center">
                                                                                        <div className="custom-control custom-checkbox text-left">
                                                                                            <input data-index-level={indexLevel}
                                                                                                   data-index-parent={null}
                                                                                                   data-index={indexMenu}
                                                                                                   data-child={false}
                                                                                                   data-type="create"
                                                                                                   id={`create_${menu.value}`}
                                                                                                   disabled={this.state.loadings.levels || ! menu.meta.can.read || ! this.state.privilege.update}
                                                                                                   data-id={menu.value} checked={menu.meta.can.create}  onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" />
                                                                                            <label htmlFor={`create_${menu.value}`} className="custom-control-label"/>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="align-middle text-center">
                                                                                        <div className="custom-control custom-checkbox text-left">
                                                                                            <input data-index-level={indexLevel}
                                                                                                   data-index-parent={null}
                                                                                                   data-index={indexMenu}
                                                                                                   data-child={false}
                                                                                                   data-type="update"
                                                                                                   id={`update_${menu.value}`}
                                                                                                   disabled={this.state.loadings.levels || ! menu.meta.can.create || ! this.state.privilege.update}
                                                                                                   data-id={menu.value} checked={menu.meta.can.update}  onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" />
                                                                                            <label htmlFor={`update_${menu.value}`} className="custom-control-label"/>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="align-middle text-center">
                                                                                        <div className="custom-control custom-checkbox text-left">
                                                                                            <input data-index-level={indexLevel}
                                                                                                   data-index-parent={null}
                                                                                                   data-index={indexMenu}
                                                                                                   data-child={false}
                                                                                                   data-type="delete"
                                                                                                   id={`delete_${menu.value}`}
                                                                                                   disabled={this.state.loadings.levels || ! menu.meta.can.update || ! this.state.privilege.update}
                                                                                                   data-id={menu.value} checked={menu.meta.can.delete}  onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox" />
                                                                                            <label htmlFor={`delete_${menu.value}`} className="custom-control-label"/>
                                                                                        </div>
                                                                                    </td>
                                                                                </>
                                                                            }
                                                                        </tr>
                                                                        {menu.meta.childrens.map((child,indexChild)=>
                                                                            <tr key={child.value}>
                                                                                <td>
                                                                                    <i className={`${child.meta.icon} ml-3 mr-1`}/>
                                                                                    {Lang.get(child.meta.langs.menu)}
                                                                                    <br/><span className="small text-muted ml-3">{Lang.get(child.meta.langs.description)}</span>
                                                                                </td>
                                                                                {child.meta.function ?
                                                                                    <td className="align-middle text-left" colSpan={4}>
                                                                                        <div className="custom-control custom-checkbox">
                                                                                            <input data-index-level={indexLevel}
                                                                                                   data-index-parent={indexMenu}
                                                                                                   data-index={indexChild}
                                                                                                   data-child={true}
                                                                                                   data-type="read"
                                                                                                   disabled={this.state.loadings.levels || ! menu.meta.can.read || ! this.state.privilege.update}
                                                                                                   id={`read_${child.value}`}
                                                                                                   data-id={child.value} checked={child.meta.can.read} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox"/>
                                                                                            <label htmlFor={`read_${child.value}`} className="custom-control-label"/>
                                                                                        </div>
                                                                                    </td>
                                                                                    :
                                                                                    <>
                                                                                        <td className="align-middle text-center">
                                                                                            <div className="custom-control custom-checkbox text-left">
                                                                                                <input data-index-level={indexLevel}
                                                                                                       data-index-parent={indexMenu}
                                                                                                       data-index={indexChild}
                                                                                                       data-child={true}
                                                                                                       data-type="read"
                                                                                                       disabled={this.state.loadings.levels || ! menu.meta.can.read || ! this.state.privilege.update}
                                                                                                       id={`read_${child.value}`}
                                                                                                       data-id={child.value} checked={child.meta.can.read} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox"/>
                                                                                                <label htmlFor={`read_${child.value}`} className="custom-control-label"/>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="align-middle text-center">
                                                                                            <div className="custom-control custom-checkbox text-left">
                                                                                                <input data-index-level={indexLevel}
                                                                                                       data-index-parent={indexMenu}
                                                                                                       data-index={indexChild}
                                                                                                       data-child={true}
                                                                                                       data-type="create"
                                                                                                       disabled={this.state.loadings.levels || ! child.meta.can.read || ! this.state.privilege.update}
                                                                                                       id={`create_${child.value}`}
                                                                                                       data-id={child.value} checked={child.meta.can.create} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox"/>
                                                                                                <label htmlFor={`create_${child.value}`} className="custom-control-label"/>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="align-middle text-center">
                                                                                            <div className="custom-control custom-checkbox text-left">
                                                                                                <input data-index-level={indexLevel}
                                                                                                       data-index-parent={indexMenu}
                                                                                                       data-index={indexChild}
                                                                                                       data-child={true}
                                                                                                       data-type="update"
                                                                                                       disabled={this.state.loadings.levels || ! child.meta.can.create || ! this.state.privilege.update}
                                                                                                       id={`update_${child.value}`}
                                                                                                       data-id={child.value} checked={child.meta.can.update} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox"/>
                                                                                                <label htmlFor={`update_${child.value}`} className="custom-control-label"/>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="align-middle text-center">
                                                                                            <div className="custom-control custom-checkbox text-left">
                                                                                                <input data-index-level={indexLevel}
                                                                                                       data-index-parent={indexMenu}
                                                                                                       data-index={indexChild}
                                                                                                       data-child={true}
                                                                                                       data-type="delete"
                                                                                                       disabled={this.state.loadings.levels || ! child.meta.can.update || ! this.state.privilege.update}
                                                                                                       id={`delete_${child.value}`}
                                                                                                       data-id={child.value} checked={child.meta.can.delete} onChange={this.handleCheckPrivilege} className="custom-control-input custom-control-input-success custom-control-input-outline" type="checkbox"/>
                                                                                                <label htmlFor={`delete_${child.value}`} className="custom-control-label"/>
                                                                                            </div>
                                                                                        </td>
                                                                                    </>
                                                                                }
                                                                            </tr>
                                                                        )}
                                                                    </React.Fragment>
                                                                )}
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
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
export default PrivilegePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PrivilegePage route="auth.users.privileges"/></React.StrictMode>);
