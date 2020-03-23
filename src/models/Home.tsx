import {observable} from "mobx";
import {API} from "../API";

interface GlobalImagesResponse {
    items: [];
}

export default class Home {
    @observable private globalImages;

    constructor() {
    }

    async setGlobalImages(page) {
        await Promise.all([this.getGlobalImages(page)]);
    }

    async getGlobalImages(page) {
        let header = new Headers();
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/pictures?page=${page}`, 'GET', header).then((response : GlobalImagesResponse) => {
            this.globalImages = response.items
        });
    }

    get GlobalImagesInstance() {
        return this.globalImages;
    }
}
