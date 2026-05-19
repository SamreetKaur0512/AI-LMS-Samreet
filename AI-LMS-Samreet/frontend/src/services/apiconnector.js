import axios from "axios"

export const axiosInstance = axios.create({});

const FILE_UPLOAD_TIMEOUT = 5 * 60 * 1000;

export const apiConnector = (method, url, bodyData, headers, params) => {
    const isFileUpload =
        typeof FormData !== "undefined" && bodyData instanceof FormData;

    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers: null,
        params: params ? params : null,
        timeout: isFileUpload ? FILE_UPLOAD_TIMEOUT : undefined,
    });
}
