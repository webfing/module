/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-3-10
 * Time: 下午5:30
 * Information: 组件-拖拽
 */
define(function(require, exports, module){

    //私有成员
    var _ = {
        moveTo: function(pos, opts, target){
            if (opts.isPosfixed){
                opts.containerInfo.left = -opts.container.scrollLeft();
                opts.containerInfo.top = -opts.container.scrollTop();
            }
            if (pos.left< opts.containerInfo.left){
                pos.left = opts.containerInfo.left;
            }
            if (pos.left+ opts.targetInfo.width > opts.containerInfo.width+ opts.containerInfo.left){
                pos.left = opts.containerInfo.width+ opts.containerInfo.left- opts.targetInfo.width;
            }
            if (pos.top< opts.containerInfo.top){
                pos.top = opts.containerInfo.top;
            }
            if (pos.top+ opts.targetInfo.height > opts.containerInfo.height+ opts.containerInfo.top){
                pos.top = opts.containerInfo.height+ opts.containerInfo.top- opts.targetInfo.height;
            }
            target.css({
                left: pos.left,
                top: pos.top
            });
            opts.targetInfo.left = pos.left;
            opts.targetInfo.top = pos.top;
        }
    };

    function Drag (opts){
        opts = $.extend({}, Drag.config, opts);
        this.target = $(opts.target);
        this.handler = $(opts.handler);
        opts.container = $(opts.container);
        opts.targetInfo = {};
        opts.initOffset = {};
        opts.id = "drag-"+new Date().getTime();
        this._o_ = opts;
        var that = this;
        init();

        function init(){
            initPos();
            opts.targetInfo.width = that.target.width();
            opts.targetInfo.height = that.target.height();
            opts.containerInfo = {
                width: opts.container.width(),
                height: opts.container.height(),
                left: opts.container.offset()? opts.container.left: 0,
                top: opts.container.offset()? opts.container.top: 0
            };
            bindEvent();
        }
        function initPos (){
            var position = that.target.css('position');
            if (position === 'fixed'){
                opts.container = $(document);
                opts.isPosfixed = true;
            }else if(position === 'static'){
                var initCoord = that.target.offset();
                that.target.css({
                    position: 'absolute',
                    left: initCoord.left,
                    top: initCoord.top
                });
                opts.targetInfo.left = initCoord.left;
                opts.targetInfo.top = initCoord.top;
                return;
            }
            opts.targetInfo.left = that.target.css('left');
            opts.targetInfo.top = that.target.css('top');
        }
        function bindEvent (){
            var controlElem = opts.handler? opts.handler: that.target;
            controlElem.bind('mousedown.'+opts.id, function(e){
                opts.initOffset.left = e.pageX-$(this).offset().left;
                opts.initOffset.top = e.pageY-$(this).offset().top;
                opts.dragable = true;
                initPos();
                startDrag();
            });
            $(document).bind('mouseup.'+opts.id, function(e){
                opts.dragable = false;
                stopDrag();
            });
        }
        function startDrag(){
            $(document).bind('mousemove.'+opts.id, function(e){
                var replair = {
                    left: 0,
                    top: 0
                };
                if (opts.isPosfixed){
                    replair.left = opts.container.scrollLeft();
                    replair.top = opts.container.scrollTop();
                }
                if (opts.dragable){
                    _.moveTo({
                        left: e.pageX - opts.initOffset.left-replair.left,
                        top: e.pageY - opts.initOffset.top-replair.top
                    }, opts, that.target);
                }
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            });

        }
        function stopDrag(){
            $(document).unbind('mousemove.'+opts.id);
        }
    }

    Drag.prototype = {
        constructor: Drag,
        destroy: function(){
            var opts = this._o_;
            var controlElem = opts.handler? opts.handler: that.target;
            controlElem.unbind('mousedown.'+opts.id);
            $(document).unbind('mousemove.'+opts.id);
            $(document).unbind('mouseup.'+opts.id);
        }
    };

    Drag.config = {
        target: '',
        handler: null,
        container: $(document),
        proxy: false
    };

    return Drag;


});