const Requester = require('./Requester')

class Task {
    constructor(crawler) {
        this.crawler = crawler
        this.crawler.__proto__.constructor.name

        // Parameter index for crawler param list
        this.paramIndex = {}
        for (let param in this.crawler.config.params) {
            this.paramIndex[param] = 0;
        }

        this.param = {
            page: 1
        }
    }

    request() {
        let paramSet = this.mapTaskParam(this.crawler.config.params);
        let url = this.getTargetUrl(this.crawler.config.urlRule, paramSet);
        
        return Requester.handle(url, this.crawler.config.request);
    }

	/**
	 * Create the next task.
	 * @param {Object} task Last task object.
	 * @param {Object} crawlerConf The config of the Crawler.
	 * @param {boolean | number} nextPage Set the page increase or special a page number.
	 * @param {boolean} nextParam Change URL to next parameter.
	 */
     next(nextPage = true, nextParam = false) {
		if (nextPage && typeof nextPage == "boolean") {
			this.param.page++;
		} else if (typeof nextPage == "number") {
			this.param.page = nextPage
		}

		if (nextParam) {
			for (let param in this.paramIndex) {
				if (this.paramIndex[param] + 1 < this.crawler.config.params[param].length) {
					this.paramIndex[param]++;
					return this;
				} else {
					this.paramIndex[param] = 0
					continue
				}
			}
			console.info('No next task.');
			return false;
		}

		return task
	}

    /**
     * @param {object} task 
     * @param {object} paramList 
     */
    mapTaskParam(paramList) {
        let paramSet = {}
        for (let param in this.paramIndex) {
            paramSet[param] = paramList[param][this.paramIndex[param]];
        }
        paramSet.page = this.page;
        return paramSet;
    }

    /**
     * Return the target URL by parameter set.
     * @param {String} urlRule Url Template.
     * @param {Object} paramSet Parameter Set.
     */
    getTargetUrl(urlRule, paramSet) {
        for (let param in paramSet) {
            let rule = new RegExp('{{' + param + '}}', 'g');
            urlRule = urlRule.replace(rule, paramSet[param]);
        }
        return encodeURI(urlRule);
    }
}

module.exports = Task;