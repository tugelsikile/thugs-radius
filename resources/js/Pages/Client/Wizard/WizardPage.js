import React from "react";
import ReactDOM from "react-dom/client";
import {EmptyHeaderAndSideBar} from "../../../Components/Layout/Layout";
import MainFooter from "../../../Components/Layout/MainFooter";
import {WizardStep0, WizardStep1, WizardStep2, WizardStep3, WizardStep4, WizardStepWrapper} from "./Step";
import {responseMessage, siteData} from "../../../Components/mixedConsts";
import {getMe} from "../../../Services/AuthService";
import {showError} from "../../../Components/Toaster";
import {crudNas, crudProfilePools} from "../../../Services/NasService";

// noinspection DuplicatedCode
class WizardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, nas : true, pools : true, bandwidths : true, profiles : true, customers : true },
            privilege : null, menus : [], site : null,
            nas : [], pools : [], bandwidths : [], profiles : [], customers : [],
            steps : { current :0, max : 0, body : null, allowNext : false, allowSkip : false },
        };
        this.handleStep = this.handleStep.bind(this);
        this.handleMe = this.handleMe.bind(this);
        this.loadNas = this.loadNas.bind(this);
        this.loadPools = this.loadPools.bind(this);
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        siteData()
            .then((response)=>this.setState({site:response}))
            .then(()=>{
                loadings.nas = false; this.setState({loadings},()=>this.loadNas());
            })
            .then(()=>{
                loadings.pools = false; this.setState({loadings},()=>this.loadPools());
            })
            .then(()=>{
                let steps = this.state.steps;
                if (localStorage.getItem('static_step') !== null) {
                    steps = JSON.parse(localStorage.getItem('static_step'));
                } else {
                    steps.body = <WizardStep0 onStep={this.handleStep} site={this.state.site}/>;
                }
                this.setState({steps},()=>this.handleStepBody());
            })
    }
    handleStepBody() {
        let steps = this.state.steps;
        if (steps.current >= 0 && steps.current <= 6) {
            switch (steps.current){
                case 0:
                    steps.body = <WizardStep0 onStep={this.handleStep} site={this.state.site}/>;
                    steps.allowNext = true;
                    steps.allowSkip = true;
                    break;
                case 1:
                    steps.body = <WizardStep1 onUpdate={this.handleMe} user={this.state.user} onStep={this.handleStep}/>;
                    steps.allowNext = steps.max > 1;
                    steps.allowSkip = true;
                    break;
                case 2:
                    steps.body = <WizardStep2 user={this.state.user} onStep={this.handleStep}/>;
                    steps.allowNext = true;
                    steps.allowSkip = false;
                    break;
                case 3:
                    steps.body = <WizardStep3 user={this.state.user} onNas={this.loadNas} nas={this.state.nas} onStep={this.handleStep}/>;
                    steps.allowNext = this.state.nas.length > 0;
                    steps.allowSkip = false;
                    break;
                case 4:
                    steps.body = <WizardStep4 pools={this.state.pools} onPool={this.loadPools} nas={this.state.nas} onStep={this.handleStep}/>;
                    steps.allowNext = this.state.pools.length > 0;
                    steps.allowSkip = false;
                    break;
            }
        }
        this.setState({steps});
    }
    handleStep(event) {
        event.preventDefault();
        let nextStep = parseInt(event.currentTarget.getAttribute('data-step'));
        if (nextStep !== null) {
            if (Number.isInteger(nextStep)) {
                if (nextStep >= 0) {
                    let steps = this.state.steps;
                    steps.current = nextStep;
                    steps.body = null;
                    if (nextStep >= steps.max) {
                        steps.max = nextStep;
                    }
                    localStorage.setItem('static_step', JSON.stringify(this.state.steps));
                    this.setState({steps},()=>this.handleStepBody());
                }
            }
        }
    }
    async loadPools() {
        if (! this.state.loadings.pools) {
            let loadings = this.state.loadings;
            loadings.pools = true; this.setState({loadings});
            try {
                let response = await crudProfilePools();
                if (response.data.params === null) {
                    loadings.pools = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.pools = false; this.setState({loadings,pools:response.data.params},()=>this.handleStepBody());
                }
            } catch (e) {
                loadings.pools = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadNas() {
        if (! this.state.loadings.nas) {
            let loadings = this.state.loadings;
            loadings.nas = true; this.setState({loadings});
            try {
                let response = await crudNas();
                if (response.data.params === null) {
                    loadings.nas = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.nas = false; this.setState({loadings,nas:response.data.params},()=>this.handleStepBody());
                }
            } catch (e) {
                loadings.nas = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async handleMe() {
        try {
            let response = await getMe();
            if (response.data.params === null) {
                showError(response.data.message);
            } else {
                let steps = this.state.steps;
                steps.allowNext = true;
                localStorage.setItem('user',JSON.stringify(response.data.params));
                this.setState({user:response.data.params,steps});
            }
        } catch (e) {
            responseMessage(e);
        }
    }
    render() {
        return (
            <React.StrictMode>
                <EmptyHeaderAndSideBar onStep={this.handleStep} steps={this.state.steps} site={this.state.site} loadings={this.state.loadings} user={this.state.user}/>
                <div className="content-wrapper">
                    <section className="content">
                        <div className="container-fluid mt-5">
                            <WizardStepWrapper steps={this.state.steps} onStep={this.handleStep}/>
                        </div>
                    </section>
                </div>
                <MainFooter/>
            </React.StrictMode>
        );
    }
}
export default WizardPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><WizardPage/></React.StrictMode>);
