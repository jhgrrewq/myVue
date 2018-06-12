// 订阅者
function Watcher(vm, exp, cb) {
	this.vm = vm; // vm 实例
	this.exp = exp;  // 订阅 数据属性
	this.cb = cb;		// 订阅回调
	this.value = this.get(); // 实例化时候自动将自身添加到订阅器缓存列表
}

Watcher.prototype = {
	get: function() {
		Dep.target = this; // 将自身赋值
		let value = this.vm[this.exp]; // 调用数据劫持属性 get 方法
		Dep.target = null;
		return value
	},
	update: function() {
		// 新值 value
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

