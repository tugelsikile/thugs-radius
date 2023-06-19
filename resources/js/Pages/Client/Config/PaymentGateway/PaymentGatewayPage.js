import React from "react";
import ReactDOM from "react-dom/client";
import PageLoader from "../../../../Components/PageLoader";
import {CardPreloader, responseMessage, siteData} from "../../../../Components/mixedConsts";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import {sortDate} from "../../User/Tools/Mixed";
import moment from "moment/moment";
import {crudPaymentGatewayClient} from "../../../../Services/ConfigService";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import PageTitle from "../../../../Components/Layout/PageTitle";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import BtnSort from "../../../Auth/User/Tools/BtnSort";
import {TableHeader} from "./Tools/Mixed";
import {DataNotFound, TableAction, TableCheckBox} from "../../../../Components/TableComponent";
import FormGateways from "./Tools/FormGateways";
import MainFooter from "../../../../Components/Layout/MainFooter";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-regular-svg-icons";

// noinspection DuplicatedCode
class PaymentGatewayPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privilege : false, levels : true, site : false, gateways : true },
            privilege : null, menus : [], companies : [],
            gateways : { filtered : [], unfiltered : [], selected : [], },
            filter : {
                keywords : '',
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
        this.loadGateways = this.loadGateways.bind(this);
        this.confirmActivate = this.confirmActivate.bind(this);
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        if (! loadings.privilege) {
            siteData().then((response)=>this.setState({site:response}));
            loadings.privilege = true; this.setState({loadings});
            if (this.state.privilege === null) {
                getPrivileges([
                    {route : this.props.route, can : false,},
                    {route : 'clients.configs.payment-gateways.activate', can : false }
                ])
                    .then((response)=>this.setState({privilege:response.privileges,menus:response.menus}))
                    .then(()=>{
                        loadings.gateways = false; this.setState({loadings},()=>this.loadGateways());
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
    confirmActivate(data) {
        confirmDialog(this, data.value, 'patch', data.meta.timestamps.active.at === null ? `${window.origin}/api/clients/configs/payment-gateways/activate` : `${window.origin}/api/clients/configs/payment-gateways/inactivate`, data.meta.timestamps.active.at === null ? Lang.get('labels.active.confirm.title',{Attribute:Lang.get('gateways.labels.menu')}) : Lang.get('labels.inactive.confirm.title',{Attribute:Lang.get('gateways.labels.menu')}),data.meta.timestamps.active.at === null ? Lang.get('labels.active.confirm.message',{Attribute:Lang.get('gateways.labels.menu')}) : Lang.get('labels.inactive.confirm.message',{Attribute:Lang.get('gateways.labels.menu')}),'app.loadGateways()', data.meta.timestamps.active.at === null ? 'success' : 'error', Lang.get('gateways.form_input.id'),null,data.meta.timestamps.active.at === null ? Lang.get('labels.active.confirm.confirm') : Lang.get('labels.inactive.confirm.confirm'), data.meta.timestamps.active.at === null ? Lang.get('labels.active.confirm.cancel') : Lang.get('labels.inactive.confirm.cancel'));
    }
    handleScrollPage() {
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
            index = this.state.gateways.unfiltered.findIndex((f) => f.value === data.value);
            ids.push(data.value);
        } else {
            this.state.gateways.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this, ids,'delete',`${window.origin}/api/clients/configs/payment-gateways`,Lang.get('labels.delete.confirm.title',{Attribute:Lang.get('gateways.labels.menu')}),Lang.get('labels.delete.confirm.message',{Attribute:Lang.get('gateways.labels.menu')}),index === null ? 'app.loadGateways()' : 'app.loadGateways(deleteIndex)','warning',Lang.get('gateways.form_input.id'),index === null ? null : index,Lang.get('labels.delete.confirm.confirm'),Lang.get('labels.delete.confirm.cancel'));
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
        let gateways = this.state.gateways;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            gateways.selected = [];
            if (event.currentTarget.checked) {
                gateways.filtered.map((item)=>{
                    if (! item.meta.default) {
                        gateways.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = gateways.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                gateways.selected.splice(indexSelected,1);
            } else {
                let indexTarget = gateways.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    if (! gateways.unfiltered[indexTarget].meta.default) {
                        gateways.selected.push(event.currentTarget.getAttribute('data-id'));
                    }
                }
            }
        }
        this.setState({gateways});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value; this.setState({filter},()=>this.handleFilter());
    }
    handleFilter(){
        let loadings = this.state.loadings;
        let filter = this.state.filter;
        let gateways = this.state.gateways;
        loadings.gateways = true; this.setState({loadings});
        if (this.state.filter.keywords.length > 0) {
            gateways.filtered = gateways.unfiltered.filter((f) => f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1)
        } else {
            gateways.filtered = gateways.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                } else {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                }
                break;
            case 'module' :
                if (filter.sort.dir === 'asc') {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.module > b.meta.module) ? -1 : ((b.meta.module > a.meta.module) ? 1 : 0));
                } else {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.module > b.meta.module) ? 1 : ((b.meta.module > a.meta.module) ? -1 : 0));
                }
                break;
            case 'mode' :
                if (filter.sort.dir === 'asc') {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.production > b.meta.production) ? -1 : ((b.meta.production > a.meta.production) ? 1 : 0));
                } else {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.production > b.meta.production) ? 1 : ((b.meta.production > a.meta.production) ? -1 : 0));
                }
                break;
            case 'status' :
                if (filter.sort.dir === 'asc') {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.timestamps.active.at > b.meta.timestamps.active.at) ? -1 : ((b.meta.timestamps.active.at > a.meta.timestamps.active.at) ? 1 : 0));
                } else {
                    gateways.filtered = gateways.filtered.sort((a,b) => (a.meta.timestamps.active.at > b.meta.timestamps.active.at) ? 1 : ((b.meta.timestamps.active.at > a.meta.timestamps.active.at) ? -1 : 0));
                }
                break;
        }
        loadings.gateways = false;
        this.setState({gateways,loadings});
    }
    async loadGateways(data = null) {
        if (! this.state.loadings.gateways) {
            let loadings = this.state.loadings;
            let gateways = this.state.gateways;
            loadings.gateways = true;
            this.setState({loadings});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    if (data >= 0) {
                        gateways.unfiltered.splice(data,1);
                    }
                } else {
                    let index = gateways.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        gateways.unfiltered[index] = data;
                    } else {
                        gateways.unfiltered.push(data);
                    }
                }
                loadings.gateways = false;
                this.setState({loadings,gateways},()=>this.handleFilter());
            } else {
                gateways.selected = [];
                this.setState({gateways});
                try {
                    let response = await crudPaymentGatewayClient(null,true);
                    if (response.data.params === null) {
                        loadings.gateways = false; this.setState({loadings});
                    } else {
                        gateways.unfiltered = response.data.params;
                        loadings.gateways = false;
                        this.setState({loadings,gateways},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.gateways = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormGateways loadings={this.state.loadings} open={this.state.modal.open} data={this.state.modal.data} user={this.state.user} companies={this.state.companies} handleClose={this.toggleModal} handleUpdate={this.loadGateways}/>
                <PageLoader/>
                <HeaderAndSideBar route={this.props.route} user={this.state.user} menus={this.state.menus} privilege={this.state.privilege} loadings={this.state.loadings} site={this.state.site}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('gateways.labels.menu')} childrens={[
                        { url : `${getRootUrl()}/configs`, label : Lang.get('configs.labels.menu') }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.gateways && <CardPreloader/>}
                                <div className="card-header pl-1" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.gateways}
                                                   langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('gateways.labels.menu')}),delete:Lang.get('labels.delete.label',{Attribute:Lang.get('gateways.labels.menu')})}}
                                                   selected={this.state.gateways.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('gateways.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead id="main-table-header">
                                            <TableHeader gateways={this.state.gateways} loading={this.state.loadings.gateways} onCheck={this.handleCheck} onSort={this.handleSort} filter={this.state.filter}/>
                                        </thead>
                                        <tbody>
                                        {this.state.gateways.filtered.length === 0 ?
                                            <DataNotFound colSpan={4} message={Lang.get('labels.not_found',{Attribute:Lang.get('gateways.labels.menu')})}/>
                                            :
                                            this.state.gateways.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item} className="pl-2"
                                                                   checked={this.state.gateways.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.gateways} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle text-xs">{item.label}</td>
                                                    <td className="align-middle text-xs"><a target="_blank" href={item.meta.keys.website}>{item.meta.module.toUpperCase()}</a></td>
                                                    <td width={100} className="align-middle text-center text-xs">{item.meta.production ? <span className="badge badge-success px-2">PRODUCTION</span> : <span className="badge badge-secondary px-2">SANDBOX</span> }</td>
                                                    <td className="align-middle text-xs text-center">{item.meta.timestamps.active.at === null ? <span className="badge badge-secondary px-2">{Lang.get('companies.labels.status.inactive').toUpperCase()}</span> : <span className="badge badge-success px-2">{Lang.get('companies.labels.status.active').toUpperCase()}</span> }</td>
                                                    <TableAction others={
                                                        [
                                                            this.state.privilege === null ? null : ! this.state.privilege.activate ? null :
                                                                { color : item.meta.timestamps.active.at === null ? 'text-success' : 'text-danger', handle : ()=>this.confirmActivate(item), icon : item.meta.timestamps.active.at === null ? faCheckCircle : faTimesCircle, lang : item.meta.timestamps.active.at === null ? Lang.get('labels.active.button',{Attribute:Lang.get('gateways.labels.menu')}) : Lang.get('labels.inactive.button',{Attribute:Lang.get('gateways.labels.menu')})}
                                                        ]}
                                                                 privilege={this.state.privilege} item={item} className="pr-2"
                                                                 langs={{update:Lang.get('labels.update.label',{Attribute:Lang.get('gateways.labels.menu')}), delete:Lang.get('labels.delete.label',{Attribute:Lang.get('gateways.labels.menu')})}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
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
export default PaymentGatewayPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PaymentGatewayPage route="clients.configs.payment-gateways"/></React.StrictMode>)
