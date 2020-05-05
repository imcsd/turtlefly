/**
 * Task Queue Class
 * Created: 2019-11-02 16:41:50 by icsd
 * Last Update: 2019-08-21 15:48:22
 * Version: 1.0.0
 */


class TaskQueue {
	constructor() {
		this.queue = []
	}

	push(task) {
		let taskStr = JSON.stringify(task)
		this.queue.push(taskStr)

		return true
	}

	pop() {
		let taskStr = this.queue.pop()
		return JSON.parse(taskStr)
	}
}

module.exports = () => {
	return new TaskQueue
}