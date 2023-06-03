import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges, getRootUrl, logout} from "../../../../Components/Authentication";
import {siteData} from "../../../../Components/mixedConsts";
import {crudConfigCurrency, crudTimeZone} from "../../../../Services/ConfigService";
import {showError} from "../../../../Components/Toaster";
import PageLoader from "../../../../Components/PageLoader";
import MainHeader from "../../../../Components/Layout/MainHeader";
import MainSidebar from "../../../../Components/Layout/MainSidebar";
import PageTitle from "../../../../Components/Layout/PageTitle";
import MainFooter from "../../../../Components/Layout/MainFooter";
import Select from "react-select";
import BtnSort from "../../User/Tools/BtnSort";

// noinspection DuplicatedCode
class CurrencyPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin,
            loadings : { privilege : false, site : false, currencies : false },
            privilege : null, menus : [], site : null,
            currencies : { filtered : [], unfiltered : [], selected : [] },
            filter : {
                keywords : '',
                sort : { by : 'code', dir : 'asc' },
                page : { value : 1, label : 1}, data_length : 20, paging : [],
            },

        };
        this.handleSave = this.handleSave.bind(this);
        this.loadCurrencies = this.loadCurrencies.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }
    componentDidMount() {
        this.setState({root:getRootUrl()});
        if (! this.state.loadings.site) {
            let loadings = this.state.loadings;
            loadings.site = true; loadings.privilege = true;
            this.setState({loadings});
            if (this.state.site === null) {
                siteData()
                    .then((response)=>{
                        loadings.site = false;
                        this.setState({loadings,site:response},()=>{
                            getPrivileges(this.props.route)
                                .then((response)=>{
                                    loadings.privilege = false;
                                    this.setState({loadings,privilege:response.privileges,menus:response.menus});
                                });
                        });
                    }).then(()=>this.loadCurrencies())
            }
        }
    }
    handleSort(event) {
        event.preventDefault();
        let filter = this.state.filter;
        filter.sort.by = event.currentTarget.getAttribute('data-sort');
        if (filter.sort.dir === 'asc') {
            filter.sort.dir = 'desc';
        } else {
            filter.sort.dir = 'asc';
        }
        this.setState({filter},()=>this.handleFilter())
    }
    handleFilter() {
        let currencies = this.state.currencies;
        currencies.filtered = currencies.unfiltered;
        if (this.state.filter.keywords.length > 0) {
            currencies.filtered = currencies.unfiltered.filter((f) =>
                f.label.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.code.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
                ||
                f.meta.symbol.toLowerCase().indexOf(this.state.filter.keywords.toLowerCase()) !== -1
            );
        }
        switch (this.state.filter.sort.by) {
            case 'code' :
            case 'symbol' :
            case 'rate' :
                if (this.state.filter.sort.dir === 'asc') {
                    currencies.filtered = currencies.filtered.sort((a,b) => (a.meta[this.state.filter.sort.by] > b.meta[this.state.filter.sort.by]) ? 1 : ((b.meta[this.state.filter.sort.by] > a.meta[this.state.filter.sort.by]) ? -1 : 0));
                } else {
                    currencies.filtered = currencies.filtered.sort((a,b) => (a.meta[this.state.filter.sort.by] > b.meta[this.state.filter.sort.by]) ? -1 : ((b.meta[this.state.filter.sort.by] > a.meta[this.state.filter.sort.by]) ? 1 : 0));
                }
                break;
            case 'name' :
                if (this.state.filter.sort.dir === 'asc') {
                    currencies.filtered = currencies.filtered.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
                } else {
                    currencies.filtered = currencies.filtered.sort((a,b) => (a.label > b.label) ? -1 : ((b.label > a.label) ? 1 : 0));
                }
                break;
        }
        this.setState({currencies});
    }
    handleSearch(event) {
        let filter = this.state.filter;
        filter.keywords = event.target.value;
        this.setState({filter},()=>this.handleFilter());
    }
    async handleSave(event) {
        event.preventDefault();
        let loadings = this.state.loadings;
        loadings.timezones = true;
        this.setState({loadings});
        try {
            const formData = new FormData();
            formData.append('_method','patch');
            if (this.state.timezone !== null) formData.append(Lang.get('timezones.form_input.name'), this.state.timezone.value);
            let response = await crudTimeZone(formData);
            if (response.data.params === null) {
                loadings.timezones = false; this.setState({loadings});
                showError(response.data.message);
            } else {
                localStorage.setItem('locale_time_zone', response.data.params);
                loadings.timezones = false; this.setState({loadings,timezone:{value:response.data.params,label:response.data.params}});
            }
        } catch (e) {
            loadings.timezones = false; this.setState({loadings});
            showError(e.response.data.message);
            if (e.response.status === 401) logout();
        }
    }
    async loadCurrencies(data = null) {
        if (! this.state.loadings.currencies) {
            let currencies = this.state.currencies;
            currencies.selected = [];
            let loadings = this.state.loadings;
            loadings.currencies = true; this.setState({loadings,currencies});
            if (data !== null) {
                if (Number.isInteger(data)) {
                    currencies.unfiltered.splice(data, 1);
                } else {
                    let index = currencies.unfiltered.findIndex((f) => f.value === data.value);
                    if (index >= 0) {
                        currencies.unfiltered[index] = data;
                    } else {
                        currencies.unfiltered.push(data);
                    }
                }
                this.setState({currencies},()=>this.handleFilter())
            } else {
                try {
                    let response = await crudConfigCurrency();
                    if (response.data.params === null) {
                        loadings.currencies = false; this.setState({loadings});
                        showError(response.data.message);
                    } else {
                        loadings.currencies = false;
                        currencies.unfiltered = response.data.params;
                        this.setState({loadings,currencies},()=>this.handleFilter());
                    }
                } catch (e) {
                    loadings.currencies = false; this.setState({loadings});
                    showError(e.response.data.message);
                    if (e.response.status === 401) logout();
                }
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <MainHeader root={this.state.root} user={this.state.user}/>
                <MainSidebar route={this.props.route}
                             menus={this.state.menus}
                             root={this.state.root}
                             user={this.state.user}/>
                <div className="content-wrapper">

                    <PageTitle title={Lang.get('currencies.labels.menu')} childrens={[
                        {label : Lang.get('configs.labels.menu'), url : getRootUrl() + '/configs' }
                    ]}/>

                    <section className="content">

                        <div className="container-fluid">

                            <form onSubmit={this.handleSave} className="card card-outline card-primary">
                                <div className="card-header">
                                    <h3 className="card-title">

                                    </h3>
                                    <div className="card-tools">
                                        <div className="input-group input-group-sm" style={{width:150}}>
                                            <input onChange={this.handleSearch} value={this.state.filter.keywords} type="text" name="table_search" className="form-control float-right" placeholder={Lang.get('currencies.labels.search')}/>
                                            <div className="input-group-append">
                                                <button type="submit" className="btn btn-default"><i className="fas fa-search"/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-sm table-striped">
                                        <thead>
                                        <tr>
                                            <th className="align-middle" width={120}>
                                                <BtnSort sort="code"
                                                         name={Lang.get('currencies.labels.code')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle">
                                                <BtnSort sort="name"
                                                         name={Lang.get('currencies.labels.name')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={100}>
                                                <BtnSort sort="symbol"
                                                         name={Lang.get('currencies.labels.symbol')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                            <th className="align-middle" width={120}>
                                                <BtnSort sort="rate"
                                                         name={Lang.get('currencies.labels.rate')}
                                                         filter={this.state.filter}
                                                         handleSort={this.handleSort}/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.state.currencies.filtered.length === 0 ?
                                            <tr><td className="align-middle text-center" colSpan={6}>{Lang.get('messages.no_data')}</td></tr>
                                            :
                                            this.state.currencies.filtered.map((item,index)=>
                                                <tr key={index}>
                                                    <td className="align-middle">
                                                        {item.meta.code}
                                                    </td>
                                                    <td className="align-middle">{item.label}</td>
                                                    <td className="align-middle">{item.meta.symbol}</td>
                                                    <td className="align-middle">{item.meta.rate}</td>
                                                </tr>
                                            )
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                <div className="card-footer justify-content-between">

                                </div>
                            </form>

                        </div>

                    </section>

                </div>
                <MainFooter/>
            </React.StrictMode>
        )
    }


}
export default CurrencyPage;

const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><CurrencyPage route="auth.configs.currencies"/></React.StrictMode>)
