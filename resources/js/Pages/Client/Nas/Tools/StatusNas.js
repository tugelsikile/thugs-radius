import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCircleNotch, faCrosshairs,
    faSign,
    faTimesCircle, faDigitalTachograph
} from "@fortawesome/free-solid-svg-icons";
import {CardPreloader} from "../../../../Components/mixedConsts";

class StatusNas extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="row">
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-info">
                        {this.props.loading && <CardPreloader/>}
                        <div className="inner">
                            <h3>{this.props.nas.filtered.length}</h3>
                            <p>{Lang.get('labels.total',{Attribute:Lang.get('nas.labels.menu')})}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-success">
                        {this.props.loading && <CardPreloader/>}
                        <div className="inner">
                            <h3>{this.props.nas.unfiltered.filter((f) => f.meta.status.success).length}</h3>
                            <p>{Lang.get('labels.online',{Attribute:Lang.get('nas.labels.menu')})}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-warning">
                        {this.props.loading && <CardPreloader/>}
                        <div className="inner">
                            <h3>{this.props.nas.unfiltered.filter((f) => ! f.meta.status.success).length}</h3>
                            <p>{Lang.get('labels.offline',{Attribute:Lang.get('nas.labels.menu')})}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
                <div className="col-lg-3 col-6">
                    <div className="small-box bg-danger">
                        {this.props.loading && <CardPreloader/>}
                        <div className="inner">
                            <h3>
                                {this.props.user === null ? null :
                                    this.props.user.meta.company === null ? null :
                                        this.props.user.meta.company.package_obj === null ? null :
                                            this.props.user.meta.company.package_obj.max_routerboards === 0 ?
                                                'UNLIMITED'
                                                :
                                                this.props.user.meta.company.package_obj.max_routerboards
                                }
                            </h3>
                            <p>{Lang.get('labels.max',{Attribute:Lang.get('nas.labels.menu')})}</p>
                        </div>
                        <div className="icon">
                            <FontAwesomeIcon icon={faDigitalTachograph}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default StatusNas;
