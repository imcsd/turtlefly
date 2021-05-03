/**
 * Scheduler Class
 * Created: 2019-11-02 16:41:50 by icsd
 * Last Update: 2019-08-21 15:48:22
 * Version: 1.0.0
 */

const TaskQueue = require('./TaskQueue')
const Requster = require('./Requester')

class Scheduler {
	constructor() {
		console.warn('Scheduleer is deprecated and has been removed in TrutleFly 2.0.');
		this.TaskQueue = TaskQueue
		this.crawlerList = {}
		this.taskList = {
			Requesting: {}
		}
	}

	/**
	 * addCrawler
	 * @param {Object} crawler Crawler instances.
	 */
	addCrawler(crawler) {
		let crawlerName = crawler.config.name
		this.crawlerList[crawlerName] = crawler // Push crawler object to crawler list.
		this.taskList.Requesting[crawlerName] = [] // Initialize requesting list of crawler.
		crawler.tasker.bindScheduler(this).init()
	}

	/**
	 * 
	 * @param {String} event event name
	 * @param {Object} info Task object
	 */
	eventHandler(event, task) {
		// console.log(event, task);

		switch (event) {
			case 'request':
				this.takeRequest(task)
				break;
			default:
				break;
		}
	}

	takeRequest(task) {
		// Get crawler instance.
		let crawler = this.getCrawler(task.crawlerName)
		if(!crawler) {
			console.error(`${task.crawlerName} crawler is not exist in crawler list.`);
			return false
		}

		// Check request URL.
		if(!task.url) {
			crawler.tasker.fail(task, 'Request url is not exist.')
			return false
		}

		// Check Request number limit.
		let requestLimit = crawler.config.maxRequestNum
		requestLimit = (requestLimit != undefined && requestLimit != 0) ? requestLimit : false
		if (requestLimit && this.taskList.Requesting[task.crawlerName].length >= requestLimit) {
			// If requesting task is full, push task into Task Queue.
			this.TaskQueue.push(task)
		} else {
			let param = {
				charset: crawler.config.charset
			}
			crawler.config.respType && (param.respType = crawler.config.respType)
			
			Requster.get(task.url, param).then(res => {
				crawler.tasker.finish(task, res)
			}).catch(err => {
				crawler.tasker.fail(task, err)
			})
		}
	}

	/**
	 * Get crawler instance by crawler name.
	 * @param {String} crawlerName Crawler name
	 */
	getCrawler(crawlerName) {
		let crawler = this.crawlerList[crawlerName]
		if (crawler) {
			return crawler
		} else {
			return false
		}
	}
}

module.exports = Scheduler