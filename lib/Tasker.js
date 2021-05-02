/**
 * DataCrawler Tasker Module
 * @author Cstom
 * Created: 2019-08-20 19:17:08
 * Last Update: 2020-02-16 22:45:43
 * Version: 1.0.2
 */


class Tasker {
	/**
	 * Constructor
	 * @param {Object} crawler Crawler object of Crawler class.
	 */
	constructor(crawler) {
		this.crawler = crawler
		this.handler = {}

		// Save the status of the hook, run the hook if false.
		this.hookStatus = {
			beforeCreate: false
		}
	}

	/**
	 * initTask - Initialize task.
	 * @param {Object} config Crawler Project Config Object.
	 */
	init() {
		let task = this.create()

		this.request(task)

		return this
	}

	/**
	 * create the first task
	 * @param {object} crawlerConf 
	 * @param {string} scheme - the scheme name in crawlConf.scheme
	 */
	create(crawlerConf) {
		crawlerConf = crawlerConf ? crawlerConf : this.crawler.config

		if(this.hookStatus.beforeCreate) {
			this.hookStatus.beforeCreate = false
		} else if(typeof this.beforeCreate == 'function') {
			this.hookStatus.beforeCreate = true
			this.beforeCreate(crawlerConf)
			return
		}

		let crawlerName = this.crawler.__proto__.constructor.name

		
		let task = {
			crawlerName,
			param: {},
			page: 1
		};

		for (let param in crawlerConf.urlParam) {
			task.param[param] = 0;
		}

		return task
	}

	/**
	 * Create the next task.
	 * @param {Object} task Last task object.
	 * @param {Object} crawlerConf The config of the Crawler.
	 * @param {boolean | number} nextPage Set the page increase or special a page number.
	 * @param {boolean} nextParam Change URL to next parameter.
	 */
	createNextTask(task, crawlerConf, nextPage = true, nextParam = false) {
		if (nextPage && typeof nextPage == "boolean") {
			task.page++;
		} else if (typeof nextPage == "number") {
			task.page = nextPage
		}

		if (nextParam) {
			for (let param in task.param) {
				if (task.param[param] + 1 < crawlerConf.urlParam[param].length) {
					task.param[param]++;
					return task;
				} else {
					task.param[param] = 0
					continue
				}
			}
			console.info('No next task.');
			return false;
		}

		return task
	}

	doNextTask(task, crawlerConf, nextPage = true, nextParam = false) {
		crawlerConf = crawlerConf ? crawlerConf : this.crawler.config
		let nextTask = this.createNextTask(task, crawlerConf, nextPage, nextParam)

		if (nextTask) {
			this.request(nextTask)
		} else {
			return false
		}
	}

	/**
	 * Sent a request task to Scheduler.
	 * @param {Object} task schedule task object
	 */
	request(task) {
		task.type = 'request'

		if (task.param) {
			let paramSet = this.mapTaskParam(task, this.crawler.config.urlParam)
			let url = this.getTargetUrl(this.crawler.config.urlRule, paramSet)
			task.url = url
		}

		this.propEvent('request', task)
	}

	/**
	 * Handle scheduler finished result.
	 * @param {Object} task Task Object
	 * @param {Mixed} result Result of task.
	 */
	finish(task, result) {
		let handler = this.crawler.handler[task.type]
		if (handler && typeof handler == 'function') {
			handler(result, task)
		} else {
			console.error(`No handler to parse this type of task: ${task.type}`);
			return false
		}
	}

	fail(task, failInfo) {
		let errHandler = this.crawler.errHandler
		if (errHandler && typeof errHandler[task.type] == 'function') {
			let handler = errHandler[task.type]
			handler(failInfo, task)
		} else {
			console.error(`Task is fail, and no error handler registered for the type of task: ${task.type}`);
			console.error(`Task detail: ${JSON.stringify(task)} \nFail detail: `);
			if (failInfo.message) {
				console.error(failInfo.message);
				if (failInfo.stack) console.error(failInfo.stack);
			} else {
				// If no error message, display the error object:
				console.error(`Task fail info: ${JSON.stringify(failInfo)}`);
			}
			
			return false
		}
	}

	/**
	 * seteventHandler
	 * @param {Function} handler the function to listen event
	 */
	bindScheduler(scheduler) {
		this.Scheduler = scheduler
		return this
	}

	propEvent(eventName, Info) {
		if (this.Scheduler) {
			this.Scheduler.eventHandler(eventName, Info)
		} else {
			console.error('No Scheduler bind to the tasker.');
		}
	}

	/**
	 * Fetch the parameter data corresponding to task.param index.
	 * @param {object} task 
	 * @param {object} paramList 
	 */
	mapTaskParam(task, paramList) {
	    let paramSet = {}
	    for (let param in task.param) {
	        paramSet[param] = paramList[param][task.param[param]];
	    }
	    paramSet.page = task.page;
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

module.exports = Tasker