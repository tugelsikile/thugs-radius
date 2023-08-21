import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../../Components/Authentication";
import {CardPreloader, responseMessage, siteData} from "../../../../Components/mixedConsts";
import {crudAccount, crudCashFlow, crudCategory} from "../../../../Services/AccountingService";
import moment from "moment";
import {confirmDialog, showError} from "../../../../Components/Toaster";
import PageLoader from "../../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../../Components/PageComponent";
import {FilterPage, PageFilterStatus, TableBody, TableHeader} from "./Mixed";
import FormCashFlow from "./FormCashFlow";
import {FormatPrice} from "../../Customer/Tools/Mixed";

// noinspection DuplicatedCode
class CashFlowPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, cash_flows : true, accounts : true, categories : true },
            privilege : null, menus : [], site : null, accounts : [], categories : [],
            cash_flows : { unfiltered : [], filtered : [], selected : [] },
            filter : { periods : { start : new Date(), end : new Date() }, account : null, category : null, keywords : '', sort : { by : 'name', dir : 'asc' } },
            modal : { open : false, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.loadCashFlow = this.loadCashFlow.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.loadAccount = this.loadAccount.bind(this);
        this.loadCategory = this.loadCategory.bind(this);
        this.handlePeriod = this.handlePeriod.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
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
                        ])
                            .then((response)=>{
                                loadings.privilege = false;
                                if (response !== null) {
                                    this.setState({privilege:response.privileges,menus:response.menus})
                                }
                                this.setState({loadings});
                            })
                            .then(()=>{
                                loadings.cash_flows = false; this.setState({loadings},()=>this.loadCashFlow());
                            })
                            .then(()=>{
                                loadings.accounts = false; this.setState({loadings},()=>this.loadAccount());
                            })
                            .then(()=>{
                                loadings.categories = false; this.setState({loadings},()=>this.loadCategory());
                            })
                    })
            }
        }
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data === null) {
            this.state.cash_flows.selected.map((item)=>{
                ids.push(item);
            });
        } else {
            ids.push(data.value);
        }
        confirmDialog(this, ids, 'delete', `${window.origin}/api/clients/accounting/cash-flows`, Lang.get('labels.delete.confirm.title'), Lang.get('labels.delete.confirm.message', {Attribute : Lang.get('cash_flow.labels.menu')}), 'app.loadCashFlow()', 'error', Lang.get('cash_flow.form_input.id'), null, Lang.get('labels.delete.confirm.confirm'), Lang.get('labels.delete.confirm.cancel'));
    }
    handleSelect(value, name) {
        let filter = this.state.filter;
        filter[name] = value;
        this.setState({filter},()=>this.handleFilter());
    }
    handlePeriod(value, name) {
        let filter = this.state.filter;
        filter.periods[name] = value;
        this.setState({filter},()=>this.loadCashFlow());
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.open = ! this.state.modal.open;
        modal.data = data;
        this.setState({modal});
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
        let cash_flows = this.state.cash_flows;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            cash_flows.selected = [];
            if (event.currentTarget.checked) {
                cash_flows.filtered.map((item)=>{
                    if (! item.meta.default) {
                        cash_flows.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = cash_flows.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                cash_flows.selected.splice(indexSelected,1);
            } else {
                let indexTarget = cash_flows.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    cash_flows.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({cash_flows});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    handleFilter() {
        let cash_flows = this.state.cash_flows;
        let filter = this.state.filter;
        if (filter.keywords.length > 0) {
            cash_flows.filtered = cash_flows.unfiltered.filter((f)=> f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1);
        } else {
            cash_flows.filtered = cash_flows.unfiltered;
        }
        if (filter.account !== null) cash_flows.filtered = cash_flows.filtered.filter((f)=> f.meta.account.value === filter.account.value);
        if (filter.category !== null) cash_flows.filtered = cash_flows.filtered.filter((f)=> f.meta.category.value === filter.category.value);
        switch (filter.sort.by) {
            case 'description':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
            case 'code':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.meta.code > b.meta.code) ? 1 : ((b.meta.code > a.meta.code) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.meta.code > b.meta.code) ? -1 : ((b.meta.code > a.meta.code) ? 1 : 0));
                }
                break;
            case 'debit':
            case 'credit':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.meta.amount[filter.sort.by] > b.meta.amount[filter.sort.by]) ? 1 : ((b.meta.amount[filter.sort.by] > a.meta.amount[filter.sort.by]) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.meta.amount[filter.sort.by] > b.meta.amount[filter.sort.by]) ? -1 : ((b.meta.amount[filter.sort.by] > a.meta.amount[filter.sort.by]) ? 1 : 0));
                }
                break;
            case 'account':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.meta.account.label > b.meta.account.label) ? 1 : ((b.meta.account.label > a.meta.account.label) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.meta.account.label > b.meta.account.label) ? -1 : ((b.meta.account.label > a.meta.account.label) ? 1 : 0));
                }
                break;
            case 'category':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.meta.category.label > b.meta.category.label) ? 1 : ((b.meta.category.label > a.meta.category.label) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.meta.category.label > b.meta.category.label) ? -1 : ((b.meta.category.label > a.meta.category.label) ? 1 : 0));
                }
                break;
            case 'period':
                if (filter.sort.dir === 'asc') {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b) => (a.meta.period > b.meta.period) ? 1 : ((b.meta.period > a.meta.period) ? -1 : 0));
                } else {
                    cash_flows.filtered = cash_flows.filtered.sort((a,b)=> (a.meta.period > b.meta.period) ? -1 : ((b.meta.period > a.meta.period) ? 1 : 0));
                }
                break;
        }

        this.setState({cash_flows});
    }
    async loadAccount(data = null) {
        if (! this.state.loadings.accounts) {
            let accounts = this.state.accounts;
            let loadings = this.state.loadings;
            if (data !== null) {
                if (Number.isInteger(data)) {
                    accounts.splice(data,1);
                } else {
                    let index = accounts.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        accounts[index] = data;
                    } else {
                        accounts.push(data);
                    }
                }
                this.setState({accounts});
            } else {
                loadings.accounts = true; this.setState({loadings});
                try {
                    let response = await crudAccount();
                    if (response.data.params === null) {
                        loadings.accounts = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        accounts = response.data.params;
                        loadings.accounts = false;
                        this.setState({loadings,accounts});
                    }
                } catch (e) {
                    loadings.accounts = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCategory(data = null) {
        if (! this.state.loadings.categories) {
            let categories = this.state.categories;
            let loadings = this.state.loadings;
            if (data !== null) {
                if (Number.isInteger(data)) {
                    categories.splice(data,1);
                } else {
                    let index = categories.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        categories[index] = data;
                    } else {
                        categories.push(data);
                    }
                }
                this.setState({categories});
            } else {
                loadings.categories = true; this.setState({loadings});
                try {
                    let response = await crudCategory();
                    if (response.data.params === null) {
                        loadings.categories = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        categories = response.data.params;
                        loadings.categories = false;
                        this.setState({loadings,categories});
                    }
                } catch (e) {
                    loadings.categories = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCashFlow(data = null) {
        if (! this.state.loadings.cash_flows ) {
            let loadings = this.state.loadings;
            let cash_flows = this.state.cash_flows;
            cash_flows.selected = [];
            if (data !== null) {
                if (Number.isInteger(data)) {
                    cash_flows.unfiltered.splice(data,1);
                } else if (typeof data === "object") {
                    let index = cash_flows.unfiltered.findIndex((f)=> f.value === data.value);
                    if (index >= 0) {
                        cash_flows.unfiltered[index] = data;
                    } else {
                        cash_flows.unfiltered.push(data);
                    }
                }
                this.setState({cash_flows},()=>this.handleFilter());
            } else {
                loadings.cash_flows = true;
                this.setState({loadings});
                try {
                    const formData = new FormData();
                    if (this.state.filter.periods.start !== null) formData.append(Lang.get('cash_flow.form_input.periods.start'), moment(this.state.filter.periods.start).format('yyyy-MM-DD'));
                    if (this.state.filter.periods.end !== null) formData.append(Lang.get('cash_flow.form_input.periods.end'), moment(this.state.filter.periods.end).format('yyyy-MM-DD'));
                    if (this.state.filter.account !== null) formData.append(Lang.get('cash_flow.form_input.account.name'), this.state.filter.account.value);
                    let response = await crudCashFlow(formData);
                    if (response.data.params === null) {
                        loadings.cash_flows = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.cash_flows = false;
                        cash_flows.unfiltered = response.data.params;
                        this.setState({loadings}, ()=> this.handleFilter());
                    }
                } catch (e) {
                    loadings.cash_flows = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormCashFlow onUpdateAccount={this.loadAccount} onUpdateCategory={this.loadCategory} open={this.state.modal.open} data={this.state.modal.data} {...this.state} handleClose={this.toggleModal} handleUpdate={this.loadCashFlow}/>
                <PageLoader/>
                <HeaderAndSideBar root={this.state.root} user={this.state.user} site={this.state.site} route={this.props.route} menus={this.state.menus} loadings={this.state.loadings}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('cash_flow.labels.menu')} childrens={[
                        { url : getRootUrl() + '/accounting', label : Lang.get('accounting.labels.menu') }
                    ]}/>

                    <section className="content">
                        <div className="container-fluid">

                            <PageFilterStatus onSelect={this.handleSelect} {...this.state}/>

                            <div id="main-page-card" className="card card-outline card-primary">
                                {this.state.loadings.cash_flows && <CardPreloader/>}
                                <div className="card-header pl-2" id="page-card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   filter={<FilterPage onSelect={this.handleSelect} onSubmit={this.loadCashFlow} onPeriod={this.handlePeriod} onReload={this.loadCashFlow} {...this.state} onModal={this.toggleModal} onDelete={this.confirmDelete}/>}
                                                   loading={this.state.loadings.cash_flows}
                                                   langs={null}
                                                   selected={this.state.cash_flows.selected}
                                                   handleModal={null}
                                                   confirmDelete={null}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('labels.search',{Attribute:Lang.get('cash_flow.labels.menu')})}/>
                                </div>
                                <div className="card-body p-0 table-responsive">
                                    <table className="table table-sm table-hover table-striped">
                                        <thead>
                                            <TableHeader type="header" {...this.state} onSort={this.handleSort} onCheck={this.handleCheck}/>
                                        </thead>
                                        <tbody>
                                            <TableBody onEdit={this.toggleModal} onDelete={this.confirmDelete} {...this.state} onCheck={this.handleCheck}/>
                                        </tbody>
                                        <tfoot>
                                            <TableHeader type="header" {...this.state} onSort={this.handleSort} onCheck={this.handleCheck}/>
                                            <tr>
                                                <th className="align-middle text-xs text-right" colSpan={6}>{Lang.get('labels.total',{Attribute:''})}</th>
                                                <th className="align-middle text-xs">{FormatPrice(this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.debit,0))}</th>
                                                <th className="align-middle text-xs pr-2">{FormatPrice(this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.credit,0))}</th>
                                                <th/>
                                            </tr>
                                            <tr>
                                                <th className="align-middle text-lg text-right" colSpan={6}>Grand Total</th>
                                                <th className={this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.debit,0) - this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.credit,0) < 0 ? "align-middle text-lg pr-2 text-danger" : "align-middle text-lg pr-2 text-success"} colSpan={2}>{FormatPrice(this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.debit,0) - this.state.cash_flows.unfiltered.reduce((a,b)=> a + b.meta.amount.credit,0))}</th>
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

export default CashFlowPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><CashFlowPage route="clients.accounting.cash-flow"/></React.StrictMode>);
