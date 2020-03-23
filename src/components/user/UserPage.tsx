import * as React from 'react';
import {Card, CardTitle} from 'react-materialize';
import {observer} from "mobx-react";
import Profile from "../../models/Profile";
import {ImageCard} from "../image/ImageCard";
import * as ReactGA from "react-ga";

require('../../scss/profile.scss');

@observer
export class UserPage extends React.Component {
    private userProfile;
    private userID;

    constructor(props) {
        super(props);
        const params = new URLSearchParams(props.location.search);
        this.userID = params.get('id');
    };

    async componentWillMount() {
        if (!this.userID) {
            window.location.replace("/");
        } else {
            this.userProfile = new Profile(this.userID);
        }
        await this.userProfile.setUserProfile();
        ReactGA.pageview(window.location.pathname + window.location.search);
        window.addEventListener('resize', () => this.forceUpdate())
    }

    render() {
        const profilePictures = this.userProfile.ProfilePictureInstance;
        const profile = this.userProfile.ProfileInstance;
        return <div className="section profile-page-container">
            <h1>Profile</h1>
            <div className="profile-page-div-top-style">
                {profile &&
                <Card horizontal={window.innerWidth > 800}
                      className={"card-wide-container"}
                      header={<CardTitle className={'image-container'}  image={profile.pictureUrl ? profile.pictureUrl : require("../../assets/favicon.png")}/> }>
                    <div className={'card-user-info-container'}>
                        <div className={'card-user-info-title'}>
                            <span className={'card-user-info-title-id'}>{profile.firstName} {profile.lastName}</span>
                        </div>
                        <ul className={'user-profile-info'}>
                            <li><div>Name:</div> {profile.firstName} {profile.lastName}</li>
                            <li><div>Email:</div> {profile.email}</li>
                            <li><div>Phone:</div> {profile.phoneNumber}</li>
                            <li><div>Registration date:</div> {new Date(profile.registrationDate).toLocaleDateString()}</li>
                        </ul>
                    </div>
                </Card>
                }
            </div>
            <div className="profile-page-div-bottom-style">
                <h1>Posts</h1>
                <div className="profile-page-recent-posts-style">
                    {
                        profile && profilePictures && profilePictures.map((picture, index) =>
                            <div key={index} className="profile-page-recent-posts-image-style">
                                <ImageCard editable={false} triggerParentUpdate={() => {}} pictureId={picture.id} mentions={picture.mentions} tags={picture.tags}
                                           url={picture.url} userId={profile.id} description={picture.description}/>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>;
    }
}
