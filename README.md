# Star Wars Marksman-H Lightsaber Training
This is a little coding project I did in my 6th semester. The idea was to create a star wars lightsaber training for averting laser projectiles. I wanted the lightsaber to be controlled with a physical "lightsaber" - a stick - in real life.

## Software Setup
To play the game, the way it is meant to be played, you need to install python 3.X (+ dependencies) and have a stick with two differenct colored tennis balls at both ends of the stick ready.

# Install Python
[Windows]https://www.python.org/downloads/windows/
[Linux]https://www.python.org/downloads/source/
[MacOS]https://www.python.org/downloads/mac-osx/

# Clone the Repository
SSH: ```git clone git@git.imd.rocks:matthias.dietrich/marksman-h.git```
HTTPS: ```git clone https://git.imd.rocks/matthias.dietrich/marksman-h.git```

# Install Dependencies
Inside the Repository run: ```pip install requirements.txt```


## Build your lightsaber
To build your own lightsaber controller you will need:
1. a stick (whatever length you prefer)
2. 2 Tennis Balls (or similiar objects you can find)
3. 2 different painting colors (Preferable **red** and **green**)

Now paint the tennis balls in one color each. When they are dry, put the tennisballs onto the ends of the stick. Your lightsaber is ready! And yes, that's how lightsabers look like.

## Configure your "lightsaber-stick"
The stick should have two tennis balls or other objects at both ends of the stick. They need to have different colors. In my code I used **green** and **red**.
If you want to use different colors, you would have to change the HSV color values inside the **stickRec.py**
To identify the HSV Color values of your stick run the **range-detector.py** script inside the **/python** subdirectory: ```python range-detector.py --filter HSV --webcam```

 Three windows will pop up (Sliders, Webcam Image, Mask). Use the sliders till the mask will only show the outlines of the object with the color you want to identify. Write down the **min** and **max** values you used for the sliders.

Repeat this for your second color.
After that open up **stickRec.py** inside a Editor and replace the color Values of the variables **greenLower**, **greenUpper**, **redLower** and **redUpper**.

The color variables stored inside **redLower** and **redUpper** will be used to identify the Position of the **handle**, while the **greenLower** and **greenUpper** variables will be used to identify the **top position** of the lightsaber.


## Start playing
# Execute the Python Script
Navigate to the python subdirectory: ```cd .\python\```
Run the Script: ```python stickRec.py```

If you set up your lightsaber colors correctly, you should now see a blue line between the two tennis balls inside the "Result"-Window. If not, you propably set the wrong colors inside the script. Also: Make sure to change the webcam index inside **stickRec.py**, if necessarry.

# May the force be with you!
Run the game application inside the **build** subdirectory.
Hit **Start** inside the Main Menu. Good look defending yourself!



