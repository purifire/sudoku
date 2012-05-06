/**
 *  Sudoku Core
 *  ------------------
 *  @version       0.08a
 *  @author        d.prock
 *  @dependencies  jquery, tempload, easing
 */

var Sudoku = {
    data:null, points:250, pass:0, range:[1,2,3,4,5,6,7,8,9], keys:{49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9}, cardinals:{37:'left',38:'up',39:'right',40:'down'},
    init: function() {
        Sudoku.temp.load.init();

        if (!this.recover()) {
            Sudoku.grid.H.set();
            Sudoku.grid.V.set();
            Sudoku.grid.A.set();
            Sudoku.generate.xyGrids();
            Sudoku.grid.M.set().make();
            Sudoku.save.puzzle();
        }

        Sudoku.grid.A.get();
        Sudoku.data = {
            rows       : Sudoku.grid.M.get(),
            range      : Sudoku.range,
            strike     : Sudoku.stats.strike.get(),
            multiplier : Sudoku.stats.multiplier.int(),
            score      : Sudoku.stats.score.get(),
            difficulty : Sudoku.stats.difficulty.get(),
            dparams    : Sudoku.stats.difficulty.params.get()
        };
        Sudoku.temp.load.main(Sudoku.data, Sudoku.attach.init).modal();
        Sudoku.puzzle.fulfill();
    },
    temp:{
        T:{t:'sudoku',c:'cell',m:'modal'},
        S:{container:'#sContainer',modal:{m:'#sMC',span:'#sMC > span'},tablecontainer:'#sTableContainer',table:{t:'#sTable',tr:'tbody > tr',td:'td'},item:'.item p',input:'.cell p',closed:'.closed p',target:'p.target',picker:'button.picker',reset:'button.reset',labels:'thead > tr > th > ul li'},
        load:{
            init: function() {
                $.tmpload(Sudoku.temp.T.t, '/assets/templates/sudoku.tmpl');
                $.tmpload(Sudoku.temp.T.c, '/assets/templates/cell.tmpl');
                $.tmpload(Sudoku.temp.T.m, '/assets/templates/modal.tmpl');
            },
            main: function(obj,cb) {
                $.when($.tmpload(Sudoku.temp.T.t), obj).then(function(tmpl, data) {
                    $.tmpl(tmpl, data).appendTo(Sudoku.temp.S.container);
                    if ($.type(cb)==='function') {cb();};
                });
                return this;
            },
            modal: function() {
                $.when($.tmpload(Sudoku.temp.T.m),{content:''}).then(function(tmpl, data) {
                    $.tmpl(tmpl, data).appendTo(Sudoku.temp.S.container);
                });
                return this;
            }
        },
        update:{
            cell: function(obj,a,cb) {
                $.when($.tmpload(Sudoku.temp.T.c),{cell:a}).then(function(tmpl, data) {
                    var o = $.tmpl(tmpl, data).appendTo($(obj).parent('div').parent('td').empty());
                    if ($.type(cb)==='function') {
                        cb(o);
                    }
                    Sudoku.attach.closed(o.find('p'));
                });
                return this;
            },
            labels: function(i,j) {
                var o = $(Sudoku.temp.S.labels, Sudoku.temp.S.table.t).get(j);
                $(o).find('span').text(i);
                return this;
            },
            modal: function(s) {
                $.when($.tmpload(Sudoku.temp.T.m),{content:s}).then(function(tmpl, data) {
                    $(Sudoku.temp.S.modal.span, Sudoku.temp.S.container).text(s);
                    Sudoku.effects.bubble(Sudoku.temp.S.modal.m);
                });
                return this;
            }
        }
    },
    generate:{ 
        xyGrids: function(i) {
            var i = i||1, box, opt, val, x, y;
            if (Sudoku.pass > 100) {
                Sudoku.grid.H.set();
                Sudoku.grid.V.set();
                i = 1;
                Sudoku.pass = 0;
            }

            Sudoku.pass++;

            try { 
                for(x = i; x <= 9; x++) {
                    for( y = 1; y <= 9; y++) {
                        Sudoku.grid.h[x] = ($.type(Sudoku.grid.h[x])==='undefined') ? {}:Sudoku.grid.h[x];
                        Sudoku.grid.v[y] = ($.type(Sudoku.grid.v[y])==='undefined') ? {}:Sudoku.grid.v[y];

                        box = Sudoku.generate.zGrid(x, y);
                        opt = Sudoku.generate.grep(Sudoku.grid.h[x], Sudoku.grid.v[y], box);
                        val = Sudoku.generate.rand(opt);

                        if ($.type(val)!=='number') {
                            Sudoku.grid.h[x] = {};
                            return Sudoku.generate.xyGrids(x);
                        }

                        Sudoku.grid.h[x][y] = Sudoku.grid.v[y][x] = val;
                    }
                }
            } catch(e) {
                console.log(e);
            } 
            return this;
        },
        zGrid: function(x,y) {
            var box = [], r = Math.ceil(x/3) * 3, l = r - 2, b = Math.ceil(y/3) * 3, t = b - 2;
            for(x = l; x <= r; x++) {
                for(y = t; y <= b; y++) {
                    if (null !== (Sudoku.grid.h[x]||null)) {
                        if (null !== (Sudoku.grid.h[x][y]||null)) {
                            box.push(Sudoku.grid.h[x][y]);
                        }
                    }
                }
            }
            return box;
        },
        mArr: function(obj) {
            var args = [];
            for(i in obj) {
                args[i] = obj[i];
            }
            return args;
        },
        grep: function(a,b,c,d) {
            d = $.grep(Sudoku.range, function(e) {
                    return $.inArray(e, Sudoku.generate.mArr(a)) == -1;
                });
            d = $.grep(d, function(e) {
                    return $.inArray(e, Sudoku.generate.mArr(b)) == -1;
                });

            return $.grep(d, function(e) {
                    return $.inArray(e, c) == -1;
                });
        },
        rand: function(a) { 
            return a[Math.floor(Math.random() * a.length)];
        }
    },
    grid:{
        h:null, v:null, m:null, a:null,
        H: {
            set: function(o) {
                Sudoku.grid.h = ($.type(o)!=='object') ? {}:o;
                return this;
            },
            get: function() {
                return Sudoku.grid.h;
            },
            save: function() {
                Sudoku.storage.set("sudokuPuzzleHGrid", this.get());
            },
            find: function(c) {
                if (false !== (c = Sudoku.storage.get("sudokuPuzzleHGrid"))) {
                    this.set(c);
                    return true;
                } else {
                    return false;
                }
            }
        },
        V: {
            set: function(o) {
                Sudoku.grid.v = ($.type(o)!=='object') ? {}:o;
                return this;
            },
            get: function() {
                return Sudoku.grid.v;
            },
            save: function() {
                Sudoku.storage.set("sudokuPuzzleVGrid", this.get());
            },
            find: function(c) {
                if (false !== (c = Sudoku.storage.get("sudokuPuzzleVGrid"))) {
                    this.set(c);
                    return true;
                } else {
                    return false;
                }
            }
        },
        A: { 
            set: function(o) {
                Sudoku.grid.a = ($.type(o)!=='object') ? {}:o;
                return this;
            },
            get: function() {
                return Sudoku.grid.a;
            },
            save: function() {
                Sudoku.storage.set("sudokuPuzzleAGrid", this.get());
            },
            find: function(c) {
                if (false !== (c = Sudoku.storage.get("sudokuPuzzleAGrid"))) {
                    this.set(c);
                    return true;
                } else {
                    return false;
                }
            }
        },
        M: {
            set: function(o) {
                Sudoku.grid.m = ($.type(o)!=='object') ? {}:o;
                return this;
            },
            get: function() {
                return Sudoku.grid.m;
            },
            save: function() {
                Sudoku.storage.set("sudokuPuzzleMGrid", this.get());
            },
            find: function(c) {
                if (false !== (c = Sudoku.storage.get("sudokuPuzzleMGrid"))) {
                    this.set(c);
                    return true;
                } else {
                    return false;
                }
            },
            make: function() {
                $.extend(true, Sudoku.grid.m, Sudoku.grid.H.get());
                try { 
                    for(var x = 1; x <= 9; x++) {
                        for(var y = 1; y <= 9; y++) {
                            Sudoku.grid.m[y][x] = ((Math.floor(Math.random() * Sudoku.stats.difficulty.i)+1) == 1) ? Sudoku.grid.h[y][x]:"";
                        }
                    }
                } catch(e) {
                    console.log(e);
                }
                return this;
            }
        }
    },
    puzzle:{ 
        validate:{ 
            all: function() {
                var p=[];

                $(Sudoku.temp.S.input, Sudoku.temp.S.table.t).each(function(i) {
                    p.push( ($(this).text() || null) );
                });

                return ($.inArray(null, p) == -1 && p.length==81);
            },
            cell: function(x,y,v) { 
                if (v == Sudoku.grid.h[x][y]) {
                    if (Sudoku.puzzle.validate.all()) {
                        Sudoku.temp.update.modal('puzzle complete');
                    }
                    return true;
                } else {
                    return false;
                }
            }
        },
        select: function(t,a) {
            var obj = $(t, Sudoku.temp.S.table.t);
            if (!obj.length) {
                Sudoku.temp.update.modal("Please select a target cell.");
            } else {
                var x = obj.data('row'), y = obj.data('column');

                if (Sudoku.puzzle.validate.cell(x, y, a)) {
                    Sudoku.puzzle.setAnswer(obj, x, y, a);
                    Sudoku.stats.score.add();
                } else {
                    obj.text(a);
                    Sudoku.stats.strike.add();
                    Sudoku.stats.multiplier.add();
                    Sudoku.effects.flame(obj, true);
                }
                Sudoku.save.stats();
            }
            return this;
        },
        fulfill: function() {
            /*    
                TODO 
                check number of completed elements and disable pickers if fulfilled
             */
            //Sudoku.temp.update.modal("hello");
            var m = $.extend(true, Sudoku.grid.m, Sudoku.grid.a);
            
            //console.dir(m);
            return this;
        },
        isAnswer: function(x,y) {
            return (null !== Sudoku.grid.a && $.type(Sudoku.grid.a[x]) !== 'undefined' && $.type(Sudoku.grid.a[x][y]) !== 'undefined');
        },
        setAnswer: function(obj,x,y,a) {
            if (null === Sudoku.grid.a) {
                Sudoku.grid.A.set();
            }

            Sudoku.grid.a[x] = (null == Sudoku.grid.a[x]) ? {}:Sudoku.grid.a[x];
            Sudoku.grid.a[x][y] = a;
            Sudoku.grid.A.save();
            Sudoku.temp.update.cell(obj, a, function(o) {
                Sudoku.effects.rotate(o).blaze(o, true);
            });
            return this;
        },
        getAnswer: function(x,y) {
            return Sudoku.grid.h[x][y];
        },
        setEdit: function(obj,b) {
            $(Sudoku.temp.S.input, Sudoku.temp.S.table.t).removeClass('target');
            if (b) {
                $(obj).addClass('target');
            }
            return this;
        }
    },
    stats:{
        S:{
            save: function() {
                Sudoku.storage.set("sudokuPuzzleStats", {
                    strike     : Sudoku.stats.strike.get(), 
                    multiplier : Sudoku.stats.multiplier.get(), 
                    score      : Sudoku.stats.score.get(), 
                    difficulty : Sudoku.stats.difficulty.get(), 
                    dparams    : Sudoku.stats.difficulty.params.get()
                });
                return this;
            },
            find: function(c) {
                if (false !== (c = Sudoku.storage.get("sudokuPuzzleStats"))) {
                    Sudoku.stats.strike.set(c.strike);
                    Sudoku.stats.multiplier.set(c.multiplier);
                    Sudoku.stats.score.set(c.score);
                    Sudoku.stats.difficulty.set(c.difficulty);
                    return true;
                } else {
                    return false;
                }
            },
            reset: function() {
                Sudoku.stats.strike.set(0);
                Sudoku.stats.multiplier.set(0);
                Sudoku.stats.score.set(0);
                return this;
            }
        },
        strike:{
            i:0,
            set: function(i) {
                this.i = i;
                return this;
            },
            get: function() {
                return this.i;
            },
            add: function() {
                this.set(this.get()+1);
                Sudoku.temp.update.labels(this.get(), 0);
            }
        },
        multiplier:{
            i:0, a:[10,9,8,7,6,5,4,3,2,1],
            set: function(i) {
                this.i = i;
                return this;
            },
            get: function() {
                return this.i;
            },
            int: function() {
                return this.a[this.get()];
            },
            add: function() {
                var i = this.get()+1;
                if (i < this.a.length) {
                    this.set(i);
                }
                Sudoku.temp.update.labels(this.int(), 1);
            }
        },
        score:{
            i:0,
            set: function(i) {
                this.i = i;
                return this;
            },
            get: function() {
                return this.i;
            },
            add: function() {
                this.set((parseInt(this.get(), 10) + (Sudoku.stats.multiplier.int() * Sudoku.points)));
                Sudoku.temp.update.labels(this.get(), 2);
            }
        },
        difficulty:{
            i:3,
            set: function(i) {
                this.i = i;
                return this;
            },
            get: function() {
                return this.i;
            },
            params: {
                o: {
                    3: 'easy',
                    4: 'medium',
                    5: 'hard'
                },
                set: function(o) {
                    this.o = o;
                    return this;
                },
                get: function() {
                    return this.o;
                }
            }
        }
    },
    effects:{
        bubble: function(obj) {
            var t,
            _r = function(i) {
                if (i <= 3) {
                    i++;
                    $(obj).addClass('show');
                    $(obj).addClass('bubble-'+i).removeClass('bubble-'+(i-1));
                    t = setTimeout(function() {
                        _r(i);
                    }, 250);
                } else {
                    t = setTimeout(function() {
                        $(obj).removeClass('show').removeClass('bubble-'+i);
                        window.clearTimeout(t);
                    }, 750);
                }
            };

            _r(0);
            return this;
        },
        flame: function(obj,b) {
            if (b) {
                $(obj).parent('div').addClass('flame');
            } else {
                $(obj).parent('div').removeClass('flame');
            }
        },
        blaze: function(obj,b) {
            if (b) {
                $(obj).parent('div').addClass('blaze').removeClass('unblaze');
                $(obj).animate({opacity:1}, 500);
            } else {
                $(obj).parent('div').addClass('unblaze').removeClass('blaze');
            };
            return this;
        },
        rotate: function(obj) {
            var t,
            _r = function(i) {
                if (i <= 1) {
                    i++;
                    $(obj).addClass('rotate-'+i).removeClass('rotate-'+(i - 1));
                    t = setTimeout(function() {
                        _r(i);
                    }, 10);
                } else {
                    t = setTimeout(function() {
                        $(obj).removeClass('rotate').removeClass('rotate-'+i);
                        window.clearTimeout(t);
                    }, 100);
                }
            };

            _r(0);
            return this;
        }, 
        rows: {
            hilite: function(row,column) {
                Sudoku.effects.cells.lolite();
                $(Sudoku.temp.S.table.tr, Sudoku.temp.S.table.t).each(function(i) {
                    if (false != (row == $(this).data('row'))) {
                        $(this).addClass('active');
                    } else {
                        $(this).removeClass('active');
                        $(Sudoku.temp.S.table.td, this).removeClass('active');
                        $(Sudoku.temp.S.table.td, this).each(function(j) {
                            if (false != (column == $(this).data('column'))) {
                                $(this).addClass('active');
                            }
                        });
                    }
                });
                return this;
            },
            lolite: function() {
                $(Sudoku.temp.S.table.tr, Sudoku.temp.S.table.t).each(function(i) {
                    $(this).removeClass('active');
                    $(Sudoku.temp.S.table.td, this).removeClass('active');
                });
                return this;
            }
        },
        cells: {
            hilite: function(item) {
                Sudoku.effects.rows.lolite();
                $(Sudoku.temp.S.item, Sudoku.temp.S.table.t).each(function() {
                    if (false != (item == $(this).data('item'))) {
                        $(this).addClass('hilite');
                    } else {
                        $(this).removeClass('hilite');
                    }
                });
                return this;
            },
            lolite: function() {
                $(Sudoku.temp.S.item, Sudoku.temp.S.table.t).removeClass('hilite');
                return this;
            }
        }
    },
    save:{
        puzzle: function() {
            Sudoku.grid.H.save();
            Sudoku.grid.V.save();
            Sudoku.grid.M.save();
            Sudoku.grid.A.save();
            Sudoku.stats.S.save();
            return this;
        },
        answers: function() {
            Sudoku.grid.A.save();
            return this;
        },
        stats: function() {
            Sudoku.stats.S.save();
            return this;
        }
    },
    storage: { 
        set: function(n,o) {
			localStorage.setItem(n, JSON.stringify(o));
            return this;
        },
        get: function(n) {
            var c;
            if (null == (c = localStorage.getItem(n) )) {
                return false;
            } else {
                return JSON.parse(c);
            }
        },
        clear: function(a) {
			localStorage.clear();
            return this;
        }
    },
    recover: function() {
        if ( ! Sudoku.grid.H.find() || ! Sudoku.grid.V.find() || ! Sudoku.grid.M.find() || ! Sudoku.stats.S.find()) {
            return false;
        } else {
            Sudoku.grid.A.find();
            return true;
        }
    },
    reset: function() {
        Sudoku.storage.clear();
        $(Sudoku.temp.S.modal.m).remove();
        $(Sudoku.temp.S.tablecontainer).remove();

        return Sudoku.init();
    },
    attach:{
        init: function() {
            Sudoku.attach.reset();
            Sudoku.attach.input();
            Sudoku.attach.picker();
            Sudoku.attach.closed();
        },
        reset: function() {
            $(Sudoku.temp.S.reset).click(function(e) {
                e.preventDefault();e.stopImmediatePropagation();
                if (confirm("Are you sure you want to reset the puzzle?")) {
                    Sudoku.stats.S.reset();
                    Sudoku.stats.difficulty.set($(this).data('difficulty'));
                    Sudoku.reset();
                }
            });
        },
        input: function() {
            $(Sudoku.temp.S.input, Sudoku.temp.S.table.t).bind({
                focus: function(e) {
                    e.preventDefault();e.stopImmediatePropagation();
                    Sudoku.effects.rows.hilite($(this).data('row'), $(this).data('column'));
                    Sudoku.effects.blaze(this, true);
                    Sudoku.puzzle.setEdit(this, true);
                },
                blur: function(e) {
                    e.preventDefault();
                    Sudoku.effects.blaze(this, false);
                },
                keypress: function(e) {
                    if (e.keyCode == 9) { 
                        Sudoku.puzzle.setEdit(this, false); 
                    } else if (e.which > 0) {
                        e.preventDefault();
                        if ($.type(Sudoku.keys[e.which])==='number') {
                            Sudoku.puzzle.select(this, Sudoku.keys[e.which]);
                        }
                    }
                }
            });
        },
        picker: function() {
            $(Sudoku.temp.S.picker).each(function() {
                $(this).bind({
                    click: function(e) {
                        e.preventDefault();e.stopImmediatePropagation();
                        Sudoku.puzzle.select(Sudoku.temp.S.target, $(this).data('value'));
                    }
                });
            });
        },
        closed: function(obj) {
            if (obj) {
                $(obj).bind({
                    click: function(e) {
                        e.preventDefault();e.stopImmediatePropagation();
                        Sudoku.effects.cells.hilite($(this).data('item'));
                    }
                });
            } else {
                $(Sudoku.temp.S.item, Sudoku.temp.S.table.t).each(function() {
                    Sudoku.attach.closed(this);
                });
            }
        }
    }
};