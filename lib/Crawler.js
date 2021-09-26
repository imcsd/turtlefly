/**
 * Crawler Crawler Class
 * Created: 2019-08-21 15:48:22 by Cstom
 * Last Update: 2020-03-14 00:33:46
 * Version: 1.0.1
 */

const cheerio = require("cheerio")
const Requester = require('./Requester')

class Crawler {
	constructor(config) {
		this.config = config
		this.$requester = Requester
	}

	/**
	 * Parse html buffer and return the cheerio instances.
	 * @param {buffer} html 
	 * @param {string} charset 
	 * @returns {object} cheerio object
	 */
	loadDom(html, charset = 'utf-8') {
	    if (charset != 'utf-8') {
	        html = iconv.decode(html, charset);
	    }
	
	    let $ = cheerio.load(html);
	
	    return $;
	}

	getList(cheerioObj, schema) {
		schema = schema ? schema : this.config.schema
		if (!schema) {
			console.error('Fail to parse content because no schema available.');
			return false
		}

		let domList = cheerioObj(schema.item);

		let list = []
		domList.each(function (i, elem) {
			
			let dataObj = {};
			for(let field in schema.data) {
				let el = schema.data[field].el;
				let attr = schema.data[field].attr;
				let dom = el == '' ? cheerioObj(this) : cheerioObj(this).find(el);
				let val = (attr == undefined) ? dom.text() : dom.attr(attr);
				dataObj[field] = val;
			}
			list.push(dataObj);
		});
		return list;
	}

	getContent(cheerioObj, schema) {
		schema = schema ? schema : this.config.schema
		if (!schema) {
			console.error('Fail to parse content because no schema available.');
			return false
		}

		let targetDom = cheerioObj(schema.item);

		let dataObj = {};
		for(let field in schema.data) {
			let el = schema.data[field].el;
			let attr = schema.data[field].attr;
			let dom = targetDom.find(el);
			let val = (attr == undefined) ? dom.text():dom.attr(attr);
			dataObj[field] = val;
		}
		return dataObj;
	}
}

module.exports = Crawler