function Compiler(vm, el) {
	this.el = el;
	this.vm = vm;
	this.fragment = null;
	this.init();
}

Compiler.prototype = {
	// 不在dom上直接操作，而是在文档片段节点中操作，在 appendChild 到原来的dom上
	init: function() {
		if (this.el) {
			this.fragment = this.node2Fragment(this.el);
			this.compile(this.fragment);
			this.el.appendChild(this.fragment);
		} else {
			console.log('dom节点不存在')
		}
	},
	node2Fragment: function(el) {
		let child, fragment = document.createDocumentFragment();
		// 不断将 dom 移到 fragment 中
		while (child = el.firstChild) {
			fragment.appendChild(child);
		}
		return fragment
	},
	compile: function(root) {
		let children = root.children;
		for (let i = 0; i < children.length; i++) {
			let node = children[i]
			// 元素节点 进而判断属性
			if (this.isElementNode(node)) {
				this.compileElement(node)
			}
			// 文本内容
			if (/\{\{([^\}]+)\}\}/.test(node.textContent)) {
				this.compileText(node, node.textContent, /\{\{([^\}]+)\}\}/.exec(node.textContent)[1])
			}
			if (node.children.length) {
				console.log(node)
				// 子节点继续遍历
				this.compile(node)
			}
		}
	},
	compileElement: function(node) {
		let nodeAttrs = node.attributes
		Array.prototype.forEach.call(nodeAttrs, attr => {
			let attrName = attr.name
			let exp = attr.nodeValue

			// 判断 v-model 
			if (attrName.indexOf('v-model') > -1) {
				this.compileModel(node, this.vm, exp)
			}
			if (attrName.indexOf('v-on') > -1 || /^@/.test(attrName)) {
				let event = attrName.indexOf('v-on') > -1
					? attrName.slice(5)
					: /^@/.test(attrName) ? attrName.slice(2) : ''
				this.compileEvent(node, this.vm, exp, event)
			}

			// 处理后去除该属性
			node.removeAttribute(attrName)
		})
	}, 
	// 处理文本节点
	compileText: function(node, expTextContent, exp) {
		console.log(node, expTextContent, exp)
		this.updateText(node, expTextContent, this.vm[exp])
		// 初始化 Watcher 
		// 绑定 数据属性 和对应更新回调
		new Watcher(this.vm, exp, val => {
			this.updateText(node, expTextContent, exp)
		})
	},
	// 处理 v-model 属性节点
	compileModel: function(node, vm, exp) {
		this.updateModel(node, vm[exp])
		// 初始化 Watcher 
		// 绑定 数据属性 和对应更新回调
		new Watcher(this.vm, exp, val => {
			this.updateModel(node, vm[exp])
		})

		// 上面只是做了数据到视图的单向绑定，视图对数据的修改是通过绑定节点的 input 事件
		node.addEventListener('input', e => {
			let value = e.target.value 
			if (this.vm[exp] === value) return
			this.vm[exp] = value
		}, false)
	},
	// 处理事件属性节点
	compileEvent: function(node, vm, exp, event) {
		let cb = vm.methods && vm.methods[exp]
		// 事件监听
		cb && node.addEventListener(event, cb.bind(vm), false)
	},
	// 更新 model
	updateModel: function(node, value) {
		node.value = typeof val === 'undefined' ? '' : val
	},
	// 更新 text
	updateText: function(node, expTextContent, val) {
		let value = typeof val === 'undefined' ? '' : val
		node.textContent = expTextContent.replace(/\{\{([^\}]+)\}\}/, value)
	},
	// 判断是否是元素结点
	isElementNode: function(node) {
		return node.nodeType === 1
	}
}