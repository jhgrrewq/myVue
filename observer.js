function Observer(data) {
	this.data = data;
	this.walk(data);
	// 每次实例化一个 Observer 就会实例化一个 Dep，用 dep 实例来管理所有的订阅器回调，每当属性变化遍历触发订阅器回调
	this.dep = new Dep();
}

// 遍历data，如果是 key 值是对象继续递归遍历
Observer.prototype.walk = function(data) {
	let childObj = {}
	Object.keys(data).forEach(key => {
		// 判断 key 的值是否是对象
		if (Object.prototype.toString.call(data[key]) === '[object Object]') {
			// 是对象继续遍历
			childObj = observe(data[key])
		}
		// 否则对 key 属性添加 getter setter
		this.defineReative(data, key, data[key]);
	})
}
Observer.prototype.defineReative = function(data, key, val) {
	Object.defineProperty(data, key, {
		get: () => {
			// 属性获取 将 watcher 添加到缓存列表
			// 设置getter 时，Dep.target 指向当前 watcher
			if (Dep.target) {
				this.dep.on(Dep.target.exp, Dep.target);
			}
			return val
		},
		set: newVal => {
			if (val === newVal) {
				return
			}
			val = newVal

			// 如果设置的新值是一个对象，添加 添加 getter setter
			if (Object.prototype.toString.call(newVal) === '[object Object]') {
				childObj = observe(newVal);
			}
			// 属性变化 遍历订阅器回调 触发watcher改变视图
			this.dep.notify(key);
		}
	})
}
function observe(data) {
	if (!data || typeof data !== 'object') {
		return 
	}
	return new Observer(data)
}

// 构建发布者 针对不同的 exp 存储
function Dep() {
	this.deps = {}; // 缓存列表
}
Dep.prototype.on = function(exp, watcher) {
	if (this.deps[exp]) {
		this.deps[exp].push(watcher);
	} else {
		this.deps[exp] = [watcher];
	}
}
Dep.prototype.notify = function(exp) {
	this.deps[exp] && this.deps[exp].forEach(watcher => {
		watcher.update();
	})
}
Dep.target = null;