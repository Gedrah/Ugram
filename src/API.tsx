import {toast} from "react-toastify";

export function API<T>(uri: string, method: string , header?: Headers, body?: any): Promise<T> {
    let baseUrl = process.env.API_URL;
    let params = {
        method: method,
        headers: header,
        body: body
    };
    return fetch(baseUrl.concat(uri), params).then(response => {
        return response.json();
    }).then((data) => {
        if (data && data.message) {
            toast.error(data.message, {
                position: toast.POSITION.TOP_RIGHT
            });
            return false;
        }
        return data;
    }).catch((err) => {
        return true;
    })
}
