import React from "react";
import moment from "moment";

class MainFooter extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <footer className="main-footer text-sm">
                <div className="float-right d-none d-sm-block">
                    <b>Version</b> {process.env.MIX_APP_VERSION}
                </div>
                <strong>Copyright © {moment().format('yyyy')} <a href="https://github.com/tugelsikile">Tugelsikile</a>.</strong> All rights reserved.
            </footer>
        )
    }
}

export default MainFooter;
