import React from "react";
import ReactDOM from "react-dom/client";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {crudPrivileges, setPrivileges} from "../../../../Services/UserService";
import {crudCompany} from "../../../../Services/CompanyService";
import FormPrivilege from "../../../Auth/User/Privilege/Tools/FormPrivilege";
import {CardPreloader, customPreventDefault, siteData} from "../../../../Components/mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationCircle,faPlus} from "@fortawesome/free-solid-svg-icons";
import {MenuIcon} from "../../../Client/User/Privilege/Tools/IconTool";
import {Tooltip} from "@mui/material";
import {InputCheckBox, UserLevelList} from "../../../Client/User/Privilege/Tools/TableTools";

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
                keywords : '', level : null,
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
        this.handleSelectLevel = this.handleSelectLevel.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        let loadings = this.state.loadings;
        if (! loadings.privilege) {
            siteData().then((response)=>this.setState({site:response}));
            loadings.privilege = true; this.setState({loadings});
            if (this.state.privilege === null) {
                getPrivileges([
                    {route : this.props.route, can : false },
                    {route : 'clients.users', can : false},
                    {route : 'clients.customers', can : false},
                ])
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
    handleSelectLevel(data = null) {
        if (data !== null) {
            let filter = this.state.filter;
            filter.level = data;
            this.setState({filter},()=>this.handleFilter());
        }
    }
    confirmDelete(data = null) {
        let index = null;
        let ids = [];
        if (data !== null) {
            index = this.state.levels.unfiltered.findIndex((f) => f.value === data.value);
            ids.push(data.value);
        } else {
            this.state.levels.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this, ids,'delete',`${window.origin}/api/auth/users/privileges`,Lang.get('messages.privileges.delete.form'),Lang.get('messages.privileges.delete.select'),index === null ? 'app.loadLevels()' : 'app.loadLevels(deleteIndex)','warning','id',index === null ? null : index);
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data; this.setState({modal});
    }
    handleCheckPrivilege(event) {
        let indexLevel = -1;
        let filter = this.state.filter;
        let levels = this.state.levels;
        let levelIndex = levels.filtered.findIndex((f)=> f.value === filter.level.value);
        if (levelIndex >= 0) {
            let menuId = event.currentTarget.getAttribute('data-id');
            let dataType = event.currentTarget.getAttribute('data-type');
            if (menuId !== null) {
                if (menuId.length > 10) {
                    let menuIndex = null, menuChildIndex = null;
                    filter.level.meta.privileges.map((menu, indexMenu)=>{
                        if (menu.value === menuId) {
                            menuIndex = indexMenu;
                        }
                        menu.meta.childrens.map((children, indexChildren)=>{
                            if (children.value === menuId) {
                                menuChildIndex = indexChildren;
                                menuIndex = indexMenu;
                            }
                        })
                    });
                    if (menuIndex >= 0) {
                        if (menuChildIndex !== null && menuChildIndex >= 0) { //ini adalah children
                            filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can[dataType] = ! filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can[dataType];
                            switch (dataType) {
                                case 'read' :
                                    if (! filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.read) {
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.create = false;
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.update = false;
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.delete = false;
                                    }
                                    break;
                                case 'create':
                                    if (! filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.create) {
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.update = false;
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.delete = false;
                                    }
                                    break;
                                case 'update' :
                                    if (! filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.update) {
                                        filter.level.meta.privileges[menuIndex].meta.childrens[menuChildIndex].meta.can.delete = false;
                                    }
                                    break;
                            }
                        } else { //ini adalah parent
                            filter.level.meta.privileges[menuIndex].meta.can[dataType] = ! filter.level.meta.privileges[menuIndex].meta.can[dataType];
                            switch (dataType) {
                                case 'read' :
                                    if (! filter.level.meta.privileges[menuIndex].meta.can.read) {
                                        filter.level.meta.privileges[menuIndex].meta.can.create = false;
                                        filter.level.meta.privileges[menuIndex].meta.can.update = false;
                                        filter.level.meta.privileges[menuIndex].meta.can.delete = false;
                                        filter.level.meta.privileges[menuIndex].meta.childrens.map((children,indexChildren)=>{
                                            filter.level.meta.privileges[menuIndex].meta.childrens[indexChildren].meta.can.read = false;
                                            filter.level.meta.privileges[menuIndex].meta.childrens[indexChildren].meta.can.create = false;
                                            filter.level.meta.privileges[menuIndex].meta.childrens[indexChildren].meta.can.update = false;
                                            filter.level.meta.privileges[menuIndex].meta.childrens[indexChildren].meta.can.delete = false;
                                        })
                                    }
                                    break;
                                case 'create' :
                                    if (! filter.level.meta.privileges[menuIndex].meta.can.create) {
                                        filter.level.meta.privileges[menuIndex].meta.can.update = false;
                                        filter.level.meta.privileges[menuIndex].meta.can.delete = false;
                                    }
                                    break;
                                case 'update' :
                                    if (! filter.level.meta.privileges[menuIndex].meta.can.update) {
                                        filter.level.meta.privileges[menuIndex].meta.can.delete = false;
                                    }
                                    break;
                            }
                        }
                        const formData = new FormData();
                        formData.append('_method','patch');
                        formData.append('id', event.currentTarget.getAttribute('data-id'));
                        formData.append('type', event.currentTarget.getAttribute('data-type'));
                        this.setState({filter},()=>this.setPrivilege(formData));
                    }
                }
            }
        }
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
            } else {
                let levels = this.state.levels;
                let index = levels.unfiltered.findIndex((f) => f.value === response.data.params.value);
                if (index >= 0) {
                    levels.unfiltered[index] = response.data.params;
                    this.setState({levels});
                }
            }
        } catch (e) {
            showError(e.response.data.message);
            if (e.response.status === 401) logout();
        }
    }
    async loadLevels(data = null) {
        if (!this.state.loadings.levels) {
            let filter = this.state.filter;
            let loadings = this.state.loadings;
            let levels = this.state.levels;
            levels.selected = [];
            loadings.levels = true; this.setState({loadings,levels});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    levels.unfiltered.splice(data,1);
                    if (levels.unfiltered.length === 0) {
                        filter.level = null; this.setState({filter});
                    } else {
                        filter.level = levels.unfiltered[0];
                        this.setState({filter});
                    }
                } else {
                    let indexLevel = levels.unfiltered.findIndex((f) => f.value === data.value);
                    if (indexLevel >= 0) {
                        levels.unfiltered[indexLevel] = data;
                    } else {
                        levels.unfiltered.push(data);
                    }
                    filter.level = data;
                    this.setState({filter});
                }
                loadings.levels = false;
                this.setState({loadings,levels,filter},()=>this.handleFilter());
            } else {
                try {
                    const formData = new FormData();
                    if (this.state.user !== null) {
                        if (this.state.user.meta.company !== null) {
                            formData.append(Lang.get('companies.form_input.name'), this.state.user.meta.company.id);
                        }
                    }
                    let response = await crudPrivileges(formData);
                    if (response.data.params === null) {
                        loadings.levels = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        levels.unfiltered = response.data.params;
                        if (levels.unfiltered.length > 0) {
                            filter.level = levels.unfiltered[0];
                        }
                        loadings.levels = false; this.setState({loadings,levels,filter},()=>this.handleFilter());
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

                <FormPrivilege user={this.state.user} level={this.state.filter.level} open={this.state.modal.open} data={this.state.modal.data} companies={this.state.companies} loadings={this.state.loadings} handleClose={this.toggleModal} handleUpdate={this.loadLevels}/>

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

                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card shadow card-outline card-primary">
                                        {this.state.loadings.levels && <CardPreloader/>}
                                        <div className="card-header">
                                            <h3 className="card-title">{Lang.get('users.privileges.labels.menu')}</h3>
                                            <div className="card-tools">
                                                <Tooltip title={Lang.get('users.privileges.create.info')}>
                                                    <button onClick={()=>this.toggleModal()} disabled={this.state.loadings.levels} type="button" className="btn btn-tool btn-xs">
                                                        <FontAwesomeIcon icon={faPlus} size="xs"/>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="card-body p-0">
                                            <ul className="nav nav-pills flex-column">
                                                {this.state.levels.filtered.length === 0 ?
                                                    <li className="nav-item active">
                                                        <a onClick={customPreventDefault} href="#" className="nav-link text-sm text-muted">
                                                            <FontAwesomeIcon icon={faExclamationCircle} size="xs" className="mr-1"/>
                                                            {Lang.get('users.privileges.labels.select.not_found')}
                                                        </a>
                                                    </li>
                                                    :
                                                    this.state.levels.filtered.map((item,index)=>
                                                        <li key={item.value} className="nav-item">
                                                            {item.meta.company === null ?
                                                                <UserLevelList filter={this.state.filter} item={item} privilege={this.state.privilege} loading={this.state.loadings.levels} clickUpdate={this.toggleModal} clickDelete={this.confirmDelete} onSelect={this.handleSelectLevel}/>
                                                                :
                                                                <Tooltip title={item.meta.company.name}>
                                                                    <span><UserLevelList filter={this.state.filter} item={item} privilege={this.state.privilege} loading={this.state.loadings.levels} clickUpdate={this.toggleModal} clickDelete={this.confirmDelete} onSelect={this.handleSelectLevel}/></span>
                                                                </Tooltip>
                                                            }
                                                        </li>
                                                    )
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-9">
                                    <div className="card shadow card-outline card-info">
                                        {this.state.loadings.levels && <CardPreloader/>}
                                        <div className="card-header pl-2">
                                            <h3 className="card-title text-bold text-sm">{Lang.get('messages.menu.label')}</h3>
                                        </div>

                                        <div className="card-body p-0 table-responsive">
                                            <table className="table table-sm table-striped table-hover table-head-fixed">
                                                <thead>
                                                <tr>
                                                    <th className="align-middle text-sm pl-2"><Tooltip title={Lang.get('messages.menu.name.info')}><span>{Lang.get('messages.menu.name.label')}</span></Tooltip></th>
                                                    <th width={50} className="align-middle text-center text-sm">
                                                        <Tooltip title={Lang.get('messages.menu.read.info')}><span>{Lang.get('messages.menu.read.label')}</span></Tooltip>
                                                    </th>
                                                    <th width={50} className="align-middle text-center text-sm">
                                                        <Tooltip title={Lang.get('messages.menu.create.info')}><span>{Lang.get('messages.menu.create.label')}</span></Tooltip>
                                                    </th>
                                                    <th width={50} className="align-middle text-center text-sm">
                                                        <Tooltip title={Lang.get('messages.menu.update.info')}><span>{Lang.get('messages.menu.update.label')}</span></Tooltip>
                                                    </th>
                                                    <th width={50} className="align-middle text-center text-sm pr-2">
                                                        <Tooltip title={Lang.get('messages.menu.delete.info')}><span>{Lang.get('messages.menu.delete.label')}</span></Tooltip>
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {this.state.filter.level === null ?
                                                    <tr><td className="align-middle text-center text-xs text-warning" colSpan={5}>{Lang.get('users.privileges.labels.select.no_select')}</td></tr>
                                                    :
                                                    this.state.filter.level.meta.privileges.filter((f) => f.meta.client === this.state.filter.level.meta.client).length === 0 ?
                                                        <tr><td className="align-middle text-center text-xs text-warning" colSpan={5}>{Lang.get('users.privileges.labels.select.no_menu')}</td></tr>
                                                        :
                                                        this.state.filter.level.meta.privileges.filter((f) => f.meta.client === this.state.filter.level.meta.client).map((menu,indexMenu)=>
                                                            <React.Fragment key={menu.value}>
                                                                <tr>
                                                                    <td className="align-middle text-xs pl-2">
                                                                        <Tooltip placement="left-end" title={Lang.get(menu.meta.langs.description)}>
                                                                            <FontAwesomeIcon icon={MenuIcon(menu.meta.icon)} size="sm" className="mr-1"/>
                                                                        </Tooltip>
                                                                        <span>{Lang.get(menu.meta.langs.menu)}</span>
                                                                    </td>
                                                                    {menu.meta.function ?
                                                                        <td colSpan={4} className="align-middle pr-2">
                                                                            <Tooltip title={menu.meta.can.read ? Lang.get('messages.menu.info.dont',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.read.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.read.do')})}>
                                                                                <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={menu} levels={this.state.levels} filter={this.state.filter} index={indexMenu} checked={menu.meta.can.read} type="read" child={false} onCheck={this.handleCheckPrivilege}/></span>
                                                                            </Tooltip>
                                                                        </td>
                                                                        :
                                                                        <React.Fragment>
                                                                            <td className="align-middle">
                                                                                <Tooltip title={menu.meta.can.read ? Lang.get('messages.menu.info.dont',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.read.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.read.do')})}>
                                                                                    <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={menu} levels={this.state.levels} filter={this.state.filter} index={indexMenu} checked={menu.meta.can.read} type="read" child={false} onCheck={this.handleCheckPrivilege}/></span>
                                                                                </Tooltip>
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <Tooltip title={menu.meta.can.create ? Lang.get('messages.menu.info.dont',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.create.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get(`messages.menu.create.do`)})}>
                                                                                    <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! menu.meta.can.read || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={menu} levels={this.state.levels} filter={this.state.filter} index={indexMenu} checked={menu.meta.can.create} type="create" child={false} onCheck={this.handleCheckPrivilege}/></span>
                                                                                </Tooltip>
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <Tooltip title={menu.meta.can.update ? Lang.get('messages.menu.info.dont',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.update.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get(`messages.menu.update.do`)})}>
                                                                                    <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! menu.meta.can.create || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={menu} levels={this.state.levels} filter={this.state.filter} index={indexMenu} checked={menu.meta.can.update} type="update" child={false} onCheck={this.handleCheckPrivilege}/></span>
                                                                                </Tooltip>
                                                                            </td>
                                                                            <td className="align-middle pr-2">
                                                                                <Tooltip title={menu.meta.can.delete ? Lang.get('messages.menu.info.dont',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get('messages.menu.delete.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(menu.meta.langs.menu), type : Lang.get(`messages.menu.delete.do`)})}>
                                                                                    <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! menu.meta.can.update || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={menu} levels={this.state.levels} filter={this.state.filter} index={indexMenu} checked={menu.meta.can.delete} type="delete" child={false} onCheck={this.handleCheckPrivilege}/></span>
                                                                                </Tooltip>
                                                                            </td>
                                                                        </React.Fragment>
                                                                    }
                                                                </tr>
                                                                {menu.meta.childrens.length === 0 ? null :
                                                                    menu.meta.childrens.map((children, indexChildren)=>
                                                                        <tr key={children.value}>
                                                                            <td className="align-middle text-xs pl-2">
                                                                                <Tooltip placement="left-end" title={Lang.get(children.meta.langs.description)}>
                                                                                    <FontAwesomeIcon icon={MenuIcon(children.meta.icon)} size="sm" className="mr-1 ml-3"/>
                                                                                </Tooltip>
                                                                                <span>{Lang.get(children.meta.langs.menu)}</span>
                                                                            </td>
                                                                            {children.meta.function ?
                                                                                <td colSpan={4} className="align-middle pr-2">
                                                                                    <Tooltip title={children.meta.can.read ? Lang.get('messages.menu.info.dont',{menu : Lang.get(children.meta.langs.menu), type : Lang.get('messages.menu.read.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(children.meta.langs.menu), type : Lang.get(`messages.menu.read.do`)})}>
                                                                                        <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! menu.meta.can.read || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={children} levels={this.state.levels} filter={this.state.filter} index={indexChildren} indexParent={indexMenu} checked={children.meta.can.read} type="read" child={true} onCheck={this.handleCheckPrivilege}/></span>
                                                                                    </Tooltip>
                                                                                </td>
                                                                                :
                                                                                <React.Fragment>
                                                                                    <td className="align-middle">
                                                                                        <Tooltip title={children.meta.can.read ? Lang.get('messages.menu.info.dont',{menu : Lang.get(children.meta.langs.menu), type : Lang.get('messages.menu.read.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(children.meta.langs.menu), type : Lang.get(`messages.menu.read.do`)})}>
                                                                                            <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! menu.meta.can.read || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={children} levels={this.state.levels} filter={this.state.filter} index={indexChildren} indexParent={indexMenu} checked={children.meta.can.read} type="read" child={true} onCheck={this.handleCheckPrivilege}/></span>
                                                                                        </Tooltip>
                                                                                    </td>
                                                                                    <td className="align-middle">
                                                                                        <Tooltip title={children.meta.can.create ? Lang.get('messages.menu.info.dont',{menu : Lang.get(children.meta.langs.menu), type : Lang.get('messages.menu.create.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(children.meta.langs.menu), type : Lang.get(`messages.menu.create.do`)})}>
                                                                                            <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! children.meta.can.read || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={children} levels={this.state.levels} filter={this.state.filter} index={indexChildren} indexParent={indexMenu} checked={children.meta.can.create} type="create" child={true} onCheck={this.handleCheckPrivilege}/></span>
                                                                                        </Tooltip>
                                                                                    </td>
                                                                                    <td className="align-middle">
                                                                                        <Tooltip title={children.meta.can.update ? Lang.get('messages.menu.info.dont',{menu : Lang.get(children.meta.langs.menu), type : Lang.get('messages.menu.update.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(children.meta.langs.menu), type : Lang.get(`messages.menu.update.do`)})}>
                                                                                            <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! children.meta.can.create || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={children} levels={this.state.levels} filter={this.state.filter} index={indexChildren} indexParent={indexMenu} checked={children.meta.can.update} type="update" child={true} onCheck={this.handleCheckPrivilege}/></span>
                                                                                        </Tooltip>
                                                                                    </td>
                                                                                    <td className="align-middle pr-2">
                                                                                        <Tooltip title={children.meta.can.delete ? Lang.get('messages.menu.info.dont',{menu : Lang.get(children.meta.langs.menu), type : Lang.get('messages.menu.delete.do')}) : Lang.get('messages.menu.info.label',{menu : Lang.get(children.meta.langs.menu), type : Lang.get(`messages.menu.delete.do`)})}>
                                                                                            <span><InputCheckBox disabled={this.state.loadings.levels || ! this.state.privilege.update || ! children.meta.can.update || (!this.state.user.meta.level.super && this.state.filter.level.meta.default) } privilege={this.state.privilege} loadings={this.state.loadings} menu={children} levels={this.state.levels} filter={this.state.filter} index={indexChildren} indexParent={indexMenu} checked={children.meta.can.delete} type="delete" child={true} onCheck={this.handleCheckPrivilege}/></span>
                                                                                        </Tooltip>
                                                                                    </td>
                                                                                </React.Fragment>
                                                                            }
                                                                        </tr>
                                                                    )
                                                                }
                                                            </React.Fragment>
                                                        )
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
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
