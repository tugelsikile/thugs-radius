import React from "react";
import ReactDOM from "react-dom/client";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {crudCompany} from "../../../../Services/CompanyService";
import {
    CardPreloader, durationType, durationTypeByte,
    formatBytes,
    formatLocaleString,
    responseMessage,
    siteData
} from "../../../../Components/mixedConsts";
import {crudNas, crudProfile, crudProfileBandwidth, crudProfilePools} from "../../../../Services/NasService";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import BtnSort from "../../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableAction, TableCheckBox} from "../../../../Components/TableComponent";
import FormProfile from "./Tools/FormProfile";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBriefcase,faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {Popover} from "@mui/material";
import {DetailBandwidth, DetailNas, DetailPool} from "./Tools/DetailCard";

// noinspection DuplicatedCode
class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, companies : false, bandwidths : true, pools : true, profiles : true },
            privilege : null, menus : [], site : null, companies : [], nas : [], bandwidths : [], pools : [],
            profiles : { filtered : [], unfiltered : [], selected : [] },
            filter : { keywords : '', sort : { by : 'code', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : { open : false, data : null },
            popover : { open : false, anchorEl : null, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.loadProfiles = this.loadProfiles.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
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
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                                })
                                .then(()=>{
                                    loadings.companies = false; this.setState({loadings},()=>this.loadCompanies());
                                })
                                .then(()=>{
                                    loadings.bandwidths = false; this.setState({loadings},()=>this.loadBandwidths());
                                })
                                .then(()=>{
                                    loadings.pools = false; this.setState({loadings},()=>this.loadPools());
                                })
                                .then(()=>{
                                    loadings.profiles = false; this.setState({loadings}, ()=>this.loadProfiles());
                                })
                        });
                    });
            }
        }
    }
    handlePopOver(e) {
        let popover = this.state.popover;
        popover.open = ! this.state.popover.open;
        popover.anchorEl = e.currentTarget;
        popover.data = null;
        let index = this.state.profiles.unfiltered.findIndex((f) => f.value === e.currentTarget.getAttribute('data-value'));
        if (index >= 0) {
            switch (e.currentTarget.getAttribute('data-type')) {
                case 'nas' :
                    if (this.state.profiles.unfiltered[index].meta.nas !== null) {
                        popover.data = <DetailNas data={this.state.profiles.unfiltered[index]} />
                    }
                break;
                case 'pool' :
                    if (this.state.profiles.unfiltered[index].meta.pool !== null) {
                        popover.data = <DetailPool data={this.state.profiles.unfiltered[index]} />
                    }
                break;
                case 'bandwidth' :
                    if (this.state.profiles.unfiltered[index].meta.bandwidth !== null) {
                        popover.data = <DetailBandwidth data={this.state.profiles.unfiltered[index]} />
                    }
                break;
            }
        }
        this.setState({popover});
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.profiles.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/nas/profiles`,Lang.get('profiles.delete.warning'),Lang.get('profiles.delete.select'),'app.loadProfiles()');
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
        let profiles = this.state.profiles;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            profiles.selected = [];
            if (event.currentTarget.checked) {
                profiles.filtered.map((item)=>{
                    if (! item.meta.default) {
                        profiles.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = profiles.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                profiles.selected.splice(indexSelected,1);
            } else {
                let indexTarget = profiles.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    profiles.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({profiles});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let profiles = this.state.profiles;
        let filter = this.state.filter;
        loadings.profiles = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            profiles.filtered = profiles.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.description.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            profiles.filtered = profiles.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'nas' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.nas === null ? 'z' : a.meta.nas.shortname) > (b.meta.nas === null ? 'z' : b.meta.nas.shortname)) ? 1 : (((b.meta.nas === null ? 'z' : b.meta.nas.shortname) > (a.meta.nas === null ? 'z' : a.meta.nas.shortname)) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.nas === null ? 'z' : a.meta.nas.shortname) > (b.meta.nas === null ? 'z' : b.meta.nas.shortname)) ? -1 : (((b.meta.nas === null ? 'z' : b.meta.nas.shortname) > (a.meta.nas === null ? 'z' : a.meta.nas.shortname)) ? 1 : 0));
                }
                break;
            case 'pool' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.pool === null ? 'z' : a.meta.pool.name) > (b.meta.pool === null ? 'z' : b.meta.pool.name)) ? 1 : (((b.meta.pool === null ? 'z' : b.meta.pool.name) > (a.meta.pool === null ? 'z' : a.meta.pool.name)) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.pool === null ? 'z' : a.meta.pool.name) > (b.meta.pool === null ? 'z' : b.meta.pool.name)) ? -1 : (((b.meta.pool === null ? 'z' : b.meta.pool.name) > (a.meta.pool === null ? 'z' : a.meta.pool.name)) ? 1 : 0));
                }
                break;
            case 'bandwidth' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.bandwidth === null ? 'z' : a.meta.bandwidth.name) > (b.meta.bandwidth === null ? 'z' : b.meta.bandwidth.name)) ? 1 : (((b.meta.bandwidth === null ? 'z' : b.meta.bandwidth.name) > (a.meta.bandwidth === null ? 'z' : a.meta.bandwidth.name)) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => ((a.meta.bandwidth === null ? 'z' : a.meta.bandwidth.name) > (b.meta.bandwidth === null ? 'z' : b.meta.bandwidth.name)) ? -1 : (((b.meta.bandwidth === null ? 'z' : b.meta.bandwidth.name) > (a.meta.bandwidth === null ? 'z' : a.meta.bandwidth.name)) ? 1 : 0));
                }
                break;
            case 'validity' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.limit.rate > b.meta.limit.rate) ? 1 : ((b.meta.limit.rate > a.meta.limit.rate) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.limit.rate > b.meta.limit.rate) ? -1 : ((b.meta.limit.rate > a.meta.limit.rate) ? 1 : 0));
                }
                break;
            case 'price' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.price > b.meta.price) ? 1 : ((b.meta.price > a.meta.price) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.price > b.meta.price) ? -1 : ((b.meta.price > a.meta.price) ? 1 : 0));
                }
                break;
            case 'customers' :
                if (filter.sort.dir === 'asc') {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.customers.length > b.meta.customers.length) ? 1 : ((b.meta.customers.length > a.meta.customers.length) ? -1 : 0));
                } else {
                    profiles.filtered = profiles.filtered.sort((a,b) => (a.meta.customers.length > b.meta.customers.length) ? -1 : ((b.meta.customers.length > a.meta.customers.length) ? 1 : 0));
                }
                break;
        }
        loadings.profiles = false;
        this.setState({loadings,profiles});
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
    async loadBandwidths() {
        if (! this.state.loadings.bandwidths) {
            if (this.state.bandwidths.length === 0) {
                let loadings = this.state.loadings;
                loadings.bandwidths = true; this.setState({loadings});
                try {
                    let response = await crudProfileBandwidth();
                    if (response.data.params === null) {
                        loadings.bandwidths = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.bandwidths = false; this.setState({loadings,bandwidths:response.data.params});
                    }
                } catch (e) {
                    loadings.bandwidths = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadPools() {
        if (! this.state.loadings.pools ) {
            if (this.state.pools.length === 0) {
                let loadings = this.state.loadings;
                loadings.pools = true; this.setState({loadings});
                try {
                    let response = await crudProfilePools();
                    if (response.data.params === null) {
                        loadings.pools = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.pools = false; this.setState({loadings,pools:response.data.params});
                    }
                } catch (e) {
                    responseMessage(e);
                }
            }
        }
    }
    async loadProfiles(data = null) {
        if (! this.state.loadings.profiles ) {
            let profiles = this.state.profiles;
            let loadings = this.state.loadings;
            profiles.selected = [];
            loadings.profiles = true;
            this.setState({loadings,profiles});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    profiles.unfiltered.splice(data,1);
                } else {
                    let index = profiles.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        profiles.unfiltered[index] = data;
                    } else {
                        profiles.unfiltered.push(data);
                    }
                }
                loadings.profiles = false;
                this.setState({loadings,profiles},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudProfile(null,true);
                    if (response.data.params === null) {
                        loadings.profiles = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.profiles = false;
                        profiles.unfiltered = response.data.params;
                        this.setState({loadings,profiles},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.profiles = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <Popover
                    sx={{ pointerEvents: 'none', }} open={this.state.popover.open}
                    anchorEl={this.state.popover.anchorEl}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left', }}
                    onClose={this.handlePopOver} disableRestoreFocus>{this.state.popover.data}</Popover>
                <FormProfile user={this.state.user} loadings={this.state.loadings} companies={this.state.companies} nas={this.state.nas} pools={this.state.pools} bandwidths={this.state.bandwidths} open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleModal} handleUpdate={this.loadProfiles}/>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('profiles.labels.menu')} childrens={[
                        { url : getRootUrl() + '/nas', label : Lang.get('nas.labels.menu')}
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-primary">
                                {this.state.loadings.profiles && <CardPreloader/>}
                                <div className="card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.profiles}
                                                   langs={{create:Lang.get('profiles.create.button'),delete:Lang.get('profiles.delete.button')}}
                                                   selected={this.state.profiles.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('profiles.labels.search')}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <tr>
                                            {this.state.profiles.filtered.length > 0 &&
                                                <th rowSpan={2} className="align-middle text-center" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input id="checkAll" data-id="" disabled={this.state.loadings.profiles} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('profiles.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="nas"
                                                         name={Lang.get('nas.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="pool"
                                                         name={Lang.get('nas.pools.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="bandwidth"
                                                         name={Lang.get('bandwidths.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="validity"
                                                         name={Lang.get('profiles.labels.validity.rate')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="price"
                                                         name={Lang.get('profiles.labels.price')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="customers"
                                                         name={Lang.get('profiles.labels.customers.length')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" width={50}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.profiles.filtered.length === 0 ?
                                            <DataNotFound colSpan={8} message={Lang.get('profiles.labels.not_found')}/>
                                            :
                                            this.state.profiles.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item}
                                                                   checked={this.state.profiles.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.profiles} handleCheck={this.handleCheck}/>
                                                    <td colSpan={item.meta.additional ? 4 : 1} className="align-middle">
                                                        {item.meta.additional &&
                                                            <FontAwesomeIcon icon={faBriefcase} className="mr-1 text-info" title={Lang.get('profiles.labels.additional.info_true')}/>
                                                        }
                                                        {item.label}
                                                    </td>
                                                    {! item.meta.additional &&
                                                        <>
                                                            <td className="align-middle">
                                                                {item.meta.nas === null ? null :
                                                                    <>
                                                                        <FontAwesomeIcon size="xs" data-type="nas" data-value={item.value} onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} icon={faInfoCircle} className="mr-1 text-info"/>
                                                                        {item.meta.nas.shortname}
                                                                    </>
                                                                }
                                                            </td>
                                                            <td className="align-middle">
                                                                {item.meta.pool === null ? null :
                                                                    <>
                                                                        <FontAwesomeIcon size="xs" data-type="pool" data-value={item.value} onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} icon={faInfoCircle} className="mr-1 text-info"/>
                                                                        {item.meta.pool.name}
                                                                    </>
                                                                }
                                                            </td>
                                                            <td className="align-middle">
                                                                {item.meta.bandwidth === null ? null :
                                                                    <>
                                                                        <FontAwesomeIcon size="xs" data-type="bandwidth" data-value={item.value} onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} icon={faInfoCircle} className="mr-1 text-info"/>
                                                                        {item.meta.bandwidth.name}
                                                                    </>
                                                                }
                                                            </td>
                                                        </>
                                                    }
                                                    <td className="align-middle">
                                                        {item.meta.additional ? null :
                                                            item.meta.limit.rate === 0 ? <span className="badge badge-success">UNLIMITED</span> :
                                                                item.meta.limit.type === 'time' ?
                                                                    `${item.meta.limit.rate} ${durationType[durationType.findIndex((f) => f.value === item.meta.limit.unit)].label}`
                                                                    :
                                                                    `${item.meta.limit.rate} ${durationTypeByte[durationTypeByte.findIndex((f) => f.value === item.meta.limit.unit)].label}`
                                                        }
                                                    </td>
                                                    <td className={item.meta.price === 0 ? "align-middle text-center" : "align-middle"}>
                                                        {item.meta.price === 0 ?
                                                            <span className="badge badge-success">FREE</span>
                                                            :
                                                            <>
                                                                <span className="float-left">Rp.</span>
                                                                <span className="float-right">{formatLocaleString(item.meta.price)}</span>
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="align-middle text-center">{item.meta.customers.length}</td>
                                                    <TableAction privilege={this.state.privilege} item={item} langs={{update:Lang.get('profiles.update.button'),delete:Lang.get('profiles.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
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
export default ProfilePage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><ProfilePage route="clients.nas.profiles"/></React.StrictMode>)
