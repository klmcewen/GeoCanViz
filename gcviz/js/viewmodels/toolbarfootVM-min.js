(function(){define(["knockout","gcviz-i18n","gcviz-gisgeo"],function(c,d,b){var a;a=function(h,e,f){var g=function(l,j,k){var i=this,m=locationPath+"gcviz/images/footNorthArrow.png";i.imgNorth=m;i.init=function(){var o,n=mapArray[j].length;while(n--){o=mapArray[j][n];if(k.mousecoords){o.on("mouse-move",function(p){i.showCoordinates(p,"mousecoord_"+j)})}if(k.northarrow){o.on("pan-end",function(p){i.showNorthArrow(p,"north_"+j)});o.on("zoom-end",function(p){i.showNorthArrow(p,"north_"+j)})}}return{controlsDescendantBindings:true}};i.showCoordinates=function(n,o){b.getCoord(n.mapPoint,o,k.mousecoords)};i.showNorthArrow=function(n,o){b.getNorthAngle(n.extent,o,k.northarrow)};i.init()};c.applyBindings(new g(h,e,f),h[0])};return{initialize:a}})}).call(this);