function Watcher(vm, exp, cb) {
	this.vm = vm;
	this.exp = exp;
	this.cb = cb;
	this.value = this.get(); // 实例化时候自动将自身添加到订阅器缓存列表
}

Watcher.prototype = {
	get: function() {
		Event.target = this; // 将自身赋值
		let value = this.vm[this.exp]; // 调用数据劫持属性get方法
		Event.target = null;
		return value
	},
	update: function() {
		let value = this.vm[this.exp];
		let oldValue = this.value;
		if (value === oldValue) {
			return
		}
		this.value = value;
		// 调用回调
		this.cb.call(this.vm, value, oldValue)
	}
}