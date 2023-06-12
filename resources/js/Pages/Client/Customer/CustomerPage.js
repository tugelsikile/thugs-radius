// noinspection DuplicatedCode

import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl} from "../../../Components/Authentication";
import {CardPreloader, formatLocalePeriode, responseMessage, siteData} from "../../../Components/mixedConsts";
import {crudNas, crudProfile} from "../../../Services/NasService";
import {crudCustomers} from "../../../Services/CustomerService";
import {confirmDialog} from "../../../Components/Toaster";
import MainHeader from "../../../Components/Layout/MainHeader";
import MainSidebar from "../../../Components/Layout/MainSidebar";
import PageTitle from "../../../Components/Layout/PageTitle";
import MainFooter from "../../../Components/Layout/MainFooter";
import {PageCardSearch, PageCardTitle} from "../../../Components/PageComponent";
import BtnSort from "../../Auth/User/Tools/BtnSort";
import {DataNotFound, TableAction, TableCheckBox, TablePaging} from "../../../Components/TableComponent";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {allProvinces} from "../../../Services/RegionService";
import FormCustomer from "./Tools/FormCustomer";
import {crudDiscounts, crudTaxes} from "../../../Services/ConfigService";

class CustomerPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, customers : true, profiles : true, provinces : true, taxes : true, discounts : true },
            privilege : null, menus : [], site : null, nas : [], profiles : [], provinces : [], taxes : [], discounts : [],
            customers : { filtered : [], unfiltered : [], selected : [] },
            filter : { keywords : '', sort : { by : 'code', dir : 'asc' }, page : { value : 1, label : 1}, data_length : 20, paging : [], },
            modal : {
                customer : { open : false, data : null },
            },
            popover : { open : false, anchorEl : null, data : null },
        };
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.confirmDelete = this.confirmDelete.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handlePopOver = this.handlePopOver.bind(this);
        this.loadCustomers = this.loadCustomers.bind(this);
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
                                    loadings.provinces = false; this.setState({loadings},()=>this.loadProvinces());
                                })
                                .then(()=>{
                                    loadings.nas = false; this.setState({loadings},()=>this.loadNas());
                                })
                                .then(()=>{
                                    loadings.discounts = false; this.setState({loadings},()=>this.loadDiscounts());
                                })
                                .then(()=>{
                                    loadings.taxes = false; this.setState({loadings}, ()=>this.loadTaxes());
                                })
                                .then(()=>{
                                    loadings.profiles = false; this.setState({loadings}, ()=>this.loadProfiles());
                                })
                                .then(()=>{
                                    loadings.customers = false; this.setState({loadings}, ()=>this.loadCustomers());
                                });
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
        let index = this.state.customers.unfiltered.findIndex((f) => f.value === e.currentTarget.getAttribute('data-value'));
        if (index >= 0) {
            switch (e.currentTarget.getAttribute('data-type')) {
            }
        }
        this.setState({popover});
    }
    confirmDelete(data = null) {
        let ids = [];
        if (data !== null) {
            ids.push(data.value);
        } else {
            this.state.customers.selected.map((item)=>{
                ids.push(item);
            });
        }
        confirmDialog(this,ids,'delete',`${window.origin}/api/clients/customers`,Lang.get('customers.delete.warning'),Lang.get('customers.delete.select'),'app.loadCustomers()');
    }
    toggleModal(data = null) {
        let modal = this.state.modal;
        modal.customer.open =  ! this.state.modal.customer.open;
        modal.customer.data = data; this.setState({modal});
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
        let customers = this.state.customers;
        if (event.currentTarget.getAttribute('data-id').length === 0) {
            customers.selected = [];
            if (event.currentTarget.checked) {
                customers.filtered.map((item)=>{
                    if (! item.meta.default) {
                        customers.selected.push(item.value);
                    }
                });
            }
        } else {
            let indexSelected = customers.selected.findIndex((f) => f === event.currentTarget.getAttribute('data-id'));
            if (indexSelected >= 0) {
                customers.selected.splice(indexSelected,1);
            } else {
                let indexTarget = customers.unfiltered.findIndex((f) => f.value === event.currentTarget.getAttribute('data-id'));
                if (indexTarget >= 0) {
                    customers.selected.push(event.currentTarget.getAttribute('data-id'));
                }
            }
        }
        this.setState({customers});
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
        let customers = this.state.customers;
        let filter = this.state.filter;
        loadings.customers = true;
        this.setState({loadings});
        if (filter.keywords.length > 0) {
            customers.filtered = customers.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.description.toLowerCase().indexOf(filter.keywords.toLowerCase()) !== -1
            );
        } else {
            customers.filtered = customers.unfiltered;
        }
        switch (filter.sort.by) {
            case 'name' :
                if (filter.sort.dir === 'asc') {
                    customers.filtered = customers.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    customers.filtered = customers.filtered.sort((a,b)=> (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
        }

        filter.paging = [];
        for (let page = 1; page <= Math.ceil(customers.filtered.length / this.state.filter.data_length); page++) {
            filter.paging.push(page);
        }
        let indexFirst = ( filter.page.value - 1 ) * filter.data_length;
        let indexLast = filter.page.value * filter.data_length;
        customers.filtered = customers.filtered.slice(indexFirst, indexLast);
        loadings.customers = false;
        this.setState({loadings,customers});
    }
    async loadDiscounts() {
        if (! this.state.loadings.discounts) {
            if (this.state.discounts.length === 0) {
                let loadings = this.state.loadings;
                loadings.discounts = true; this.setState({loadings});
                try {
                    let response = await crudDiscounts();
                    if (response.data.params === null) {
                        loadings.discounts = false; this.setState({loadings});
                    } else {
                        let discounts = [];
                        response.data.params.map((item)=>{
                            item.meta.label = item.label;
                            item.label = item.meta.code;
                            discounts.push(item);
                        });
                        loadings.discounts = false; this.setState({loadings,discounts});
                    }
                } catch (e) {
                    loadings.discounts = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadTaxes() {
        if (! this.state.loadings.taxes) {
            if (this.state.taxes.length === 0) {
                let loadings = this.state.loadings;
                loadings.taxes = true; this.setState({loadings});
                try {
                    let response = await crudTaxes();
                    if (response.data.params === null) {
                        loadings.taxes = false; this.setState({loadings});
                    } else {
                        let taxes = [];
                        response.data.params.map((item)=>{
                            item.meta.label = item.label;
                            item.label = item.meta.code;
                            taxes.push(item);
                        });
                        loadings.taxes = false; this.setState({loadings,taxes});
                    }
                } catch (e) {
                    loadings.taxes = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadProvinces() {
        if (! this.state.loadings.provinces) {
            if (this.state.provinces.length === 0) {
                let loadings = this.state.loadings;
                loadings.provinces = true; this.setState({loadings});
                try {
                    let response = await allProvinces();
                    if (response.data.params === null) {
                        loadings.provinces = false; this.setState({loadings});
                    } else {
                        loadings.provinces = false; this.setState({loadings,provinces:response.data.params});
                    }
                } catch (e) {
                    loadings.provinces = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadNas () {
        if (! this.state.loadings.nas) {
            if (this.state.nas.length === 0) {
                let loadings = this.state.loadings;
                loadings.nas = true; this.setState({loadings});
                try {
                    let response = await crudNas();
                    if (response.data.params === null) {
                        loadings.nas = false; this.setState({loadings});
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
    async loadProfiles() {
        if (! this.state.loadings.profiles ) {
            if (this.state.profiles.length === 0) {
                let loadings = this.state.loadings;
                loadings.profiles = true; this.setState({loadings});
                try {
                    let response = await crudProfile();
                    if (response.data.params === null) {
                        loadings.profiles = false; this.setState({loadings});
                    } else {
                        loadings.profiles = false; this.setState({loadings,profiles:response.data.params});
                    }
                } catch (e) {
                    loadings.profiles = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    async loadCustomers(data = null) {
        if (! this.state.loadings.customers ) {
            let loadings = this.state.loadings;
            let customers = this.state.customers;
            customers.selected = [];
            loadings.customers = true;
            this.setState({loadings,customers});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    customers.unfiltered.splice(data,1);
                } else {
                    let index = customers.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        customers.unfiltered[index] = data;
                    } else {
                        customers.unfiltered.push(data);
                    }
                }
                loadings.customers = false;
                this.setState({loadings,customers},()=>this.handleFilter());
            } else {
                try {
                    let response = await crudCustomers(null,true);
                    if (response.data.params === null) {
                        loadings.customers = false; this.setState({loadings});
                    } else {
                        loadings.customers = false;
                        customers.unfiltered = response.data.params;
                        this.setState({loadings,customers},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.customers = false; this.setState({loadings});
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormCustomer open={this.state.modal.customer.open} data={this.state.modal.customer.data}
                              loadings={this.state.loadings}
                              provinces={this.state.provinces}
                              taxes={this.state.taxes}
                              discounts={this.state.discounts}
                              profiles={this.state.profiles}
                              nas={this.state.nas}
                              handleClose={this.toggleModal} handleUpdate={this.loadCustomers}/>

                <MainHeader root={this.state.root} user={this.state.user} site={this.state.site}/>
                <MainSidebar route={this.props.route} site={this.state.site}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">
                    <PageTitle title={Lang.get('customers.labels.menu')} childrens={[]}/>

                    <section className="content">

                        <div className="container-fluid">
                            <div className="card card-outline card-primary">
                                {this.state.loadings.customers && <CardPreloader/>}
                                <div className="card-header">
                                    <PageCardTitle privilege={this.state.privilege}
                                                   loading={this.state.loadings.customers}
                                                   langs={{create:Lang.get('customers.create.button'),delete:Lang.get('customers.delete.button')}}
                                                   selected={this.state.customers.selected}
                                                   handleModal={this.toggleModal}
                                                   confirmDelete={this.confirmDelete}/>
                                    <PageCardSearch handleSearch={this.handleSearch} filter={this.state.filter} label={Lang.get('customers.labels.search')}/>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-striped table-sm">
                                        <thead>
                                        <tr>
                                            {this.state.customers.filtered.length > 0 &&
                                                <th className="align-middle text-center" width={30}>
                                                    <div className="custom-control custom-checkbox">
                                                        <input id="checkAll" data-id="" disabled={this.state.loadings.customers} onChange={this.handleCheck} className="custom-control-input custom-control-input-secondary custom-control-input-outline" type="checkbox"/>
                                                        <label htmlFor="checkAll" className="custom-control-label"/>
                                                    </div>
                                                </th>
                                            }
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="code"
                                                         name={Lang.get('customers.labels.code')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('customers.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="nas"
                                                         name={Lang.get('nas.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="profile"
                                                         name={Lang.get('profiles.labels.name')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={150}>
                                                <BtnSort sort="price"
                                                         name={Lang.get('profiles.labels.price')}
                                                         filter={this.state.filter} handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle text-center" width={50}>{Lang.get('messages.action')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.customers.filtered.length === 0 ?
                                            <DataNotFound colSpan={8} message={Lang.get('customers.labels.not_found')}/>
                                            :
                                            this.state.customers.filtered.map((item)=>
                                                <tr key={item.value}>
                                                    <TableCheckBox item={item}
                                                                   checked={this.state.customers.selected.findIndex((f) => f === item.value) >= 0}
                                                                   loading={this.state.loadings.customers} handleCheck={this.handleCheck}/>
                                                    <td className="align-middle text-center">{item.meta.code}</td>
                                                    <td className="align-middle">{item.meta.user.name}</td>
                                                    <td className="align-middle">
                                                        {item.meta.nas === null ? null :
                                                            <>
                                                                <FontAwesomeIcon size="xs" data-type="nas" data-value={item.value} onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} icon="info-circle" className="mr-1 text-info"/>
                                                                {item.meta.nas.shortname}
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="align-middle">
                                                        {item.meta.profile === null ? null :
                                                            <>
                                                                <FontAwesomeIcon size="xs" data-type="profile" data-value={item.value} onMouseEnter={this.handlePopOver} onMouseLeave={this.handlePopOver} icon="info-circle" className="mr-1 text-info"/>
                                                                {item.meta.profile.name}
                                                            </>
                                                        }
                                                    </td>
                                                    <td className="align-middle">
                                                        {item.meta.timestamps.due.at === null ?
                                                            <span className="badge badge-success">UNLIMITED</span>
                                                            :
                                                            moment().isAfter(item.meta.timestamps.due.at) ?
                                                                <span className="badge badge-danger">{formatLocalePeriode(item.meta.timestamps.due.at)}</span>
                                                                :
                                                                <span className="badge badge-primary">{formatLocalePeriode(item.meta.timestamps.due.at)}</span>
                                                        }
                                                    </td>
                                                    <TableAction privilege={this.state.privilege} item={item} langs={{update:Lang.get('customers.update.button'),delete:Lang.get('customers.delete.button')}} toggleModal={this.toggleModal} confirmDelete={this.confirmDelete}/>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                <TablePaging customers={this.state.customers} filter={this.state.filter} handleChangePage={this.handleChangePage}/>
                            </div>
                        </div>

                    </section>
                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }
}

export default CustomerPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><CustomerPage route="clients.customers"/></React.StrictMode>)