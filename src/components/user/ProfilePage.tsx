import * as React from 'react';
import {Button, Card, CardTitle, Input, Modal} from 'react-materialize';
import ImageFilter from 'react-image-filter';
import {observer} from "mobx-react";
import Profile from "../../models/Profile";
import {ImageCard} from "../image/ImageCard";
import {Icon} from "@material-ui/core";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import * as Cookies from "js-cookie";
import * as Webcam from "react-webcam";
import * as ReactGA from "react-ga";

require('../../scss/profile.scss');

interface ProfilePageProps {
    checkProfile: any
    checkNotification: any
    history: any
}

@observer
export class ProfilePage extends React.Component<ProfilePageProps> {
    private userProfile;
    private stockMentions: string;
    private stockHashtags: string;
    private objectForm = {
        description: "",
        mentions: [],
        tags: []
    };
    private pictures = "";
    private filterType;
    private webcam;
    private canvas;
    private previewImageUpload;
    private previewWebcam;
    private previewImage = '';


    private objectEditProfile = {
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: ""
    };

    constructor(props) {
        super(props);
        this.userProfile = new Profile(Cookies.get("UGramUserId"));
        this.state = {
            modalEditOpen: false,
            inputState: "",
            modalDeleteOpen: false,
            modalFilter: false,
            modalWebcam: false
        }
    };

    async componentWillMount() {
        this.props.checkNotification();
        await this.userProfile.setUserProfile();
        this.canvas = document.createElement("canvas");
        ReactGA.pageview(window.location.pathname + window.location.search);
    }

    componentDidMount(): void {
        window.addEventListener('resize', () => this.forceUpdate())
    }

    triggerReRender = () => {
        this.userProfile.getUserProfilePicture();
        this.props.checkNotification();
        this.forceUpdate();
    };

