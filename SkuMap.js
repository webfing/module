/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-2-27
 * Time: 下午5:30
 * Information: 组件-skumap
 */
define(function (require, exports, module) {

    //类静态成员
    var _ = {
        //为了使sku能够比较，先把key格式化，按从小到大顺序
        formatSkuKey: function (obj, keySplitCode) {
            var newObj = {},
                arr,
                val;
            for (var i in obj) {
                val = obj[i];
                arr = i.split(keySplitCode).sort(function (a, b) {
                    return a - b;
                });
                newObj[arr.join(keySplitCode)] = val;
            }
            return newObj;
        },
        //组合key，生成各种可能的值
        mixSkuKey: function (key, keySplitCode) {
            var arr = key.split(keySplitCode),
                len = arr.length,
                mixArr = [],
                resultArr = [],
                newArr = [];

            for (var i = 0; i < len; i++) {
                mixArr.push([arr[i]]);
                if (i + 1 != len) {
                    circulate([arr[i]]);
                }
            }

            function circulate(item) {
                var pot = dds.Array.indexOf(arr, item[item.length - 1]);
                for (var i = pot + 1; i < len; i++) {
                    var newItem = item.slice();
                    newItem.push(arr[i]);
                    mixArr.push(newItem);
                    if (i + 1 != len) {
                        circulate(newItem);
                    }
                }
            }

            for (var j = 0, k = mixArr.length; j < k; j++) {
                resultArr[j] = mixArr[j].join(keySplitCode);
            }

            return resultArr;
        },
        //成生key的对应数据
        combinSku: function(skuMap, keySplitCode){
            var data = {},arr;

            for (var i in skuMap) {
                arr = _.mixSkuKey(i, keySplitCode);
                for (var m = 0, n = arr.length; m < n; m++) {
                    var item = data[arr[m]];
                    if (item) {
                        item.stock = item.stock + skuMap[i]['stock'];
                        item.sellPrice.push(skuMap[i]['sellPrice']);
                    } else {
                        data[arr[m]] = {
                            stock: skuMap[i]['stock'],
                            sellPrice: [skuMap[i]['sellPrice']]
                        }
                    }
                }
            }
            return data;
        },
        //验证除本次选中和选中的兄弟元素是否可选
        verifyBtn: function(target, wrapElem, skuCombination, opts, that) {

            var selectedSku = (function () {
                var arr = [];
                wrapElem.find('.'+opts.selCls).each(function () {
                    arr.push($(this).attr(opts.dataField));
                });
                return arr;
            })();

            opts.selLen = selectedSku.length;

            if (opts.selLen === opts.keyLen){
                _.hideError(wrapElem);
                opts.change(that, that);
            }

            var skuBtnAble = wrapElem.find('.'+opts.skuCls+':not(.'+ opts.selCls+')');

            if (target) {
                skuBtnAble = skuBtnAble.not(target.siblings('.'+opts.skuCls)).not(target);
            }

            skuBtnAble.each(function () {
                var key,
                    tempSelectSku = [],
                    len = opts.selLen;
                var siblingsSelectedObj = $(this).siblings('.'+opts.selCls);
                if(siblingsSelectedObj.length) {
                    var siblingsSelectedObjId = siblingsSelectedObj.attr(opts.dataField);
                    for(var i = 0; i < len; i++) {
                        (selectedSku[i] != siblingsSelectedObjId) && tempSelectSku.push(selectedSku[i]);
                    }
                } else {
                    tempSelectSku = selectedSku.slice();
                }
                tempSelectSku.push($(this).attr(opts.dataField));
                tempSelectSku.sort(function (a, b) {
                    return parseInt(a) - parseInt(b);
                });
                key = tempSelectSku.join(opts.keySplitCode);
                if (!skuCombination[key] || skuCombination[key]['stock'] === 0) {
                    $(this).addClass(opts.disableCls);
                } else {
                    $(this).removeClass(opts.disableCls);
                }
            });
        },
        showError: function(wrapElem){
            if (!wrapElem.hasClass('error')){
                wrapElem.addClass('error');
                var closeBtn = $('<a class="icon icon-close"></a>');
                wrapElem.append(closeBtn);
                closeBtn.bind('click', function(){
                    _.hideError(wrapElem);
                });
            }
        },
        hideError: function(wrapElem){
            if (wrapElem.hasClass('error')){
                wrapElem.removeClass('error');
                wrapElem.find('.icon-close').remove();
            }
        }
    };

    function SkuMap (opts){
        opts = $.extend({}, SkuMap.config, opts);
        this._o_ = opts;
        this.wrapElem = $(opts.wrap);
        this.skuMapData = _.formatSkuKey(opts.skuMapData, opts.keySplitCode);
        this.skuCombination = _.combinSku(this.skuMapData, opts.keySplitCode);
        var wrapElem = this.wrapElem,
            that = this;
        init();

        function init(){
            opts.keyLen = wrapElem.find('.'+opts.rowCls).length;
            bindEvent();
        }
        function bindEvent(){
            //视图渲染及事件绑定
            wrapElem.find('.'+opts.skuCls).each(function () {
                var skuId = $(this).attr(opts.dataField);
                if (!that.skuCombination[skuId]) {
                    $(this).addClass(opts.disableCls);
                }
            }).click(function () {
                    if ($(this).hasClass(opts.disableCls)) return false;
                    if ($(this).hasClass(opts.selCls)) {
                        $(this).removeClass(opts.selCls);
                        _.verifyBtn(null, wrapElem, that.skuCombination, opts, that);
                    } else {
                        $(this).addClass(opts.selCls);
                        $(this).siblings('.'+ opts.selCls).removeClass(opts.selCls);
                        _.verifyBtn($(this), wrapElem, that.skuCombination, opts, that);
                    }
                    return false;
                });
        }
    }

    SkuMap.prototype = {
        constructor: SkuMap,
        validate: function(){
            var opts = this._o_,
                selectLen = this.wrapElem.find('.'+ opts.selCls).length;
            if (selectLen === opts.keyLen){
                return true;
            }
            _.showError(this.wrapElem);
            return false;
        },
        getSelData: function(){
            if (!this.validate()) return false;
            var arr = [],
                data = null,
                opts = this._o_;
            this.wrapElem.find('.'+ opts.selCls).each(function(){
                arr.push($(this).attr(opts.dataField));
            });
            arr.sort(function(a, b){
                return parseInt(a)-parseInt(b);
            });
            data = this.skuMapData[arr.join(opts.keySplitCode)];
            return data;
        },
        setSelData: function(obj){
            var arr,str,
                opts = this._o_;
            if ($.isArray(obj)){
                arr = obj;
                str = obj.split(opts.keySplitCode);
            }else{
                arr = obj.split(opts.keySplitCode);
                arr.sort(function(a, b){
                    return parseInt(a)-parseInt(b);
                });
                str = obj;
            }
            if (!this.skuCombination[str]) return;
            this.wrapElem.find('.'+ opts.skuCls).removeClass(opts.selCls);
            for (var i= 0; i<arr.length; i++){
                this.wrapElem.find('.'+ opts.skuCls+':['+ opts.dataField+'='+arr[i]+']').addClass(opts.selCls);
            }
            _.verifyBtn(null, this.wrapElem, this.skuCombination, opts, this);

        }
    };

    SkuMap.config = {
        wrap: '',
        skuMapData: '',
        selSkuData: null,
        skuCls: 'sku',
        selCls: 'selected',
        disableCls: 'null',
        rowCls: 'sel',
        dataField: 'data',
        keySplitCode: ',',
        change: function(){}
    };

    return SkuMap;

});