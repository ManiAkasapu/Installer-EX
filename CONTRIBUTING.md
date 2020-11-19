# Contributing to Installer-EX

First things first - Thanks for taking the time to contribute to this project!

## Setup

1. **Fork**, then **clone** this repository. 
2. Check to see if Node.js is properly installed on your system. Run ```node -v``` and ```npm -v```. If those don't return version numbers, you'll need to install [Node.js](https://nodejs.org/en/download/). Install the LTS version if you're not sure what to choose.
3. Navigate in the terminal to the folder you cloned and run ```npm install``` 

## Running in development mode
Run the project by typing ```npm start```. That's it!

## Building the application for release
Run ```npm run make```. It will automatically build it for your the paltform that it is running on. Other platforms may be available depending on what type of machine you have, see the documentation on [Makers](https://www.electronforge.io/config/makers) for more info. If you're building for release, make sure to deletet the ```cli``` folder to keep the size down.