/**
 * Requester Module
 * Created: 2019-11-02 02:43:21
 * Last Update: 2020-07-05 23:57:08
 * @version: 1.0.3
 * @author: icsd
 */

const axios = require('axios');
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

function getRandomUA() {
    let uaList = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36"
    ]
    let randomInt = Math.floor(Math.random() * Math.floor(uaList.length - 1))
    return uaList[randomInt];
}

function getTargetData(respType, responseData, charset = 'UTF-8') {
    // decode the charset if isn't UTF-8.
    if (charset.toUpperCase() != 'UTF-8') {
        responseData = iconv.decode(responseData, charset);
    }

    // Process the response to special data type.
    switch (respType) {
        case 'text':
            return str = String.fromCharCode.apply(null, new Uint16Array(responseData));
        case 'buffer':
            return responseData;
        case 'json':
            return JSON.parse(responseData)
        default:
            let $ = cheerio.load(responseData);
            return $
    }
}

/**
 * @deprecated
 * @param {String} url - Request URL
 * @param {String} charset - charset of the page
 * @param {String} respType - Set response type, return a cheerio Object by default, Option: text | buffer | json
 * @param {Object} config - config for axios: https://github.com/axios/axios#request-config
 */
function get(url, { charset = "UTF-8", respType = 'object', config = {} } = {}) {
    console.warn('Requester.get() is deprecated and has been removed in TrutleFly 2.0. Use Requester.handle() instead.');
    console.log(`GET URL: ${url}`);

    // Fetch response as arraybuffer
    config.responseType = 'arraybuffer';

    // Set User-Agent
    (typeof config.headers != "object") && (config.headers = {})
    if (!config.headers['User-Agent']) {
        config.headers['User-Agent'] = getRandomUA()
    }

    return new Promise((resolve, reject) => {
        axios.get(url, config).then(res => {
            let targetData = getTargetData(respType, res.data, charset);
            resolve(targetData)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * @deprecated
 * @param {String} url - Request URL
 * @param {String} charset - charset of the page
 * @param {String} respType - Set response type, return a cheerio Object by default, Option: text | buffer | json
 * @param {Object} config - config for axios: https://github.com/axios/axios#request-config
 */
function post(url, data = {},
    {
        charset = "UTF-8",
        respType = 'object',
        config = {}
    } = {}
) {
    console.warn('Requester.get() is deprecated and has been removed in TrutleFly 2.0. Use Requester.handle() instead.');
    console.log(`POST URL: ${url}`);

    // Fetch response as arraybuffer
    config.responseType = 'arraybuffer';

    // Set User-Agent
    (typeof config.headers != "object") && (config.headers = {})
    if (!config.headers['User-Agent']) {

        config.headers['User-Agent'] = getRandomUA()
    }

    return new Promise((resolve, reject) => {
        axios.post(url, data, config).then(res => {

            let targetData = getTargetData(respType, res.data, charset);
            resolve(targetData)
        }).catch(err => {
            reject(err)
        })
    })
}

let Requester = {
    get, post,
    handle(url, {
        charset = "UTF-8", 
        respType = 'object',
        method = 'get',
        config = {},
        payload = null
    } = {}) {
        // Fetch response as arraybuffer
        // config.responseType = 'arraybuffer';
    
        // Set User-Agent
        (typeof config.headers != "object") && (config.headers = {})
        if (!config.headers['User-Agent']) {
            config.headers['User-Agent'] = getRandomUA()
        }
    
        return new Promise((resolve, reject) => {
            console.log(`${method} URL: ${url}`);

            let reqConfig = {
                method,
                data: payload,
                ...config
            }

            axios(url, reqConfig).then(res => {
                let targetData = getTargetData(respType, res.data, charset);
                resolve(targetData)
            }).catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = Requester