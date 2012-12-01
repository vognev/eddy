;
(function($){
    
    // eddy constructor
    function Editor(root, options){

        if (
            $(root).get(0).nodeName != 'TEXTAREA' ||
            typeof(rangy) == 'undefined'
        ) return false;

        rangy.init();

        var self = this;
        if (options == 'destroy'){
            if ( (eddy = $(root).data('eddy')) ){
                return eddy.destroy()
            }
        }

        if (options == 'sync') {
            if ( (eddy = $(root).data('eddy')) ) {
                return eddy.sync()
            }
        }

        options = $.extend(
            {
                width:   'auto',
                toolbar: [
                    'bold', 'italic', 'underline', 'separator',
                    'strikethrough', 'cite', 'separator',
                    'list_bullets', 'list_numbers', 'separator',
                    'link', 'unlink', 'separator',
                    'image'
                ]
            }, options
        );

        var $root = $(root).data('eddy', self).hide();

        var $wrapper = $root.wrap('<div class="eddy"/>').parent().css({
            'width': options.width
        });

        var $editable   = $('<div class="canvas"/>').prependTo($wrapper).html($root.val())
                .css('height', $root.height())
                .attr('contentEditable', true),
            editable    = $editable.get(0);

        // prevent link clicks in editable
        $editable.delegate('a', 'click', function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        var onFocus = function(){ self.focus(); }
        $root.bind('focus', onFocus);

        var $toolbar = $('<table/>').insertBefore($editable).wrap('<div class="toolbar"></div>'),
            $dialog = $('<div class="dialog"/>').insertAfter($toolbar).hide();

        this.getButton = function(nameOrObject) {
            if (this.commands.hasOwnProperty(nameOrObject)) {
                return this.commands[nameOrObject]
            }
            return nameOrObject;
        }

        // build toolbar
        if (options.toolbar) {

            for(var i = 0; i < options.toolbar.length; i++) {

                if (options.toolbar[i] == 'separator') {
                    $toolbar.append('<td class="separator"></td>');
                } else {
                    var button = self.getButton(options.toolbar[i]);
                    var a = $('<td><a class="' + button.name + '"></a></td>').appendTo($toolbar).find('a');

                    // tooltip
                    if (button.tooltip) a.bind('mouseover', (function(button){
                        return function() {
                            var $tip = $(
                                '<div class="tooltip" >'+
                                    '<div class="tooltip-body">'+button.tooltip+'</div>'+
                                    '<div class="tooltip-handle"></div>'+
                                    '</div>').appendTo(this.parentNode).hide().fadeIn();
                            $(this.parentNode).mouseout(function(){
                                $tip.stop().remove();
                            });
                        }
                    })(button));

                    // prevent focus loss and bind command
                    a.mousedown(function(e){
                        e.preventDefault();e.stopPropagation(); return false;
                    });

                    a.click((function(button){
                        return function(e) {
                            if (button.command) button.command.apply(self);
                            return false;
                        }
                    })(button));
                }
            }
            $toolbar.append('<td class="separator"></td>');
        }

        this.sync = function(){
            $root.val($editable.html());
        };

        this.destroy = function(){
            this.sync();
            $root.insertBefore($wrapper).show();
            $wrapper.remove();
            $root.unbind('focus', onFocus);
        };

        this.setContent = function(html) {
            $editable.html(html); $root.html(html);
            return this;
        }

        this.focus = function() {
            var r = rangy.createRange();
            r.selectNodeContents($editable.get(0));
            r.collapse(true);
            rangy.getSelection().setSingleRange(r);
            $editable.focus();
            return this;
        }

        this.getEditable = function() {
            return $editable;
        }

        this.getDialog = function() {
            return $dialog;
        }

        return this;
    }

    function getClosestParentNode(node1, node2, editable){
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

    Editor.prototype.commands = {
        bold: {
            name: 'bold',
            tooltip: 'Bold',
            command: function(){
                document.execCommand('Bold', false, '');
            }
        },
        italic: {
            name: 'italic',
            tooltip: 'Italic',
            command: function(){
                document.execCommand('Italic', false, '');
            }
        },
        underline: {
            name: 'underline',
            tooltip: 'Underline selection',
            command: function(){
                document.execCommand('Underline', false, '');
            }
        },
        strikethrough: {
            name: 'strikethrough',
            tooltip: 'Strike selection',
            command: function(){
                document.execCommand('StrikeThrough', false, '');
            }
        },
        cite: {
            name: 'cite',
            tooltip: 'Wrap selection into blockquote',
            command: function() {

                var i                   = 0,
                    self                = this,
                    $editable           = self.getEditable(),
                    editable            = $editable.get(0);

                var sel = rangy.getSelection();
                if (sel.rangeCount == 0)
                    return;

                var rng = sel.getRangeAt(0);

                var parent = getClosestParentNode(rng.startContainer, rng.endContainer, editable);
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
        },
        list_bullets: {
            name: 'list_bullets',
            tooltip: 'Make unordered list',
            command: function(){
                document.execCommand('InsertUnorderedList', false, '');
            }
        },
        list_numbers: {
            name: 'list_numbers',
            tooltip: 'Make ordered list',
            command: function(){
                document.execCommand('InsertOrderedList', false, '');
            }
        },
        link: {
            name: 'link',
            tooltip: 'Insert link in cursor position',
            command: function() {
                var sel = rangy.getSelection(),
                    self = this,
                    $dialog = self.getDialog(),
                    $editable = self.getEditable();

                if (!sel.rangeCount)
                    return;

                var rng = sel.getRangeAt(0);
                rng.collapse();

                if (!hasAmongParents(rng.endContainer, this.getEditable().get(0))) return false;

                $dialog.show().html(
                    '<div class="control">'+
                        '<div class="eddy_wrap"><input class="text title" type="text" value="Link title"/></div>'+
                        '<div class="eddy_wrap"><input class="text link" type="text" value="http://"/></div>'+
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

                    try {
                        $editable.focus();
                        sel.removeAllRanges();

                        var link = $('<a/>')
                            .html(text)
                            .attr('href', url)
                            .get(0);

                        rng.insertNode(link);
                        rng.selectNode(link);
                        rng.collapse();
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
        },
        unlink: {
            name: 'unlink',
            tooltip: 'Remove links from selection',
            command: function(){
                document.execCommand('Unlink', false, '');
            }
        },
        image: {
            name: 'image',
            tooltip: 'Insert image in cursor position',
            command: function(){

                var sel = rangy.getSelection(),
                    self = this,
                    $dialog = self.getDialog(),
                    $editable = self.getEditable();

                if (!sel.rangeCount)
                    return;

                var rng = sel.getRangeAt(0);
                rng.collapse();

                if (!hasAmongParents(rng.endContainer, self.getEditable().get(0))) return;

                $dialog.show().html(
                    '<div class="control">'+
                        '<div class="eddy_wrap"><input class="text link" type="text" value="http://"/></div>'+
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
        }
    };

    $.fn.eddy = function(options){

        if (this.length == 1){
            return new Editor(this[0], options);
        }

        return this.each(function(){
            new Editor(this, options);
        });
    }

})(jQuery);
