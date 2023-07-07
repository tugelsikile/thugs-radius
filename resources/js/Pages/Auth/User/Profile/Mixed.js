import React, {useRef, useState} from "react";
import {Skeleton} from "@mui/material";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleNotch, faFileUpload} from "@fortawesome/free-solid-svg-icons";
import {CardPreloader, formatBytes} from "../../../../Components/mixedConsts";
import {showError} from "../../../../Components/Toaster";

const onMouseOverProfileCardAvatar = (event)=> {
    let childElements = event.currentTarget.children;
    if (childElements !== null) {
        if (childElements.length > 0) {
            for (let elem of childElements) {
                let classElements = elem.classList;
                classElements.forEach(function (elemClass){
                    if (elemClass.indexOf("fa") !== -1) {
                        if (elem.style.display === 'none') {
                            elem.style.display = 'block';
                        }
                    }
                })
            }
        }
    }
}
const onMouseOutProfileCardAvatar = (event) => {
    let childElements = event.currentTarget.children;
    if (childElements !== null) {
        if (childElements.length > 0) {
            for (let elem of childElements) {
                let classElements = elem.classList;
                classElements.forEach(function (elemClass){
                    if (elemClass.indexOf("fa") !== -1) {
                        if (elem.style.display === 'block') {
                            elem.style.display = 'none';
                        }
                    }
                })
            }
        }
    }
}

export const ProfileCardAvatar = (props)=> {
    const fileInput = useRef(null);
    const [imgSrc, setImgSrc]= useState(props.profile.meta.avatar);
    function handleClick() {
        if (!props.loadings.avatar) {
            fileInput.current.click();
        }
    }
    function handleChange(event) {
        const fileReader = new FileReader();
        const avatarFile = event.target.files[0];
        if (avatarFile.size > 5000000) {
            showError(Lang.get('validation.max.file',{Attribute:Lang.get('users.labels.avatar.label'),max:5000000}));
        } else if (avatarFile.size < 1000) {
            showError(Lang.get('validation.min.file', {Attribute:Lang.get('users.labels.avatar.label'),min:1000}));
        } else {
            fileReader.readAsDataURL(avatarFile);
            fileReader.onloadend = (f) => {
                const image = new Image();
                image.src = fileReader.result;
                image.onload = function () {
                    if (this.width < 100) {
                        showError(Lang.get('validation.min.numeric', { Attribute: Lang.get('users.labels.avatar.width'), min: 100 }));
                    } else if (this.width > 1000) {
                        showError(Lang.get('validation.max.numeric', { Attribute: Lang.get('users.labels.avatar.width'), max: 100 }));
                    } else if (this.height < 100) {
                        showError(Lang.get('validation.min.numeric', { Attribute: Lang.get('users.labels.avatar.height'), min: 100 }));
                    } else if (this.height > 1000) {
                        showError(Lang.get('validation.max.numeric', { Attribute: Lang.get('users.labels.avatar.height'), max: 100 }));
                    } else if (this.height !== this.width) {
                        showError(Lang.get('validation.same', { Attribute: Lang.get('users.labels.avatar.height'), other: Lang.get('users.labels.avatar.width') }));
                    } else {
                        setImgSrc(fileReader.result);
                        props.onAvatar(event);
                    }
                }
            }
        }
    }
    let response = <img className="profile-user-img img-fluid img-circle" src={props.profile.meta.avatar} alt="User profile picture"/>;
    if (props.user.value === props.profile.value) {
        response = (
            <React.Fragment>
                <input accept="image/*" onChange={handleChange} ref={fileInput} type="file" style={{display:'none'}}/>
                <a onClick={handleClick} onMouseOver={onMouseOverProfileCardAvatar} onMouseOut={onMouseOutProfileCardAvatar} href="#" className="position-relative">
                    {props.loadings.avatar && <div style={{position:'absolute',top:0,bottom:0,left:0,right:0,marginTop:"auto",marginBottom:"auto",marginLeft:"auto",marginRight:"auto"}}><FontAwesomeIcon icon={faCircleNotch} className="text-light" size="2xl" spin={true}/></div>}
                    <FontAwesomeIcon style={{display:"none",top:0,bottom:0,left:0,right:0,marginTop:"auto",marginBottom:"auto",marginLeft:"auto",marginRight:"auto"}} icon={faFileUpload} size="2xl" className="position-absolute text-light"/>
                    <img style={{height:90,width:90}} className="profile-user-img img-fluid img-circle" src={imgSrc} alt="User profile picture"/>
                </a>
            </React.Fragment>
        )
    }
    return response;
}
export const ProfileCard = (props)=> {
    return (
        <div className="col-md-3">
            <div className="card card-primary card-outline">
                <div className="card-body box-profile">
                    <div className="text-center">
                        {props.loadings.profile ?
                            <Skeleton className="profile-user-img img-fluid img-circle" animation="wave" variant="circular" width={90} height={90} />
                            :
                            props.profile === null ?
                                <Skeleton className="profile-user-img img-fluid img-circle" animation="wave" variant="circular" width={90} height={90} />
                                :
                                <ProfileCardAvatar loadings={props.loadings} onAvatar={props.onAvatar} user={props.user} profile={props.profile}/>
                        }
                    </div>

                    <h3 className="profile-username text-center">
                        {props.loadings.profile ?
                            <Skeleton animation="wave" height={25} variant="text"/> : props.profile === null ? '-' : props.profile.label
                        }
                    </h3>

                    <p className="text-muted text-center">
                        {props.loadings.profile ?
                            <Skeleton animation="wave" height={25} variant="text"/> : props.profile === null ? '-' : props.profile.meta.level.label
                        }
                    </p>

                </div>
            </div>
        </div>
    )
}
