function Compiler(el, vm) {
	this.el = el;
	this.vm = vm;
	this.fragment = null;
	this.init();
}

Compiler.prototype = {
	// 不在dom上直接操作，而是在文档片段节点中操作，在appendChild到原来的dom上
	init: function() {
		if (this.el) {
			this.fragment = this.node2Fragment(this.el);
			this.compileElement(this.fragment);
			this.el.appendChild(this.fragment);
		} else {
			console.log('dom节点不存在')
		}
	},
	node2Fragment: function(el) {
		let child, fragment = document.createDocumentFragment();
		// 不断将dom移到fragment中
		while (child = el.firstChild) {
			fragment.appendChild(child);
		}
		return fragment
	},
	compileElement: function(node) {
		let childNodes = node.childNodes;
		let reg = /\{\{([^\}]+)\}\}/;
		// childNodes 只是一个只读的类数组
		Array.prototype.slice.call(childNodes).forEach(node => {
			let text = node.textContent;

			if (this.isElementNode(node)) {
				this.compile(node);
			} else if (this.isTextNode(node) && reg.test(text)) {


				this.compileText(node, node.textContent, reg.exec(text)[1]);
			}
			// 本身还包含子节点，继续遍历
			if (node.childNodes && node.childNodes.length) {
				this.compileElement(node);
			}
		})
	},
	compile: function(node) {
		let nodeAttrs = node.attributes;
		Array.prototype.forEach.call(nodeAttrs, attr => {
			let attrName = attr.name;

			// 判断是否是 v- 属性
			if (this.isDirective(attrName)) {
				let exp = attr.nodeValue;
				let dir = attrName.substring(2);

				if (this.isEventDirective(dir)) { // 事件指令
					this.compileEvent(node, this.vm, exp, dir);
				} else { // v-model 指令
					this.compileModel(node, this.vm, exp, dir);
				}
				// 处理完后将该属性去除
				node.removeAttribute(attrName);
			}
		})
	},
	compileModel: function(node, vm, exp, dir) {
		let value = this.vm[exp];
		this.updateModel(node, value);
		new Watcher(this.vm, exp, (val) => {
			this.updateModel(node, val);
		})

		// 上面做了数据视图的单项绑定，视图对数据的修改则是通过绑定节点的事件操作
		node.addEventListener('input', (e) => {
			let value = e.target.value;
			if (this.vm[exp] === value) {
				return
			}
			this.vm[exp] = value;
		})
	},
	compileEvent: function(node, vm, exp, dir) {
		let action = dir.split(':')[1];
		let cb = vm.methods && vm.methods[exp];

		if (action && cb) {
			node.addEventListener(action, cb.bind(vm), false);
		}
	},
	handleExp: function(exp) {
		let key = exp.split('.'),
			data = this.vm.data;
		for (let i = 0; i < key.length; i++) {
			if (data.hasOwnProperty(key[i])) {
				data = data[key[i]];
			} else {
				return undefined;
			}
		}
		return data;
	},
	compileText: function(node, expTextContent, exp) {
		let innerText = this.handleExp(exp);
		this.updateText(node, expTextContent, innerText);
		new Watcher(this.vm, exp, (val) => {
			this.updateText(node, expTextContent, val);
		})
	},
	updateModel: function(node, val) {
		node.value = typeof val === 'undefine' ? '' : val;
	},
	updateText: function(node, expTextContent, val) {
		let value = typeof val === 'undefine' ? '' : val;
		node.textContent = expTextContent.replace(/\{\{([^\}]+)\}\}/, value);
	},
	isDirective: function(attr) {
		return attr.indexOf('v-') > -1
	},
	isEventDirective: function(attr) {
		return attr.indexOf('on') > -1
	},
	isTextNode: function(node) {
		return node.nodeType === 3
	},
	isElementNode: function(node) {
		return node.nodeType === 1
	}

}