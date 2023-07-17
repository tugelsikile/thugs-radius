import React from "react";
import ReactDOM from "react-dom/client";
import {getPrivileges} from "../../../../Components/Authentication";
import {responseMessage, siteData} from "../../../../Components/mixedConsts";
import PageLoader from "../../../../Components/PageLoader";
import {HeaderAndSideBar} from "../../../../Components/Layout/Layout";
import {crudWhatsapp} from "../../../../Services/WhatsappService";

class WhatsappPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : JSON.parse(localStorage.getItem('user')), root : window.origin, site : null,
            loadings : { privileges : true, site : false, whatsapp : true },
            privileges : null, menus : [],
        }
    }
    componentDidMount() {
        let loadings = this.state.loadings;
        if (this.state.privileges === null) {
            siteData()
                .then((response)=>this.setState({site:response}));
            getPrivileges(this.props.route)
                .then((response)=>{
                    this.setState({privileges:response.privileges,menus:response.menus});
                })
                .then(()=>{
                    loadings.whatsapp = false; this.setState({loadings},()=>this.loadConfigWhatsapp());
                })
        }
    }
    async loadConfigWhatsapp(data = null) {
        if (! this.state.loadings.whatsapp) {
            let loadings = this.state.loadings;
            loadings.whatsapp = true;
            this.setState({loadings});
            try {
                let response = await crudWhatsapp();
                if (response.data.params === null) {
                    loadings.whatsapp = false; this.setState({loadings});
                } else {
                    console.log(response.data.params);
                    loadings.whatsapp = false;
                    this.setState({loadings});
                }
            } catch (e) {
                loadings.whatsapp = false; this.setState({loadings});
                responseMessage(e);
            }
        }
    }
    render() {
        return (
            <React.StrictMode>
                <PageLoader/>
                <HeaderAndSideBar route={this.props.route} user={this.state.user} menus={this.state.menus} site={this.state.site} loadings={this.state.loadings}/>
            </React.StrictMode>
        )
    }
}
export default WhatsappPage;
const root = ReactDOM.createRoot(document.getElementById('main-container'));
root.render(<React.StrictMode><WhatsappPage route="clients.configs.whatsapp"/></React.StrictMode>)
