// 'use strict'

(function(global, factory) {
	// 判断是否是模块导出 或者 amd 或者 浏览器环境使用
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(global.SelfVue = factory());
}(this, function() {
	let _default = {
		el: 'body',
		data: {}
	}

	let SelfVue = function SelfVue(option) {
		// 从右到左依次覆盖属性
		this.extend(this, _default, option);
		this.el = document.querySelector(this.el)

		// 代理 SelfVue.data[key] 可以通过SelfVue[key]访问

		Object.keys(this.data).forEach(key => {
			this.proxy(key);
		})


		// 监听所有数据变化
		new Observer(this.data);
		// 提取模板指令，初始化视图，并绑定订阅
		new Compiler(this.el, this);
		// 所有准备完毕后 
		this.mounted.call(this);

	}

	SelfVue.prototype = {
		extend: function() {
			for (let i = 1; i < arguments.length; i++) {
				for (let key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						this[key] = arguments[i][key];
					}
				}
			}
		},
		proxy: function(key) { // 访问 SelfVue对象 相当于访问 SelfVue[data] 
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
	}

	return SelfVue
}))