var $S = {
    data:null,points:250,pass:0,range:[1,2,3,4,5,6,7,8,9],keys:{49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9},dirs:{37:'left',38:'up',39:'right',40:'down'},
    init:function(){
        $S.temp.load.init();
        if(!this.recover()){
            $S.grid.H.set();
            $S.grid.V.set();
            $S.grid.A.set();
            $S.generate.xyGrids();
            $S.grid.M.set().make();
            $S.save.puzzle();
        }

        $S.grid.A.get();
        $S.data = {
            rows       : $S.grid.M.get(),
            range      : $S.range,
            strike     : $S.stats.strike.get(),
            multiplier : $S.stats.multiplier.int(),
            score      : $S.stats.score.get(),
            difficulty : $S.stats.difficulty.get(),            
            dparams    : $S.stats.difficulty.params.get()            
        };
        $S.temp.load.main($S.data,$S.attach.init).modal();
        $S.puzzle.fulfill();
    },
    temp:{
        T:{t:'sudoku',c:'cell',m:'modal'},
        S:{container:'#sContainer',modal:{m:'#sMC',span:'#sMC > span'},tablecontainer:'#sTableContainer',table:{t:'#sTable',tr:'tbody > tr',td:'td'},item:'.item p',input:'.cell p',closed:'.closed p',target:'p.target',picker:'button.picker',reset:'button.reset',labels:'thead > tr > th > ul li'},
        load:{
            init:function(){
                $.tmpload($S.temp.T.t, '/assets/templates/sudoku.tmpl');
                $.tmpload($S.temp.T.c, '/assets/templates/cell.tmpl');
                $.tmpload($S.temp.T.m, '/assets/templates/modal.tmpl');
            },
            main:function(obj,cb){
                $.when($.tmpload($S.temp.T.t),obj).then(function(tmpl,data){
                    $.tmpl(tmpl,data).appendTo($S.temp.S.container);
                    if($.type(cb)==='function'){cb();};
                });
                return this;
            },
            modal:function(){
                $.when($.tmpload($S.temp.T.m),{content:''}).then(function(tmpl,data){
                    $.tmpl(tmpl,data).appendTo($S.temp.S.container);
                });
                return this;
            }
        },
        update:{
            cell:function(obj,a,cb){
                $.when($.tmpload($S.temp.T.c),{cell:a}).then(function(tmpl,data){
                    var o=$.tmpl(tmpl,data).appendTo($(obj).parent('div').parent('td').empty());
                    if($.type(cb)==='function'){cb(o);}
                    $S.attach.closed(o.find('p'));
                });
                return this;
            },
            labels:function(i,j){
                var o=$($S.temp.S.labels,$S.temp.S.table.t).get(j);
                $(o).find('span').text(i);
                return this;
            },
            modal:function(s){
                $.when($.tmpload($S.temp.T.m),{content:s}).then(function(tmpl,data){
                    $($S.temp.S.modal.span,$S.temp.S.container).text(s);
                    $S.effects.bubble($S.temp.S.modal.m);
                });
                return this;
            }
        }
    },
    generate:{ 
        xyGrids:function(i){var box,opt,val,i=i||1,x,y;if($S.pass>100){$S.grid.H.set();$S.grid.V.set();i=1;$S.pass=0;}$S.pass++;try{for(x=i;x<=9;x++){for(y=1;y<=9;y++){$S.grid.h[x]=($.type($S.grid.h[x])==='undefined')?{}:$S.grid.h[x];$S.grid.v[y]=($.type($S.grid.v[y])==='undefined')?{}:$S.grid.v[y];box=$S.generate.zGrid(x,y);opt=$S.generate.grep($S.grid.h[x],$S.grid.v[y],box);val=$S.generate.rand(opt);if($.type(val)!=='number'){$S.grid.h[x]={};return $S.generate.xyGrids(x);}$S.grid.h[x][y]=$S.grid.v[y][x]=val;}}}catch(e){console.log(e);}return this;},
        zGrid:function(x,y){var box=[],r=Math.ceil(x/3)*3,l=r-2,b=Math.ceil(y/3)*3,t=b-2;for(x=l;x<=r;x++){for(y=t;y<=b;y++){if(null!==($S.grid.h[x]||null)){if(null!==($S.grid.h[x][y]||null)){box.push($S.grid.h[x][y]);}}}}return box;},
        mArr:function(obj){var args=[];for(i in obj){args[i]=obj[i];}return args;},
        grep:function(a,b,c,d){d=$.grep($S.range,function(e){return $.inArray(e,$S.generate.mArr(a))==-1;});d=$.grep(d,function(e){return $.inArray(e,$S.generate.mArr(b))==-1;});return $.grep(d,function(e){return $.inArray(e,c)==-1;});},
        rand:function(a){return a[Math.floor(Math.random()*a.length)];}
    },
    grid:{
        h:null,v:null,m:null,a:null,
        H:{set:function(o){$S.grid.h=($.type(o)!=='object')?{}:o;return this;},get:function(){return $S.grid.h;},save:function(){$S.cookie.set("sudokuPuzzleHGrid",this.get());},find:function(c){if(false!==(c=$S.cookie.get("sudokuPuzzleHGrid"))){this.set(c);return true;}else{return false;}}},
        V:{set:function(o){$S.grid.v=($.type(o)!=='object')?{}:o;return this;},get:function(){return $S.grid.v;},save:function(){$S.cookie.set("sudokuPuzzleVGrid",this.get());},find:function(c){if(false!==(c=$S.cookie.get("sudokuPuzzleVGrid"))){this.set(c);return true;}else{return false;}}},
        A:{set:function(o){$S.grid.a=($.type(o)!=='object')?{}:o;return this;},get:function(){return $S.grid.a;},save:function(){$S.cookie.set("sudokuPuzzleAGrid",this.get());},find:function(c){if(false!==(c=$S.cookie.get("sudokuPuzzleAGrid"))){this.set(c);return true;}else{return false;}}},
        M:{set:function(o){$S.grid.m=($.type(o)!=='object')?{}:o;return this;},get:function(){return $S.grid.m;},save:function(){$S.cookie.set("sudokuPuzzleMGrid",this.get());},find:function(c){if(false!==(c=$S.cookie.get("sudokuPuzzleMGrid"))){this.set(c);return true;}else{return false;}},make:function(){$.extend(true,$S.grid.m,$S.grid.H.get());try{for(var x=1;x<=9;x++){for(var y=1;y<=9;y++){$S.grid.m[y][x]=((Math.floor(Math.random()*$S.stats.difficulty.i)+1)==1)?$S.grid.h[y][x]:"";}}}catch(e){console.log(e);}return this;}}
    },
    puzzle:{ 
        validate:{ 
            all:function(){var p=[];$($S.temp.S.input,$S.temp.S.table.t).each(function(i){p.push(($(this).text()||null));});return ($.inArray(null,p)==-1&&p.length==81);},
            cell:function(x,y,v){ 
                if(v==$S.grid.h[x][y]){
                    if($S.puzzle.validate.all()){
                        $S.temp.update.modal('puzzle complete');
                    }
                    return true;
                }else{return false;}
            }
        },
        select:function(t,a){
            var obj=$(t,$S.temp.S.table.t);
            if(!obj.length){
                $S.temp.update.modal("Please select a target cell.");
            }else{
                var x=obj.data('row'),y=obj.data('column');
                if($S.puzzle.validate.cell(x,y,a)){
                    $S.puzzle.setAnswer(obj,x,y,a);
                    $S.stats.score.add();
                }else{
                    obj.text(a);
                    $S.stats.strike.add();
                    $S.stats.multiplier.add();
                    $S.effects.flame(obj,true);
                }
                $S.save.stats();
            }
            return this;
        },
        fulfill:function(){
            /*    
            	TODO 
                check number of completed elements and disable pickers if fulfilled
             */
            //$S.temp.update.modal("hello");
            var m = $.extend(true,$S.grid.m,$S.grid.a);
            
            //console.dir(m);
            return this;
        },
        isAnswer:function(x,y){return (null!==$S.grid.a && $.type($S.grid.a[x])!=='undefined'&&$.type($S.grid.a[x][y])!=='undefined');},
        setAnswer:function(obj,x,y,a){if(null===$S.grid.a){$S.grid.A.set();}$S.grid.a[x]=(null==$S.grid.a[x])?{}:$S.grid.a[x];$S.grid.a[x][y]=a;$S.grid.A.save();$S.temp.update.cell(obj,a,function(o){$S.effects.rotate(o).blaze(o,true)});return this;},
        getAnswer:function(x,y){return $S.grid.h[x][y];},
        setEdit:function(obj,b){
        	$($S.temp.S.input,$S.temp.S.table.t).removeClass('target');
        	if(b){
        		$(obj).addClass('target');
        	}
        	return this;
        }
    },
    stats:{
        S:{
            save:function(){$S.cookie.set("sudokuPuzzleStats",{strike:$S.stats.strike.get(),multiplier:$S.stats.multiplier.get(),score:$S.stats.score.get(),difficulty:$S.stats.difficulty.get(),dparams:$S.stats.difficulty.params.get()});return this;},
            find:function(c){if(false!==(c=$S.cookie.get("sudokuPuzzleStats"))){$S.stats.strike.set(c.strike);$S.stats.multiplier.set(c.multiplier);$S.stats.score.set(c.score);$S.stats.difficulty.set(c.difficulty);return true;}else{return false;}},
            reset:function(){$S.stats.strike.set(0);$S.stats.multiplier.set(0);$S.stats.score.set(0);return this;}
        },
        strike:{
            i:0,
            set:function(i){this.i=i;return this;},
            get:function(){return this.i;},
            add:function(){this.set(this.get()+1);$S.temp.update.labels(this.get(),0);}
        },
        multiplier:{
            i:0,a:[10,9,8,7,6,5,4,3,2,1],
            set:function(i){this.i=i;return this;},
            get:function(){return this.i;},
            int:function(){return this.a[this.get()];},
            add:function(){var i=this.get()+1;if(i<this.a.length){this.set(i);}$S.temp.update.labels(this.int(),1);}
        },
        score:{
            i:0,
            set:function(i){this.i=i;return this;},
            get:function(){return this.i;},
            add:function(){this.set((parseInt(this.get(),10)+($S.stats.multiplier.int()*$S.points)));$S.temp.update.labels(this.get(),2);}
        },
        difficulty:{
            i:3,
            set:function(i){this.i=i;return this;},
            get:function(){return this.i;},
            params:{o:{3:'easy',4:'medium',5:'hard'},set:function(o){this.o=o;return this;},get:function(){return this.o;}}
        }
    },
    effects:{
        bubble:function(obj){var t,_r=function(i){if(i<=3){$(obj).addClass('show');i++;$(obj).addClass('bubble-'+i).removeClass('bubble-'+(i-1));t=setTimeout(function(){_r(i);},250);}else{t=setTimeout(function(){$(obj).removeClass('show').removeClass('bubble-'+i);window.clearTimeout(t);},750);}};_r(0);return this;},
        flame:function(obj,b){if(b){$(obj).parent('div').addClass('flame');}else{$(obj).parent('div').removeClass('flame');}},
        blaze:function(obj,b){if(b){$(obj).parent('div').addClass('blaze').removeClass('unblaze');$(obj).animate({opacity:1},500);}else{$(obj).parent('div').addClass('unblaze').removeClass('blaze');};return this;},
        rotate:function(obj){var t,_r=function(i){if(i<=1){i++;$(obj).addClass('rotate-'+i).removeClass('rotate-'+(i-1));t=setTimeout(function(){_r(i);},10);}else{t=setTimeout(function(){$(obj).removeClass('rotate').removeClass('rotate-'+i);window.clearTimeout(t);},100);}};_r(0);return this;}, 
        rows:{hilite:function(row,column){$S.effects.cells.lolite();$($S.temp.S.table.tr,$S.temp.S.table.t).each(function(i){if(false!=(row==$(this).data('row'))){$(this).addClass('active');}else{$(this).removeClass('active');$($S.temp.S.table.td,this).removeClass('active');$($S.temp.S.table.td,this).each(function(j){if(false!=(column==$(this).data('column'))){$(this).addClass('active');}});}});return this;},lolite:function(){$($S.temp.S.table.tr,$S.temp.S.table.t).each(function(i){$(this).removeClass('active');$($S.temp.S.table.td,this).removeClass('active');});return this;}},
        cells:{hilite:function(item){$S.effects.rows.lolite();$($S.temp.S.item,$S.temp.S.table.t).each(function(){if(false!=(item==$(this).data('item'))){$(this).addClass('hilite');}else{$(this).removeClass('hilite');}});return this;},lolite:function(){$($S.temp.S.item,$S.temp.S.table.t).removeClass('hilite');return this;}}
    },
    save:{
        puzzle:function(){$S.grid.H.save();$S.grid.V.save();$S.grid.M.save();$S.grid.A.save();$S.stats.S.save();return this;},
        answers:function(){$S.grid.A.save();return this;},
        stats:function(){$S.stats.S.save();return this;}
    },
    cookie:{ 
        set:function(n,o){return $.cookie(n,(($.type(o)==='object')?JSON.stringify(o):o),{path:'/'});},
        get:function(n){var c;if(null==(c=$.cookie(n))){return false;}else{return JSON.parse(c);}},
        args:function(a){for(i in a){this.set(a[i][0],a[i][1]);}return this;}
    },
    recover:function(){if(!$S.grid.H.find()||!$S.grid.V.find()||!$S.grid.M.find()||!$S.stats.S.find()){return false;}else{$S.grid.A.find();return true;}},
    reset:function(){$S.cookie.args([["sudokuPuzzleHGrid",null],["sudokuPuzzleVGrid",null],["sudokuPuzzleMGrid",null],["sudokuPuzzleAGrid",null],["sudokuPuzzleStats",null]]);$($S.temp.S.modal.m).remove();$($S.temp.S.tablecontainer).remove();return $S.init();},
    attach:{
        init:function(){
            $S.attach.reset();
            $S.attach.input();
            $S.attach.picker();
            $S.attach.closed();
        },
        reset:function(){
            $($S.temp.S.reset).click(function(e){
                e.preventDefault();e.stopImmediatePropagation();
                if (confirm("Are you sure you want to reset the puzzle?")){
                    $S.stats.S.reset();
                    $S.stats.difficulty.set($(this).data('difficulty'));
                    $S.reset();
                }
            });
        },
        input:function(){
            $($S.temp.S.input,$S.temp.S.table.t).bind({
                focus:function(e){
                    e.preventDefault();e.stopImmediatePropagation();
                    $S.effects.rows.hilite($(this).data('row'),$(this).data('column'));
                    $S.effects.blaze(this,true);
                    $S.puzzle.setEdit(this,true);
                },
                blur:function(e){
                    e.preventDefault();
                    $S.effects.blaze(this,false);
                },
                keypress:function(e){
                    if(e.keyCode==9) { 
                        $S.puzzle.setEdit(this,false); 
                    }else if(e.which > 0){
                        e.preventDefault();
                        if($.type($S.keys[e.which])==='number'){
                            $S.puzzle.select(this,$S.keys[e.which]);
                        }
                    }
                }
            });
        },
        picker:function(){
            $($S.temp.S.picker).each(function(){
                $(this).bind({
                    click:function(e){

                        e.preventDefault();e.stopImmediatePropagation();
                        $S.puzzle.select($S.temp.S.target,$(this).data('value'));
                    }
                });
            });
        },
        closed:function(obj){            
            if(obj){
                $(obj).bind({
                    click:function(e){
                        e.preventDefault();e.stopImmediatePropagation();
                        $S.effects.cells.hilite($(this).data('item'));
                    }
                });
            }else{
                $($S.temp.S.item,$S.temp.S.table.t).each(function(){
                    $S.attach.closed(this);
                });
            }
        }
    }
};

Sudoku = $S;