import {action, observable} from "mobx";
import {API} from "../API";
import {toast} from "react-toastify";
import * as Cookies from "js-cookie";

export default class ImageManager {
    @observable private currentImage;
    @observable private comments;
    @observable private likes;
    userId: string;
    pictureId: string;

    constructor(id: string, imageId: string) {
        this.userId = id;
        this.pictureId = imageId;
    }

    async setCurrentImage() {
        await Promise.all([this.getCurrentImage()]);
    }

    async getCurrentImage() {
        let header = new Headers();
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIGetSpecificImage(header).then((response) =>
            this.currentImage = response
        );
    }

    async getCurrentImageLikes() {
        return await this.callAPIToGetImageLikes(this.pictureId).then((response : any) => {
            this.likes = response;
        });
    }

    async getCurrentImageCommentaries() {
        return await this.callAPIToGetImageComments(this.pictureId).then((response : any) => {
            this.comments = response;
        });
    }

    @action
    async deleteImage(realPictureId: string) {
        let header = new Headers();
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIToDeleteImage(header, realPictureId).then((response) => {
            if (response) {
                toast.success("This picture has been successfully deleted.", {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        });
    }

    @action
    async editImage(json: {}, realPictureId: string) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIForEditImage(JSON.stringify(json), header, realPictureId).then((response) => {
            if (response) {
                toast.success("This picture has been successfully edited.", {
                    position: toast.POSITION.TOP_RIGHT
                });
                this.getCurrentImage();
            }
        });
    }

    @action
    async sendLike(json: {}, realPictureId: string) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPISendLike(JSON.stringify(json), header, realPictureId).then((response) => {
            if (response) {
               // this.getCurrentImage();
                this.getCurrentImageLikes();
            }
        });
    }

    @action
    async removeLike(json: {}, realPictureId: string) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIRemoveLike(JSON.stringify(json), header, realPictureId).then((response) => {
            if (response) {
                // this.getCurrentImage();
                this.getCurrentImageLikes();
            }
        });
    }

    @action
    async sendComment(json: {}, realPictureId: string) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPISendCommentary(JSON.stringify(json), header, realPictureId).then((response) => {
            if (response) {
                // this.getCurrentImage();
                this.getCurrentImageCommentaries();
            }
        });
    }

    @action
    async removeComment(commentaryId: string) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIRemoveCommentary(header, this.pictureId, commentaryId).then((response) => {
            if (response) {
             //   this.getCurrentImage();
                this.getCurrentImageCommentaries();
            }
        });
    }


    callAPISendLike(json: {}, header: Headers, realPictureId) {
        return API(`/users/${Cookies.get("UGramUserId")}/pictures/${realPictureId}/likes`, 'POST', header, json)
    }

    callAPIRemoveLike(json: {}, header: Headers, realPictureId) {
        return API(`/users/${Cookies.get("UGramUserId")}/pictures/${realPictureId}/likes`, 'DELETE', header, json)
    }

    callAPISendCommentary(json: {}, header: Headers, realPictureId) {
        return API(`/users/${Cookies.get("UGramUserId")}/pictures/${realPictureId}/commentary`, 'POST', header, json);
    }

    callAPIRemoveCommentary(header: Headers, realPictureId, commentaryId) {
        return API(`/users/${Cookies.get("UGramUserId")}/pictures/${realPictureId}/commentary/${commentaryId}`, 'DELETE', header)
    }

    callAPIGetSpecificImage(header: Headers) {
        return API(`/users/${this.userId}/pictures/${this.pictureId}`, 'GET', header);
    }

    callAPIForEditImage(json: {}, header: Headers, realPictureId: string) {
        return API(`/users/${this.userId}/pictures/${realPictureId}`, 'PUT', header, json);
    }

    callAPIToDeleteImage(header: Headers, realPictureId: string) {
        return API(`/users/${this.userId}/pictures/${realPictureId}`, 'DELETE', header);
    }

    callAPIToGetImageLikes(pictureId) {
        return API(`/pictures/${pictureId}/likes`, 'GET');
    }

    callAPIToGetImageComments(pictureId) {
        return API(`/pictures/${pictureId}/commentaries`, 'GET');
    }


    get ImageInstance() {
        return this.currentImage;
    }

    get CommentariesInstance() {
        return this.comments;
    }

    get LikesInstance() {
        return this.likes;
    }
}
