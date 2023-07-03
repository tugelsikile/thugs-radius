import React from "react";
import ReactDOM from "react-dom/client";
import {BreadCrumb, MainNavbar, MainSidebar} from "../../../Components/Layout/PlusAdmin/PlusAdminLayout";
import {getRootUrl} from "../../../Components/Authentication";
import {formatLocalePeriode, responseMessage, siteData} from "../../../Components/mixedConsts";
import {ToastContainer} from "react-toastify";
import {crudCustomerInvoices} from "../../../Services/CustomerService";
import {showError} from "../../../Components/Toaster";
import {currentMonthBilling, lastMonthBilling} from "./Mixed";
import moment from "moment";

class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadings : { invoices : true },
            site : null,
            invoices : [],
            user : JSON.parse(localStorage.getItem('user')),
        }
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        siteData()
            .then((response)=>this.setState({site:response}))
            .then(()=>{
                loadings.invoices = false; this.setState({loadings},()=>this.loadInvoices());
            })
    }
    async loadInvoices() {
        if (! this.state.loadings.invoices) {
            let loadings = this.state.loadings;
            loadings.invoices = true; this.setState({loadings});
            try {
                const formData = new FormData();
                if (this.state.user !== null) formData.append(Lang.get('customers.form_input.id'), this.state.user.value);
                let response = await crudCustomerInvoices(formData);
                if (response.data.params === null) {
                    loadings.invoices = false; this.setState({loadings});
                    showError(response.data.message);
                } else {
                    loadings.invoices = false;
                    this.setState({loadings,invoices:response.data.params});
                }
            } catch (e) {
                loadings.invoices = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <ToastContainer position="bottom-right" newestOnTop={true}/>

                <MainSidebar route={this.props.route} user={this.state.user}/>
                <div className="container-fluid page-body-wrapper">
                    <MainNavbar user={this.state.user}/>

                    <div className="main-panel">
                        <div className="content-wrapper pb-0">
                            <BreadCrumb childrens={[]}/>
                            <div className="row">
                                <div className="col-xl-4 grid-margin">
                                    <div className="card card-stat stretch-card mb-3">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="text-white">
                                                    <h3 className="font-weight-bold mb-0">IDR {currentMonthBilling(this.state.invoices)}</h3>
                                                    <h6>{Lang.get('invoices.labels.bill_period.current',{Attribute:formatLocalePeriode(moment(),'MMMM yyyy')})}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card stretch-card mb-3">
                                        <div className="card-body d-flex flex-wrap justify-content-between">
                                            <div>
                                                <h4 className="font-weight-semibold mb-1 text-black">
                                                    {Lang.get('invoices.labels.bill_period.last')}
                                                </h4>
                                                <h6 className="text-muted">{formatLocalePeriode(moment().add(-1,'months'),'MMMM yyyy')}</h6>
                                            </div>
                                            <h3 className="text-success font-weight-bold">IDR {lastMonthBilling(this.state.invoices)}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-8 stretch-card grid-margin">
                                    <div className="card">
                                        <div className="card-body pb-0">
                                            <h4 className="card-title mb-0">Financial management review</h4>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="table-responsive">
                                                <table className="table custom-table text-dark">
                                                    <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Sale Rate</th>
                                                        <th>Actual</th>
                                                        <th>Variance</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    <tr>
                                                        <td>
                                                            <img src="../assets/images/faces/face2.jpg" className="mr-2" alt="image"/> Jacob Jensen</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <span className="pr-2 d-flex align-items-center">85%</span>
                                                                <div className="br-wrapper br-theme-css-stars">
                                                                    <select id="star-1" name="rating" autoComplete="off" style={{display:'none'}}>
                                                                        <option value="1">1</option>
                                                                        <option value="2">2</option>
                                                                        <option value="3">3</option>
                                                                        <option value="4">4</option>
                                                                        <option value="5">5</option>
                                                                    </select>
                                                                    <div className="br-widget">
                                                                        <a href="#" data-rating-value="1" data-rating-text="1" className="br-selected"></a>
                                                                        <a href="#" data-rating-value="2" data-rating-text="2" className="br-selected"></a>
                                                                        <a href="#" data-rating-value="3" data-rating-text="3" className="br-selected"></a>
                                                                        <a href="#" data-rating-value="4" data-rating-text="4" className="br-selected"></a>
                                                                        <a href="#" data-rating-value="5" data-rating-text="5" className="br-selected br-current"></a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>32,435</td>
                                                        <td>40,234</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <a className="text-black font-13 d-block pt-2 pb-2 pb-lg-0 font-weight-bold pl-4" href="#">Show more</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.StrictMode>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><DashboardPage route="dashboard"/></React.StrictMode>);