    newPictureUploaderHandler = e => {
        e.preventDefault();
        if (this.pictures) {
            if (this.stockMentions)
                this.objectForm.mentions = this.stockMentions.trim().split(" ");
            if (this.stockHashtags)
                this.objectForm.tags = this.stockHashtags.trim().split(" ");
            const formData = new FormData();
            fetch(this.canvas.toDataURL())
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'image.png', blob);
                    formData.append('file',  file);
                    formData.append('description', this.objectForm.description);
                    formData.append('tags', this.objectForm.tags.toString());
                    formData.append('mentions', this.objectForm.mentions.toString());
                    this.userProfile.uploadNewPicture(formData);
                    ReactGA.event({category: 'Image', action: 'Uploaded an image'});
                    this.clearObjectEditProfile();
                    this.props.checkNotification();
                });
        }
    };

    handlerDescriptionOnChange = e => {
        this.objectForm.description = e.currentTarget.value;
    };

    handlerMentionOnChange = e => {
        this.stockMentions = e.currentTarget.value;
    };

    handleHashtagOnChange = e => {
        this.stockHashtags = e.currentTarget.value;
    };

    handleFileOnChange(e) {
        this.pictures = e.target.files[0];
        if (this.pictures) {
            this.previewImageUpload = window.URL.createObjectURL(this.pictures);
            this.loadToCanvas(this.previewImageUpload);
            this.filterType = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,];
        } else
            this.previewImage = "";
        this.forceUpdate();
    };

    handleEmailOnChange = e => {
        this.objectEditProfile.email = e.currentTarget.value;
    };

    handleFirstNameOnChange = e => {
        this.objectEditProfile.firstName = e.currentTarget.value;
    };
    handleLastNameOnChange = e => {
        this.objectEditProfile.lastName = e.currentTarget.value;
    };
    handlePhoneNumberOnChange = e => {
        this.objectEditProfile.phoneNumber = e.currentTarget.value;
    };

    validateField() {
        let nameValid = /^[A-Za-z]+$/;
        let emailValid = (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        let phoneNumberValid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

        if (!nameValid.test(this.objectEditProfile.lastName)) {
            return false;
        } else if (!nameValid.test(this.objectEditProfile.firstName)) {
            return false;
        } else if (!emailValid.test(this.objectEditProfile.email)) {
            return false;
        } else if (!phoneNumberValid.test(this.objectEditProfile.phoneNumber)) {
            return false;
        } else {
            return true;
        }
    }

    clearObjectEditProfile() {
        const inputs = document.getElementsByTagName("input");
        const labels = document.getElementsByTagName("label");

        for (let i = 0; i < labels.length; ++i) {
            labels.item(i).className = "";
        }

        for (let i = 0; i < inputs.length; ++i) {
            if (inputs.item(i).type === 'file') {
                inputs.item(i).type = '';
                inputs.item(i).type = 'file';
            }
            inputs.item(i).value = "";
            inputs.item(i).className = "";
            inputs.item(i).autofocus = false;
        }
        this.objectEditProfile.email = "";
        this.objectEditProfile.firstName = "";
        this.objectEditProfile.lastName = "";
        this.objectEditProfile.phoneNumber = "";
        this.pictures = "";
    }

    editProfile = e => {
        if (this.objectEditProfile.email && this.objectEditProfile.lastName &&
            this.objectEditProfile.firstName && this.objectEditProfile.phoneNumber && this.validateField()) {
            this.userProfile.editProfile(this.objectEditProfile);
            this.props.checkNotification();
            this.clearObjectEditProfile();
            ReactGA.event({category: 'User', action: 'Edited profile'});
            this.setState(() => {
                return {
                    modalEditOpen: false,
                    editButtonState: false
                };
            });
        }
    };

    chooseFilter(e, filter) {
        e.preventDefault();
        if (filter === 'none') {
            this.filterType = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,];
        } else {
            this.filterType = filter;
            this.applyFilter(filter);
        }
        this.setState(() => {
            return {
                modalFilter: true,
                modalWebcam: false
            };
        });
    }

    loadToCanvas(image) {
        let img = new Image();
        img.src = image;
        let ctx = this.canvas.getContext("2d");
        img.onload = function() {
            ctx.canvas.width = img.width;
            ctx.canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
        this.previewImage = image;
    }

    applyFilter(filter) {
        let img = new Image();
        img.src = this.previewImage;
        let ctx = this.canvas.getContext("2d");
        img.onload = function() {
            ctx.canvas.width = img.width;
            ctx.canvas.height = img.height;
            if (typeof filter === 'string' || filter instanceof String)
                ctx.filter = `${filter}(0.8)`;
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
    }

    setRef(webcam) {
        this.webcam = webcam;
    };

    captureImage(e) {
        this.previewWebcam = this.webcam.getScreenshot();
        this.loadToCanvas(this.previewWebcam);
        this.filterType = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,];
        this.pictures = "ScreenShot";
        this.setState(() => {
            return {
                modalWebcam: true
            };
        });
    }

    closeModal(e) {
        this.setState(() => {
            return {
                modalFilter: false,
                modalWebcam: false
            };
        });
        return false;
    }

    openModal(e) {
        e.preventDefault();
        ReactGA.event({category: 'Image', action: 'Using webcam'});
        this.setState(() => {
            return {
                modalWebcam: true
            };
        });
    }

    deleteAccount() {
        this.userProfile.deleteAccount().then(() => {
            ReactGA.event({category: 'User', action: 'Deleted an account'});
            this.props.checkProfile();
            this.props.history.push('/auth');
        });
        this.setState(() => {
            return {
                modalDeleteOpen: false,
            };
        });
    };

    render() {
        const profilePictures = this.userProfile.ProfilePictureInstance;
        const profile = this.userProfile.ProfileInstance;
        return <div className="section profile-page-container">
            <ToastContainer autoClose={2000} />
            <h1>Your Profile</h1>
            <div className="profile-page-div-top-style">
                {profile &&
                <Card horizontal={window.innerWidth > 800}
                      className={"card-container"}
                      header={<CardTitle className={'image-container'}  image={profile.pictureUrl ? profile.pictureUrl : require('../../assets/favicon.png')}/> }>
                    <div className={'card-user-info-container'}>
                        <div className={'card-user-info-title'}>
                            <span className={'card-user-info-title-id'}>{profile.firstName} {profile.lastName}</span>
                            <Modal
                                header='Edit Profile'
                                actions={[
                                    <Button onClick={this.editProfile}>Edit</Button>
                                ]}
                                open={this.state['modalEditOpen']}
                                trigger={<a><Icon>edit</Icon></a>}>
                                <form>
                                    <Input s={6} label="First Name"
                                           onChange={this.handleFirstNameOnChange} validate />
                                    <Input s={6} label="Last Name" validate
                                           onChange={this.handleLastNameOnChange}/>
                                    <Input type="email" label="Email"  validate s={12}
                                           onChange={this.handleEmailOnChange}/>
                                    <Input type="number" label="Phone Number" validate s={12}
                                           onChange={this.handlePhoneNumberOnChange}/>
                                </form>
                            </Modal>
                        </div>
                        <ul className={'user-profile-info'}>
                            <li><div>Name:</div> {profile.firstName} {profile.lastName}</li>
                            <li><div>Email:</div> {profile.email}</li>
                            <li><div>Phone:</div> {profile.phoneNumber}</li>
                            <li><div>Registration date:</div> {new Date(profile.registrationDate).toLocaleDateString()}</li>
                            <Modal
                                header='Delete Account'
                                actions={[
                                    <Button waves='light' className='red' onClick={() => this.deleteAccount()}>Delete</Button>
                                ]}
                                open={this.state['modalDeleteOpen']}
                                trigger={<Button waves='light' className='red'>Delete your account</Button>}>
                                <form>
                                    <span>Do you really want to delete your account ?</span>
                                </form>
                            </Modal>
                        </ul>
                    </div>
                </Card>
                }
                <Card title={'Upload picture'}>
                    <form onSubmit={this.newPictureUploaderHandler}>
                        <Input type="file" label="Picture" onChange={this.handleFileOnChange.bind(this)}/>
                        <Input label="Description" onChange={this.handlerDescriptionOnChange}/>
                        <Input label="Mentions" onChange={this.handlerMentionOnChange}/>
                        <Input label="Tags" onChange={this.handleHashtagOnChange}/>
                        <div className="align-buttons">
                            <Button>Upload</Button>
                            <Button onClick={(e) => this.openModal(e)}>Webcam</Button>
                            <Modal
                                header='Webcam'
                                modalOptions={{ dismissible: false }}
                                actions={[
                                    <Button className="red" onClick={(e) => this.closeModal(e)}>Close</Button>
                                ]}
                                trigger={<Button style={{ display: 'none' }}>Webcam</Button>}
                                open={this.state['modalWebcam']}>
                                <div className="inline-webcam">
                                    {this.state['modalWebcam'] && <Webcam
                                        audio={false}
                                        height={300}
                                        ref={(webcam) => this.setRef(webcam)}
                                        screenshotFormat="image/jpeg"
                                        width={500}
                                        videoConstraints={{width: 1920, height: 1080, facingMode: "user"}}/> }
                                </div>
                                <div className="inline-webcam">
                                    <Button onClick={(e) => this.captureImage(e)}>Capture</Button>
                                </div>
                                <br/>
                                <h2>Preview</h2>
                                <div className="inline-webcam">
                                    <img src={this.previewWebcam}/>
                                </div>
                            </Modal>
                            <Modal
                                header='Image Filter'
                                actions={[
                                    <Button onClick={(e) => this.closeModal(e)}>Apply</Button>
                                ]}
                                open={this.state['modalFilter']}
                                trigger={<Button disabled={!this.pictures}>Filter</Button>}>
                                <div>
                                    <ImageFilter
                                        image={this.previewImage}
                                        filter={this.filterType}/>
                                </div>
                                <div className="align-buttons">
                                    <Button onClick={(e) => this.chooseFilter(e, 'none')}>None</Button>
                                    <Button onClick={(e) => this.chooseFilter(e, 'invert')}>Invert</Button>
                                    <Button onClick={(e) => this.chooseFilter(e, 'grayscale')}>GrayScale</Button>
                                    <Button onClick={(e) => this.chooseFilter(e, 'sepia')}>Sepia</Button>
                                </div>
                            </Modal>
                        </div>
                    </form>
                </Card>
            </div>
            <div className="profile-page-div-bottom-style">
                <h1>Your Posts</h1>
                <div className="profile-page-recent-posts-style">
                    {
                        profile && profilePictures && profilePictures.map((picture, index) =>
                            <div key={index} className="profile-page-recent-posts-image-style">
                                <ImageCard editable={true} triggerParentUpdate={this.triggerReRender} pictureId={picture.id} mentions={picture.mentions} tags={picture.tags}
                                           url={picture.url} userId={profile.id} description={picture.description}/>
                        </div>
                        )
                    }
                </div>
            </div>
        </div>;
    }


}
