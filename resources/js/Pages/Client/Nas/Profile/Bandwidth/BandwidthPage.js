// noinspection DuplicatedCode

import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../../../Components/Authentication";
import {CardPreloader, formatBytes, responseMessage, siteData} from "../../../../../Components/mixedConsts";
import {confirmDialog, showError} from "../../../../../Components/Toaster";
import {crudCompany} from "../../../../../Services/CompanyService";
import {crudNas, crudProfileBandwidth} from "../../../../../Services/NasService";
import PageLoader from "../../../../../Components/PageLoader";
import MainHeader from "../../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../../Components/Layout/PageTitle";
import {PageCardSearch, PageCardTitle} from "../../../../../Components/PageComponent";
import MainFooter from "../../../../../Components/Layout/MainFooter";
import BtnSort from "../../../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableAction, TableCheckBox} from "../../../../../Components/TableComponent";
import FormBandwidth from "./Tools/FormBandwidth";

class BandwidthPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : false, companies : false, bandwidths : true },
            privilege : null, menus : [], site : null, companies : [], nas : [],
            bandwidths : { filtered : [], unfiltered : [], selected : [] },
            filter : { keywords : '', sort : { by : 'code', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : { open : false, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.loadBandwidths = this.loadBandwidths.bind(this);
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
            this.state.bandwidths.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/nas/profiles/bandwidths`,Lang.get('bandwidths.delete.warning'),Lang.get('bandwidths.delete.select'),'app.loadBandwidths()');
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
        let bandwidths = this.state.bandwidths;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            bandwidths.selected = [];
            if (event.currentTarget.checked) {
                bandwidths.filtered.map((item)=>{
                    if (! item.meta.default) {
                        bandwidths.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = bandwidths.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                bandwidths.selected.splice(indexSelected,1);
            } else {
                let indexTarget = bandwidths.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    bandwidths.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({bandwidths});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let bandwidths = this.state.bandwidths;
        let filter = this.state.filter;
        loadings.bandwidths = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            bandwidths.filtered = bandwidths.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.description.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            bandwidths.filtered = bandwidths.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    bandwidths.filtered = bandwidths.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    bandwidths.filtered = bandwidths.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'max_limit.up' :
            case 'burst.up' :
            case 'threshold.up' :
            case 'time.up' :
            case 'limit_at.up' :
            case 'max_limit.down' :
            case 'burst.down' :
            case 'threshold.down' :
            case 'time.down' :
            case 'limit_at.down' :
                let sortString = filter.sort.by.split('.');
                let parent = sortString[0];
                let child = sortString[1];
                if (filter.sort.dir === 'asc') {
                    bandwidths.filtered = bandwidths.filtered.sort((a,b) => (a.meta[parent][child] > b.meta[parent][child]) ? 1 : ((b.meta[parent][child] > a.meta[parent][child]) ? -1 : 0));
                } else {
                    bandwidths.filtered = bandwidths.filtered.sort((a,b) => (a.meta[parent][child] > b.meta[parent][child]) ? -1 : ((b.meta[parent][child] > a.meta[parent][child]) ? 1 : 0));
                }
                break;
        }
        loadings.bandwidths = false;
        this.setState({loadings,bandwidths});
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
    async loadBandwidths(data = null) {
        if (! this.state.loadings.bandwidths) {
            let loadings = this.state.loadings;
            let bandwidths = this.state.bandwidths;
            bandwidths.selected = [];
            loadings.bandwidths = true; this.setState({loadings});
            if (data != null) {
                if (Number.isInteger(data)) {
                    bandwidths.filtered.splice(data, 1);
                } else {
                    let index = bandwidths.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        bandwidths.unfiltered[index] = data;
                    } else {
                        bandwidths.unfiltered.push(data);
                    }
                }
                loadings.bandwidths = false;
                this.setState({loadings,bandwidths},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudProfileBandwidth();
                    if (response.data.params === null) {
                        loadings.bandwidths = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        bandwidths.unfiltered = response.data.params;
                        loadings.bandwidths = false;
                        this.setState({loadings,bandwidths},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.bandwidths = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormBandwidth open={this.state.modal.open} data={this.state.modal.data} user={this.state.user} loadings={this.state.loadings} nas={this.state.nas} companies={this.state.companies} handleClose={this.toggleModal} handleUpdate={this.loadBandwidths}/>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('bandwidths.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <div className="card card-outline card-primary">
                                {this.state.loadings.bandwidths && <CardPreloader/>}
                                <div className="card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.bandwidths}
                                                   langs={{create:Lang.get('bandwidths.create.button'),delete:Lang.get('bandwidths.delete.button')}}
                                                   selected={this.state.bandwidths.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('bandwidths.labels.search')}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <tr>
                                            {this.state.bandwidths.filtered.length > 0 &&
                                                <th rowSpan={2} className="align-middle text-center" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input id="checkAll" data-id="" disabled={this.state.loadings.bandwidths} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className="align-middle" rowSpan={2}>
                                                <BtnSort sort="name"
                                                         name={Lang.get('bandwidths.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" colSpan={2}>{Lang.get('bandwidths.labels.max_limit.main')}</th>
                                            <th className="align-middle text-center" colSpan={2}>{Lang.get('bandwidths.labels.burst_limit.main')}</th>
                                            <th className="align-middle text-center" colSpan={2}>{Lang.get('bandwidths.labels.threshold.main')}</th>
                                            <th className="align-middle text-center" colSpan={2}>{Lang.get('bandwidths.labels.time.main')}</th>
                                            <th className="align-middle text-center" colSpan={2}>{Lang.get('bandwidths.labels.limit_at.main')}</th>
                                            <th rowSpan={2} className="align-middle text-center" width={50}>
                                                <BtnSort sort="priority"
                                                         name={Lang.get('bandwidths.labels.priority.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th rowSpan={2} className="align-middle text-center" width={30}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        <tr>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="max_limit.up"
                                                         name={Lang.get('bandwidths.labels.max_limit.up')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="max_limit.down"
                                                         name={Lang.get('bandwidths.labels.max_limit.down')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="burst.up"
                                                         name={Lang.get('bandwidths.labels.burst_limit.up')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="burst.down"
                                                         name={Lang.get('bandwidths.labels.burst_limit.down')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="threshold.up"
                                                         name={Lang.get('bandwidths.labels.threshold.up')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="threshold.down"
                                                         name={Lang.get('bandwidths.labels.threshold.down')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="time.up"
                                                         name={Lang.get('bandwidths.labels.time.up')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="time.down"
                                                         name={Lang.get('bandwidths.labels.time.down')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={60}>
                                                <BtnSort sort="limit_at.up"
                                                         name={Lang.get('bandwidths.labels.limit_at.up')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={90}>
                                                <BtnSort sort="limit_at.down"
                                                         name={Lang.get('bandwidths.labels.limit_at.down')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.bandwidths.filtered.length === 0 ?
                                            <DataNotFound colSpan={13} message={Lang.get('bandwidths.labels.not_found')}/>
                                            :
                                            this.state.bandwidths.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item}
                                                                   checked={this.state.bandwidths.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.bandwidths} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle">{item.label}</td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max_limit.up === 0 ? <span className="badge badge-success">UNL</span> :formatBytes(item.meta.max_limit.up)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.max_limit.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.max_limit.down)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.burst.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.burst.up)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.burst.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.burst.down)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.threshold.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.threshold.up)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.threshold.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.threshold.down)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.burst.up === 0 ? <span className="badge badge-success">UNL</span> : `${item.meta.time.up}s`}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.burst.down === 0 ? <span className="badge badge-success">UNL</span> : `${item.meta.time.down}s`}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.limit_at.up === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.limit_at.up)}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.meta.limit_at.down === 0 ? <span className="badge badge-success">UNL</span> : formatBytes(item.meta.limit_at.down)}
                                                    </td>
                                                    <td className="align-middle text-center">{item.meta.priority}</td>
                                                    <TableAction privilege={this.state.privilege} item={item} langs={{update:Lang.get('bandwidths.update.button'),delete:Lang.get('bandwidths.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
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
export default BandwidthPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><BandwidthPage route="clients.nas.bandwidths"/></React.StrictMode>)
