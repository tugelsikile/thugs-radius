import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import PageLoader from "../../../Components/PageLoader";
import MainFooter from "../../../Components/Layout/MainFooter";
import PageTitle from "../../../Components/Layout/PageTitle";
import {crudPrivileges, crudUsers} from "../../../Services/UserService";
import {confirmDialog, showError} from "../../../Components/Toaster";
import Select from "react-select";
import Icon from '@mdi/react';
import { mdiSortAlphabeticalDescending,mdiSortAlphabeticalAscending,mdiSortReverseVariant  } from '@mdi/js';
import BtnSort from "./Tools/BtnSort";
import FormUser from "./Tools/FormUser";
import {crudCompany} from "../../../Services/CompanyService";
import {CardPreloader} from "../../../Components/mixedConsts";

class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privileges : false, levels : false, users : false, companies : false },
            privileges : null, menus : [],
            levels : [], companies : [],
            users : { filtered : [], unfiltered : [], selected : [] },
            filter : {
                level : null, keywords : '', page : {value:1,label:1}, data_length : 20, paging : [],
                sort : { by : 'email', dir : 'asc' },
            },
            modals : {
                user : { open : false, data : null },
                level : { open : false, data : null }
            }
        };
        this.loadLevels = this.loadLevels.bind(this);
        this.loadUsers = this.loadUsers.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleCheckAll = this.handleCheckAll.bind(this);
        this.toggleUser = this.toggleUser.bind(this);
        this.toggleLevel = this.toggleLevel.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        let loadings = this.state.loadings;
        if (! loadings.privileges) {
            loadings.privileges = true; this.setState({loadings});
            if (this.state.privileges === null) {
                getPrivileges(this.props.route)
                    .then((response)=>this.setState({privileges:response.privileges,menus:response.menus}))
                    .then(()=>this.loadCompanies())
                    .then(()=>this.loadLevels())
                    .then(()=>this.loadUsers())
                    .then(()=>{
                        loadings.privileges = false;
                        this.setState({loadings});
                    })
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.users.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/auth/users`,Lang.get('messages.users.delete.form'), Lang.get('messages.users.delete.warning'), 'app.loadUsers()');
    }
    toggleLevel(data = null) {
        let modals = this.state.modals;
        modals.level.open = ! this.state.modals.level.open;
        modals.level.data = data;
        this.setState({modals});
    }
    toggleUser(data = null) {
        let modals = this.state.modals;
        modals.user.open = ! this.state.modals.user.open;
        modals.user.data = data;
        this.setState({modals});
    }
    handleCheckAll(event) {
        let users = this.state.users;
        if (event.target.checked) {
            users.filtered.map((item)=>{
                users.selected.push(item.value);
            });
        } else {
            users.selected = [];
        }
        this.setState({users},()=>this.handleFilter());
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
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value; this.setState({filter},()=>this.handleFilter());
    }
    handleChangePage(page) {
        let filter = this.state.filter;
        filter.page = {value:page,label:page}; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        loadings.users = true; this.setState({loadings});
        let users = this.state.users;
        let filter = this.state.filter;
        if (this.state.filter.keywords.length > 0) {
            users.filtered = users.unfiltered.filter((f) =>
                    f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                    ||
                    f.meta.email.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                    ||
                    f.meta.level.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            );
        } else {
            users.filtered = users.unfiltered;
        }
        switch (this.state.filter.sort.by) {
            case 'email' :
                if (this.state.filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.email > b.meta.email) ? -1 : ((b.meta.email > a.meta.email) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.email > b.meta.email) ? 1 : ((b.meta.email > a.meta.email) ? -1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                }
                break;
            case 'level' :
                if (this.state.filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.level.label > b.meta.level.label) ? -1 : ((b.meta.level.label > a.meta.level.label) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.level.label > b.meta.level.label) ? 1 : ((b.meta.level.label > a.meta.level.label) ? -1 : 0));
                }
                break;
            case 'company' :
                if (this.state.filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.company === null || b.meta.company === null) ? 1 : (a.meta.company.name > b.meta.company.name) ? -1 : ((b.meta.company.name > a.meta.company.name) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.company === null || b.meta.company === null) ? -1 : (a.meta.company.name > b.meta.company.name) ? 1 : ((b.meta.company.name > a.meta.company.name) ? -1 : 0));
                }
                break;

        }
        filter.paging = [];
        for (let page = 1; page <= Math.ceil(users.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        users.filtered = users.filtered.slice(indexFirst, indexLast);
        loadings.users = false;
        this.setState({users,filter,loadings});
    }
    async loadCompanies() {
        if (!this.state.loadings.companies) {
            let loadings = this.state.loadings;
            loadings.companies = true; this.setState({loadings});
            try {
                let response = await crudCompany();
                if (response.data.params === null) {
                    loadings.companies = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.companies = false;
                    this.setState({loadings,companies:response.data.params});
                }
            } catch (e) {
                loadings.companies = false; this.setState({loadings});
                showError(e.response.data.message);
            }
        }
    }
    async loadLevels() {
        let loadings = this.state.loadings;
        if (! loadings.levels) {
            loadings.levels = true; this.setState({loadings});
            try {
                let response = await crudPrivileges();
                if (response.data.params === null) {
                    loadings.levels = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.levels = false;
                    this.setState({levels:response.data.params,loadings});
                }
            } catch (e) {
                loadings.levels = false; this.setState({loadings});
                showError(e.response.data.message);
            }
        }
    }
    async loadUsers(data = null) {
        let loadings = this.state.loadings;
        let users = this.state.users;
        if (! loadings.users) {
            users.selected = [];
            loadings.users = true; this.setState({loadings,users});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    users.unfiltered.splice(data,1);
                } else {
                    let index = users.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        users.unfiltered[index] = data;
                    } else {
                        users.unfiltered.push(data);
                    }
                }
                loadings.users = false;
                this.setState({loadings,users},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudUsers();
                    if (response.data.params === null) {
                        loadings.users = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        users.unfiltered = response.data.params;
                        loadings.users = false;
                        this.setState({loadings,users},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.users = false; this.setState({loadings});
                    showError(e.response.data.message);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormUser loadings={this.state.loadings}
                          user={this.state.user}
                          open={this.state.modals.user.open}
                          data={this.state.modals.user.data}
                          levels={this.state.levels}
                          companies={this.state.companies}
                          handleClose={this.toggleUser} handleUpdate={this.loadUsers}/>

                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>

                <div className="content-wrapper">

                    <PageTitle title={Lang.get('messages.users.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div className="alert alert-warning mb-3 alert-dismissible">
                                <i className="fas fa-exclamation-triangle mr-1"/>{Lang.get('messages.users.labels.warning.title')}
                                <br/>{Lang.get('messages.users.labels.warning.content')}
                                <button type="button" className="close" data-dismiss="alert" aria-hidden="true">×</button>
                            </div>
                            <div className="card">
                                {this.state.loadings.users &&
                                    <CardPreloader/>
                                }
                                <div className="card-header">
                                    <h3 className="card-title">
                                        {this.state.privileges !== null &&
                                            <>
                                                {this.state.privileges.create &&
                                                    <button onClick={()=>this.toggleUser()} disabled={this.state.loadings.users} className="btn btn-tool"><i className="fe fe-plus"/> {Lang.get('messages.users.create.form')}</button>
                                                }
                                                {this.state.privileges.delete &&
                                                    this.state.users.selected.length > 0 &&
                                                        <button onClick={()=>this.confirmDelete()} disabled={this.state.loadings.users} className="btn btn-tool"><i className="fe fe-trash-2"/> {Lang.get('messages.users.delete.select')}</button>
                                                }
                                            </>
                                        }
                                    </h3>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('messages.users.labels.search')}/>
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search"/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body table-responsive p-0">
                                    <table className="table table-head-fixed text-nowrap table-sm">
                                        <thead>
                                        <tr>
                                            <th width={50}>
                                                <div className="custom-control custom-checkbox">
                                                    <input disabled={this.state.loadings.users} onChange={this.handleCheckAll} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id="checkAll"/>
                                                    <label htmlFor="checkAll" className="custom-control-label"/>
                                                </div>
                                            </th>
                                            <th width="50px"/>
                                            <th>
                                                <BtnSort name={Lang.get('messages.users.labels.email')} sort="email" handleSort={this.handleSort} filter={this.state.filter}/>
                                            </th>
                                            <th>
                                                <BtnSort name={Lang.get('messages.users.labels.name')} sort="name" handleSort={this.handleSort} filter={this.state.filter}/>
                                            </th>
                                            <th width="200">
                                                <BtnSort name={Lang.get('messages.privileges.labels.menu')} sort="level" handleSort={this.handleSort} filter={this.state.filter}/>
                                            </th>
                                            <th>
                                                <BtnSort name={Lang.get('messages.company.labels.menu')} sort="company" handleSort={this.handleSort} filter={this.state.filter}/>
                                            </th>
                                            <th width="50px">{Lang.get('messages.users.labels.table_action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.users.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={7}>Tidak ada data</td></tr>
                                            :
                                            this.state.users.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <td className="align-middle text-center">
                                                        <div className="custom-control custom-checkbox">
                                                            <input onChange={()=>{
                                                                let users = this.state.users;
                                                                let indexChecked = users.selected.findIndex((f) => f === item.value);
                                                                if (indexChecked >= 0) {
                                                                    users.selected.splice(indexChecked, 1);
                                                                } else {
                                                                    users.selected.push(item.value);
                                                                }
                                                                this.setState({users},()=>this.handleFilter());
                                                            }} checked={this.state.users.selected.findIndex((f) => f === item.value) >= 0} disabled={this.state.loadings.users} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox" id={`checkbox_${item.value}`}/>
                                                            <label htmlFor={`checkbox_${item.value}`} className="custom-control-label"/>
                                                        </div>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <img className="img-circle" src={item.meta.avatar} style={{width:30,height:30}}/>
                                                    </td>
                                                    <td className="align-middle">{item.meta.email}</td>
                                                    <td className="align-middle">{item.label}</td>
                                                    <td className="align-middle">{item.meta.level.label}</td>
                                                    <td className="align-middle">{item.meta.company !== null && item.meta.company.name}</td>
                                                    <td className="align-middle text-center">
                                                        {item.label !== 'Super Admin' &&
                                                            <React.Fragment>
                                                                <button type="button" className="btn btn-tool dropdown-toggle dropdown-icon" data-toggle="dropdown">
                                                                    <span className="sr-only">Toggle Dropdown</span>
                                                                </button>
                                                                <div className="dropdown-menu" role="menu">
                                                                    {this.state.privileges.update &&
                                                                        <button onClick={()=>this.toggleUser(item)} className="dropdown-item text-primary"><i className="fe fe-edit mr-1"/> {Lang.get('messages.users.update.form')}</button>
                                                                    }
                                                                    {this.state.privileges.delete &&
                                                                        <button onClick={()=>this.confirmDelete(item)} className="dropdown-item text-danger"><i className="fe fe-trash-2 mr-1"/> {Lang.get('messages.users.delete.form')}</button>
                                                                    }
                                                                </div>
                                                            </React.Fragment>
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                {this.state.users.filtered.length > 0 &&
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
export default UserPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><UserPage route="auth.users"/></React.StrictMode>)
