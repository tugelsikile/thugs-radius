import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faTimes} from "@fortawesome/free-solid-svg-icons";
import {CardPreloader, FormControlSMReactSelect, responseMessage} from "../../../Components/mixedConsts";
import {cancelOltService, crudGponStates, getGponCustomer} from "../../../Services/OltService";
import {showError} from "../../../Components/Toaster";
import {CustomerTableHeader, LeftSideBar, TableContentGponState, TablePaging} from "./Mixed";
import {DataNotFound} from "../../../Components/TableComponent";
import Select from "react-select";
import FormLinkCustomer from "./FormLinkCustomer";

class DetailOLT extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            olt : null,
            gpon_states : {
                loading : false, status : null, filtered : [], unfiltered : [],
                keywords : '',
                sort : { by : 'name', dir : 'asc' },
                page : { value : 1, label : 1},
                data_length : 20, paging : [],
            },
            modals : {
                customer : { open : false, data : null }
            }
        };
        this.loadGponState = this.loadGponState.bind(this);
        this.handleClickState = this.handleClickState.bind(this);
        this.loadGponCustomer = this.loadGponCustomer.bind(this);
        this.handleGponCustomer = this.handleGponCustomer.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleDataPerPage = this.handleDataPerPage.bind(this);
        this.handleChangePage = this.handleChangePage.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.toggleCustomer = this.toggleCustomer.bind(this);
        this.modalCustomer = this.modalCustomer.bind(this);
        this.handleUpdateCustomer = this.handleUpdateCustomer.bind(this);
    }
    componentDidMount() {
        if (this.props.olt !== null) {
            this.setState({olt:this.props.olt},()=>this.loadGponState());
        }
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.olt !== null) {
            this.setState({olt:nextProps.olt},()=>this.loadGponState());
        }
    }
    modalCustomer(data = null) {
        let modals = this.state.modals;
        modals.customer.open = ! this.state.modals.customer.open;
        modals.customer.data = data;
        this.setState({modals});
    }
    toggleCustomer(event) {
        let value = event.currentTarget.getAttribute('data-onu');
        let index = this.state.gpon_states.unfiltered.findIndex((f)=> f.onu === value);
        if (index >= 0) {
            this.modalCustomer(this.state.gpon_states.unfiltered[index]);
        }
    }
    handleSearch(event) {
        let gpon_states = this.state.gpon_states;
        gpon_states.keywords = event.target.value;
        this.setState({gpon_states},()=>this.handleFilter());
    }
    handleChangePage(page) {
        let gpon_states = this.state.gpon_states;
        gpon_states.page = {value:page,label:page}; this.setState({gpon_states},()=>this.handleFilter());
    }
    handleDataPerPage(event) {
        let gpon_states = this.state.gpon_states;
        if (event !== null) {
            gpon_states.data_length = event.value;
        }
        this.setState({gpon_states},()=>this.handleFilter());
    }
    handleClickState(event) {
        event.preventDefault();
        let gpon_states = this.state.gpon_states;
        gpon_states.page = {value:1,label:1};
        const newValue = event.currentTarget.getAttribute('data-target');
        if (newValue === gpon_states.status) {
            gpon_states.status = null;
        } else {
            gpon_states.status = newValue;
        }
        this.setState({gpon_states},()=>this.handleFilter());
    }
    handleFilter() {
        let gpon_states = this.state.gpon_states;
        gpon_states.filtered = gpon_states.unfiltered;
        if (gpon_states.keywords.length > 0) {
            gpon_states.filtered = gpon_states.unfiltered.filter((f)=>
                f.onu.toLowerCase().indexOf(gpon_states.keywords.toLowerCase()) !== -1
            );
        }
        if (gpon_states.status !== null) {
            gpon_states.filtered = gpon_states.filtered.filter((f)=> f.phase_state === gpon_states.status);
        }
        gpon_states.paging = [];
        for (let page = 1; page <= Math.ceil(gpon_states.filtered.length / gpon_states.data_length); page++) {
            gpon_states.paging.push(page);
        }
        let indexFirst = ( gpon_states.page.value - 1 ) * gpon_states.data_length;
        let indexLast = gpon_states.page.value * gpon_states.data_length;
        gpon_states.filtered = gpon_states.filtered.slice(indexFirst, indexLast);
        this.setState({gpon_states},()=>this.handleGponCustomer());
    }
    handleGponCustomer() {
        cancelOltService();
        if (this.state.olt !== null) {
            if (this.state.gpon_states.filtered.length > 0) {
                let gpon_states = this.state.gpon_states;
                this.state.gpon_states.filtered.map((item)=>{
                    let indexUnfiltered = this.state.gpon_states.unfiltered.findIndex((f)=> f.onu === item.onu);
                    if (indexUnfiltered >= 0) {
                        if (this.state.gpon_states.unfiltered[indexUnfiltered].details === null) {
                            gpon_states.unfiltered[indexUnfiltered].loading = true;
                            this.setState({gpon_states},()=>{
                                this.loadGponCustomer(item)
                                    .then((response)=>{
                                        if (typeof this.state.gpon_states.unfiltered[indexUnfiltered] !== 'undefined') {
                                            if (typeof this.state.gpon_states.unfiltered[indexUnfiltered].details !== 'undefined') {
                                                gpon_states.unfiltered[indexUnfiltered].loading = false;
                                                gpon_states.unfiltered[indexUnfiltered].details = response;
                                                /*if (gpon_states.unfiltered[indexUnfiltered].details !== null) {
                                                    if (typeof response.new_phase_state !== 'undefined') {
                                                        gpon_states.unfiltered[indexUnfiltered].phase_state = response.new_phase_state;
                                                    }
                                                }*/
                                                let indexFiltered = this.state.gpon_states.filtered.findIndex((f)=> f.onu === this.state.gpon_states.unfiltered[indexUnfiltered].onu);
                                                if (indexFiltered >= 0) {
                                                    gpon_states.filtered[indexFiltered] = this.state.gpon_states.unfiltered[indexUnfiltered];
                                                }
                                                this.setState({gpon_states});
                                            }
                                        }
                                    });
                            });
                        }
                    }
                });
            }
        }
    }
    async handleUpdateCustomer(data, onu) {
        if (typeof data === 'object') {
            let index = this.state.gpon_states.unfiltered.findIndex((f)=> f.onu === onu);
            if (index >= 0) {
                let gpon_states = this.state.gpon_states;
                gpon_states.unfiltered[index].details = data;
                let index2 = this.state.gpon_states.filtered.findIndex((f)=> f.onu === onu);
                if (index2 >= 0) {
                    gpon_states.filtered[index2].details = data;
                }
                this.setState({gpon_states});
            }
        }
    }
    async loadGponCustomer(item) {
        if (this.state.gpon_states.filtered.length > 0) {
            try {
                const formData = new FormData();
                if (this.state.olt !== null) formData.append(Lang.get('olt.form_input.id'), this.state.olt.value);
                formData.append(Lang.get('olt.form_input.onu'), item.onu);
                formData.append(Lang.get('olt.form_input.phase_state'), item.phase_state);
                let response = await getGponCustomer(formData);
                if (response.data.params === null) {
                    return null;
                } else {
                    return response.data.params;
                }
            } catch (e) {
                return null;
            }
        }
    }
    async loadGponState() {
        if (! this.state.gpon_states.loading ) {
            if (this.state.olt !== null) {
                cancelOltService();
                let gpon_states = this.state.gpon_states;
                gpon_states.filtered = [];
                gpon_states.unfiltered = [];
                gpon_states.status = null;
                gpon_states.loading = true; this.setState({gpon_states},()=>this.handleFilter());
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('olt.form_input.id'), this.state.olt.value);
                    let response = await crudGponStates(formData);
                    if (response.data.params === null) {
                        gpon_states.loading = false; this.setState({gpon_states},()=>this.handleFilter());
                        showError(response.data.message);
                    } else {
                        gpon_states.loading = false;
                        gpon_states.unfiltered = response.data.params;
                        this.setState({gpon_states},()=>this.handleFilter());
                    }
                } catch (e) {
                    gpon_states.loading = false; this.setState({gpon_states},()=>this.handleFilter());
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <FormLinkCustomer privilege={this.props.privilege}
                                  olt={this.state.olt}
                                  open={this.state.modals.customer.open}
                                  data={this.state.modals.customer.data}
                                  handleClose={this.modalCustomer}
                                  handleUpdate={this.handleUpdateCustomer}
                                  companies={this.props.companies}
                                  nas={this.props.nas} onNas={this.props.onNas}
                                  pools={this.props.pools} onPool={this.props.onPool}
                                  profiles={this.props.profiles} onProfile={this.props.onProfile}
                                  bandwidths={this.props.bandwidths} onBandwidth={this.props.onBandwidth}
                                  customers={this.props.customers} onCustomer={this.props.onCustomer}
                                  taxes={this.props.taxes} onTax={this.props.onTax}
                                  discounts={this.props.discounts} onDiscount={this.props.onDiscount}
                                  loadings={this.props.loadings}/>
                {this.state.olt !== null &&
                    <div className="row">
                        <div className="col-md-3">
                            <LeftSideBar onClickState={this.handleClickState} handleReload={this.loadGponState} gpon_states={this.state.gpon_states}/>
                        </div>
                        <div className="col-md-9">
                            <div className="card card-outline card-secondary">
                                {this.state.gpon_states.loading && <CardPreloader/>}
                                <div className="card-header pl-2">
                                    <div className="card-title text-sm">
                                        <button disabled={this.state.gpon_states.loading || this.props.loadings.olt || this.state.gpon_states.filtered.filter((f)=> f.loading).length > 0 } onClick={()=>this.props.onToggle()} type="button" className="btn btn-xs btn-outline-secondary mr-1 float-left">
                                            <FontAwesomeIcon icon={faTimes}/>
                                        </button>
                                        <Select value={this.props.olt} options={this.props.olts.filtered} onChange={this.props.onToggle}
                                                styles={FormControlSMReactSelect} className="float-left text-xs"
                                                isLoading={this.props.loadings.olt}
                                                isDisabled={this.props.loadings.olt || this.state.gpon_states.loading || this.state.gpon_states.filtered.filter((f)=> f.loading).length > 0}/>
                                    </div>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input disabled={this.state.gpon_states.loading || this.props.loadings.olt || this.state.gpon_states.filtered.filter((f)=> f.loading).length > 0} onChange={this.handleSearch} value={this.state.gpon_states.keywords} type="text" name="table_search" className="form-control text-xs float-right" placeholder="Search ..."/>
                                            <div style={{zIndex:0}} className="input-group-append"><button type="submit" className="btn btn-default"><FontAwesomeIcon icon={faSearch}/></button></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0 table-responsive-sm table-responsive">
                                    <table className="table table-sm table-hover table-striped">
                                        <thead>
                                            <CustomerTableHeader/>
                                        </thead>
                                        <tbody>
                                        {this.state.gpon_states.status === null ?
                                            this.state.gpon_states.filtered.length === 0 ?
                                                <DataNotFound colSpan={7} message="Not Found"/>
                                                :
                                                this.state.gpon_states.filtered.map((item,index)=>
                                                    <TableContentGponState gpon_states={this.state.gpon_states} item={item} index={index} key={index} privilege={this.props.privilege} onCustomer={this.toggleCustomer}/>
                                                )
                                            :
                                            this.state.gpon_states.filtered.filter((f)=> f.phase_state === this.state.gpon_states.status).length === 0 ?
                                                <DataNotFound colSpan={7} message="Not Found"/>
                                                :
                                                this.state.gpon_states.filtered.filter((f)=> f.phase_state === this.state.gpon_states.status).map((item,index)=>
                                                    <TableContentGponState gpon_states={this.state.gpon_states} item={item} index={index} key={index} privilege={this.props.privilege} onCustomer={this.toggleCustomer}/>
                                                )
                                        }
                                        </tbody>
                                        <tfoot>
                                            <CustomerTableHeader/>
                                        </tfoot>
                                    </table>
                                </div>
                                <TablePaging showDataPerPage={true}
                                             handelSelectDataPerPage={this.handleDataPerPage}
                                             data={this.state.gpon_states} handleChangePage={this.handleChangePage}/>
                            </div>
                        </div>
                    </div>
                }
            </React.StrictMode>
        )
    }
}
export default DetailOLT;
