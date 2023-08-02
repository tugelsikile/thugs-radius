import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../../Components/mixedConsts";
import {crudPettyCash} from "../../../../Services/AccountingService";
import moment from "moment";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import PageLoader from "../../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import MainFooter from "../../../../Components/Layout/MainFooter";
import PageTitle from "../../../../Components/Layout/PageTitle";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faDownload, faPrint, faRefresh} from "@fortawesome/free-solid-svg-icons";
import FormPettyCash from "./FormPettyCash";
import {DataNotFound} from "../../../../Components/TableComponent";
import {PageCards, PageFilter, PettyCashTableMainRow, SumEndBalance} from "./Mixed";

class PettyCashPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, petty_cashes : true },
            privilege : null, menus : [], site : null,
            petty_cashes : { filtered : [], unfiltered : [], selected : [], last : [] },
            filter : { period : new Date(), keywords : '', sort : { by : 'type', dir : 'asc' } },
            modal : { open : false, data : null }
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.loadPettyCash = this.loadPettyCash.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.confirmApprove = this.confirmApprove.bind(this);
        this.loadPettyCashLast = this.loadPettyCashLast.bind(this);
        this.handleSelectPeriod = this.handleSelectPeriod.bind(this);
        this.handleDownload = this.handleDownload.bind(this);
        this.handlePrint = this.handlePrint.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.site) {
            let loadings = this.state.loadings;
            loadings.site = true;
            loadings.privilege = true;
            this.setState({loadings});
            if (this.state.site === null) {
                siteData()
                    .then((response)=>{
                        loadings.site = false;
                        if (response != null) {
                            this.setState({site:response});
                        }
                        this.setState({loadings});
                    })
                    .then(()=>{
                        getPrivileges([
                            {route : this.props.route, can : false},
                            {route : "clients.accounting.petty-cash.approve", can : false},
                        ])
                            .then((response)=>{
                                loadings.privilege = false;
                                if (response !== null) {
                                    this.setState({privilege:response.privileges,menus:response.menus})
                                }
                                this.setState({loadings});
                            })
                            .then(()=>{
                                loadings.petty_cashes = false; this.setState({loadings},()=>this.loadPettyCash());
                            });
                    })
            }
        }
    }
    handleDownload(event = null) {
        if (event !== null) event.preventDefault();
        let targetUrl = `${window.origin}/clients/accounting/petty-cash/download`;
        if (this.state.filter.period !== null) targetUrl = `${targetUrl}?period=${moment(this.state.filter.period).format('yyyy-MM-DD')}`;
        window.open(targetUrl, '_blank');
    }
    handlePrint(event = null) {
        if (event !== null) event.preventDefault();
    }
    handleSelectPeriod(value) {
        let filter = this.state.filter;
        filter.period = value;
        this.setState({filter},()=>this.loadPettyCash());
    }
    confirmApprove(data) {
        confirmDialog(this, data.value, 'patch', `${window.origin}/api/clients/accounting/petty-cash/approve`, Lang.get('petty_cash.approve.confirm.title'), Lang.get('petty_cash.approve.confirm.message'), 'app.loadPettyCash(response.data.params)', "error", Lang.get('petty_cash.form_input.id'), null, Lang.get('petty_cash.approve.confirm.yes'), Lang.get('petty_cash.approve.confirm.no'));
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.petty_cashes.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this, ids, "delete", `${window.origin}/api/clients/accounting/petty-cash`, Lang.get('labels.delete.confirm.title'), Lang.get('labels.delete.confirm.message',{Attribute:Lang.get('petty_cash.labels.menu')}), 'app.loadPettyCash(ids,"delete")','error',Lang.get('petty_cash.form_input.id'),null,Lang.get('labels.delete.confirm.confirm'), Lang.get('labels.delete.confirm.cancel'));
    }
    handleCheck(event) {
        let petty_cashes = this.state.petty_cashes;
        let indexPeriod = petty_cashes.filtered.findIndex((f)=> f.value === event.target.getAttribute('data-period'));
        if (event.target.getAttribute('data-value') === null) {
            if (event.target.getAttribute('data-period')) {
                if (indexPeriod >= 0) {
                    petty_cashes.filtered[indexPeriod].data.map((item)=>{
                        if (event.target.checked) {
                            petty_cashes.selected.push(item.value);
                        } else {
                            let indexChecked = petty_cashes.selected.findIndex((f)=> f === item.value);
                            if (indexChecked >= 0) {
                                petty_cashes.selected.splice(indexChecked,1);
                            }
                        }
                    });
                }
            }
        } else {
            if (event.target.getAttribute('data-period')) {
                if (indexPeriod >= 0) {
                    let indexChecked = petty_cashes.selected.findIndex((f)=> f === event.target.getAttribute('data-value'));
                    if (event.target.checked) {
                        if (indexChecked < 0) {
                            petty_cashes.selected.push(event.target.getAttribute('data-value'));
                        }
                    } else {
                        if (indexChecked >= 0) {
                            petty_cashes.selected.splice(indexChecked, 1);
                        }
                    }
                }
            }
        }
        this.setState({petty_cashes});
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data;
        this.setState({modal});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let petty_cashes = this.state.petty_cashes;
        let filter = this.state.filter;
        if (petty_cashes.last.length > 0 && petty_cashes.unfiltered.length > 0) {
            let dataLastMonth = {
                value : null,
                label : Lang.get('petty_cash.labels.end_balance.last'),
                period : petty_cashes.unfiltered[0].value,
                meta : {
                    description : '', type : 'input', remarks : null,
                    timestamps : { approve : { at : moment().format('yyyy-MM-DD HH:mm:ss') } },
                    amount : SumEndBalance(petty_cashes.last,null,false),
                }
            }
            petty_cashes.unfiltered[0].data.unshift(dataLastMonth);
        }
        if (filter.keywords.length > 0) {
            let cacheData = JSON.parse(localStorage.getItem('cache_data'));
            petty_cashes.filtered = [];
            for (let index = 0; index < cacheData.length; index++) {
                let theData = cacheData[index];
                theData.data = theData.data.filter((f)=>
                    f.label.toLowerCase().includes(filter.keywords.toLowerCase())
                    ||
                    f.meta.description.toLowerCase().includes(filter.keywords.toLowerCase())
                );
                petty_cashes.filtered.push(theData);
            }
        } else {
            localStorage.setItem('cache_data', JSON.stringify(petty_cashes.unfiltered));
            petty_cashes.filtered = petty_cashes.unfiltered;
        }
        this.setState({petty_cashes});
    }
    async loadPettyCash(data = null,mode = 'update') {
        if (! this.state.loadings.petty_cashes) {
            let petty_cashes = this.state.petty_cashes;
            let loadings = this.state.loadings;
            if (data !== null) {
                if (typeof data === "object") {
                    if (typeof data.period !== "undefined" && typeof data.value !== "undefined") {
                        let indexPeriod = petty_cashes.unfiltered.findIndex((f)=> f.value === data.period);
                        if (indexPeriod >= 0) {
                            let indexPettyCash = petty_cashes.unfiltered[indexPeriod].data.findIndex((f)=> f.value === data.value);
                            if (indexPettyCash >= 0) {
                                if (mode === "delete") {
                                    petty_cashes.selected = [];
                                    petty_cashes.unfiltered[indexPeriod].data.splice(indexPettyCash,1);
                                } else if (mode === "update"){
                                    petty_cashes.unfiltered[indexPeriod].data[indexPettyCash] = data;
                                }
                            } else {
                                if (mode === "update") {
                                    petty_cashes.unfiltered[indexPeriod].data.push(data);
                                }
                            }
                        }
                    } else {
                        if (mode === "delete") {
                            petty_cashes.unfiltered.map((unfiltered,indexUnfiltered)=>{
                                unfiltered.data.map((item,index)=>{
                                    if (data.findIndex((f)=> f === item.value) >= 0) {
                                        petty_cashes.unfiltered[indexUnfiltered].data.splice(index,1);
                                    }
                                });
                            });
                            petty_cashes.selected = [];
                        }
                    }
                    this.setState({petty_cashes},()=>this.handleFilter());
                }
            } else {
                loadings.petty_cashes = true; this.setState({loadings});
                try {
                    const formData = new FormData();
                    formData.append('_method','post');
                    if (this.state.filter.period !== null) formData.append(Lang.get('petty_cash.form_input.period'), moment(this.state.filter.period).format('yyyy-MM-DD'));
                    let response = await crudPettyCash(formData);
                    if (response.data.params === null) {
                        loadings.petty_cashes = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.petty_cashes = false;
                        petty_cashes.selected = [];
                        petty_cashes.unfiltered = response.data.params;
                        this.setState({loadings,petty_cashes},()=>this.loadPettyCashLast());
                    }
                } catch (e) {
                    loadings.petty_cashes = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadPettyCashLast() {
        if (! this.state.loadings.petty_cashes) {
            let petty_cashes = this.state.petty_cashes;
            let loadings = this.state.loadings;
            loadings.petty_cashes = true; this.setState({loadings});
            try {
                const formData = new FormData();
                formData.append('_method','post');
                if (this.state.filter.period !== null) formData.append(Lang.get('petty_cash.form_input.period'), moment(this.state.filter.period).add(-1,"months").endOf('months').format('yyyy-MM-DD'));
                let response = await crudPettyCash(formData);
                if (response.data.params === null) {
                    loadings.petty_cashes = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.petty_cashes = false;
                    petty_cashes.last = response.data.params;
                    this.setState({loadings,petty_cashes},()=>this.handleFilter());
                }
            } catch (e) {
                loadings.petty_cashes = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormPettyCash open={this.state.modal.open} data={this.state.modal.data} handleClose={this.toggleModal} handleUpdate={this.loadPettyCash} period={this.state.filter.period}/>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('petty_cash.labels.menu')} childrens={[
                        { url : getRootUrl() + '/accounting', label : Lang.get('accounting.labels.menu') }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <PageCards {...this.state}/>

                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.petty_cashes && <CardPreloader/>}
                                <div className="card-header pl-2" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   filter={<PageFilter onSelect={this.handleSelectPeriod} {...this.state} onReload={this.loadPettyCash} />}
                                                   others={[
                                                       { disabled : this.state.loadings.petty_cashes, icon : faDownload, lang : Lang.get('labels.download', {Attribute : Lang.get('petty_cash.labels.menu')}), handle : ()=> this.handleDownload() },
                                                       { disabled : this.state.loadings.petty_cashes, icon : faPrint, lang : Lang.get('labels.print', {Attribute : Lang.get('petty_cash.labels.menu')}), handle : ()=> this.handlePrint()}
                                                   ]}
                                                   loading={this.state.loadings.petty_cashes}
                                                   langs={{create:Lang.get('labels.create.label',{Attribute:Lang.get('petty_cash.labels.menu')}),delete:Lang.get('labels.delete.select',{Attribute:Lang.get('petty_cash.labels.menu')})}}
                                                   selected={this.state.petty_cashes.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('petty_cash.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0 table-responsive">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <tr>
                                            <th className="align-middle text-xs pl-2">{Lang.get('petty_cash.labels.period')}</th>
                                            <th width={150} className="align-middle text-xs">{Lang.get('petty_cash.labels.input')}</th>
                                            <th width={150} className="align-middle text-xs">{Lang.get('petty_cash.labels.output')}</th>
                                            <th width={150} className="align-middle text-xs">{Lang.get('petty_cash.labels.total')}</th>
                                            <th width={150} className="align-middle text-xs pr-2">{Lang.get('petty_cash.labels.balance')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.petty_cashes.filtered.length === 0 ?
                                            <DataNotFound colSpan={5} message={Lang.get('labels.not_found',{Attribute:Lang.get('petty_cash.labels.menu')})}/>
                                            :
                                            this.state.petty_cashes.filtered.map((item,index)=>
                                                <PettyCashTableMainRow loadings={this.state.loadings} onApprove={this.confirmApprove} onDelete={this.confirmDelete} privilege={this.state.privilege} onEdit={this.toggleModal} filtered={this.state.petty_cashes.filtered} selected={this.state.petty_cashes.selected} onCheck={this.handleCheck} item={item} key={`x_${index}`} index={index}/>
                                            )
                                        }
                                        </tbody>
                                        <tfoot>
                                        <tr>
                                            <th className="align-middle text-right text-xs" colSpan={4}>{Lang.get('petty_cash.labels.end_balance.label')}</th>
                                            <th className="align-middle text-xs pr-2">
                                                {SumEndBalance(this.state.petty_cashes.unfiltered)}
                                            </th>
                                        </tr>
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
export default PettyCashPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><PettyCashPage route="clients.accounting.petty-cash"/></React.StrictMode>)
