import {API} from "../API";
import * as Cookies from "js-cookie"

interface responseAuthLogIn {
    accessToken: string,
    userId: string,
}

export class Auth {

    async register(json) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users`, 'POST', header, JSON.stringify(json)).then((response: responseAuthLogIn) => {
            if (response) {
                Cookies.set("UGramAccessToken", response.accessToken);
                Cookies.set("UGramUserId", response.userId);
            }
        });
    }

    async login(json) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users/login/`, 'POST', header, JSON.stringify(json)).then((response: responseAuthLogIn) => {
            if (response) {
                Cookies.set("UGramAccessToken", response.accessToken);
                Cookies.set("UGramUserId", response.userId);
                return true;
            } else {
                return false;
            }
        });
    }

    async logout(json) {
        let header = new Headers();
        header.append('Content-Type', 'application/json');
        header.append('Access-Control-Allow-Origin', '*');
        return await API(`/users/logout/`, 'POST', header, JSON.stringify(json)).then((response: responseAuthLogIn) => {
            Cookies.remove('UGramAccessToken');
            Cookies.remove('UGramUserId');
        });
    }

    static verifyExists(email) {
        let header = new Headers();
        header.append('Access-Control-Allow-Origin', '*');
        return API(`/users/email/${email}`, 'GET', header);
    }

    static verifyToken() {
        if (Cookies.get("UGramUserId") !== undefined
            && Cookies.get("UGramAccessToken") !== undefined) {
            let header = new Headers();
            header.append('Access-Control-Allow-Origin', '*');
            header.append('Authorization', `Bearer ${Cookies.get("UGramAccessToken")}`);
            return API(`/users/${Cookies.get("UGramUserId")}/token`, 'POST', header)
        } else {
            return Promise.resolve(false);
        }
    }
}
