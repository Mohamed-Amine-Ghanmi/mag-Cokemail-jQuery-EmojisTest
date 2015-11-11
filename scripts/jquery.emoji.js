

(function($, window, document) {
	var event1;
	var ELEMENT_NODE = 1;
	var TEXT_NODE = 3;
	var TAGS_BLOCK = ['p', 'div', 'pre', 'form'];
	var KEY_ESC = 27;
	var KEY_TAB = 9;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	
	$.emojiarea = {
		max: 90,
		path: '',
		icons: {},
		defaults: {
			button: null,
			buttonLabel: '',
			buttonPosition: 'after'
		}
	};



	$.fn.emojiarea = function(options) {
		options = $.extend({}, $.emojiarea.defaults, options);
		return this.each(function() {
			var $textarea = $(this);
			if ('contentEditable' in document.body && options.wysiwyg !== false) {
				new Emoji_TextArea($textarea, options);
			}
		});
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var util = {};

	util.replaceSelection = (function() {
		if (window.getSelection) {
			return function(content) {
				var range, sel = window.getSelection();
				var node = typeof content === 'string' ? document.createTextNode(content) : content;
				if (sel.getRangeAt && sel.rangeCount) {
					range = sel.getRangeAt(0);
					range.deleteContents();
					range.insertNode(document.createTextNode(' '));
					range.insertNode(node);
					range.insertNode(document.createTextNode(' '));
					range.setStart(node, 0);
					
					window.setTimeout(function() {
						range = document.createRange();
						range.setStartAfter(node);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}, 0);
				}
			}
		} else if (document.selection && document.selection.createRange) {
			return function(content) {
				var range = document.selection.createRange();
				if (typeof content === 'string') {
					range.text = content;
				} else {
					range.pasteHTML(content.outerHTML);
				}
			}
		}
	})();


	util.extend = function(a, b) {
		if (typeof a === 'undefined' || !a) { a = {}; }
		if (typeof b === 'object') {
			for (var key in b) {
				if (b.hasOwnProperty(key)) {
					a[key] = b[key];
				}
			}
		}
		return a;
	};

	util.escapeRegex = function(str) {
		return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
	};

	util.htmlEntities = function(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var EmojiArea = function() {};

	EmojiArea.createIcon = function(emoji) {
		var filename = $.emojiarea.icons[emoji];
		var path = $.emojiarea.path || '';
		if (path.length && path.charAt(path.length - 1) !== '/') {
			path += '/';
		}
		return '<img src="' + path + filename + '" alt="' + util.htmlEntities(emoji) + '">';
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/**
	 * Editor
	 * 
	 * @constructor
	 * @param {object} $textarea
	 * @param {object} options
	 */
	var Emoji_TextArea = function($textarea, options) {
		var self = this;

		this.options = options;
		this.$textarea = $textarea;
		this.$editor = $('<div>').addClass('emoji-wysiwyg-editor');
		this.$editor.text($textarea.val());
		this.$editor.attr({contenteditable: 'true'});
		this.$editor.on('blur keyup paste', function() { return self.onChange.apply(self, arguments); });
		this.$editor.on('mousedown focus', function() { document.execCommand('enableObjectResizing', false, false); });
		this.$editor.on('blur', function() { document.execCommand('enableObjectResizing', true, true); });
		this.$editor.on('click focus', function(e) { //or use dblclick
			//if( e.which == 2 ){
			//alert( window.getSelection().getRangeAt(0).startOffset);
			//alert($textarea.val().length);
			event1 = e;
			Tooltip.show(self);
			e.stopPropagation();
			//}
			 });

		//-------------------------------------------------------------------------------------------------
		// To load Emojis when using the key :1: in the text area 
		var html = this.$editor.text();
		var emojis = $.emojiarea.icons;
		for (var key in emojis) {
			if (emojis.hasOwnProperty(key)) {
				html = html.replace(new RegExp(util.escapeRegex(key), 'g'), EmojiArea.createIcon(key));
			}
		}
		this.$editor.html(html);

		$textarea.hide().after(this.$editor);
		
	};	
//------------------------------------------------------------------------------------------------------------------------------


	Emoji_TextArea.prototype.onChange = function() { 
		this.$textarea.val(this.val()).trigger('change');
	};

	Emoji_TextArea.prototype.insert = function(emoji) {
		var content;
		var $img = $(EmojiArea.createIcon(emoji));
		if ($img[0].attachEvent) {
			$img[0].attachEvent('onresizestart', function(e) { e.returnValue = false; }, false);
		}
		this.$editor.trigger('focus');
		try { util.replaceSelection($img[0]); } catch (e) {}
		this.onChange();
	};

//------------------------------------------------------------------------------------------------------------------------------
	// POUR NE PAS AJOUTER LES SMILY SI JE FAIT UN FOCUS EN DEHORS DU TEXTAREA
	Emoji_TextArea.prototype.val = function() {
		var lines = [];
		var line  = [];

		var flush = function() {
			lines.push(line.join(''));
			line = [];
		};

		var sanitizeNode = function(node) {
			if (node.nodeType === TEXT_NODE) {
				line.push(node.nodeValue);
			} else if (node.nodeType === ELEMENT_NODE) {
				var tagName = node.tagName.toLowerCase();
				var isBlock = TAGS_BLOCK.indexOf(tagName) !== -1;

				if (isBlock && line.length) flush();

				if (tagName === 'img') {
					var alt = node.getAttribute('alt') || '';
					if (alt) line.push(alt);
					return;
				} else if (tagName === 'br') {
					flush();
				}

				var children = node.childNodes;
				for (var i = 0; i < children.length; i++) {
					sanitizeNode(children[i]);
				}

				if (isBlock && line.length) flush();
			}
		};

		var children = this.$editor[0].childNodes;
		for (var i = 0; i < children.length; i++) {
			sanitizeNode(children[i]);
		}

		if (line.length) flush();

		return lines.join('\n');
	};
//------------------------------------------------------------------------------------------------------------------------------

	util.extend(Emoji_TextArea.prototype, EmojiArea.prototype);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	/**
	 * Emoji ToolTip
	 *
	 * @constructor
	 * @param {object} emojiarea
	 */
	var Tooltip = function() {
		var self = this;
		var $body = $(document.body);
		var $window = $(window);

		this.visible = false;
		this.emojiarea = null;
		this.$menu = $('<div>');
		this.$menu.addClass('emoji-menu');
		this.$menu.hide();
		this.$items = $('<div>').appendTo(this.$menu);

		$body.append(this.$menu);
		//------------------------------------------------------------------------------
		//This is for hidding the tooltip when clicking outside of the textarea
		$body.on('keydown', function(e) {
			if (e.keyCode === KEY_ESC || e.keyCode === KEY_TAB) {
				self.hide();
			}
		});

		$body.on('mouseup', function() {
			self.hide();
		});

		$window.on('resize', function() {
			if (self.visible) self.reposition();
		});

		this.$menu.on('mouseup', 'a', function(e) {
			e.stopPropagation();
			return false;
		});
		//---------------------------------------------------------------------------------
 		this.$menu.on('click', 'a', function(e) {
			var emoji = $('.label', $(this)).text();
			window.setTimeout(function() {
				self.onItemSelected.apply(self, [emoji]);
			}, 0);
			e.stopPropagation();
			return false;
		});

		this.load();
	};

	Tooltip.prototype.onItemSelected = function(emoji) {
		this.emojiarea.insert(emoji);
		this.hide();
	};

	Tooltip.prototype.load = function() {
		var html = [];
		var options = $.emojiarea.icons;
		var path = $.emojiarea.path;
		if (path.length && path.charAt(path.length - 1) !== '/') {
			path += '/';
		}
		var i=0;
		for (var key in options) {
			if(++i>$.emojiarea.max)
				break;
			else if (options.hasOwnProperty(key)) {
				var filename = options[key];
				html.push('<a href="javascript:void(0)" title="' + util.htmlEntities(key) + '">' + EmojiArea.createIcon(key) + '<span class="label">' + util.htmlEntities(key) + '</span></a>');
			}
		}

		this.$items.html(html.join(''));
	};

	

	Tooltip.prototype.hide = function(callback) {
		if (this.emojiarea) {
			this.emojiarea.menu = null;
			this.emojiarea = null;
		}
		this.visible = false;
		this.$menu.hide();
	};

	

	Tooltip.prototype.reposition = function() {
		this.$menu.css({
			top: event1.pageY + 20,
			left: event1.pageX + 80
		});
	};
	Tooltip.prototype.show = function(emojiarea) {
		if (this.emojiarea && this.emojiarea === emojiarea) return;
		this.emojiarea = emojiarea;
		this.emojiarea.menu = this;

		this.reposition();
		this.$menu.show();
		this.visible = true;
	};
	Tooltip.show = (function() {
		var menu = null;
		return function(emojiarea) {
			menu = menu || new Tooltip();
			menu.show(emojiarea);
		};
	})();
	

})(jQuery, window, document);