import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../Components/mixedConsts";
import PageLoader from "../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../Components/Layout/Layout";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import {faHdd, faTicketAlt} from "@fortawesome/free-solid-svg-icons";
import {sortStatus, sumGrandtotalCustomer} from "../Customer/Tools/Mixed";
import {crudClientBackup} from "../../../Services/BackupService";
import {showError} from "../../../Components/Toaster";
import ModalImportRST from "./ModalImportRST";


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
    async loadBackup(data = null) {
        /*let backups = this.state.backups;
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
                        backups.unfiltered = response.data.params;
                        this.setState({loadings,backups},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.backups = false; this.setState({loadings},()=>this.handleFilter());
                    responseMessage(e);
                }
            }
        }*/
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
                                                   handleModal={this.toggleModal}
                                                   others={[
                                                       { handle : ()=>this.toggleImport(), loading : this.state.loadings.backups, icon : faHdd, lang : Lang.get('backup.import.rst.button') }
                                                   ]}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('backup.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
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
