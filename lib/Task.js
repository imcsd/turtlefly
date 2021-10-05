const Requester = require('./Requester')

class Task {
    constructor(crawler) {
        // Object Crawler instance
        this.crawler = crawler

        this.paramsSet = {}

        this.progress = {
            params: {
                page: 1,
            },
            paramsIndex: {}
        }
    }

    /**
     * Init progress
     * @param {Object} paramsSet | default: this.paramsSet
     */
    initProgress(paramsSet) {
        paramsSet = paramsSet ? paramsSet : this.paramsSet
        for (let param in paramsSet) {
            this.progress.paramsIndex[param] = 0;
        }
    }

    /**
     * Create the next task.
     * @param {boolean | number} nextPage Set the page increase or special a page number, default with true.
     * @param {boolean} nextParam Change this.progress.paramsIndex pointer to next parameter, default with false.
     * @return {Object|boolean} this.progress | false
     */
    next(nextPage = true, nextParam = false) {
        if (nextPage && typeof nextPage == "boolean") {
            this.progress.params.page++;
        } else if (typeof nextPage == "number") {
            this.progress.params.page = nextPage
        }

        if (nextParam) {
            for (let param in this.paramsSet) {
                if (this.progress.paramsIndex[param] + 1 < this.paramsSet[param].length) {
                    this.progress.paramsIndex[param]++;
                    return true
                } else {
                    this.progress.paramsIndex[param] = 0
                    continue
                }
            }
            console.info('No next task.');
            return false;
        }

        return this.progress
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
        let paramsMap = this.mapTaskParam(this.paramsSet);

        url = url ? url : this.getTargetUrl(this.crawler.config.urlRule, paramsMap);
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
     * @param {object} paramsSet 
     */
    mapTaskParam(paramsSet) {
        let paramsMap = {}
        for (let param in this.progress.paramsIndex) {
            paramsMap[param] = paramsSet[param][this.progress.paramsIndex[param]];
        }
        paramsMap.page = this.progress.params.page;
        return paramsMap;
    }

    /**
     * Return the target URL by parameter set.
     * @access private
     * @param {String} urlRule Url Template.
     * @param {Object} paramsSet Parameter Set.
     */
    getTargetUrl(urlRule, paramsSet) {
        for (let param in paramsSet) {
            let rule = new RegExp('{{' + param + '}}', 'g');
            urlRule = urlRule.replace(rule, paramsSet[param]);
        }
        return encodeURI(urlRule);
    }
}

module.exports = Task;