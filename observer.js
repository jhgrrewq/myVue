function Observer(data) {
	this.data = data;
	this.walk(data);
	// 每次实例化一个Observer就会实例化一个Event，用Event实例来管理所有的订阅器回调，每当属性变化遍历触发订阅器回调
	this.eventBus = new Event();
}

Observer.prototype = {
	// 遍历data，如果是对象继续递归遍历
	walk: function(data) {
		Object.keys(data).forEach(key => {
			// 判断是否是对象
			if (Object.prototype.toString.call(data[key]) === '[object Object]') {
				new Observer(data[key])
			}
			this.defineReative(data, key, data[key]);
		})
	},
	defineReative: function(data, key, val) {
		Object.defineProperty(data, key, {
			get: () => {
				// 属性获取 将watcher添加到缓存列表
				if (Event.target) {
					this.eventBus.on(Event.target.exp, Event.target);
				}
				return val
			},
			set: newVal => {
				if (val === newVal) {
					return
				}
				val = newVal;

				if (Object.prototype.toString.call(newVal) === '[object Object]') {
					new Observer(newVal);
				}

				// 属性变化 遍历订阅器回调 触发watcher改变视图

				this.eventBus.notify(key);
			}
		})
	}
}

// 构建简单构造器 针对不同的exp存储
function Event() {
	this.events = {}; // 缓存列表
}

Event.prototype = {
	on: function(exp, event) {
		if (this.events[exp]) {
			this.events[exp].push(event);
		} else {
			this.events[exp] = [event];
		}

	},
	notify: function(exp) {
		this.events[exp] && this.events[exp].forEach(event => {
			event.update();
		})
	}
}
Event.target = null;