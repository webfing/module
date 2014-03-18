/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-3-14
 * Time: AM10:30
 * Information: 滚动加载：到内容进入浏览器视区再加载
 */
define(function(require, exports, module){

    function ScrollLoad(opts){
        opts = $.extend({}, ScrollLoad.config, opts);
        this.wrapElem = $(opts.wrap);
        this._o_ = opts;
        this.isLoaded = false;
        var that = this;
        init();

        function init (){
            opts.id = "scrollLoad-"+new Date().getTime();
            opts.insight = false;
            opts.wrapHeight = that.wrapElem.height();
            that.resetOffset();
            bindEvent();
        }
        function bindEvent (){
            $(window).bind('scroll.'+ opts.id, function(){
                if(that.checkInSight()){
                    opts.insight = true;
                    opts.onsight(that, that);
                    if (opts.loadOnce || that.isLoaded){
                        setTimeout(function(){
                            that.unBindEvent();
                        }, opts.delay);
                    }
                }else{
                    opts.insight = false;
                }
            });
        }
    }

    ScrollLoad.prototype = {
        constructor: ScrollLoad,
        resetOffset: function(){
            var opts = this._o_;
            opts.offsetTop = this.wrapElem.offset().top;
        },
        checkInSight: function(){
            var opts = this._o_,
                docScrollTop = $(window).scrollTop(),
                winHeight = $(window).height();
            return opts.offsetTop<docScrollTop+winHeight && opts.offsetTop+opts.wrapHeight>docScrollTop;
        },
        unBindEvent: function(){
            var opts = this._o_;
            $(window).unbind('scroll.'+ opts.id);
        }
    };

    ScrollLoad.config = {
        wrap: '',
        delay: 50,
        loadOnce: true,
        onsight: function(){}
    };

    return ScrollLoad;

});