import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRefresh, faTimes, faUserCheck, faUserSlash, faUserTimes} from "@fortawesome/free-solid-svg-icons";
import {CardPreloader, responseMessage} from "../../../Components/mixedConsts";
import {crudGponStates} from "../../../Services/OltService";
import {showError} from "../../../Components/Toaster";
import {faUserCircle} from "@fortawesome/free-regular-svg-icons";
import {TableContentGponState} from "./Mixed";
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
        if (event.currentTarget.getAttribute('data-target') !== null) {
            let gpon_states = this.state.gpon_states;
            const newValue = event.currentTarget.getAttribute('data-target');
            if (newValue === gpon_states.status) {
                gpon_states.status = null;
            } else {
                gpon_states.status = newValue;
            }
            this.setState({gpon_states});
        }
    }
    async loadGponState() {
        if (! this.state.gpon_states.loading ) {
            if (this.state.olt !== null) {
                let gpon_states = this.state.gpon_states;
                gpon_states.current = [];
                gpon_states.status = null;
                gpon_states.loading = true; this.setState({gpon_states});
                try {
                    const formData = new FormData();
                    formData.append(Lang.get('olt.form_input.id'), this.state.olt.value);
                    let response = await crudGponStates(formData);
                    if (response.data.params === null) {
                        gpon_states.loading = false; this.setState({gpon_states});
                        showError(response.data.message);
                    } else {
                        gpon_states.loading = false;
                        gpon_states.current = response.data.params;
                        this.setState({gpon_states});
                    }
                } catch (e) {
                    gpon_states.loading = false; this.setState({gpon_states});
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
                            <div className="card card-info card-outline">
                                {this.state.gpon_states.loading && <CardPreloader/>}
                                <div className="card-header">
                                    <h4 className="card-title">GPON STATE</h4>
                                    <div className="card-tools">
                                        <button className="btn btn-tool" onClick={this.loadGponState}><FontAwesomeIcon icon={faRefresh}/></button>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <ul className="nav nav-pills flex-column">
                                        <li className="nav-item">
                                            <a onClick={this.handleClickState} data-target="lost" href="#" className="nav-link px-2">
                                                <FontAwesomeIcon style={{width:30}} icon={faUserCircle} className="text-danger mr-2"/>
                                                LOST GPON
                                                {this.state.gpon_states.current.length > 0 &&
                                                    this.state.gpon_states.current.filter((f)=> f.status === 'lost').length > 0 &&
                                                        <span className="badge bg-primary float-right">{this.state.gpon_states.current.filter((f)=> f.status === 'lost').length}</span>
                                                }
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a onClick={this.handleClickState} data-target="dying gasp" href="#" className="nav-link px-2">
                                                <FontAwesomeIcon style={{width:30}} icon={faUserCircle} className="text-warning mr-2"/>
                                                DYING GASP
                                                {this.state.gpon_states.current.length > 0 &&
                                                    this.state.gpon_states.current.filter((f)=> f.status === 'dying gasp').length > 0 &&
                                                    <span className="badge bg-primary float-right">{this.state.gpon_states.current.filter((f)=> f.status === 'dying gasp').length}</span>
                                                }
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a onClick={this.handleClickState} data-target="offline" href="#" className="nav-link px-2">
                                                <FontAwesomeIcon style={{width:30}} icon={faUserCircle} className="text-muted mr-2"/>
                                                OFFLINE
                                                {this.state.gpon_states.current.length > 0 &&
                                                    this.state.gpon_states.current.filter((f)=> f.status === 'offline').length > 0 &&
                                                    <span className="badge bg-primary float-right">{this.state.gpon_states.current.filter((f)=> f.status === 'offline').length}</span>
                                                }
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a onClick={this.handleClickState} data-target="online" href="#" className="nav-link px-2">
                                                <FontAwesomeIcon style={{width:30}} icon={faUserCircle} className="text-success mr-2"/>
                                                ONLINE
                                                {this.state.gpon_states.current.length > 0 &&
                                                    this.state.gpon_states.current.filter((f)=> f.status === 'online').length > 0 &&
                                                    <span className="badge bg-primary float-right">{this.state.gpon_states.current.filter((f)=> f.status === 'online').length}</span>
                                                }
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
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
                                        <tr>
                                            <th className="align-middle text-center text-xs pl-2" width={30}>#</th>
                                            <th className="align-middle text-xs">Name</th>
                                            <th className="align-middle text-xs">Mac Address</th>
                                            <th className="align-middle text-xs">Status</th>
                                            <th className="align-middle text-xs pr-2">Aksi</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.gpon_states.status === null ?
                                            this.state.gpon_states.current.length === 0 ?
                                                <DataNotFound colSpan={5} message="Not Found"/>
                                                :
                                                this.state.gpon_states.current.map((item,index)=>
                                                    <TableContentGponState item={item} index={index} key={index}/>
                                                )
                                            :
                                            this.state.gpon_states.current.filter((f)=> f.status === this.state.gpon_states.status).length === 0 ?
                                                <DataNotFound colSpan={5} message="Not Found"/>
                                                :
                                                this.state.gpon_states.current.filter((f)=> f.status === this.state.gpon_states.status).map((item,index)=>
                                                    <TableContentGponState item={item} index={index} key={index}/>
                                                )
                                        }
                                        </tbody>
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
