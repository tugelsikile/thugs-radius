import React from "react";
import Watermark from '@uiw/react-watermark';
import BodyInvoice from "./BodyInvoice";

class BodyInvoiceWM extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Watermark image={window.origin + '/lunas.png'} content={['LUNAS']}>
                <BodyInvoice user={this.props.user} site={this.props.site} loadings={this.props.loadings} invoice={this.props.invoice}/>
            </Watermark>
        )
    }
}
export default BodyInvoiceWM;
