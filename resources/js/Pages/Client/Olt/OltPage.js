import React from "react";
import ReactDOM from "react-dom/client";
import {confirmDialog, showError} from "../../../Components/Toaster";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../Components/mixedConsts";
import {crudOlt} from "../../../Services/OltService";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import {faCircleNotch, faPlay, faRefresh, faTicketAlt} from "@fortawesome/free-solid-svg-icons";
import {TableHeader} from "./Mixed";
import {DataNotFound, TableAction, TableCheckBox} from "../../../Components/TableComponent";
import FormOlt from "./FormOlt";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import DetailOLT from "./DetailOLT";


class OltPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, olt : true },
            privilege : null, menus : [], site : null,
            olt : { filtered : [], unfiltered : [], selected : [] },
            filter : { olt : null, keywords : '', sort : { by : 'name', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : { open : false, data : null },
            popover : { open : false, anchorEl : null, data : null },
        }
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.loadOlt = this.loadOlt.bind(this);
        this.toggleOlt = this.toggleOlt.bind(this);
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
                            getPrivileges([
                                {route : this.props.route, can : false },
                            ])
                                .then((response)=>{
                                    loadings.privilege = false; this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                })
                                .then(()=>{
                                    loadings.olt = false; this.setState({loadings}, ()=>this.loadOlt());
                                });
                        });
                    });
            }
        }
        window.addEventListener('scroll', this.handleScrollPage);
    }
    toggleOlt(data = null) {
        let filter = this.state.filter;
        filter.olt = data;
        this.setState({filter});
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.olt.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/olt`,Lang.get('labels.delete.confirm.title'), Lang.get('labels.delete.confirm.message',{Attribute:Lang.get('olt.labels.menu')}),'app.loadOlt()','error',Lang.get('olt.form_input.id'));
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
        let olt = this.state.olt;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            olt.selected = [];
            if (event.currentTarget.checked) {
                olt.filtered.map((item)=>{
                    if (! item.meta.default) {
                        olt.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = olt.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                olt.selected.splice(indexSelected,1);
            } else {
                let indexTarget = olt.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    olt.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({olt});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleChangePage(page) {
        let filter = this.state.filter;
        filter.page = {value:page,label:page}; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let olt = this.state.olt;
        let filter = this.state.filter;
        loadings.olt = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            olt.filtered = olt.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.auth.host.indexOf(filter.keywords) !== -1
            );
        } else {
            olt.filtered = olt.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'host':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.host > b.meta.auth.host) ? 1 : ((b.meta.auth.host > a.meta.auth.host) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.host > b.meta.auth.host) ? -1 : ((b.meta.auth.host > a.meta.auth.host) ? 1 : 0));
                }
                break;
            case 'port':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.port > b.meta.auth.port) ? 1 : ((b.meta.auth.port > a.meta.auth.port) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.auth.port > b.meta.auth.port) ? -1 : ((b.meta.auth.port > a.meta.auth.port) ? 1 : 0));
                }
                break;
            case 'community':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.communities.read > b.meta.communities.read) ? 1 : ((b.meta.communities.read > a.meta.communities.read) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.communities.read > b.meta.communities.read) ? -1 : ((b.meta.communities.read > a.meta.communities.read) ? 1 : 0));
                }
                break;
            case 'uptime':
                if (filter.sort.dir === 'asc') {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.remote.uptime > b.meta.remote.uptime) ? 1 : ((b.meta.remote.uptime > a.meta.remote.uptime) ? -1 : 0));
                } else {
                    olt.filtered = olt.filtered.sort((a,b)=> (a.meta.remote.uptime > b.meta.remote.uptime) ? -1 : ((b.meta.remote.uptime > a.meta.remote.uptime) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(olt.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        olt.filtered = olt.filtered.slice(indexFirst, indexLast);
        loadings.olt = false;
        this.setState({loadings,olt});
    }
    async loadOlt(data = null) {
        if (! this.state.loadings.olt) {
            let loadings = this.state.loadings;
            let olt = this.state.olt;
            if (data !== null) {
                if (Number.isInteger(data)) {
                    olt.splice(data, 1);
                } else {
                    let index = olt.unfiltered.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        olt.unfiltered[index] = data;
                    } else {
                        olt.unfiltered.push(data);
                    }
                }
                this.setState({olt},()=>this.handleFilter());
            } else {
                olt.selected = [];
                loadings.olt = true; this.setState({loadings});
                try {
                    let response = await crudOlt();
                    if (response.data.params === null) {
                        loadings.olt = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.olt = false;
                        olt.unfiltered = response.data.params;
                        this.setState({loadings,olt},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.olt = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormOlt open={this.state.modal.open} data={this.state.modal.data} onClose={this.toggleModal} onUpdate={this.loadOlt}/>

                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('olt.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            {this.state.filter.olt !== null ?
                                <DetailOLT onToggle={this.toggleOlt} olt={this.state.filter.olt}/>
                                :
                                <div id="main-page-card" className="card card-outline card-primary">
                                    {this.state.loadings.olt && <CardPreloader/>}
                                    <div className="card-header pl-2" id="page-card-header">
                                        <PageCardTitle privilege={this.state.privilege}
                                                       filter={<button onClick={()=>this.loadOlt()} className="btn btn-sm mr-1 btn-outline-secondary" disabled={this.state.loadings.olt}><FontAwesomeIcon icon={this.state.loadings.olt ? faCircleNotch : faRefresh} spin={this.state.loadings.olt} size="xs"/></button>}
                                                       loading={this.state.loadings.olt}
                                                       langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('olt.labels.menu')}),delete:Lang.get('labels.delete.select',{Attribute:Lang.get('olt.labels.menu')})}}
                                                       selected={this.state.olt.selected}
                                                       handleModal={this.toggleModal}
                                                       confirmDelete={this.confirmDelete}/>
                                        <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('olt.labels.menu')})}/>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-striped table-sm">
                                            <thead id="main-table-header">
                                            <TableHeader type="header" onCheck={this.handleCheck} filter={this.state.filter} onSort={this.handleSort} loading={this.state.loadings.olt} olt={this.state.olt}/>
                                            </thead>
                                            <tbody>
                                            {this.state.olt.unfiltered.length === 0 ?
                                                <DataNotFound colSpan={5} message={Lang.get('labels.not_found',{Attribute:Lang.get('olt.labels.menu')})}/>
                                                :
                                                this.state.olt.unfiltered.map((item)=>
                                                    <tr key={item.value}>
                                                        <TableCheckBox checked={this.state.olt.selected.filter((f)=> f === item.value).length > 0} className="pl-2" item={item} loading={this.state.loadings.olt} handleCheck={this.handleCheck}/>
                                                        <td className="align-middle text-xs">{item.label}</td>
                                                        <td className="align-middle text-xs">{item.meta.auth.host}</td>
                                                        <td className="align-middle text-xs">{item.meta.auth.port}</td>
                                                        <td className="align-middle text-xs">*****</td>
                                                        <td className="align-middle text-xs">{item.meta.remote.uptime}</td>
                                                        <TableAction
                                                            others={[
                                                                {handle:()=>this.toggleOlt(item), icon : faPlay, lang : Lang.get('olt.labels.detail')}
                                                            ]}
                                                            privilege={this.state.privilege} item={item} className="pr-2"
                                                            langs={{update:Lang.get('labels.update.label',{Attribute:Lang.get('olt.labels.menu')}), delete:Lang.get('labels.delete.label',{Attribute:Lang.get('olt.labels.menu')})}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
                                                    </tr>
                                                )
                                            }
                                            </tbody>
                                            <tfoot>
                                            <TableHeader type="footer" onCheck={this.handleCheck} filter={this.state.filter} onSort={this.handleSort} loading={this.state.loadings.olt} olt={this.state.olt}/>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            }
                        </div>

                    </section>

                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }

}

export default OltPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><OltPage route="clients.olt"/></React.StrictMode>);
