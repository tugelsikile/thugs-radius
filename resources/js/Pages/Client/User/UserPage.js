import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, formatLocaleDate, responseMessage, siteData} from "../../../Components/mixedConsts";
import {crudCompany} from "../../../Services/CompanyService";
import {confirmDialog, showError} from "../../../Components/Toaster";
import {crudPrivileges, crudUsers} from "../../../Services/UserService";
import PageLoader from "../../../Components/PageLoader";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableAction, TableCheckBox} from "../../../Components/TableComponent";
import {sortDate} from "./Tools/Mixed";
import moment from "moment";
import FormUser from "./Tools/FormUser";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import {crudNas} from "../../../Services/NasService";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faRefresh} from "@fortawesome/free-solid-svg-icons";

// noinspection DuplicatedCode
class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privilege : false, levels : true, companies : true, site : false, users : true, nas : true },
            privilege : null, menus : [], companies : [], levels : [], nas : [],
            users : { filtered : [], unfiltered : [], selected : [], },
            filter : {
                keywords : '', level : null,
                sort : { by : 'name', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },
            modal : { open : false, data : null },
        };
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.loadUsers = this.loadUsers.bind(this);
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
                    {route : 'clients.users.privileges', can : false},
                    {route : 'clients.users.reset-password', can : false},
                ])
                    .then((response)=>this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>{
                        loadings.companies = false; this.setState({loadings},()=>this.loadCompanies());
                    })
                    .then(()=>{
                        loadings.levels = false; this.setState({loadings},()=>this.loadLevels());
                    })
                    .then(()=>{
                        loadings.users = false; this.setState({loadings},()=>this.loadUsers());
                    })
                    .then(()=>{
                        loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                    })
                    .then(()=>{
                        loadings.privilege = false;
                        this.setState({loadings});
                    });
            }
        }
        window.addEventListener('scroll', this.handleScrollPage);
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScrollPage);
    }
    handleScrollPage(event) {
        const element = document.getElementById('page-card-header');
        const sidebar = document.getElementById('app-main-sidebar');
        if (element !== null && sidebar !== null) {
            if (window.scrollY > 230) {
                element.style.position = 'fixed';
                element.style.background = '#fff';
                element.style.top = '0px';
                element.style.right = '0px';
                element.style.left = `${sidebar.offsetWidth}px`;
                element.style.zIndex = '1';
            } else {
                element.style.position = null;
                element.style.background = null;
                element.style.right = null;
                element.style.left = null;
                element.style.zIndex = null;
            }
        }
    }
    confirmDelete(data = null) {
        let index = null;
        let ids = [];
        if (data !== null) {
            index = this.state.users.unfiltered.findIndex((f) => f.value === data.value);
            ids.push(data.value);
        } else {
            this.state.users.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this, ids,'delete',`${window.origin}/api/auth/users`,Lang.get('users.delete.button'), Lang.get('users.delete.confirm'),index === null ? 'app.loadLevels()' : 'app.loadLevels(deleteIndex)','warning',Lang.get('users.form_input.id'),index === null ? null : index);
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data; this.setState({modal});
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
        let users = this.state.users;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            users.selected = [];
            if (event.currentTarget.checked) {
                users.filtered.map((item)=>{
                    if (! item.meta.default) {
                        users.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = users.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                users.selected.splice(indexSelected,1);
            } else {
                let indexTarget = users.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    if (! users.unfiltered[indexTarget].meta.default) {
                        users.selected.push(event.currentTarget.getAttribute('data-id'));
                    }
                }
            }
        }
        this.setState({users});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter(){
        let loadings = this.state.loadings;
        let filter = this.state.filter;
        let users = this.state.users;
        loadings.users = true; this.setState({loadings});
        if (this.state.filter.keywords.length > 0) {
            users.filtered = users.unfiltered.filter((f) => f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1)
        } else {
            users.filtered = users.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                }
                break;
            case 'email' :
                if (filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.email > b.meta.email) ? -1 : ((b.meta.email > a.meta.email) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.email > b.meta.email) ? 1 : ((b.meta.email > a.meta.email) ? -1 : 0));
                }
                break;
            case 'level' :
                if (filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.level.label > b.meta.level.label) ? -1 : ((b.meta.level.label > a.meta.level.label) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => (a.meta.level.label > b.meta.level.label) ? 1 : ((b.meta.level.label > a.meta.level.label) ? -1 : 0));
                }
                break;
            case 'login':
                if (filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => ((sortDate(a) === null || sortDate(b) === null) ? 'z' : moment(sortDate(a)).isSameOrAfter(sortDate(b))) ? -1 : (((sortDate(a) === null || sortDate(b) === null) ? 'z' : moment(sortDate(b)).isSameOrAfter(sortDate(a))) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => ((sortDate(a) === null || sortDate(b) === null) ? 'z' : moment(sortDate(a)).isSameOrAfter(sortDate(b))) ? 1 : (((sortDate(a) === null || sortDate(b) === null) ? 'z' : moment(sortDate(b)).isSameOrAfter(sortDate(a))) ? -1 : 0));
                }
                break;
            case 'activity':
                if (filter.sort.dir === 'asc') {
                    users.filtered = users.filtered.sort((a,b) => ((sortDate(a,'activity') === null || sortDate(b,'activity') === null) ? 'z' : moment(sortDate(a,'activity')).isSameOrAfter(sortDate(b,'activity'))) ? -1 : (((sortDate(a,'activity') === null || sortDate(b,'activity') === null) ? 'z' : moment(sortDate(b,'activity')).isSameOrAfter(sortDate(a,'activity'))) ? 1 : 0));
                } else {
                    users.filtered = users.filtered.sort((a,b) => ((sortDate(a,'activity') === null || sortDate(b,'activity') === null) ? 'z' : moment(sortDate(a,'activity')).isSameOrAfter(sortDate(b,'activity'))) ? 1 : (((sortDate(a,'activity') === null || sortDate(b,'activity') === null) ? 'z' : moment(sortDate(b,'activity')).isSameOrAfter(sortDate(a,'activity'))) ? -1 : 0));
                }
                break;
        }
        loadings.users = false;
        this.setState({users,loadings});
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
    async loadLevels() {
        if (!this.state.loadings.levels) {
            let loadings = this.state.loadings;
            loadings.levels = true; this.setState({loadings});
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
                    loadings.levels = false; this.setState({loadings,levels:response.data.params});
                }
            } catch (e) {
                loadings.levels = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadNas(data = null) {
        if (! this.state.loadings.nas) {
            let nas = this.state.nas;
            if (data !== null) {
                if (typeof data === 'object') {
                    let index = nas.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        nas[index] = data;
                    } else {
                        nas.push(data);
                    }
                    this.setState({nas});
                }
            } else {
                let loadings = this.state.loadings;
                nas = [];
                loadings.nas = true; this.setState({loadings,nas});
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.nas = false;
                        this.setState({loadings,nas:response.data.params});
                    }
                } catch (e) {
                    loadings.nas = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadUsers(data = null) {
        if (!this.state.loadings.users) {
            let loadings = this.state.loadings;
            let users = this.state.users;
            users.selected = [];
            loadings.users = true; this.setState({loadings,users});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    users.unfiltered.splice(data,1);
                } else {
                    let indexLevel = users.unfiltered.findIndex((f) => f.value === data.value);
                    if (indexLevel >= 0) {
                        users.unfiltered[indexLevel] = data;
                    } else {
                        users.unfiltered.push(data);
                    }

                }
                loadings.users = false;
                this.setState({loadings,users},()=>this.handleFilter());
            } else {
                try {
                    const formData = new FormData();
                    if (this.state.user !== null) {
                        if (this.state.user.meta.company !== null) {
                            formData.append(Lang.get('companies.form_input.name'), this.state.user.meta.company.id);
                        }
                    }
                    let response = await crudUsers(formData);
                    if (response.data.params === null) {
                        loadings.users = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        users.unfiltered = response.data.params;
                        loadings.users = false; this.setState({loadings,users},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.users = false; this.setState({loadings});
                    responseMessage(e)
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormUser onUpdateNas={this.loadNas} nas={this.state.nas} data={this.state.modal.data} user={this.state.user} levels={this.state.levels} companies={this.state.companies} loadings={this.state.loadings} open={this.state.modal.open} handleClose={this.toggleModal} handleUpdate={this.loadUsers}/>
                <PageLoader/>

                <HeaderAndSideBar site={this.state.site} root={this.state.root} user={this.state.user} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>

                <div className="content-wrapper">
                    <PageTitle title={Lang.get('users.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.users && <CardPreloader/>}
                                <div className="card-header pl-2" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   filter={<button type="button" disabled={this.state.loadings.users} onClick={()=>this.loadUsers()} className="btn btn-outline-secondary btn-sm text-xs mr-1"><FontAwesomeIcon icon={this.state.loadings.user ? faCircleNotch : faRefresh} spin={this.state.loadings.users} size="xs"/></button>}
                                                   loading={this.state.loadings.users}
                                                   langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('users.labels.menu')}),delete:Lang.get('users.delete.select')}}
                                                   selected={this.state.users.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('users.labels.search')}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead id="main-table-header">
                                        <tr>
                                            {this.state.users.filtered.length > 0 &&
                                                <th className="align-middle text-center pl-2" width={30}>
                                                    <div style={{zIndex:0}} className="custom-control custom-checkbox">
                                                        <input id="checkAll" data-id="" disabled={this.state.loadings.users} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('users.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="email"
                                                         name={Lang.get('users.labels.email')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="level"
                                                         name={Lang.get('users.privileges.labels.menu')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="login"
                                                         name={Lang.get('users.labels.last.login')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="activity"
                                                         name={Lang.get('users.labels.last.activity')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center pr-2" width={50}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.users.filtered.length === 0 ?
                                            <DataNotFound colSpan={6} message={Lang.get('users.labels.select.not_found')}/>
                                            :
                                            this.state.users.filtered.map((item,index)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item} className="pl-2"
                                                                   checked={this.state.users.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.users} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle text-xs">{item.label}</td>
                                                    <td className="align-middle text-xs">{item.meta.email}</td>
                                                    <td className="align-middle text-xs">{item.meta.level.label}</td>
                                                    <td className="align-middle text-xs">{item.meta.last.login === null ? null : formatLocaleDate(item.meta.last.login.created_at)}</td>
                                                    <td className="align-middle text-xs">{item.meta.last.activity === null ? null : formatLocaleDate(item.meta.last.activity.created_at)}</td>
                                                    <TableAction others={[]}
                                                                 privilege={this.state.privilege} item={item} className="pr-2"
                                                                 langs={{update:Lang.get('users.update.button'), delete:Lang.get('users.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
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
export default UserPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><UserPage route="clients.users"/></React.StrictMode>)
