<html>
    <head>
        <title>dl > dd > div.contenteditable test</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style type="text/css">

            *{
                margin: 0; padding: 0;
            }

            body{
                padding: 10px;
            }

            .editable{
                padding: 10px;
                border: #444 solid 1px;
                width: 600px;
                height: 200px;
            }
        </style>
    </head>
    <body>

        <dl>
            <dt>
                The div below not reacts on enter keypress (dl > dd > div)
            </dt>
            <dd style="display: block;">
                <div class="editable" contenteditable="true">
                    add line here
                </div>
            </dd>
        </dl>

        <div>
            <label>This one works as espected (div > div) </label>
            <div class="editable" contenteditable="true">
                add line here
            </div>
        </div>

    </body>
</html>
