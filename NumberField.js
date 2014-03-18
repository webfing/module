/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-3-2
 * Time: 下午5:30
 * Information: 组件-数字输入框
 */
define(function (require, exports, module) {

    //构造函数
    function NumberField(opts) {
        opts = $.extend({}, NumberField.config, opts);
        this.wrapElem = $(opts.elem);
        this.minValue = opts.minValue;
        this.maxValue = opts.maxValue;
        this._o_ = opts;
        var wrapElem = this.wrapElem,
            that = this,
            valueElem = wrapElem.find(opts.valueField);
        init();

        function init(){
            var initValue = opts.initValue;
                domValue = parseInt(valueElem.val());
            if (initValue && $.isNumeric(initValue)){
                opts.value = initValue;
                valueElem.val(initValue);
            }else{
                if ($.isNumeric(domValue)){
                    opts.value = domValue;
                }else{
                    valueElem.val(0);
                }
            }
            bindEvent();
        }
        function bindEvent(){
            $(opts.subBtn, wrapElem).bind('click', function () {
                that.remove(1);
                return false;
            }).longPress(function(){
                    that.remove(1);
                    return false;
                }, 50);

            $(opts.addBtn, wrapElem).bind('click', function () {
                that.add(1);
                return false;
            }).longPress(function(){
                    that.add(1);
                    return false;
                }, 50);

            valueElem.bind('keydown', function (e) {
                var keyCode = event.which;
                if (keyCode === 38){
                    that.add(1);
                }else if(keyCode === 40){
                    that.remove(1);
                }else{
                    return keyCode == 46 || keyCode == 8 || keyCode == 37 || keyCode == 39 || (keyCode >= 48 && keyCode <= 57) ||  (keyCode >= 96 && keyCode <= 105);
                }
            }).bind('keyup', function(e){
                    var newVal = parseInt($(this).val());
                    newVal = !!newVal ? newVal:0;
                    that.setValue(newVal);
                });
        }
    }

    //公共方法-对外暴露的方法
    NumberField.prototype = {
        constructor: NumberField,
        add: function(val){
            var opts = this._o_;
            if ($.isNumeric(val)){
                var newValue = opts.value+val;
                this.setValue(newValue);
            }
        },
        remove: function(val){
            var opts = this._o_;
            if ($.isNumeric(val)){
                var newValue = opts.value-val;
                this.setValue(newValue);
            }
        },
        checkValue: function(val){
            if ($.isNumeric(val)){
                if (val> this.maxValue ){
                    dds.util.tip(this.wrapElem, '购买数量不能超过库存最大值'+ this.maxValue, {
                        direction: 'top'
                    });
                    return false;
                }
                if(val< this.minValue){
                    dds.util.tip(this.wrapElem, '购买数量不能小于'+ this.minValue, {
                        direction: 'right'
                    });
                    return false;
                }
            }
            return true;
        },
        setValue: function (val) {
            var opts = this._o_;
            if (!opts.beforechange.call(this, this, val)) return false;
            if (this.checkValue(val)) {
                opts.value = val;
                this.wrapElem.find(opts.valueField).val(val);
                opts.change();
                return true;
            }
            return false;
        },
        getValue: function(){
            var opts = this._o_;
            return opts.value;
        },
        setMinValue: function(val){
            var opts = this._o_;
            opts.minValue = $.isNumeric(val)? val : this.minValue;
        },
        setMaxValue: function(val){
            this.maxValue = $.isNumeric(val)? val: this.maxValue;
        }
    };

    //配置项
    NumberField.config = {
        elem: '',
        initValue: null,
        minValue: 0,
        maxValue: Number.MAX_VALUE,
        regex: null,
        subBtn: '.number-sub',
        addBtn: '.number-add',
        valueField: '.value-field',
        beforechange: function(){
            return true;
        },
        change: function(){

        }
    };

    return NumberField;

});