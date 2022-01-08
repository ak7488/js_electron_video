const {BrowserWindow} = require('electron');

const createWindow = async ({path = "", width = 500, height = 500, frame = true, fullscreen = false}) => {
	const win = new BrowserWindow({
		width: 500,
		height: 500,
		backgroundColor: "#202124",
		center: true,
		fullscreen,
		webPreferences: {
			nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInSubFrames: true,
            enableRemoteModule: true,
		}
	});

	win.loadFile(path);

	return win;
};

module.exports = createWindow;