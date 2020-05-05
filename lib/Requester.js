/**
 * Requester Module
 * Created: 2019-11-02 02:43:21
 * Last Update: 2020-02-18 16:18:20
 * @version: 1.0.2
 * @author: icsd
 */

const axios = require('axios');
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

/**
 * 
 * @param {String} url - Request URL
 * @param {String} charset - charset of the page
 * @param {String} respType - Set response type, return a cheerio Object by default, Option: text | buffer | json
 * @param {Object} config - config for axios: https://github.com/axios/axios#request-config
 */
function get(url, {charset = "UTF-8", respType = 'object', config = {}} = {}) {
	console.log(`Request URL: ${url}`);
	
	// Fetch response as arraybuffer
	config.responseType = 'arraybuffer';

	// Set User-Agent
	(typeof config.headers != "object") && (config.headers = {})
	if (!config.headers['User-Agent']) {
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
		config.headers['User-Agent'] = getRandomUA()
	}
	
	return new Promise((resolve, reject) => {
		axios.get(url, config).then(res => {
			// decode the charset if isn't UTF-8.
			if (charset.toUpperCase() != 'UTF-8') {
				res.data = iconv.decode(res.data, charset);
			}

			// Process the response to special data type.
			switch (respType) {
				case 'text':
					let str = String.fromCharCode.apply(null, new Uint16Array(res.data));
					resolve(str) // Response origional data.
					break;
				case 'buffer':
					resolve(res.data) // Response origional data.
					break;
				case 'json':
					resolve(JSON.parse(res.data))
					break;
				default:
					let $ = cheerio.load(res.data);
					resolve($) // Response cheerio object
					break;
			}
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	get
}