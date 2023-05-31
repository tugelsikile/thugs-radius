import React from "react";

class PageLoader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="preloader flex-column justify-content-center align-items-center">
                <img className="animation__shake" src={window.origin + '/theme/adminlte/img/AdminLTELogo.png'} alt="AdminLTELogo" height="60" width="60"/>
            </div>
        )
    }
}
export default PageLoader;
