[![Build Status](https://travis-ci.org/CESNET/liberouter-gui.svg?branch=master)](https://travis-ci.org/CESNET/liberouter-gui)

![Liberouter Logo](https://www.liberouter.org/wp-content/uploads/2017/12/liberouter_cesnet_zmensene2.png "Liberouter logo")

# Liberouter GUI
Liberouter GUI encapsulates all modules visually and logically. On the backend it takes care of user, session and configuration management and authorization.

Frontend utilizes Angular 6 to create modular frontend environment.

Liberouter GUI is a modular system which provides environment for GUIs. These GUIs are installed as modules for Liberouter GUI that handles user and configuration management.

# Quick start


1. Download Liberouter GUI directly from github or using `git clone https://github.com/CESNET/liberouter-gui`
2. Place modules you want to use into `modules` folder
3. Remove example module from `modules` folder (you can safely remove `modules/example` folder)
4. Edit `modules/app.config.json`. Use a [theme](https://github.com/CESNET/liberouter-gui/wiki/Themes) if you want.
5. Run `python3 bootstrap.py`
6. Install backend dependencies by running `pip3 install -r backend/requirements.txt`
7. Install frontend dependendies by navigating to `frontend` folder and typing `npm install`
8. Start frontend development server using `npm start` in `frontend` folder
9. If mongodb service was not running, start it.
10. Start backend using `python3 backend`
11. In your browser, type `localhost:4200`
 
For customization and more detailed tutorials, please visit our [Wiki](https://github.com/CESNET/liberouter-gui/wiki).

# StaaS GUI

We provide official modules for Liberouter GUI which create a GUI for all related products [Staas GUI](https://github.com/CESNET/Staas-GUI)

# More info
For more information visit our [Wiki](https://github.com/CESNET/liberouter-gui/wiki)

