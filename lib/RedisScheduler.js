const redis = require('redis')
const crypto = require('crypto');

/**
 * @unimplement Experimental class
 */
class RedisScheduler {
    constructor({
            server, port, auth
        } = {
            server: '127.0.0.1',
            port: 6379
    }) {
        this.client = null
        this.connect({
            server, port, auth
        });
    }

    connect({
        server, port, auth
    } = {}) {
        this.client = redis.createClient(port, server)

        this.client.on('ready', function (info) {
            console.log('Connection is ready.' + info);
        });

        this.client.on('error', function (err) {
            console.error('Error ' + err);
        });
    }

    push(task) {
        this.client.lpush('crawlerTasks', JSON.stringify(task), redis.print);
    }

    pop() {
        this.client.lpop('crawlerTasks', res => {
            let task = JSON.parse(res);

            // calculate res json md5
            var md5 = crypto.createHash('md5');
            var taskHash = md5.update(res).digest('hex');

            task.hash = taskHash

            // save task to pending list
            this.client.hmset('crawlerTasksPending', taskHash, res);
            return task
        })
    }

    finish(task) {
        this.client.hdel('crawlerTasksPending', task.hash)
    }

    retry(task) {
        this.client.lpush('crawlerTasks', JSON.stringify(task), redis.print);
    }
}

module.exports = RedisScheduler