import {API} from "../API";
import {observable, action} from "mobx";
import {toast} from "react-toastify";
import * as Cookies from "js-cookie";


interface pictureResponse {
    items: []
}

export default class Profile {
    @observable private userProfile;
    @observable private userProfilePicture;
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    async getUserProfilePicture()
    {
        let header = new Headers();
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users/${this.id}/pictures`, 'GET', header).then((response : pictureResponse) =>
            this.userProfilePicture = response.items
        );
    }

    async getUserProfile()
    {
        let header = new Headers();
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users/${this.id}`, 'GET', header).then((response) => this.userProfile = response);
    }

    async setUserProfile() {
        await Promise.all([this.getUserProfile(), this.getUserProfilePicture()]);
    }

    @action
    uploadNewPicture(formData: FormData) {
        let header = new Headers();
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        this.callAPIForUploadNewPicture(formData, header).then(() => {
            toast.success("Image upload successful !", {
                position: toast.POSITION.TOP_RIGHT
            });
            this.getUserProfilePicture();
        });
    }

    @action
    async editProfile(json: {}) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIForUpdateProfile(json, header).then((response) => {
            if (response) {
                this.getUserProfile()
            }
        });
    }

    async deleteAccount() {
        let header = new Headers();
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIForDeleteAccount(header).then((response) => {
            Cookies.remove('UGramAccessToken');
            Cookies.remove('UGramUserId');
        });
    }

    async callAPIForUpdateProfile(json: {}, header: Headers) {
        return API(`/users/${this.id}`, 'PUT', header, JSON.stringify(json));
    }

    async callAPIForUploadNewPicture(formData: FormData, header: Headers) {
        await API(`/users/${this.id}/pictures`, 'POST', header, formData);
    }

    async callAPIForDeleteAccount(header: Headers) {
        await API(`/users/${this.id}/`, 'DELETE', header)
    }

    get ProfileInstance() {
        return this.userProfile;
    }

    get ProfilePictureInstance() {
        return this.userProfilePicture;
    }
}
