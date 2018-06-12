// 'use strict'
(function(global, factory) {
	// 判断是否是模块导出 或者 amd 或者 浏览器环境使用
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.SelfVue = factory());
}(this, function() {

	let SelfVue = function SelfVue(options = {}) {
		// 把 options 上的属性添加到 this 实例上
		Object.assign(this, options)
		this.data = this.data || {}
		this.el = document.querySelector(this.el || 'body')

		// 代理 SelfVue.data[key] 可以通过SelfVue[key]访问 如访问 this.title 等同 this.data.title
		Object.keys(this.data).forEach(key => {
			this.proxy(key);
		})
		// 监听所有数据变化
		observe(this.data)
		// new Observer(this.data);
		// 提取模板指令，初始化视图，并绑定订阅
		new Compiler(this, this.el);
		// 所有准备完毕后 
		this.mounted.call(this);
	}

	SelfVue.prototype.proxy = function(key) { 
		Object.defineProperty(this, key, {
			enumberable: false,
			configurable: true,
			get: () => {
				return this.data[key];
			},
			set: newVal => {
				if (this.data[key] === newVal) {
					return
				}
				this.data[key] = newVal;
			}
		})
	}

	return SelfVue
}))