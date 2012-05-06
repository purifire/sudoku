/**
 *    Tooltip
 *    ------------------
 *    @dependencies jquery, tempload, easing
 */
(function($){
    $.fn.tooltips = function(options) {
        var tooltip = this, config = {speed:'fast'}, item, obj, t, p;
        if(options) $.extend(config, options);

        if(!$.tmpload('tooltips')) {
            $.tmpload('tooltips', '/assets/templates/tooltip.tmpl');
        }

        var getPos = function(e,t,o){
            var w=$('body').width(),top=e.clientY,left=e.clientX;
            top -= Math.floor(o.outerHeight()*2)-Math.floor(t.outerHeight()/2);
            left -= o.outerWidth();
            if(top < 0) { top = o.outerHeight(); }
            if((left+t.outerWidth()) > w) { left = w-t.outerWidth()-o.outerHeight(); }
            return {top:top+'px',left:left+'px'};
        };

        return tooltip.each(function(i) {
            item = $(this);
            item.hover(
                function(e){
                    obj = {tip:$(this).data('tip')};
                    $.when($.tmpload('tooltips'),obj).then(function(tmpl,data){
                        $.tmpl(tmpl,data).appendTo('body');
                        t = $('#tt','body');
                        item.mousemove(function(f){
                            p = getPos(f,t,item);
                            t.css({top:p.top,left:p.left});
                        });
                        t.fadeIn(200);
                    });
                },
                function(e){
                    t.fadeOut(200, function(){
                        t.remove();
                    });
                }
            );
        });
    };
})(jQuery);
