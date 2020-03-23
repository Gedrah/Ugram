import {observable} from "mobx";
import {API} from "../API";
import * as Cookies from "js-cookie";

interface NotificationsResponse {
    datas: any;
}

export default class Notifications {
    @observable private notifications;

    async setAllNotifications() {
        await Promise.all([this.getAllNotifications()]);
    }

    async getAllNotifications() {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIGetAllNotifications(header).then((response : NotificationsResponse) => {
            this.notifications = response;
            return response;
        });
    }

    async validateNotification(notifId) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
        header.append('Access-Control-Allow-Origin', '*');
        return await this.callAPIUpdateNotification(header, notifId).then((response : NotificationsResponse) => {
            return this.getAllNotifications();
        });
    }

    async callAPIUpdateNotification(header: Headers, notifId: String) {
        return await API(`/users/${Cookies.get("UGramUserId")}/notifications/${notifId}`, 'PUT', header);
    }

    async callAPIGetAllNotifications(header: Headers) {
        return await API(`/users/${Cookies.get("UGramUserId")}/notifications`, 'GET', header);
    }

    get NotificationsInstance() {
        return this.notifications;
    }
}
