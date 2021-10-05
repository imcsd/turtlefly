# TurtleFly

A flexible crawler framework based on NodeJS.



## Intro

TurtleFly is a Crawler framework based on Node.js, and now with the version 2.0. which is more simplify and flexible then version 1.

Turtlefly 2.0 consist Crawler schema design, task scheduler, request module and content parse module. 



## Module

- Crawler - The core class of Node Crawler, all crawler extends this class.
- Requester - Use to make Web request.
- RedisScheduler [new] - Task interaction with redis.
- Task [new] - Record task process and schedule task.

Code of framework index.js file:

```js
module.exports = {
	Crawler: require('./lib/Crawler'),
	Requester: require('./lib/Requester'),
	Scheduler: require('./lib/Scheduler')
}
```



## Installation

```
$ npm i turtlefly
```



## Main Modules API

### Crawler

> Crawler.constructor(config) 



> Crawler.loadDom(buffer html, string charset = 'utf-8') : {object} cheerio object



> Crawler.getList(object cheerioObj, object schema) : array dataList



> Crawler.getContent(object cheerioObj, object schema) : object data



### Requester

> Requester.handle(string url, {charset = "UTF-8", respType = 'object', config = {}} = {}) : Promise



### Task

> Task.constructor(object crawler)



> Task.next(bool nextPage = true, bool nextParam = false)



> Task.request({ url, charset, respType, method, config, payload })



### RedisScheduler

RedisScheduler module provide support for distributed task control.

Redis data construction:

* `${key}` for current crawler project name.

```
# Crawler task list, record task info.
turtlefly:task:${key}

# Task status - check this status when crawler start and switch to none when task finished.
# working|none
turtlefly:task:${key}:status {string}

# Pending task
turtlefly:task:${key}:pending {list} [task detail json]

# In progress task
turtlefly:task:${key}:inProgress {hash} [hask -> task detail json]
```

