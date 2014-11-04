/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view widget
 */
(function() {
	'use strict';
	define(['gcviz-vm-header',
			'gcviz-i18n'
	], function(headerVM, i18n) {
		var initialize,
			addToolbars;

		initialize = function($mapElem) {
			var $header, tp, ext,
				config = $mapElem.header,
				configTools = config.tools,
				configAbout = config.about,
				mapid = $mapElem.mapframe.id,
				title = config.title.value,
				node = '',
				menu = '';

			$mapElem.find('#' + mapid).prepend('<div id="head' + mapid + '" class="gcviz-head"></div>');
			// Find the header element to insert things in
			$header = $mapElem.find('.gcviz-head');

			// set the side class extension to know where to put tools and buttons
			ext = config.side === 1 ? '-r' : '-l';

			// set title
			if (typeof title !== 'undefined') {
				node += '<label class="gcviz-head-title' + ext + ' unselectable">' + title + '</label>';
			}

			// add buttons
			node += '<div class="gcviz-head-btn' + ext + '">';

			// set about button
			if (configAbout.enable) {
				node += '<button class="gcviz-head-about" tabindex="0" data-bind="buttonBlur, click: aboutClick, tooltip: { content: tpAbout }"></button>';

				// dialog text to show about
				node += '<div data-bind="uiDialog: { title: $root.lblAboutTitle, width: 400, height: 300, ok: $root.dialogAboutOk, close: $root.dialogAboutOk, openDialog: \'isAboutDialogOpen\' }">' +
						'<span data-bind="text: $root.aboutInfo1"></span>' +
						'<div data-bind="if: aboutType === 2"><a data-bind="attr: { href: $root.aboutURL, title: $root.aboutURLText }, text: $root.aboutURLText" tabindex="0" target="_blank"></a>' +
						'<span data-bind="text: $root.aboutInfo2"></span></div>' +
					'</div>';
			}

			//TODO: add this functionnality
			// add link if link map is enable
			//if (config.link) {
				//node += '<button class="gcviz-head-link" tabindex="0" data-bind="click: linkClick, tooltip: { content: tpLink }"></button>';
			//}

			// add inset button if inset are present
			if (config.inset) {
				node += '<button class="gcviz-head-inset" tabindex="0" data-bind="buttonBlur, click: insetClick, tooltip: { content: tpInset }"></button>';
			}

			// add print button
			if (config.print.enable) {
				node += '<button class="gcviz-head-print" tabindex="0" data-bind="buttonBlur, click: printClick, tooltip: { content: tpPrint }"></button>';
			}

			// add fullscreen button
			if (config.fullscreen) {
				node += '<button class="gcviz-head-fs" tabindex="0" data-bind="buttonBlur, click: fullscreenClick, tooltip: { content: tpFullScreen }, css: { \'gcviz-head-fs\': isFullscreen() === false, \'gcviz-head-reg\': isFullscreen() === true }"></button>';
			}

			// set help button (help is always visible)
			node += '<button class="gcviz-head-help" tabindex="0" data-bind="buttonBlur, click: helpClick, tooltip: { content: tpHelp }"></button>';

			node += '</div>';

			$header.append(node);
			if (configTools.enable === true) {
				// Add a collapsible container for tools to hold all the toolbars instead of having a tools icon
				$mapElem.find('.gcviz-head').append('<div id="divToolsOuter' + mapid + '" class="gcviz-tbcontainer' + ext + '" data-bind="attr: { style: xheightToolsOuter }"><div id="divToolsInner' + mapid + '" class="gcviz-toolsholder" data-bind="attr: { style: xheightToolsInner }"></div></div>');
				menu = '<div id="gcviz-menu' + mapid + '" class="gcviz-menu" data-bind="uiAccordion: { heightStyle: \'content\', collapsible: true }, attr: { style: xheightToolsOuter }">' +
							'<h3 class="gcviz-menu-title gcviz-menu-title' + ext + '"><span data-bind="text: lblMenu"></span></h3>' +
							'<div id="gcviz-menu-cont' + mapid + '" class="gcviz-menu-cont" data-bind="uiAccordion: { heightStyle: \'content\', collapsible: true, active: false }, attr: { style: xheightToolsOuter }">' +
								addToolbars($mapElem, ext) +
							'</div>' +
						'</div>';
						
				$mapElem.find('.gcviz-toolsholder').append(menu);
			}

			return (headerVM.initialize($header, mapid, config));
		};

		addToolbars = function(config, ext) {
			var cfgDraw = config.toolbardraw,
				cfgNav = config.toolbarnav,
				cfgLeg = config.toolbarlegend,
				cfgData = config.toolbardata,
				index = false,
				tools = ['','','',''];
			
			// check what toolbar is enable, the order and the index of the expand one
			if (cfgDraw.enable) {
				tools[cfgDraw.pos] = '<h3 class="gcviz-panel-title">' + i18n.getDict('%toolbardraw-name') + '</h3>' +
										'<div class="gcviz-tbdraw-content gcviz-tbcontent" gcviz-exp="' + cfgDraw.expand + '"></div>';
			}
			if (cfgNav.enable) {
				tools[cfgNav.pos] = '<h3 class="gcviz-panel-title gcviz-nav-panel">' + i18n.getDict('%toolbarnav-name') + '</h3>' +
										'<div class="gcviz-tbnav-content gcviz-tbcontent" gcviz-exp="' + cfgNav.expand + '"></div>';
			}
			if (cfgLeg.enable) {
				tools[cfgLeg.pos] = '<h3 class="gcviz-panel-title">' + i18n.getDict('%toolbarlegend-name') + '</h3>' +
										'<div class="gcviz-tbleg-content gcviz-tbcontent-leg" gcviz-exp="' + cfgLeg.expand + '"></div>';
			}
			if (cfgData.enable) {
				tools[cfgData.pos] = '<h3 class="gcviz-panel-title">' + i18n.getDict('%toolbardata-name') + '</h3>' +
										'<div class="gcviz-tbdata-content gcviz-tbcontent" gcviz-exp="' + cfgData.expand + '"></div>';
			}

			return tools.toString().replace(/,/g, '');
		};

		return {
			initialize: initialize
		};
	});
}).call(this);
