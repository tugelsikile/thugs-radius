import React from "react";
import ReactDOM from "react-dom/client";
import {EmptyHeaderAndSideBar} from "../../../Components/Layout/Layout";
import MainFooter from "../../../Components/Layout/MainFooter";
import {
    WizardStep0,
    WizardStep1,
    WizardStep2,
    WizardStep3,
    WizardStep4,
    WizardStep5,
    WizardStep6, WizardStep7, WizardStep8, WizardStep9,
    WizardStepWrapper
} from "./Step";
import {responseMessage, siteData} from "../../../Components/mixedConsts";
import {getMe} from "../../../Services/AuthService";
import {showError} from "../../../Components/Toaster";
import {crudNas, crudProfile, crudProfileBandwidth, crudProfilePools} from "../../../Services/NasService";
import {crudCustomers} from "../../../Services/CustomerService";

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
        this.loadBandwidths = this.loadBandwidths.bind(this);
        this.loadProfiles = this.loadProfiles.bind(this);
        this.loadCustomers = this.loadCustomers.bind(this);
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
                loadings.bandwidths = false; this.setState({loadings},()=>this.loadBandwidths());
            })
            .then(()=>{
                loadings.profiles = false; this.setState({loadings},()=>this.loadProfiles());
            })
            .then(()=>{
                loadings.customers = false; this.setState({loadings},()=>this.loadCustomers());
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
        if (steps.current >= 0 && steps.current <= 9) {
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
                case 5:
                    steps.body = <WizardStep5 pools={this.state.pools} bandwidths={this.state.bandwidths} onBandwidth={this.loadBandwidths} nas={this.state.nas} onStep={this.handleStep}/>;
                    steps.allowNext = this.state.bandwidths.length > 0;
                    steps.allowSkip = false;
                    break;
                case 6:
                    steps.body = <WizardStep6 user={this.state.user} pools={this.state.pools} bandwidths={this.state.bandwidths} nas={this.state.nas} profiles={this.state.profiles} onProfile={this.loadProfiles} onStep={this.handleStep}/>;
                    steps.allowNext = this.state.profiles.length > 0;
                    steps.allowSkip = false;
                    break;
                case 7:
                    steps.body = <WizardStep7 user={this.state.user} pools={this.state.pools} bandwidths={this.state.bandwidths} nas={this.state.nas} profiles={this.state.profiles} customers={this.state.customers} onCustomer={this.loadCustomers} onStep={this.handleStep}/>;
                    steps.allowNext = this.state.customers.length > 0;
                    steps.allowSkip = false;
                    break;
                case 8:
                    steps.body = <WizardStep8 customers={this.state.customers} nas={this.state.nas} onStep={this.handleStep}/>;
                    steps.allowNext = true;
                    steps.allowSkip = false;
                    break;
                case 9:
                    steps.body = <WizardStep9 onStep={this.handleStep}/>;
                    steps.allowNext = false;
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
    async loadCustomers() {
        if (! this.state.loadings.customers ) {
            let loadings = this.state.loadings;
            loadings.customers = true; this.setState({loadings});
            try {
                let response = await crudCustomers();
                if (response.data.params === null) {
                    loadings.customers = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.customers = false; this.setState({loadings,customers:response.data.params},()=>this.handleStepBody());
                }
            } catch (e) {
                loadings.customers = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadProfiles() {
        if (! this.state.loadings.profiles) {
            let loadings = this.state.loadings;
            loadings.profiles = true; this.setState({loadings});
            try {
                let response = await crudProfile();
                if (response.data.params === null) {
                    loadings.profiles = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.profiles = false; this.setState({loadings,profiles:response.data.params},()=>this.handleStepBody());
                }
            } catch (e) {
                loadings.profiles = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    async loadBandwidths() {
        if (! this.state.loadings.bandwidths ) {
            let loadings = this.state.loadings;
            loadings.bandwidths = true; this.setState({loadings});
            try {
                let response = await crudProfileBandwidth();
                if (response.data.params === null) {
                    loadings.bandwidths = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.bandwidths = false; this.setState({loadings,bandwidths:response.data.params},()=>this.handleStepBody());
                }
            } catch (e) {
                loadings.bandwidths = false; this.setState({loadings});
                responseMessage(e);
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
