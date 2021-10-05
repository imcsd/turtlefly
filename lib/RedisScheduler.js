const redis = require('redis')
const crypto = require('crypto');

/**
 * @unimplement Experimental class
 */
class RedisScheduler {
    constructor({
        host = '127.0.0.1', port = 6379, password, prefix = "turtlefly:"
    } = {}) {
        this.client = null
        this.connect({
            host, port, password, prefix
        });
    }

    connect({
        host, port, password, prefix
    } = {}) {
        this.client = redis.createClient({ host, port, password, prefix })

        this.client.on('ready', function () {
            console.log('Redis connection is ready.');
        });

        this.client.on('error', function (err) {
            console.error('Error ' + err);
        });
    }

    push(key, task) {
        return new Promise((resolve, reject) => {
            this.client.RPUSH(`task:${key}:pending`, JSON.stringify(task),
                (err, res) => err ? reject(err) : resolve(JSON.parse(res)))
        })
    }

    pop(key, block = false) {
        return new Promise((resolve, reject) => {
            let cb = (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    let task = JSON.parse(res[1]);

                    // calculate res json md5
                    var md5 = crypto.createHash('md5');
                    var taskHash = md5.update(res[1]).digest('hex');

                    task.hash = taskHash

                    // save task to pending list
                    this.client.HMSET(`task:${key}:inProgress`, task.hash, JSON.stringify(task));
                    resolve(task)
                }
            }

            if (block) {
                this.client.BLPOP(`task:${key}:pending`, "0", cb)
            } else {
                this.client.LPOP(`task:${key}:pending`, cb)
            }
        })
    }

    finish(key, task) {
        return new Promise((resolve, reject) => {
            this.client.HDEL(`task:${key}:inProgress`, task.hash,
                (err, res) => err ? reject(err) : resolve(res))
        })
    }

    retry(key, task) {
        task.retryTimes = 1;
        this.finish(key, task)
        return this.push(key, task)
    }

    status(key, value) {
        return new Promise((resolve, reject) => {
            if (value === undefined) {
                this.client.GET(`task:${key}:status`,
                    (err, res) => err ? reject(err) : resolve(res))
            } else {
                this.client.SET(`task:${key}:status`, value,
                    (err, res) => err ? reject(err) : resolve(res))
            }
        })
    }

    getData(key, field) {
        return new Promise((resolve, reject) => {
            this.client.HGET(`data:${key}`, field,
                (err, res) => err ? reject(err) : resolve(JSON.parse(res)))
        })
    }

    setData(key, field, data) {
        return new Promise((resolve, reject) => {
            this.client.HMSET(`data:${key}`, field,
                (err, res) => err ? reject(err) : resolve(res))
        })
    }
}

module.exports = RedisScheduler