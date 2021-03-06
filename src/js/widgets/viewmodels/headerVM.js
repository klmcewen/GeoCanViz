/*
 *
 * GeoCanViz viewer / Visionneuse GéoCanViz
 * gcviz.github.io/gcviz/License-eng.txt / gcviz.github.io/gcviz/Licence-fra.txt
 *
 * Header view model widget
 */
/* global locationPath: false */
(function() {
    'use strict';
    define(['jquery-private',
            'knockout',
            'media',
            'gcviz-gisprint',
            'gcviz-i18n',
            'gcviz-ko',
            'gcviz-func',
            'gcviz-vm-tbextract',
            'gcviz-vm-print',
            'gcviz-vm-help'
    ], function($viz, ko, media, gisPrint, i18n, binding, gcvizFunc, extractVM, printVM, helpVM) {
        var initialize,
            toggleMenu,
            subscribeIsFullscreen,
            subscribeIsInsetVisible,
            getScreenParam,
            printSimple,
            getRotationDegrees,
            vm = {};

        initialize = function($mapElem, mapid, config, isDataTbl) {
            // data model
            var headerViewModel = function($mapElem, mapid, config, isDataTbl) {
                var _self = this,
                    mapVM,
                    menuState,
                    configAbout = config.about,
                    configPrint = config.print,
                    pathPrint = locationPath + 'gcviz/print/defaultPrint-' + window.langext + '.html',
                    pathSave = locationPath + 'gcviz/print/defaultSave-' + window.langext + '.html',
                    pathHelpBubble = locationPath + 'gcviz/images/helpBubble.png',
                    $section = $viz('#section' + mapid),
                    $mapholder = $viz('#' + mapid),
                    $map = $viz('#' + mapid + '_holder'),
                    $btnAbout = $mapElem.find('.gcviz-head-about'),
                    $saveUrl = $mapElem.find('#gcviz-head-saveurltext'),
                    $btnSaveUrl = $mapElem.find('.gcviz-head-saveurl'),
                    $btnSaveImg = $mapElem.find('.gcviz-head-saveimage'),
                    $btnPrint = $mapElem.find('.gcviz-head-print'),
                    $menu = $mapElem.find('#gcviz-menu' + mapid),
                    $btnFull = $mapElem.find('.gcviz-head-pop'),
                    instrHeight = 36;

                // there is a problem with the define. The gcviz-vm-map is not able to be set.
                // We set the reference to gcviz-vm-map (hard way)
                require(['gcviz-vm-map'], function(vmMap) {
                    mapVM = vmMap;
                });

                // viewmodel mapid to be access in tooltip custom binding
                _self.mapid = mapid;

                // help bubble
                _self.imgHelpBubble = pathHelpBubble;

                // tools panel settings
                _self.xheightToolsOuter = ko.observable('max-height:100px!important');
                _self.xheightToolsInner = ko.observable('max-height:100px!important');

                // application title
                _self.headTitle = ko.observable(config.title.value);

                // tooltip, text strings
                _self.tpHelp = i18n.getDict('%header-tphelp');
                _self.tpPrint = i18n.getDict('%header-tpprint');
                _self.tpInset = i18n.getDict('%header-tpinset');
                _self.tpAbout = i18n.getDict('%header-tpabout');
                _self.tpSaveUrl = i18n.getDict('%header-tpsaveurl');
                _self.tpSaveImg = i18n.getDict('%header-tpsaveimage');
                _self.tpFullScreen = i18n.getDict('%header-tpfullscreen');
                _self.lblMenu = i18n.getDict('%header-tools');

                // toolbars name
                _self.legendTitle = i18n.getDict('%toolbarlegend-name');
                _self.legendAlt = i18n.getDict('%toolbarlegend-alt');
                _self.drawTitle = i18n.getDict('%toolbardraw-name');
                _self.drawAlt = i18n.getDict('%toolbardraw-alt');
                _self.navTitle = i18n.getDict('%toolbarnav-name');
                _self.navAlt = i18n.getDict('%toolbarnav-alt');
                _self.dataTitle = i18n.getDict('%toolbardata-name');
                _self.dataAlt = i18n.getDict('%toolbardata-alt');
                _self.extractTitle = i18n.getDict('%toolbarextract-name');
                _self.extractAlt = i18n.getDict('%toolbarextract-alt');

                // about dialog box
                _self.lblAboutTitle = i18n.getDict('%header-tpabout');
                _self.isAboutDialogOpen = ko.observable(false);
                _self.aboutType = configAbout.type;

                if (_self.aboutType === 1) {
                    _self.aboutInfo1 = configAbout.value;
                } else if (_self.aboutType === 2) {
                    _self.aboutInfo1 = i18n.getDict('%header-aboutread');
                    _self.aboutInfo2 = i18n.getDict('%linkopens');
                    _self.aboutURL = configAbout.value;
                    _self.aboutURLText = i18n.getDict('%header-abouttitle');
                }

                // print info
                _self.printInfo = {
                    url: i18n.getDict('%header-printurl'),
                    copyright: i18n.getDict('%header-printcopyright'),
                    template: pathPrint,
                    templatesave: pathSave,
                    title: _self.headTitle()
                };
                _self.printInfoText = i18n.getDict('%header-printinfo');
                _self.isPrint = ko.observable(true);
                _self.isPrintDialogOpen = ko.observable(false);
                _self.isForceScale = ko.observable(false);
                _self.lblForceScale = i18n.getDict('%header-printforcescale');
                _self.printInfoTxt = i18n.getDict('%header-printinfo');

                // save map image
                _self.isSaveImg = ko.observable(true);

                // save map url dialog box
                _self.lblSaveDesc = i18n.getDict('%header-copyclip');
                if (window.browserOS === 'mac') {
                    _self.lblSaveDesc = _self.lblSaveDesc.replace('CTRL+C', 'CMD+C');
                }
                _self.isSaveDialogOpen = ko.observable(false);
                _self.saveURL = ko.observable('');

                // fullscreen
                _self.isFullscreen = ko.observable(false);
                _self.isInsetVisible = ko.observable(true);
                _self.insetState = true;
                _self.fullscreenState = 0;
                _self.opencloseToolsState = 0;

                // tools initial setting
                _self.toolsInit = config.tools;

                _self.init = function() {
                    var $menuCont = $viz('#gcviz-menu-cont' + mapid);

                    // keep map size
                    _self.heightSection = parseInt($section.css('height'), 10);
                    _self.heightMap = parseInt($map.css('height'), 10);
                    _self.widthSection = parseInt($section.css('width'), 10);
                    _self.widthMap = parseInt($map.css('width'), 10);
                    _self.headerHeight = parseInt($mapElem.css('height'), 10);

                    // Set the toolbar container height
                    setTimeout(function() {
                        _self.adjustContainerHeight();
                    }, 500);

                    // set the active toolbar
                    $menuCont.on('accordioncreate', function(event) {
                        var value,
                            items = event.target.getElementsByTagName('div'),
                            len = items.length;

                        while (len--) {
                            value = items[len].getAttribute('gcviz-exp');
                            if (value === 'true') {
                                $menuCont.accordion('option', 'active', len);
                            }
                        }

                        // if expand is false toggle (open by default)
                        if (!_self.toolsInit.expand) {
                            // need to be in timeout. If not, doesnt work
                            setTimeout(function(){
                                $menu.accordion('option', 'active', false);
                            }, 500);
                        }

                        $menuCont.off('accordioncreate');
                    });

                    return { controlsDescendantBindings: true };
                };

                _self.showBubble = function(key, id) {
                    return helpVM.toggleHelpBubble(mapid, key, id);
                };

                // when download map and data click, check to toggle grid layer if exist.
                _self.showExtractGrid = function(event, ui) {
                    var panel = ui.newPanel;

                    if (panel.hasClass('gcviz-tbextract-content')) {
                        extractVM.showGrid(mapid, true);
                    } else {
                        extractVM.showGrid(mapid, false);
                    }
                };

                _self.fullscreenClick = function() {
                    // debounce the click to avoid resize problems
                    gcvizFunc.debounceClick(function() {
                        if (_self.fullscreenState === 0) {
                            $viz('html').css('overflow', 'hidden');
                            _self.requestFullScreen();
                        } else {
                            $viz('html').css('overflow', 'auto');
                            _self.cancelFullScreen();
                        }

                        // remove tooltip if there (the tooltip is position before the fullscreen)
                        $viz('.gcviz-tooltip').remove();
                    }, 1000);
                };

                _self._printClick = function() {
                    var node, height, width, size,
                        newHeight, newWidth;

                    // this is the simple print. It doesn't use esri print task
                    if (configPrint.type === 3) {
                        // print the map (first show extent for the print to scale)
                        // open dialog and disable print
                        _self.isPrintDialogOpen(true);
                        _self.isPrint(false);

                        // close menu
                        menuState = _self.toolsClick(false);

                        // get map height
                        node = $viz('#' + mapid + '_holder');
                        height = parseInt(node.css('height'), 10);
                        width = parseInt(node.css('width'), 10);

                        // set map size to fit the print page
                        gcvizFunc.setStyle(node[0], { 'width': '10in', 'height': '5.5in' });
                        gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': '10in', 'height': '5.5in' });

                        // On resize end, get heigh and width to add a polygon to show the user the print extent
                        mapVM.registerEventOne(mapid, 'resize', function() {
                            size = mapVM.getSizeMap(mapid);
                            newHeight = size.height;
                            newWidth = size.width;

                            // if new value are higher then original map size, keep original
                            if (newHeight > height) {
                                newHeight = height;
                            }
                            if (newWidth > width) {
                                newWidth = width;
                            }

                            // create the print extent polygon
                            $viz('#' + mapid + '_holder').prepend('<svg id="' + mapid + 'printext" class="gcviz-printext" height="' + newHeight + '" width="' + newWidth + '">' +
                                                                    '<polygon points="0,0 0,' + newHeight + ' ' + newWidth + ',' + newHeight + ' ' + newWidth + ',0">/<polygon></svg>');
                            gcvizFunc.setStyle(node[0], { 'width': width + 'px', 'height': height + 'px' });
                            gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': width, 'height': height });
                            mapVM.resizeMap(mapid);
                        });
                        mapVM.resizeMap(mapid);
                    } else {
                        // print from our custom esri services
                        printVM.togglePrint();
                    }
                };

                _self._dialogPrintOk = function() {
                    _self.isPrintDialogOpen(false);
                    printSimple(mapVM, mapid, _self.printInfo);
                };

                _self._dialogPrintCancel = function() {
                    _self.isPrintDialogOpen(false);
                };

                _self._dialogPrintClose = function() {
                    _self.isPrintDialogOpen(false);

                    if (menuState !== false) {
                        _self.toolsClick(true);
                    }

                    // enable button and remove extent
                    _self.isPrint(true);
                    $viz('#' + mapid + 'printext').remove();

                    $btnPrint.focus();
                };

                _self.insetClick = function() {
                    // trigger the insetVisibility custom binding (debounce the click to avoid resize problems)
                    gcvizFunc.debounceClick(function() {
                        var array;

                        _self.insetState = !_self.insetState;
                        _self.isInsetVisible(_self.insetState);

                        // change first and last item for section tab if inset are visible or not
                        if (_self.insetState) {
                            array = $section.find('[tabindex = 0]');
                            _self.first = array[0];
                            _self.last = array[array.length - 1];
                        } else {
                            array = $section.find('[tabindex = 0]').not('.gcviz-inset-button');
                            _self.first = array[0];
                            _self.last = array[array.length - 1];
                        }
                    }, 1000);
                };

                _self.toolsClick = function(force) {
                    var isOpen = $menu.accordion('option', 'active');

                    // Toggle the tools container
                    if (typeof force === 'undefined') {
                        if (isOpen === 0) {
                            $menu.accordion('option', 'active', false);
                        } else {
                            $menu.accordion('option', 'active', 0);
                        }
                    } else if (force === true) {
                        $menu.accordion('option', 'active', 0);
                    } else {
                        $menu.accordion('option', 'active', false);
                    }

                    return isOpen;
                };

                _self.helpClick = function() {
                    helpVM.toggleHelp(mapid);
                };

                _self.aboutClick = function() {
                    _self.isAboutDialogOpen(true);
                };

                _self.dialogAboutOk = function() {
                    _self.isAboutDialogOpen(false);
                    $btnAbout.focus();
                };

                _self.printClick = function() {
                    _self.isPrintDialogOpen(true);
                };

                _self.dialogPrintOk = function() {
                    mapVM.saveImageMap(mapid, _self.printInfo.templatesave, _self.isForceScale(), _self.printInfo.title, _self.enablePrint);
                    _self.isPrint(false);
                    _self.dialogPrintClose();
                };

                _self.enablePrint = function() {
                    _self.isPrint(true);
                    $btnPrint.focus();
                };

                _self.dialogPrintClose = function() {
                    _self.isPrintDialogOpen(false);
                };

                _self.saveImgClick = function() {
                    mapVM.saveImage(mapid, _self.enableSaveImg);
                    _self.isSaveImg(false);
                };

                _self.enableSaveImg = function() {
                    _self.isSaveImg(true);
                    $btnSaveImg.focus();
                };

                _self.saveUrlClick = function() {
                    var mapUrl, url,
                        mapidString,
                        extentString,
                        dataString,
                        legendString,
                        extent = mapVM.getExtentMap(mapid),
                        urlWin = window.location.toString(),
                        index = urlWin.indexOf('?');

                    // extract only first part of url
                    if (index !== -1) {
                        url = urlWin.substring(0, index + 1);
                    } else {
                        url = urlWin + '?';
                    }

                    // set mapid
                    mapidString = 'id=' + mapid;

                    // set extent
                    extentString = '&extent=' + extent.xmin + ',' + extent.ymin + ',' + extent.xmax + ',' + extent.ymax;

                    // set legend
                    require(['gcviz-vm-tblegend'], function(legendVM) {
                        legendString = legendVM.getURL(_self.mapid);
                    });

                    // set imported data
                    require(['gcviz-vm-tbdata'], function(dataVM) {
                        dataString = dataVM.getURL(_self.mapid);
                    });

                    // set map url
                    mapUrl = url + mapidString + extentString + dataString + legendString;
                    _self.saveURL(mapUrl);
                    _self.isSaveDialogOpen(true);

                    // select the url and focus to input
                    $saveUrl[0].setSelectionRange(0, mapUrl.length);
                    $btnSaveUrl.focus();
                };

                _self.dialogSaveOk = function() {
                    _self.isSaveDialogOpen(false);
                    $btnSaveUrl.focus();
                };

                _self.cancelFullScreen = function() {
                    var sectH = _self.heightSection,
                        sectW = _self.widthSection,
                        mapH = _self.heightMap,
                        mapW = _self.widthMap;

                    // set style back for the map
                    gcvizFunc.setStyle($mapholder[0], { 'width': sectW + 'px', 'height': (sectH - instrHeight) + 'px' }); // remove the keyboard instruction height
                    gcvizFunc.setStyle($map[0], { 'width': mapW + 'px', 'height': mapH + 'px' });
                    $mapholder.removeClass('gcviz-sectionfs');

                    // if datatable is enable, remove a class to have an overflow
                    if (isDataTbl) {
                        $mapholder.removeClass('gcviz-sectionfs-dg');
                    }

                    // trigger the fullscreen custom binding and set state
                    _self.isFullscreen(false);
                    _self.fullscreenState = 0;

                    // set on resize event to know when to adjust menu height,
                    // put back focus on fs and reset tab
                    mapVM.registerEventOne(mapid, 'resize', _self.canFullScreenEvt);

                    // resize map and keep the extent
                    mapVM.manageScreenState(mapid, 500, false);
                };

                _self.canFullScreenEvt = function() {
                    _self.adjustContainerHeight();
                    $btnFull.focus();

                    // create keydown event to keep tab in the map section
                    // remove the event that keeps tab in map section
                    $mapholder.off('keydown.fs');
                };

                _self.requestFullScreen = function() {
                    // get maximal height and width from browser window and original height and width for the map
                    var param = gcvizFunc.getFullscreenParam(),
                        h = param.height,
                        height = (h - (2 * _self.headerHeight) - 2); // minus 2 for the border

                    // set style for the map
                    gcvizFunc.setStyle($mapholder[0], { 'width': '100%', 'height': '100%' });
                    gcvizFunc.setStyle($map[0], { 'width': '100%', 'height': height + 'px' });
                    $mapholder.addClass('gcviz-sectionfs');

                    // if datatable is enable, add a class to have an overflow
                    if (isDataTbl) {
                        $mapholder.addClass('gcviz-sectionfs-dg');
                    }

                    // trigger the fullscreen custom binding and set state
                    _self.isFullscreen(true);
                    _self.fullscreenState = 1;

                    // set on resize event to know when to adjust menu height,
                    // put back focus on fs and set tab
                    mapVM.registerEventOne(mapid, 'resize', _self.reqFullScreenEvt);

                    // resize map and keep the extent
                    mapVM.manageScreenState(mapid, 500, true);
                };

                _self.reqFullScreenEvt = function() {
                    var array = $mapholder.find('[tabindex = 0]');

                    _self.adjustContainerHeight();
                    $mapElem.find('.gcviz-head-reg').focus();

                    // create keydown event to keep tab in the map section
                    _self.first = array[0];
                    _self.last = array[array.length - 1];
                    $mapholder.on('keydown.fs', function(event) {
                        _self.manageTabbingOrder(event);
                    });
                };

                _self.adjustContainerHeight = function() {
                    var active = $menu.accordion('option', 'active'),
                        toolbarheight = parseInt(mapVM.getSizeMap(mapid).height, 10);

                    // set height
                    _self.xheightToolsInner('max-height:' + (toolbarheight - instrHeight) + 'px!important'); // remove the keyboard instruction height
                    _self.xheightToolsOuter('max-height:' + toolbarheight + 'px!important');

                    // if menu was close we need to open it. Because the panel open automatically when we set the height,
                    // we need to open it from the accorriodn. We use === false because active === 0.
                    // we decide to have it open so you can choose back your tool. e.g. if you draw, goin to fs will stop the draw
                    // and reopn the menu so we can choose draw again.
                    if (active === false) {
                        $menu.accordion('option', 'active', 0);
                    }
                };

                _self.manageTabbingOrder = function(evt) {
                    var key = evt.which,
                        shift = evt.shiftKey,
                        node = evt.target.className,
                        firstClass = _self.first.className,
                        lastClass = _self.last.className,
                        firstItem = _self.first,
                        lastItem = _self.last;

                    if (key === 9 && !shift) {
                        if (node === lastClass) {
                            // workaround to avoid focus shifting to the next element
                            setTimeout(function() { firstItem.focus(); }, 0);
                        }
                    } else if (key === 9 && shift) {
                        if (node === firstClass) {
                            // workaround to avoid focus shifting to the previous element
                            setTimeout(function() {
                                lastItem.focus();
                            }, 0);

                            // still focus on previous item. If not Chrome will freeze
                            if (window.browser === 'Chrome') {
                                lastItem.focus();
                            }
                        }
                    }
                };

                _self.init();
            };

            printSimple = function(mapVM, mapid, printInfo) {
                var style, rotation,
                    styles, lenStyles,
                    arrowStyle = '',
                    center = {},
                    node = $viz('#' + mapid + '_holder'),
                    arrow = $viz('#arrow' + mapid),
                    scalebar = $viz('#scalebar' + mapid),
                    zoomMax = $viz('.gcviz-map-zm'),
                    zoomBar = $viz('.dijitSlider'),
                    zoomPrevNext = $viz('.gcviz-map-zoompv'),
                    height = node.css('height'),
                    width = node.css('width');

                // get center map
                center.point = mapVM.getCenterMap(mapid);

                // set map size to fit the print page
                gcvizFunc.setStyle(node[0], { 'width': '10in', 'height': '5.5in' });
                gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': '10in', 'height': '5.5in' });

                // resize map and center to keep scale
                center.interval = 1500;
                mapVM.resizeMap(mapid);

                // open the print page here instead of timemeout because if we do so, it will act as popup.
                // It needs to be in a click event to open without a warning
                window.open(printInfo.template);

                // hide zoom max, zoom bar and prev next
                zoomMax.addClass('gcviz-hidden');
                zoomBar.addClass('gcviz-hidden');
                zoomPrevNext.addClass('gcviz-hidden');

                // get rotation and remove decimal part
                rotation = getRotationDegrees(arrow);
                style = arrow.attr('style');
                styles = style.split(';');
                lenStyles = styles.length - 1;

                while (lenStyles--) {
                    arrowStyle += styles[lenStyles].split(':')[0] + ':' + 'rotate(' + rotation + 'deg);';
                }

                // set the local storage (modify arrow because it wont print... it is an image background)
                localStorage.setItem('gcvizTitle', printInfo.title);
                setTimeout(function() {
                    localStorage.setItem('gcvizPrintNode', node[0].outerHTML);
                    localStorage.setItem('gcvizArrowNode', '<img src="../images/printNorthArrow.png" style="' + arrowStyle + '"></img>');
                    localStorage.setItem('gcvizScalebarNode', scalebar[0].outerHTML);
                    localStorage.setItem('gcvizURL', window.location.href);
                }, 4000);

                // set map size to previous values
                setTimeout (function() {
                    zoomMax.removeClass('gcviz-hidden');
                    zoomBar.removeClass('gcviz-hidden');
                    zoomPrevNext.removeClass('gcviz-hidden');
                    gcvizFunc.setStyle(node[0], { 'width': width, 'height': height });
                    gcvizFunc.setStyle(node.find('#' + mapid + '_holder_root')[0], { 'width': width, 'height': height });
                    mapVM.resizeMap(mapid);
                }, 10000);
            };

            // http://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
            getRotationDegrees = function(obj) {
                var values, a, b, angle,
                    matrix = obj.css('-webkit-transform') ||
                    obj.css('-moz-transform') ||
                    obj.css('-ms-transform') ||
                    obj.css('-o-transform') ||
                    obj.css('transform');

                if (matrix !== 'none') {
                    values = matrix.split('(')[1].split(')')[0].split(',');
                    a = values[0];
                    b = values[1];
                    angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
                } else {
                    angle = 0;
                }

                if (angle < 0) {
                    angle +=360;
                }

                return angle;
            };

            // put view model in an array because we can have more then one map in the page
            vm[mapid] = new headerViewModel($mapElem, mapid, config, isDataTbl);
            ko.applyBindings(vm[mapid], $mapElem[0]); // This makes Knockout get to work
            return vm;
        };

        // *** PUBLIC FUNCTIONS ***
        toggleMenu = function(mapid) {
            vm[mapid].toolsClick();
        };

        subscribeIsFullscreen = function(mapid, funct) {
            return vm[mapid].isFullscreen.subscribe(funct);
        };

        subscribeIsInsetVisible = function(mapid, funct) {
            return vm[mapid].isInsetVisible.subscribe(funct);
        };

        getScreenParam = function(mapid) {
            var info = { },
                viewModel = vm[mapid];

            info.width = viewModel.widthSection;
            info.height = viewModel.heightSection;

            return info;
        };

        return {
            initialize: initialize,
            toggleMenu: toggleMenu,
            subscribeIsFullscreen: subscribeIsFullscreen,
            subscribeIsInsetVisible: subscribeIsInsetVisible,
            getScreenParam: getScreenParam
        };
    });
}).call(this);
