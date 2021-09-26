const Requester = require('./Requester')

class Task {
    constructor(crawler) {
        // Object Crawler instance
        this.crawler = crawler

        // Parameter index for crawler param list
        this.paramIndex = {}
        for (let param in this.crawler.config.urlParams) {
            this.paramIndex[param] = 0;
        }

        this.params = {
            page: 1
        }
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
            this.params.page++;
        } else if (typeof nextPage == "number") {
            this.params.page = nextPage
        }

        if (nextParam) {
            for (let param in this.paramIndex) {
                if (this.paramIndex[param] + 1 < this.crawler.config.urlParams[param].length) {
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

        return this
    }

    /**
     * Request current task
     * @returns {Object} Requester
     */
    request({
        url,
        charset,
        respType,
        method,
        config,
        payload
    }) {
        let paramSet = this.mapTaskParam(this.crawler.config.urlParams);

        url = url ? url : this.getTargetUrl(this.crawler.config.urlRule, paramSet);
        let conf = this.crawler.config.request

        ;(charset) && (conf.charset = charset)
        ;(respType) && (conf.respType = respType)
        ;(method) && (conf.method = method)
        ;(config) && (conf.config = config)
        ;(payload) && (conf.payload = payload)


        return Requester.handle(url, conf);
    }

    /**
     * @access private
     * @param {object} task 
     * @param {object} paramList 
     */
    mapTaskParam(paramList) {
        let paramSet = {}
        for (let param in this.paramIndex) {
            paramSet[param] = paramList[param][this.paramIndex[param]];
        }
        paramSet.page = this.params.page;
        return paramSet;
    }

    /**
     * Return the target URL by parameter set.
     * @access private
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