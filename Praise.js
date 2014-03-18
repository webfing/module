/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-2-27
 * Time: 下午5:30
 * Information: 组件-点赞
 */
define(function (require, exports, module) {

    require('libs/jquery/jquery.cookie.pack');

    //内部成员
    var _ = {
        saveCookie: function(id){
            var oldValue = parseInt($.cookie('praise'+id));
            oldValue = oldValue ||0;
            $.cookie('praise'+id, oldValue+1, {
                expires: 90
            });
        },
        slide: function(wrap){
            var num = parseInt(wrap.children('span:eq(0)').html())+1;
            wrap.append('<span class="two">'+num+'</span>');
            wrap.children('span:eq(0)').animate({height:0}, 300, function(){
                $(this).remove();
            });
            wrap.children('span:eq(1)').animate({height:14}, 300, function(){
                $(this).removeClass('two').addClass('one');
            });
        },
        doAjax: function(opts, wrapElem){
            $.ajax({
                url: opts.url+ opts.id,
                type: 'GET',
                dataType: 'json',
                beforeSend: function(){
                    opts.isPosting = true;
                },
                success: function(data){
                    if(data.success){
                        opts.hasAdd++;
                        _.slide(wrapElem.find('.num'));
                        //此功能暂时不使用
                        // _.saveCookie(opts.id);
                    }else{
                        dds.util.tip(wrapElem, data.msg);
                    }
                },
                error: function(){
                    dds.util.tip(wrapElem, '服务器错误，请刷新页面');
                },
                complete: function(){
                    opts.isPosting = false;
                }
            })
        }
    };

    function Praise (opts){
        opts = $.extend({}, Praise.config, opts);
        this._o_ = opts;
        this.wrapElem = $(opts.wrap);
        init.call(this);

        function init(){
            var that = this,
                btn = that.wrapElem.children('a.icon-praise');

            opts.id = btn.attr('data-value');
            opts.hasAdd = 0;
            that.wrapElem.children('div.num').wrapInner('<span class="one"></span>');
            btn.click(function(){
                that.add();
                return false;
            });
        }

    }

    Praise.prototype = {
        constructor: Praise,
        add: function(){
            var opts = this._o_;
            var oldValue = parseInt($.cookie('praise'+opts.id));
            oldValue = oldValue ||0;
            if (opts.isPosting){
                opts.onPosting(this);
            }else{
                _.doAjax(opts, this.wrapElem);
            }
        }
    };

    Praise.config = {
        wrap: '',
        url: '/product/like/',
        limit: 3,
        overLimit: function(){},
        onPosting: function(){}
    };

    return Praise;

});