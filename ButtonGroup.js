/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-3-5
 * Time: 下午2:30
 * Information: 组件-按钮组
 */
define(function(require, exports, module){

    function ButtonGroup(opts){
        opts = $.extend({}, ButtonGroup.config, opts);
        this._o_ = opts;
        var that = this;
        init();

        function init(){
            opts.btns = $(opts.elems);
            opts.value = opts.initValue;
            bindEvent();
        }
        function bindEvent(){
            opts.btns.bind('click', function(){
                var val = $(this).attr(opts.valueField);
                that.setValue(val);
                return false;
            });
        }
    }

    ButtonGroup.prototype = {
        constructor: ButtonGroup,
        getValue: function(){
            var opts = this._o_;
            return opts.value;
        },
        setValue: function(val){
            var that = this,
                opts = this._o_;
            if (val !=that.getValue()){
                opts.btns.each(function(){
                    if ($(this).hasClass(opts.disableCls)) return;
                    var thisVal = $(this).attr(opts.valueField);
                    if (thisVal === val){
                        opts.value = val;
                        opts.btns.not($(this)).removeClass(opts.onCls);
                        $(this).addClass(opts.onCls);
                        opts.change(val);
                    }
                });
            }
        }
    };

    ButtonGroup.config = {
        elems: '',
        onCls: 'current',
        disableCls: 'disabled',
        valueField: 'data-value',
        initValue: '',
        change: function(val){}
    };

    return ButtonGroup;
});