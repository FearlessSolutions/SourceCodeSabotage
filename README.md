# Source Code Sabotage
Welcome to source code sabotage where the challenge is not big O notation but to make something simple convoluted.  Most coding challenges are about keeping things efficient in memory and/or speed but the point of this challenge is to write something beautifully over-engineered.  Every week or so a new challenge will be released.  The ask will be something simple, make a calculation, print out some text, organize a list, etc. but the real ask isnt the task at hand, but to make something brilliantly complicated.

There are not many rules to this challenge but there are some.  The three rules are:

1) Accomplish the task
2) All functions must be relevant to the task
3) It works consistently.

Here is an example.  The task is to make it so if you click a button that the background of a webpage changes color.  So you create a simple page that has a button, you click it and boom color change!  But as a developer that should be a simpe task.  I want to make it cooler.

So I make it so that there is a drop down of colors, and then they click the button and it changes to that color.  But is that enough?  What if I wanted it to be a text field?  Do I need to verify that I know the color, what if they had a typo?  Do I make it autocorrect, do i say invalid.  What about random colors?  Take a simple task and make it worse.

The next part is all functionality should be relevant.  For the above example I cant just add a random number generator which is called when the button is clicked.  That is unnecessary and brings no value.  But what if I had the random number generator spit out a number between 1-1000 and then check to see if the number is between 0-255, have that function run 3 times and then produce the RGB of the color.  now it is relevant, now it is unnecessary.

The last part is consistently working.  It doesnt make sense to have an application that works 1 time. It needs to work better than sex panter, "Sixty percent of the time, it works every time."

Have fun, be creative, be unnecessary.  