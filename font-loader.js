'use strict';

/*
TODO:
-- better AJAX function
-- combine scripts to print just one <style> tag once fonts loaded
-- test speed with fonts loaded remotely on slow connection
-- unit tests
-- inline documentation
-- npm??? ES6???
-- cross browser
-- add ttf & eot support
-- support for local fonts
*/

var FontLoader = function(doc) {
	
	// Variables
	var _doc = doc || document;

	// WOFF2 test
	var _woff2 = (function() {
	  if (_doc.FontFace) {
	    var fontFace = new FontFace('t', 'url(data:application/font-woff2,) format(woff2)', {});
	    fontFace.load();
	    return (fontFace.status === 'loading') ? true: false;
	  }
	  return false;
	}());

	// Data URI prefix & suffix
	var _prefix = (_woff2) ? 'data:application/font-woff2;base64,' : 'data:application/font-woff;base64,';
	var _suffix = (_woff2) ? 'woff2' : 'woff';


	// Methods

	// want more error handling here
	// return promise
	// beef up
	function _getBinary (file) {
	    var xhr = new XMLHttpRequest();
	    xhr.open("GET", file, false);
	    xhr.overrideMimeType("text/plain; charset=x-user-defined");
	    xhr.send(null);
	    return xhr.responseText;
	};

	// good as is
	function _base64Encode(str) {
	    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	    var encodedStr = '', i = 0, len = str.length, c1, c2, c3;
	    while (i < len) {
	        c1 = str.charCodeAt(i++) & 0xff;
	        if (i == len) {
	            encodedStr += CHARS.charAt(c1 >> 2);
	            encodedStr += CHARS.charAt((c1 & 0x3) << 4);
	            encodedStr += '==';
	            break;
	        }
	        c2 = str.charCodeAt(i++);
	        if (i == len) {
	            encodedStr += CHARS.charAt(c1 >> 2);
	            encodedStr += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
	            encodedStr += CHARS.charAt((c2 & 0xF) << 2);
	            encodedStr += '=';
	            break;
	        }
	        c3 = str.charCodeAt(i++);
	        encodedStr += CHARS.charAt(c1 >> 2);
	        encodedStr += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
	        encodedStr += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
	        encodedStr += CHARS.charAt(c3 & 0x3F);
	    }
	    return encodedStr;
	};

	// iterate over data uris and write to document
	function _writeToDocument(fontObj) {

		var head = _doc.head || _doc.getElementsByTagName('head')[0],   
		    style = document.createElement('style');

		style.appendChild(document.createTextNode("\
		@font-face {\
		    font-family: '" + fontObj.name + "';\
		    src: url('" + fontObj.url + "') format('" + _suffix + "');\
		    font-weight: " + fontObj.weight + ";\
            font-style: " + fontObj.style + ";\
		}\
		"));
		head.appendChild(style);
	};

	function _init(fontArr) {
		if (!fontArr) return;

		fontArr.forEach(function(font, index) {
			try
			{	
				font.url = _prefix + _base64Encode(_getBinary(font.uri)) + "." + _suffix;
				_writeToDocument(font);
			}
			catch(e)
			{
				console.log(e.message);
			}
		});

	};

	return {
		init  : _init,
		woff2 : _woff2
	};

};