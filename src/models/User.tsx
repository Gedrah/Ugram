import {observable} from "mobx";
import {API} from "../API";

interface GlobalUsersResponse {
    items: [];
}

export default class User {
    @observable private globalUsers;

    constructor() {
    }

    async setGlobalUsers() {
        await Promise.all([this.getGlobalUsers()]);
    }

    async getGlobalUsers() {
        let header = new Headers();
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users`, 'GET', header).then((response : GlobalUsersResponse) => {
            this.globalUsers = response.items
        });
    }

    get GlobalUsersInstance() {
        return this.globalUsers;
    }
}
