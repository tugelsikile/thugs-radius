import React from "react";
import {getServerTime} from "../../Services/ConfigService";
import moment from "moment";
import {customPreventDefault, formatLocalePeriode} from "../mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons/faCircleNotch";

class DigitalClock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            time : null,
        };
        this.getServerTime = this.getServerTime.bind(this);
    }
    componentDidMount() {
        getServerTime()
            .then(()=>{
                window.setInterval(()=>{
                    this.setState({time:new Date(),loading:false})
                },1000);
            });
    }
    async getServerTime(e = null) {
        if (e != null) {
            e.preventDefault();
        }
        this.setState({loading:true});
        try {
            let response = await getServerTime();
            if (response.data.params !== null) {
                this.setState({time:moment(response.data.params).toDate,loading:false});
            } else {
                this.setState({loading:false});
            }
        } catch (e) {
            console.log(e.response.data.message);
            this.setState({loading:false});
        }
    }
    render() {
        return (
            <a title="Server Time (LIVE)" href="#" onClick={this.getServerTime} className="nav-link pl-0">
                {this.state.loading ? <FontAwesomeIcon spin={true} icon={faCircleNotch}/> :
                    this.state.time === null ? null :
                        formatLocalePeriode(this.state.time,'DD MMMM yyyy, HH:mm:ss')}
            </a>
        )
    }
}
export default DigitalClock;
