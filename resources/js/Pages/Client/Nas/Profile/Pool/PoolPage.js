// noinspection DuplicatedCode

import React from "react";
import ReactDOM from "react-dom/client";
import {confirmDialog, showError} from "../../../../../Components/Toaster";
import {crudCompany} from "../../../../../Services/CompanyService";
import {CardPreloader, responseMessage, siteData} from "../../../../../Components/mixedConsts";
import {getPrivileges, getRootUrl} from "../../../../../Components/Authentication";
import {crudNas, crudProfilePools} from "../../../../../Services/NasService";
import PageLoader from "../../../../../Components/PageLoader";
import MainHeader from "../../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../../../Components/PageComponent";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableAction, TableCheckBox} from "../../../../../Components/TableComponent";
import FormPool from "./Tools/FormPool";

class PoolPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : false, companies : false, pools : true },
            privilege : null, menus : [], site : null, companies : [], nas : [],
            pools : { filtered : [], unfiltered : [], selected : [] },
            filter : { keywords : '', sort : { by : 'code', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : { open : false, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.loadPools = this.loadPools.bind(this);
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
                                })
                                .then(()=>{
                                    loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                                })
                                .then(()=>{
                                    loadings.companies = false; this.setState({loadings},()=>this.loadCompanies());
                                })
                                .then(()=>{
                                    loadings.pools = false; this.setState({loadings},()=>this.loadPools());
                                });
                        });
                    });
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.pools.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/nas/profiles/pools`,Lang.get('nas.pools.delete.warning'),Lang.get('nas.pools.delete.select'),'app.loadPools()');
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
        let pools = this.state.pools;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            pools.selected = [];
            if (event.currentTarget.checked) {
                pools.filtered.map((item)=>{
                    if (! item.meta.default) {
                        pools.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = pools.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                pools.selected.splice(indexSelected,1);
            } else {
                let indexTarget = pools.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    pools.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({pools});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let pools = this.state.pools;
        let filter = this.state.filter;
        loadings.pools = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            pools.filtered = pools.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.description.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            pools.filtered = pools.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    pools.filtered = pools.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    pools.filtered = pools.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'nas' :
                if (this.state.filter.sort.dir === 'asc') {
                    pools.filtered = pools.filtered.sort((a,b) => (a.meta.nas.shortname > b.meta.nas.shortname) ? 1 : ((b.meta.nas.shortname > a.meta.nas.shortname) ? -1 : 0));
                } else {
                    pools.filtered = pools.filtered.sort((a,b) => (a.meta.nas.shortname > b.meta.nas.shortname) ? -1 : ((b.meta.nas.shortname > a.meta.nas.shortname) ? 1 : 0));
                }
                break;
            case 'first' :
            case 'last' :
                if (filter.sort.dir === 'asc') {
                    pools.filtered = pools.filtered.sort((a,b) => (a.meta.address[filter.sort.by] > b.meta.address[filter.sort.by]) ? 1 : ((b.meta.address[filter.sort.by] > a.meta.address[filter.sort.by]) ? -1 : 0));
                } else {
                    pools.filtered = pools.filtered.sort((a,b) => (a.meta.address[filter.sort.by] > b.meta.address[filter.sort.by]) ? -1 : ((b.meta.address[filter.sort.by] > a.meta.address[filter.sort.by]) ? 1 : 0));
                }
                break;
        }
        loadings.pools = false;
        this.setState({loadings,pools});
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
    async loadNas() {
        if (! this.state.loadings.nas) {
            if (this.state.nas.length === 0) {
                let loadings = this.state.loadings;
                loadings.nas = true; this.setState({loadings});
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.nas = false; this.setState({loadings,nas:response.data.params});
                    }
                } catch (e) {
                    loadings.nas = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadPools(data = null) {
        if (! this.state.loadings.pools) {
            let loadings = this.state.loadings;
            let pools = this.state.pools;
            pools.selected = [];
            loadings.pools = true;
            this.setState({loadings,pools});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    pools.unfiltered.splice(data,1);
                } else {
                    let index = pools.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        pools.unfiltered[index] = data;
                    } else {
                        pools.unfiltered.push(data);
                    }
                }
                loadings.pools = false;
                this.setState({loadings,pools},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudProfilePools();
                    if (response.data.params === null) {
                        loadings.pools = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        pools.unfiltered = response.data.params;
                        loadings.pools = false; this.setState({loadings,pools},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.pools = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormPool nas={this.state.nas} open={this.state.modal.open} data={this.state.modal.data} companies={this.state.companies} user={this.state.user} loadings={this.state.loadings} handleClose={this.toggleModal} handleUpdate={this.loadPools}/>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('nas.pools.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-primary">
                                {this.state.loadings.pools && <CardPreloader/>}
                                <div className="card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.pools}
                                                   langs={{create:Lang.get('nas.pools.create.button'),delete:Lang.get('nas.pools.delete.button')}}
                                                   selected={this.state.pools.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('nas.pools.labels.search')}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <tr>
                                            {this.state.pools.filtered.length > 0 &&
                                                <th rowSpan={2} className="align-middle text-center" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input id="checkAll" data-id="" disabled={this.state.loadings.pools} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('nas.pools.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="nas"
                                                         name={Lang.get('nas.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="first"
                                                         name={Lang.get('nas.pools.labels.address.first')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="last"
                                                         name={Lang.get('nas.pools.labels.address.last')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" width={30}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.pools.filtered.length === 0 ?
                                            <DataNotFound colSpan={5} message={Lang.get('nas.pools.labels.not_found')}/>
                                            :
                                            this.state.pools.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item}
                                                                   checked={this.state.pools.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.pools} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle">{item.label}</td>
                                                    <td className="align-middle">{item.meta.nas === null ? '-' : item.meta.nas.shortname}</td>
                                                    <td className="align-middle">{item.meta.address.first}</td>
                                                    <td className="align-middle">{item.meta.address.last}</td>
                                                    <TableAction privilege={this.state.privilege} item={item} langs={{update:Lang.get('nas.pools.update.button'),delete:Lang.get('nas.pools.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
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

export default PoolPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PoolPage route="clients.nas.pools"/></React.StrictMode>)
