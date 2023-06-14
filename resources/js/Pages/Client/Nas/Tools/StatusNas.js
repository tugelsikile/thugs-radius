import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCircleNotch, faCrosshairs,
    faSign,
    faTimesCircle, faDigitalTachograph
} from "@fortawesome/free-solid-svg-icons";

class StatusNas extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        <div className="inner">
                            <h3>{this.props.nas.filtered.length}</h3>
                            <p>Total NAS</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon spin={this.props.loading} icon={this.props.loading ? faCircleNotch : faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        <div className="inner">
                            <h3>{this.props.nas.unfiltered.filter((f) => f.meta.status.success).length}</h3>
                            <p>Online Nas</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon spin={this.props.loading} icon={this.props.loading ? faCircleNotch : faDigitalTachograph }/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        <div className="inner">
                            <h3>{this.props.nas.unfiltered.filter((f) => ! f.meta.status.success).length}</h3>
                            <p>Offline Nas</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon spin={this.props.loading} icon={this.props.loading ? faCircleNotch : faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-danger">
                        <div className="inner">
                            <h3>150</h3>
                            <p>Max NAS</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon spin={this.props.loading} icon={this.props.loading ? faCircleNotch : faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default StatusNas;
