import {API} from "../API";
import {observable} from "mobx";

export default class Search {
    @observable private userList;
    @observable private imageListByTag;
    @observable private imageListByDesc;

    @observable private autocompleteList;

    constructor() {
        this.autocompleteList = [];
    }

    async getListByType(pathNameForCall, listType, details) {
        await API(`/search${pathNameForCall}`, "GET").then(response => {
            if (details) {
                if (listType.users == true) {
                    this.userList = response['users'];
                }
                if (listType.tags == true) {
                    this.imageListByTag = response['tags'];
                }
                if (listType.descriptions == true) {
                    this.imageListByDesc = response['descriptions'];
                }
            } else {
                this.autocompleteList = [];
                if (listType.users == true && response['users']) {
                    response['users'].forEach((user) => {
                        this.autocompleteList.push(`${user.firstName} ${user.lastName}`);
                    });
                }
                if (listType.tags == true && response['tags']) {
                    response['tags'].forEach((tag) => {
                        this.autocompleteList.push(tag.tags);
                    });
                }
                if (listType.descriptions == true && response['descriptions']) {
                    response['descriptions'].forEach((description) => {
                        this.autocompleteList.push(description.description);
                    });
                }
            }
        });
    }

    async setLists(pathNameForCall, listType, details) {
        await Promise.all([this.getListByType(pathNameForCall, listType, details)]);
    }

    get UserList() {
        return this.userList;
    }

    get ImageListByTag() {
        return this.imageListByTag;
    }

    get ImageListByDesc() {
        return this.imageListByDesc;
    }
}

