mag-Cokemail-jQuery-EmojisTest

This repository contains a jQuery application to add Emojis into Text

Youtube URL for More Explanation : https://www.youtube.com/watch?v=ZSV0FI4yzYw

This documentation helps you get started with this jquery application: We use in our exemple only the jQuery without any external plugins, keep it simple:

1-How to install :

-you have just to download it and simply open index.html in your browser.

2-how to add emojis:

We decided to have our own emojis and not use those of apple, google or facebook to be more free in the folder img:

-you can add any emojis you would like to add -add it also in /img/emojis.js so that the program can load it. 

':key:' : 'Emojis.ext' don't froget to add , 

-Done ! 

3-how to change the way of opening the ToolTip :

a-Left click b-Right click c-mouse 3 button d-doubleClick

-Open /scripts/jquery.emoji.js :

-in line 128 : this.$editor.on('click focus', function(e) {

a-by default it's left Click : click

b-add the code between if statement (e.which == 3) means click right if( e.which == 3 ){ event1 = e; Tooltip.show(self); e.stopPropagation(); }

c-add the code between if statement (e.which == 2) means mouse 3 button if( e.which == 3 ){ event1 = e; Tooltip.show(self); e.stopPropagation(); }

d-doubleClick : add dbl to click :

this.$editor.on('click focus', function(e) ==> this.$editor.on('dblclick focus', function(e)

In /css you have all the css code you can change it as you like.

I hope you liked this application enjoy !
