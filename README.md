# TurtleJS

A crawler framework based on NodeJS.



## Intro

TurtleJS consist with three main modules: 

- Crawler - The core class of Node Crawler, all crawler extends this class.
- Requester - Use to make Web request.
- Scheduler - Scheduler for task management.

Code of framework index.js file:

```js
let TurtleJS = {
	Crawler: require('./lib/Crawler'),
	Requester: require('./lib/Requester'),
	Scheduler: require('./lib/Scheduler')
}
```

Other Modules:

- Tasker - Include some utils methods of task process.
- TaskQueue - Class of Task Queue controll.



## Main Modules API

### Crawler

> Crawler.loadDom(buffer html, string charset = 'utf-8') : {object} cheerio object



> Crawler.getList(object cheerioObj, object schema) : array dataList



> Crawler.getContent(object cheerioObj, object schema) : object data



### Requester

> Requester.get(string url, {charset = "UTF-8", respType = 'object', config = {}} = {}) : Promise



### Scheduler

> Scheduler.constructor()



> Scheduler.addCrawler(object crawlerInstance)



> Scheduler.eventHandler(String event, Object task)



> Scheduler.takeRequest(Object task) 



> Scheduler.getCrawler(String crawlerName)



## Other Modules

### Tasker

> Tasker.constructor(Object crawler)

Bind a crawler instances when create a tasker.



> Tasker.init()



> Tasker.create(Object crawlerConf)



> Tasker.createNextTask(task, crawlerConf, nextPage = true, nextParam = false)



> Tasker.doNextTask(task, crawlerConf, nextPage = true, nextParam = false)



> Tasker.request(task)



> Tasker.finish(task, result)



> Tasker.fail(task, failInfo)



> Tasker.bindScheduler(scheduler)



> Tasker.propEvent(eventName, Info)



> Tasker.mapTaskParam(task, paramList)



> Tasker.getTargetUrl(urlRule, paramSet)



### Task Queue

>TaskQueue.constructor()



>TaskQueue.push(task)



>TaskQueue.pop()