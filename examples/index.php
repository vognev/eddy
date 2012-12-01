<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        <title>InEd</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <link type="text/css" rel="stylesheet" href="../eddy/eddy.css"/>

        <script type="text/javascript" src="../lib/jquery-1.4.2.min.js"></script>
        <script type="text/javascript" src="../eddy/eddy.js"></script>
        <script type="text/javascript" src="../lib/rangy-1.0.1/rangy-core.js"></script>

        <style type="text/css">

            body{
                font-family: Tahoma, sans-serif;
                font-size: 12px;
                padding: 10px;
            }

            p{
                margin: 5px 0;
            }

            strong{ font-weight: bold; }
            em{ font-style: italic; }

            blockquote{
                padding-left: 10px;
                border-left: 2px solid #444;
                background-color: #eee;
            }

            ol{
                padding-left: 10px;
                list-style-type: decimal !important;
                list-style-position: inside !important;
            }

            ul{
                padding-left: 10px;
                list-style-type: square !important;
                list-style-position: inside !important;
            }


        </style>

        <script type="text/javascript">

            $(function(){
                $('textarea').each(function(){
                    $(this).eddy({
                        toolbar: [
                            'bold', 'italic', 'underline', 'separator',
                            'strikethrough', 'cite', 'separator',
                            'list_bullets', 'list_numbers', 'separator',
                            'link', 'unlink', 'separator',
                            'image', 'separator',
                            {
                                tooltip:    'Custom button',
                                name:       'custom',
                                command:    function(eddy) {
                                    alert('Custom button');
                                }
                            }
                        ]
                    });
                });

            });
        </script>

    </head>
    <body>

        <p>
            Simple Demonstration of eddy
        </p>

        <form method="POST" action="" onsubmit="$(this).find('textarea').eddy('sync'); return true;" style="width: 420px; background: none repeat scroll 0 0 #EDEFF4; padding: 5px;">
            <textarea name="text1" cols="40" rows="10"><?php if($_POST && $_POST['text1']) { echo htmlspecialchars($_POST['text1']); } else { ?>test text<?php } ?></textarea>
            <br/>
            <input type="submit"/>
        </form>
        <?php if ($_POST) var_dump($_POST); ?>
    </body>
</html>
