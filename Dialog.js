/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-2-27
 * Time: 下午5:30
 * Information: 组件-对话框
 */
define(function(require, exports, module){

    var Drag = require('modules/Drag');

    //私有成员
    var _ = {
        index: 1000,
        indexArr: [],
        fixIe6: function (){
            //ie6不支持position:fixed处理方式
            return !window.XMLHttpRequest? $(document).scrollTop(): 0;
        },
        unBindEvent: function(index){
            $(window).unbind('resize.Dialog'+index);
        },
        initPostion: function(opts, index){
            var dialogCoord = {
                    width: opts.width,
                    height: opts.height
                },
                targetCoord,
                dialogLeft,
                dialogTop;

            if (opts.target){
                targetCoord = {
                    left: $(opts.targetOpts.target).offset().left,
                    top: $(opts.targetOpts.target).offset().top,
                    width: $(opts.targetOpts.target).width(),
                    height: $(opts.targetOpts.target).height()
                };
                dialogCoord.top = {
                    left: targetCoord.left+targetCoord.width/2-dialogCoord.width/2,
                    top: targetCoord.top-dialogCoord.height-opts.targetOpts.offset
                };
                dialogCoord.right = {
                    left: targetCoord.left+targetCoord.width+opts.targetOpts.offset,
                    top: targetCoord.top+targetCoord.height/2-dialogCoord.height/2
                };
                dialogCoord.bottom = {
                    left: targetCoord.left+targetCoord.width/2-dialogCoord.width/2,
                    top:  targetCoord.top+targetCoord.height/2+opts.targetOpts.offset
                };
                dialogCoord.left = {
                    left: targetCoord.left-dialogCoord.width-opts.targetOpts.offset,
                    top:  targetCoord.top+targetCoord.height/2-dialogCoord.height/2
                };
                dialogLeft = dialogCoord[opts.targetOpts.position]['left'] || ($(window).width()-opts.width)/2;
                dialogTop = dialogCoord[opts.targetOpts.position]['top'] || ($(window).height()-opts.height)/2+_.fixIe6();
            }else{
                dialogLeft = ($(window).width()-opts.width)/2;
                dialogTop = ($(window).height()-opts.height)/2+_.fixIe6();
            }
            opts.wrapElem.css({
                position: opts.posStyle,
                left: dialogLeft,
                top: dialogTop,
                width: opts.width,
                height: opts.height,
                zIndex: index
            });
        },
        resize: function(opts){
            opts.wrapElem.css({
                left: pos.left,
                top: pos.top
            });
        },
        createDialog: function (opts, index, that){
            var title,
                content,
                btnsWrap;

            var shadowClass = opts.hasShadow? " dialog-shadow": "";

            opts.wrapElem = $('<div class="dialog-wrap'+shadowClass+'" id="dialog-wrap-'+ index+'">');

            if (opts.closeable){
                opts.closeBtn = $('<a class="dialog-close tool tool-close">关闭</a>').bind('click', function(){
                    that.hide();
                });
                opts.wrapElem.append(opts.closeBtn);
            }

            title = $('<div class="dialog-title">'+opts.title+'</div>');
            opts.titleElem = title;

            if (opts.icon === false){
                content = $('<div class="dialog-content">'+opts.content+'</div>');
            }else{
                content = $('<div class="dialog-content">'+'<i class="pull-left dialog-icon dialog-icon-'+opts.icon+'"></i>'+opts.content+'</div>');
            }

            btnsWrap = $('<div class="dialog-btns-wrap"></div>');

            for (var i=0; i<opts.btns.length; i++){
                btnsWrap.append(_.createBtn(opts.btns[i], that));
            }

            opts.wrapElem.append(title, content, btnsWrap);

        },
        createBtn: function (opt, that){
            var config = {
                    text: '',
                    cls: 'btn btn-primary',
                    handler: function (){}
                };
            opt = $.extend(config, opt);
            var btn = $('<a class="'+opt.cls+'">'+opt.text+'</a>');
            btn.bind('click', function(){
                opt.handler.call(this, that);
            });
            return btn;
        },
        createShadow: function(opts, index, that){
            opts.shadow = $('<iframe class="dialog-bg" id="dialog-bg-'+index+'"></iframe>').css({
                zIndex: index
            });
            if (opts.bgCloseable){
                opts.shadow.bind('click', function(){
                    that.hide();
                });
            }
        }
    };

    function Dialog (opts){
        opts = $.extend({}, Dialog.config, opts);
        this.index = ++_.index;
        this._o_ = opts;
        var that = this,
            index = this.index;
        init();

        function init(){
            if (opts.hasBg){
                _.createShadow(opts, index, that);
            }
            _.createDialog(opts, index+1, that);
            bindEvent(opts);
        }
        function bindEvent(){
            $(window).bind('resize.Dialog'+index,function(){
                _.resize({
                    left: ($(window).width()-opts.width)/2,
                    top: ($(window).height()-opts.height)/2+_.fixIe6()
                });
            });
        }

    }

    Dialog.prototype = {
        constructor: Dialog,
        show: function (){
            var opts = this._o_,
                that = this;
            _.initPostion(opts, this.index);
            if (opts.hasBg){
                $('body').append(opts.shadow, opts.wrapElem);
                opts.shadow.animate({'opacity': opts.bgOpacity}, 300, function (){
                    opts.onshow();
                    _.indexArr.push(that.index);
                });
            }else{
                $('body').append(opts.wrapElem);
                opts.onshow();
                _.indexArr.push(that.index);
            }
            if (opts.dragable){
                opts.titleElem.css("cursor","move");
                opts.drag = dds.create(Drag, {
                    target: opts.wrapElem,
                    handler: opts.titleElem
                });
            }
        },
        hide: function (){
            var opts = this._o_,
                that = this;
            opts.wrapElem.remove();
            if (opts.hasBg){
                opts.shadow.animate({opacity: 0}, 300, function (){
                    opts.wrapElem.remove();
                    opts.shadow.remove();
                    _.unBindEvent(that.index);
                    opts.drag.destroy();
                    opts.drag = null;
                    //分析内存会不会有问题;
                    dds.Array.remove(_.indexArr, that.index);
                    opts.onhide();
                })
            }else{
                opts.wrapElem.remove();
                _.unBindEvent(that.index);
                //分析内存会不会有问题;
                dds.Array.remove(_.indexArr, that.index);
                opts.onhide();
            }
        }
    };


    Dialog.config = {
        width: 400,
        height: 300,
        posStyle: 'absolute',
        hasBg: true,
        hasShadow: true,
        icon: false, // error / info / warning / question
        target: false,
        targetOpts:{
            target: '',
            position: 'left',      //left / top / right / bottom
            offset: 0
        },
        bgOpacity: 0.5,
        title: '窗口',
        content: '',
        closeable: true,
        bgCloseable: true,
        dragable: true,
        btns: [],
        onshow: function (){},
        onhide: function (){}
    };

    return Dialog;

});