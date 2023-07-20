import React from "react";
import {ToastContainer} from "react-toastify";
import {showError} from "../Toaster";
import {updateLang} from "../../Services/AuthService";
import DigitalClock from "./DigitalClock";
import {customPreventDefault, listSupportedLanguage} from "../mixedConsts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExpandArrowsAlt,faBars} from "@fortawesome/free-solid-svg-icons";

class MainHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading : false,
        }
        this.setLocaleLang = this.setLocaleLang.bind(this);
    }
    componentDidMount() {
        if (localStorage.getItem('locale_lang') === null) {
            localStorage.setItem('locale_lang','id');
            Lang.setLocale('id');
        } else {
            Lang.setLocale(localStorage.getItem('locale_lang'));
        }
    }
    async setLocaleLang(e) {
        e.preventDefault();
        if (! this.state.loading) {
            this.setState({loading:true});
            try {
                const formData = new FormData();
                let curLocale = localStorage.getItem('locale_lang');
                formData.append('lang', e.currentTarget.getAttribute('data-lang'));
                let response = await updateLang(formData);
                if (response.data.params === null) {
                    showError(response.data.message);
                    this.setState({loading:false});
                } else {
                    this.setState({loading:false});
                    localStorage.setItem('locale_lang', response.data.params);
                    Lang.setLocale(response.data.params);
                    window.location.reload();
                }
            } catch (e) {
                this.setState({loading:false});
                showError(e.response.data.message);
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <ToastContainer
                    draggable
                    //pauseOnFocusLoss
                    theme="light"
                    autoClose={3000}
                    //limit={5}
                    position="bottom-right"
                    newestOnTop={true}
                    closeOnClick/>

                <nav className="main-header navbar layout-navbar-fixed navbar-expand navbar-white navbar-light">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" data-widget="pushmenu" href="#" role="button"><FontAwesomeIcon icon={faBars}/></a>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <DigitalClock/>
                        </li>
                        {/*<li className="nav-item d-none d-sm-inline-block">
                            <a href={window.origin} className="nav-link">Contact</a>
                        </li>*/}
                    </ul>

                    <ul className="navbar-nav ml-auto">
                        {localStorage.getItem('locale_lang') === null ? null :
                            <li className="nav-item dropdown">
                                <a title={Lang.get('lang.select')} className="nav-link" data-toggle="dropdown" href="#">
                                    <i className={`mr-1 ${listSupportedLanguage[listSupportedLanguage.findIndex((f) => f.value === localStorage.getItem('locale_lang'))].flag}`}/>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right p-0">
                                    {listSupportedLanguage.map((item,index)=>
                                        <a data-lang={item.value}
                                           onClick={this.setLocaleLang}
                                           key={`flag_${index}`} href="#"
                                           className={localStorage.getItem('locale_lang') === null ? "dropdown-item" : localStorage.getItem('locale_lang') === item.value ? "dropdown-item active" : "dropdown-item"}>
                                            <i className={`mr-2 ${item.flag}`}/> {item.label}
                                        </a>
                                    )}
                                </div>
                            </li>
                        }

                        <li className="nav-item">
                            <a className="nav-link" data-widget="fullscreen" href="#" role="button">
                                <FontAwesomeIcon icon={faExpandArrowsAlt}/>
                            </a>
                        </li>
                    </ul>
                </nav>
            </React.Fragment>
        )
    }
}

export default MainHeader;
