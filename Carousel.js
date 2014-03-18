/**
 * Created with JetBrains WebStorm.
 * Company: Ejs
 * Author: King
 * Date: 14-3-3
 * Time: 下午1:30
 * Information: 组件-轮播
 */
define(function(require, exports, module){

    //私有成员
    var _ = {
        that: null,
        root: null,
        showItems: null,
        itemsCount: 0,
        itemWidth: null,
        prevBtn: null,
        nextBtn: null,
        current: 0,
        isAnimate: false,
        init: function (opts){
            var ul = _.root.find("ul"),
                items = ul.find("li");
            _.itemsCount = items.length;
            _.itemWidth = items.eq(0).outerWidth();
            ul.wrap('<div class="carousel-wrap"></div>').css({"width": _.itemWidth*_.itemsCount, "position": "absolute"});
            _.prevBtn.show();
            _.nextBtn.show();
            _.resetBtnState();
            _.bindEvent();
        },
        bindEvent: function (){
            _.prevBtn.bind('click', function(){
                if ($(this).hasClass('carousel-prev-disabled')) {
                    return false;
                }
                if (_.isAnimate){
                    return false;
                }
                _.that.gotoItem(_.current-1);
                return false;
            });
            _.nextBtn.bind('click', function(){
                if ($(this).hasClass('carousel-next-disabled')) {
                    return false;
                }
                if (_.isAnimate){
                    return false;
                }
                _.that.gotoItem(_.current+1);
                return false;
            });
        },
        resetBtnState: function (){
            var current = _.current,
                start = 0,
                end = _.itemsCount-_.showItems;

            if (current>start){
                _.prevBtn.removeClass('carousel-prev-disabled');
            }else{
                _.prevBtn.addClass('carousel-prev-disabled');
            }

            if (current<end){
                _.nextBtn.removeClass('carousel-next-disabled');
            }else{
                _.nextBtn.addClass('carousel-next-disabled');
            }

        }
    };

    function Carousel (opts){
        var opts = $.extend({}, Carousel.config, opts);
        _.root = $(opts.elem);
        _.showItems = opts.showItems;
        _.prevBtn = $(opts.prev, _.root);
        _.nextBtn = $(opts.next, _.root);
        _.that = this;
        this._o_ = opts;
        _.init(opts);
    }

    Carousel.prototype = {
        constructor: Carousel,
        gotoItem: function (i){
            var that = this,
                opts = that._o_;
            _.isAnimate = true;
            _.root.find("ul").animate({"left": -i*_.itemWidth}, opts.speed, function (){
                _.isAnimate = false;
                _.current = i;
                _.resetBtnState();
            });
        },
        goPrev: function(){

        },
        goNext: function(){

        },
        stop: function(){

        },
        play: function(){

        }

    };

    Carousel.config = {
        elem: '',
        prev: '.carousel-prev',
        next: '.carousel-next',
        showItems: 4,
        auto: false,
        delay: 3000,
        speed: 300,
        hover: false
    };

    return Carousel;

});