import React from "react";
import {getServerTime} from "../../Services/ConfigService";
import moment from "moment";
import {formatLocalePeriode} from "../mixedConsts";

class DigitalClock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
            time : null,
        };
    }
    componentDidMount() {
        getServerTime()
            .then(()=>{
                window.setInterval(()=>{
                    this.setState({time:new Date()})
                },1000);
            });
    }
    async getServerTime() {
        try {
            let response = await getServerTime();
            if (response.data.params !== null) {
                this.setState({time:moment(response.data.params).toDate});
            }
        } catch (e) {
            console.log(e.response.data.message);
        }
    }
    render() {
        return (
            <>
                {this.state.time === null ? <img alt="Loading server time" src={`${window.origin}/preloader.svg`} style={{height:30}}/> : formatLocalePeriode(this.state.time,'DD MMMM yyyy, HH:mm:ss')}
            </>
        )
    }
}
export default DigitalClock;
