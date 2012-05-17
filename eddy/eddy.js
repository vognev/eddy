;
(function($){
    
    // eddy constructor
    function Editor(root, options){

        if (
            $(root).get(0).nodeName != 'TEXTAREA' ||
            typeof(rangy) == 'undefined'
        ) return false;

        var self = this;
        if (options == 'destroy'){
            if ( (eddy = $(root).data('eddy')) ){
                return eddy.destroy()
            }
        }

        if (options == 'sync'){
            if ( (eddy = $(root).data('eddy')) ){
                return eddy.sync()
            }
        }

        options = $.extend(
            {
                'width': 'auto'
            },
            options
        );

        var $root = $(root),
            buttons = {};

        $root.data('eddy', self);

        $root.hide();

        var $wrapper = $root.wrap('<div class="eddy"/>').parent().css({
            'width': options.width
        });

        var $editable = $('<div class="canvas"/>').prependTo($wrapper)
            .html($root.val() ? $root.val() : '<br>'),
            editable = $editable.get(0);

        $editable.bind("keypress", function(e){
            if (e.which == 13) {
                if (window.getSelection) {
                    var selection   = window.getSelection(),
                        range       = selection.getRangeAt(0),
                        br          = document.createElement("br");
                    range.deleteContents();
                    range.insertNode(br);
                    range.setStartAfter(br);
                    range.setEndAfter(br);
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return false;
                }
            }
        });

        var $toolbar = $(
            '<div class="toolbar">'+
                '<table cellspacing=0 cellpadding=0>'+
                    '<tr>'+
                    '<td><a class="bold"></a></td>'+
                    '<td><a class="italic"></a></td>'+
                    '<td><a class="underline"></a></td>'+
                    '<td><a class="strikethrough"></a></td>'+
                    '<td class="separator">&nbsp;</td>'+
                    '<td><a class="cite"></a></td>'+
                    '<td><a class="list_bullets"></a></td>'+
                    '<td><a class="list_numbers"></a></td>'+
                    '<td class="separator">&nbsp;</td>'+
                    '<td><a class="link"></a></td>'+
                    '<td><a class="unlink"></a></td>'+
                    '<td><a class="image"></a></td>'+
                    '<td class="separator">&nbsp;</td>'+
                    '</tr>'+
                '</table>'+
            '</div>'
        ).insertBefore($editable);

        var $dialog = $('<div class="dialog"/>').insertAfter($toolbar).hide();

        $editable.attr('contentEditable', true);

        // misc
        function getClosestParentNode(node1, node2){
            var p1 = [ node1 ],
                p2 = [ node2 ],
                tmp = null,
                p1HasEditable = false,
                p2HasEditable = false;

                if (node1 == editable) p1HasEditable = true;
                if (node2 == editable) p2HasEditable = true;

                while( (p1[p1.length - 1]) && (tmp = p1[p1.length - 1].parentNode) ) {
                    p1.push(tmp);
                    if (tmp == editable) p1HasEditable = true;
                }
                while( (p2[p2.length - 1]) && (tmp = p2[p2.length - 1].parentNode) ) {
                    p2.push(tmp);
                    if (tmp == editable) p2HasEditable = true;
                }

                if (!p1HasEditable && !p2HasEditable) return null;

                for (var i = 0; i < p1.length; i++)
                for (var j = 0; j < p2.length; j++)
                    if ( p1[i] == p2[j] /*&& p1[i] != node1 && p2[j] != node2*/ ){
                        return p1[i];
                    }
                return null;
        }

        function hasAmongParents(node, parent){

            if (!node || !parent ) return false;

            if (node == parent) return true;

            while(node && node.parentNode){
                if (node.parentNode == parent) return true;
                node = node.parentNode;
            }

            return false;
        }

        // buttons
        buttons.bold = {
            ui: $toolbar.find('a.bold'),
            tooltip: 'Bold',
            command: function(){
                document.execCommand('Bold', false, '');
            }
        };

        buttons.italic = {
            ui: $toolbar.find('a.italic'),
            tooltip: 'Italic',
            command: function(){
                document.execCommand('Italic', false, '');
            }
        };

        buttons.underline = {
            ui: $toolbar.find('a.underline'),
            tooltip: 'Underline selection',
            command: function(){
                document.execCommand('Underline', false, '');
            }
        };

        buttons.strikethrough = {
            ui: $toolbar.find('a.strikethrough'),
            tooltip: 'Strike selection',
            command: function(){
                document.execCommand('StrikeThrough', false, '');
            }
        };

        buttons.cite = {
            ui: $toolbar.find('a.cite'),
            tooltip: 'Wrap selection into blockquote',
            command: function(){

                var i = 0;

                var sel = rangy.getSelection();
                if (sel.rangeCount == 0)
                    return;

                var rng = sel.getRangeAt(0);

                var parent = getClosestParentNode(rng.startContainer, rng.endContainer);
                if (parent) {

                    var cites = $(parent).parents('blockquote');

                    if (cites.length){
                      
                        for (i = 0; i < cites.length; i++){
                            if (cites[i] == editable) break;
                            for(var j = cites[i].childNodes.length - 1; j > -1; j--){
                                $(cites[i].childNodes[j]).insertAfter(cites[i]);
                            }
                            $(cites[i]).remove();
                            break;
                        }

                    }else{
                        if (parent.nodeName == 'LI'){
                            while( true ){
                                parent = parent.parentNode;
                                if ( parent && (parent.nodeName == 'UL') || parent.nodeName == 'OL' ){
                                    break;
                                }
                            }
                        }

                        if (parent == editable){
                            // wrap all content
                            var cn = editable.childNodes;
                            $editable.prepend($('<blockquote/>'));
                            for (i = cn.length - 1; i > 0; i--){
                                $(cn[i]).prependTo(editable.firstChild);
                            }

                        }else{
                            $(parent).wrap('<blockquote/>');
                        }
                    }
                }
            }
        };

        buttons.list_bullets = {
            ui: $toolbar.find('a.list_bullets'),
            tooltip: 'Make unordered list',
            command: function(){
                document.execCommand('InsertUnorderedList', false, '');
            }
        };

        buttons.list_numbers = {
            ui: $toolbar.find('a.list_numbers'),
            tooltip: 'Make ordered list',
            command: function(){
                document.execCommand('InsertOrderedList', false, '');
            }
        };

        buttons.link = {
            ui: $toolbar.find('a.link'),
            tooltip: 'Insert link in cursor position',
            command: function(){

                var sel = rangy.getSelection();
                if (!sel.rangeCount) 
                    return;

                var rng = sel.getRangeAt(0);
                rng.collapse();

                if (!hasAmongParents(rng.endContainer, editable)) return;

                $dialog.show().html(
                    '<div class="control">'+
                        '<input class="text title" type="text" value="Link title"/>'+
                        '<input class="text link" type="text" value="http://"/>'+
                    '</div>'+
                    '<div class="buttons">'+
                        '<input class="button insert" type="button" value="Insert"/>'+
                        '<input class="button cancel" type="button" value="Cancel"/>'+
                    '</div>'
                );
                
                $dialog.find('.cancel').click(function(e){
                    e.preventDefault();
                    $dialog.html('').hide();
                });

                $dialog.find('.insert').click(function(e){
                    e.preventDefault();
                    var url = $dialog.find('.link').val(),
                        text = $dialog.find('.title').val();

                    try{
                        $editable.focus();
                        sel.removeAllRanges();

                        var link = document.createTextNode(text);
                        rng.insertNode(link);
                        rng.selectNode(link);
                        sel.addRange(rng);

                        document.execCommand('CreateLink', false, url);
                        
                        $dialog
                            .find('.cancel').unbind('click').end()
                            .find('.insert').unbind('click').end()
                            .html('').hide();
                            
                    }catch(e){
                        console && console.log && console.log(e);
                    }
                });

            }
        };

        buttons.unlink = {
            ui: $toolbar.find('a.unlink'),
            tooltip: 'Remove links from selection',
            command: function(){
                document.execCommand('Unlink', false, '');
            }
        };

        buttons.image = {
            ui: $toolbar.find('a.image'),
            tooltip: 'Insert image in cursor position',
            command: function(){
            
                var sel = rangy.getSelection();
                if (!sel.rangeCount) 
                    return;
                
                var rng = sel.getRangeAt(0);
                rng.collapse();

                if (!hasAmongParents(rng.endContainer, editable)) return;

                $dialog.show().html(
                    '<div class="control">'+
                        '<input class="text link" type="text" value="http://"/>'+
                    '</div>'+
                    '<div class="buttons">'+
                        '<input class="button insert" type="button" value="Insert"/>'+
                        '<input class="button cancel" type="button" value="Cancel"/>'+
                    '</div>'
                );

                $dialog.find('.cancel').click(function(e){
                    e.preventDefault();
                    $dialog.html('').hide();
                });

                $dialog.find('.insert').click(function(e){
                    e.preventDefault();
                    var url = $dialog.find('.link').val();
                    try{
                        sel.removeAllRanges();
                        sel.addRange(rng);
                        $editable.focus();

                        document.execCommand('InsertImage', false, url);
                        
                        $dialog
                            .find('.cancel').unbind('click').end()
                            .find('.insert').unbind('click').end()
                            .html('').hide();

                    }catch(e){
                        console && console.log && console.log(e);
                    }
                });
            }
        };

        // prevent deselecting
        for (var idx in buttons){

            if (!buttons.hasOwnProperty(idx)) continue;

            $(buttons[idx].ui).mousedown(function(e){
                if (e.preventDefault) e.preventDefault();
                return false;
            }).click((function(idx){
                return function(){
                    if (buttons[idx].command){
                        buttons[idx].command();
                    }
                    return false;
                }
            })(idx))
            .attr('unselectable', 'on').parent().attr('unselectable', 'on');

            // tooltips
            if (buttons[idx].tooltip){
                buttons[idx].ui.mouseover((function(idx){
                    return function(){
                        var $tip = $(
                            '<div class="tooltip" >'+
                                '<div class="tooltip-body">'+buttons[idx].tooltip+'</div>'+
                                '<div class="tooltip-handle"></div>'+
                            '</div>').appendTo(this.parentNode).hide().fadeIn();
                        
                        $(this.parentNode).mouseout(function(){
                            $tip.stop().remove();
                        });
                    }
                })(idx))
            }
        }

        this.sync = function(){
            $root.val($editable.html());
        };

        this.destroy = function(){
            this.sync();
            $root.insertBefore($wrapper).show();
            $wrapper.remove();
        };

        return this;
    }

    $.fn.eddy = function(options){

        if (this.length == 1){
            return new Editor(this[0], options);
        }

        return this.each(function(){
            new Editor(this, options);
        });
    }

})(jQuery);
