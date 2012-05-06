/**
 *    popup
 *    ------------------
 *    @dependencies jquery, tempload, easing
 */
(function($) {
    $.fn.popups = function(options) {
        var popup = this, config = {speed:'fast'}, item, href, obj, t, p, a;
        if(options) $.extend(config, options);

        if(!$.tmpload('popups')) {
            $.tmpload('popups', '/assets/templates/popup.tmpl');
        }

        var getPos = function(e,t,o) {
            var w = $('body').width(), top = e.clientY, left = e.clientX;

            top -= Math.floor(o.outerHeight()*2)-Math.floor(t.outerHeight()/2);
            left -= o.outerWidth()-15;

            if( (left + t.outerWidth() ) > w) { 
                left = w-t.outerWidth()-o.outerHeight(); 
            }

            if(top < 0) { 
                top = o.outerHeight(); 
            }

            if(left < Math.floor(o.outerWidth()/2)) { 
                left = Math.floor(o.outerWidth()/2); 
            }

            return {top:top+'px', left:left+'px'};
        };

        return popup.each(function(i) {
            item = $(this), href = item.data('href'), a = false;
            item.click(function(e) {
                e.preventDefault();e.stopImmediatePropagation();
                if(a) {
                    a = false;
                    t.fadeOut(200, function() {
                        t.remove();
                    });
                } else {
                    a = true;
                    obj = {href:$(this).data('href'), tip:$(this).data('tip')};

                    $.when($.tmpload('popups'),obj).then(function(tmpl,data) {
                        $.tmpl(tmpl,data).appendTo('body');

                        t = $('#tt', 'body');

                        t.each(function(o) {
                            p = getPos(e, $(this), item);

                            $(this).css({top:p.top, left:p.left});
                            $(this).fadeIn(200);

                            if(href) {
                                $(this).click(function(f) {
                                    f.preventDefault();f.stopImmediatePropagation();
                                    a = false;
                                    t.remove();
                                    window.open(href, "new");
                                });
                            }
                        });
                    });
                }
            });
        });
    };
})(jQuery);
