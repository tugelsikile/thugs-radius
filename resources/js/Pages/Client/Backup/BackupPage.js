import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {
    CardPreloader,
    formatBytes,
    formatLocaleDate,
    formatPhone,
    responseMessage,
    siteData
} from "../../../Components/mixedConsts";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import {
    faCheckCircle,
    faDownload,
    faHdd,
    faTicketAlt,
    faTimesCircle,
    faUpload
} from "@fortawesome/free-solid-svg-icons";
import {sortStatus, sumGrandtotalCustomer} from "../Customer/Tools/Mixed";
import {crudClientBackup} from "../../../Services/BackupService";
import {confirmDialog, showError} from "../../../Components/Toaster";
import ModalImportRST from "./ModalImportRST";
import {TableHeader} from "./Mixed";
import {DataNotFound, TableAction, TableCheckBox} from "../../../Components/TableComponent";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";


class BackupPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, backups : true },
            privilege : null, menus : [], site : null,
            backups : { filtered : [], unfiltered : [], selected : [] },
            filter : { keywords : '', sort : { by : 'type', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            popover : { open : false, anchorEl : null, data : null },
            modals : {
                import : { open : false },
            }
        };
        this.loadBackup = this.loadBackup.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleImport = this.toggleImport.bind(this);
        this.confirmBackup = this.confirmBackup.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.downloadBackup = this.downloadBackup.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.confirmRestore = this.confirmRestore.bind(this);
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
                                    loadings.backups = false; this.setState({loadings},()=>this.loadBackup());
                                });
                        });
                    });
            }
        }
    }
    downloadBackup(data) {
        window.open(data.meta.path,'_blank');
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data === null) {
            ids = this.state.backups.selected;
        } else {
            ids.push(data.value);
        }
        confirmDialog(this, ids,'delete',`${window.origin}/api/clients/backups`, Lang.get('labels.delete.confirm.title'),Lang.get('labels.delete.confirm.message',{Attribute:Lang.get('backup.labels.backup')}),'app.loadBackup()','error',Lang.get('backup.form_input.id'),null,Lang.get('labels.delete.confirm.confirm'),Lang.get('labels.delete.confirm.cancel'));
    }
    confirmRestore(data) {
        confirmDialog(this, data.value, 'patch', `${window.origin}/api/clients/backups`, Lang.get('backup.restore.confirm.title'), Lang.get('backup.restore.confirm.message'),'app.loadBackup()','error',Lang.get('backup.form_input.id'),null,Lang.get('backup.restore.confirm.yes'), Lang.get('backup.restore.confirm.cancel'));
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
        let backups = this.state.backups;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            backups.selected = [];
            if (event.currentTarget.checked) {
                backups.filtered.map((item)=>{
                    if (! item.meta.default) {
                        backups.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = backups.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                backups.selected.splice(indexSelected,1);
            } else {
                let indexTarget = backups.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    backups.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({backups});
    }
    toggleImport() {
        let modals = this.state.modals;
        modals.import.open = ! this.state.modals.import.open;
        this.setState({modals});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let loadings = this.state.loadings;
        let backups = this.state.backups;
        let filter = this.state.filter;
        loadings.backups = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            backups.filtered = backups.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            backups.filtered = backups.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    backups.filtered = backups.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    backups.filtered = backups.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'date':
                if (filter.sort.dir === 'asc') {
                    backups.filtered = backups.filtered.sort((a,b) => (a.meta.created > b.meta.created) ? 1 : ((b.meta.created > a.meta.created) ? -1 : 0));
                } else {
                    backups.filtered = backups.filtered.sort((a,b)=> (a.meta.created > b.meta.created) ? -1 : ((b.meta.created > a.meta.created) ? 1 : 0));
                }
                break;
            case 'size':
                if (filter.sort.dir === 'asc') {
                    backups.filtered = backups.filtered.sort((a,b) => (a.meta.size > b.meta.size) ? 1 : ((b.meta.size > a.meta.size) ? -1 : 0));
                } else {
                    backups.filtered = backups.filtered.sort((a,b)=> (a.meta.size > b.meta.size) ? -1 : ((b.meta.size > a.meta.size) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(backups.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        backups.filtered = backups.filtered.slice(indexFirst, indexLast);
        loadings.backups = false;
        this.setState({loadings,backups});
    }
    confirmBackup() {
        confirmDialog(this,'','put',`${window.origin}/api/clients/backups`,Lang.get('labels.delete.confirm.title'),Lang.get('labels.create.label',{Attribute:Lang.get('backup.labels.backup')}),'app.loadBackup()','question','id',null,Lang.get('labels.confirm.yes'),Lang.get('labels.confirm.cancel'));
    }
    async loadBackup(data = null) {
        let backups = this.state.backups;
        if (data !== null) {
            if (Number.isInteger(data)) {
                backups.splice(data,1);
            } else {
                let index = backups.unfiltered.findIndex((f)=> f.value === data.value);
                if (index >= 0) {
                    backups.unfiltered[index] = data;
                } else {
                    backups.unfiltered.push(data);
                }
                this.setState({backups});
            }
        } else {
            if (! this.state.loadings.backups) {
                let loadings = this.state.loadings;
                loadings.backups = true; this.setState({loadings},()=>this.handleFilter());
                try {
                    let response = await crudClientBackup();
                    if (response.data.params === null) {
                        loadings.backups = false; this.setState({loadings},()=>this.handleFilter());
                        showError(response.data.message);
                    } else {
                        loadings.backups = false;
                        backups.selected = [];
                        backups.unfiltered = response.data.params;
                        this.setState({loadings,backups},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.backups = false; this.setState({loadings},()=>this.handleFilter());
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <ModalImportRST user={this.state.user} open={this.state.modals.import.open} handleClose={this.toggleImport} handleUpdate={this.loadBackup}/>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('backup.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.backups && <CardPreloader/>}
                                <div className="card-header pl-2" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.backups}
                                                   langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('backup.labels.menu')}),delete:Lang.get('labels.delete.select',{Attribute:Lang.get('backup.labels.menu')})}}
                                                   selected={this.state.backups.selected}
                                                   handleModal={this.confirmBackup}
                                                   others={[
                                                       { handle : ()=>this.toggleImport(), loading : this.state.loadings.backups, icon : faHdd, lang : Lang.get('backup.import.rst.button') }
                                                   ]}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('backup.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                            <TableHeader type="rowHeader" {...this.state} onSort={this.handleSort} onCheck={this.handleCheck}/>
                                        </thead>
                                        <tbody>
                                        {this.state.backups.filtered.length === 0 ?
                                            <DataNotFound colSpan={4} message="No data"/>
                                            :
                                            this.state.backups.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item} className="pl-2"
                                                                   checked={this.state.backups.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.backups} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle text-xs">{item.label}</td>
                                                    <td className="align-middle text-xs">{formatLocaleDate(item.meta.created)}</td>
                                                    <td className="align-middle text-xs">{formatBytes(item.meta.size,0,true,false)}</td>
                                                    <TableAction
                                                        others={[
                                                            {handle : ()=> this.confirmRestore(item), icon : faUpload, color : 'text-info', lang : Lang.get('backup.restore.button')}
                                                        ]}
                                                        icons={{update:faDownload}} className="pr-2" privilege={this.state.privilege} item={item} langs={{update:"Download", delete: Lang.get('labels.delete.label',{Attribute:Lang.get('backup.labels.backup')})}} toggleModal={this.downloadBackup} confirmDelete={this.confirmDelete}/>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                        <tfoot>
                                            <TableHeader type="rowFooter" {...this.state} onSort={this.handleSort} onCheck={this.handleCheck}/>
                                        </tfoot>
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
export default BackupPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><BackupPage route="clients.backup"/></React.StrictMode>);
