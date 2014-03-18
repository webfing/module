/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-2-27
 * Time: 下午5:30
 * Information: 组件-加载器
 */
define(function(require, exports, module){

    var template = require('modules/template');

    //私有成员
    var _ = {
        showLoading: function(opts, wrapElem){
            var pos = wrapElem.offset(),
                left = pos.left,
                top = pos.top,
                width = wrapElem.width(),
                height = wrapElem.height();
            opts.loading = $(opts.loadingTemplate).css({
                "left": left,
                "top": top,
                "width": width,
                "height": height
            });
            $("body").append(opts.loading);
            opts.loading.fadeIn(300);
        },
        hideLoading: function(opts){
            opts.loading.fadeOut(300, function(){
                opts.loading.remove();
                opts.loading = null;
                opts.isLoading = false;
            });
        },
        load: function(opts, wrapElem, that){
            opts.isLoading = true;
            _.showLoading(opts, wrapElem);
            $.ajax({
                url: opts.url,
                type: 'GET',
                dataType: 'json',
                cache: opts.cache,
                async: true,
                data: that.params,
                beforeSend: function(){
                    opts.beforeload.call(that);
                },
                success: function(data){
                    if (data.success){
                        _.writeData(data, opts.contentTemplate, wrapElem);
                        _.writePage(data, opts.pageBarTemplate, that.get('pageNo'), that.pageElem);
                        total = data.total;
                        opts.success(data, that);
                    }else{
                        opts.failure(data.msg, that);
                    }
                },
                complete: function(){
                    opts.complete(that);
                    _.hideLoading(opts);
                },
                error: function(data){
                    opts.error.call(that);
                }
            });
        },
        writeData: function(data, contentTemplate, wrapElem){
            var render = template.compile(contentTemplate);
            var html = render(data);
            wrapElem.html(html);
        },
        writePage: function(data, pageBarTemplate, pageNo, pageElem){
            var page = {
                total: data.total,
                pageNo: pageNo
            };
            var render = template.compile(pageBarTemplate);
            var html = render(page);
            pageElem.html(html);
        }
    };

    function Loader (opts){
        opts = $.extend({}, Loader.config, opts);
        this.params = $.extend(this.params, opts.params);
        this.wrapElem = $(opts.wrapElem);
        this.pageElem = $(opts.pageElem);
        this._o_ = opts;
        var that = this;
        init();

        function init (){
            bindPageEvent();
        }
        function bindPageEvent (){
            that.pageElem.delegate("a.number", "click", function(){
                that.set('pageNo', $(this).attr('data-value'));
                return false;
            });
            that.pageElem.delegate("a.page-start", "click", function(){
                if (that.get('pageNo') >1){
                    that.set('pageNo', that.get('pageNo')-1);
                }
            });
            that.pageElem.delegate("a.page-next", "click", function(){
                if (that.get('pageNo') < opts.total){
                    that.set('pageNo', that.get('pageNo')+1);
                }
            });
        }
    }

    Loader.prototype = {
        constructor: Loader,
        get: function(field){
            return this.params[field];
        },
        set: function(field, value){
            var opts = this._o_,
                fields,
                that = this;
            if (opts.isLoading) return;
            if (Object.prototype.toString.call(field) === '[object Object]'){
                fields = field;
                for (var i in fields){
                    if (fields.hasOwnProperty(i)){
                        changeParams(i, fields[i]);
                    }
                }
            }else{
                changeParams(field, value);
            }
            function changeParams (f, v){
                var val = that.params[f];
                if (typeof val === undefined || val=== v) return;
                that.params[f] = v;
            }
            _.load(opts, that.wrapElem, that);
        }
    };

    Loader.config = {
        wrapElem: '',
        pageElem: '',
        params: {
            pageNo: 1
        },
        template: '',
        cache: true,
        loadingTemplate: '<div class="widget-loading text-center"><span><i class="icon-loading"></i>正中努力加载数据中...</span></div>',
        contentTemplate: '',
        pageBarTemplate: '',
        url: '',
        beforeload: function(){},
        complete: function(){},
        success: function(){},
        failure: function(){},
        error: function(){}
    };

    return Loader;

});