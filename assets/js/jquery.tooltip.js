/*
	Tooltip
*/
(function($){
    $.fn.tooltips = function(options) {
		var $tooltip=this,$t,
        	config = {speed:'fast'};
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
			return {top:top+'px',left:left+'px'}
		};

		return $tooltip.each(function(i) {
			var $item=$(this),$tip=$item.data('tip'),$t,$p;
			$item.hover(
				function(e){
					//console.dir($p);
					var obj = {tip:$(this).data('tip')};
					$.when($.tmpload('tooltips'),obj).then(function(tmpl,data){
						$.tmpl(tmpl,data).appendTo('body');
						$t = $('#tt','body');
						$item.mousemove(function(f){
							//console.dir(f);
							$p=getPos(f,$t,$item);
							$t.css({top:$p.top,left:$p.left});
						});

						$t.fadeIn(200);
					});
				},
				function(e){
					$t.fadeOut(200, function(){
						$t.remove();
					});
				}
			);
			
		});
    };
})(jQuery);
