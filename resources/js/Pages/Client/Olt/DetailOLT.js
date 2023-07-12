import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh, faTimes, faUserCheck, faUserSlash, faUserTimes} from "@fortawesome/free-solid-svg-icons";
import {CardPreloader, responseMessage} from "../../../Components/mixedConsts";
import {cancelOltService, crudGponStates, getGponCustomer} from "../../../Services/OltService";
import {showError} from "../../../Components/Toaster";
import {faUserCircle} from "@fortawesome/free-regular-svg-icons";
import {CustomerTableHeader, LeftSideBar, TableContentGponState} from "./Mixed";
import {DataNotFound} from "../../../Components/TableComponent";

class DetailOLT extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            olt : null,
            gpon_states : { loading : false, status : null, current : [] },
        };
        this.loadGponState = this.loadGponState.bind(this);
        this.handleClickState = this.handleClickState.bind(this);
        this.loadGponCustomer = this.loadGponCustomer.bind(this);
        this.handleGponCustomer = this.handleGponCustomer.bind(this);
    }
    componentDidMount() {
        if (this.props.olt !== null) {
            this.setState({olt:this.props.olt},()=>this.loadGponState());
        }
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.olt !== null) {
            this.setState({olt:nextProps.olt});
        }
    }
    handleClickState(event) {
        event.preventDefault();
        let gpon_states = this.state.gpon_states;
        const newValue = event.currentTarget.getAttribute('data-target');
        if (newValue === gpon_states.status) {
            gpon_states.status = null;
        } else {
            gpon_states.status = newValue;
        }
        this.setState({gpon_states});
    }
    handleGponCustomer() {
        if (this.state.gpon_states.current.length > 0) {
            if (this.state.olt !== null) {
                let gpon_states = this.state.gpon_states;
                gpon_states.current.map((item,index)=>{
                    gpon_states.current[index].loading = true;
                    this.setState({gpon_states},()=>{
                        this.loadGponCustomer(item)
                            .then((response)=>{
                                if (typeof gpon_states.current[index] !== 'undefined') {
                                    if (typeof gpon_states.current[index].details !== 'undefined') {
                                        gpon_states.current[index].details = response;
                                        this.setState({gpon_states});
                                    }
                                }
                            })
                            .then(()=>{
                                if (typeof gpon_states.current[index] !== 'undefined') {
                                    if (typeof gpon_states.current[index].details !== 'undefined') {
                                        gpon_states.current[index].loading = false;
                                        this.setState({gpon_states});
                                    }
                                }
                            })
                    });
                });
            }
        }
    }
    async loadGponCustomer(item) {
        if (this.state.gpon_states.current.length > 0) {
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
                gpon_states.current = [];
                gpon_states.status = null;
                gpon_states.loading = true; this.setState({gpon_states},()=>this.handleGponCustomer());
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('olt.form_input.id'), this.state.olt.value);
                    let response = await crudGponStates(formData);
                    if (response.data.params === null) {
                        gpon_states.loading = false; this.setState({gpon_states},()=>this.handleGponCustomer());
                        showError(response.data.message);
                    } else {
                        gpon_states.loading = false;
                        gpon_states.current = response.data.params;
                        this.setState({gpon_states},()=>this.handleGponCustomer());
                    }
                } catch (e) {
                    gpon_states.loading = false; this.setState({gpon_states},()=>this.handleGponCustomer());
                    responseMessage(e);
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                {this.state.olt !== null &&
                    <div className="row">
                        <div className="col-md-3">
                            <LeftSideBar onClickState={this.handleClickState} handleReload={this.loadGponState} gpon_states={this.state.gpon_states}/>
                        </div>
                        <div className="col-md-9">
                            <div className="card card-outline card-secondary">
                                <div className="card-header pl-2">
                                    <h4 className="card-title text-sm">
                                        {this.state.olt.label}
                                    </h4>
                                    <div className="card-tools">
                                        <button onClick={()=>this.props.onToggle()} type="button" className="btn btn-tool">
                                            <FontAwesomeIcon icon={faTimes}/>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-sm table-hover table-striped">
                                        <thead>
                                            <CustomerTableHeader/>
                                        </thead>
                                        <tbody>
                                        {this.state.gpon_states.status === null ?
                                            this.state.gpon_states.current.length === 0 ?
                                                <DataNotFound colSpan={6} message="Not Found"/>
                                                :
                                                this.state.gpon_states.current.map((item,index)=>
                                                    <TableContentGponState item={item} index={index} key={index}/>
                                                )
                                            :
                                            this.state.gpon_states.current.filter((f)=> f.phase_state === this.state.gpon_states.status).length === 0 ?
                                                <DataNotFound colSpan={6} message="Not Found"/>
                                                :
                                                this.state.gpon_states.current.filter((f)=> f.phase_state === this.state.gpon_states.status).map((item,index)=>
                                                    <TableContentGponState item={item} index={index} key={index}/>
                                                )
                                        }
                                        </tbody>
                                        <tfoot>
                                            <CustomerTableHeader/>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </React.StrictMode>
        )
    }
}
export default DetailOLT;
