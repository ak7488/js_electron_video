const createWindow = require("./src/Back/createWindow.js");
const path = require("path");
const { app, ipcMain } = require("electron");
const homeDir = require("os").homedir();
const findVideoInfo = require("./src/Back/findVideoInfo.js");

let Window = null;
let videoPath = `${homeDir}/Videos`;
let videoInfo = null;

app.on("ready", async () => {
	Window = await createWindow({
		path: path.join(__dirname, "src/Front/Home/Home.html"),
	});
	Main();
});

app.on("window-all-closed", () => {
	app.quit();
});

async function Main() {
	ipcMain.on("load_home_window_request", () => {
		Window.setFullScreen(false);
		Window.loadFile(path.join(__dirname, "src/Front/Home/Home.html"));
	});

	ipcMain.on("video_info_request", (_, p) => {
		let path = p === "" ? videoPath : p;
		videoPath = path;
		const videosInfo = findVideoInfo({ path });
		Window.webContents.send("video_info_responce", videosInfo);
	});

	ipcMain.on("video_window_open_request", (_, info) => {
		videoInfo = info;
		Window.loadFile(path.join(__dirname, "src/Front/Video/Video.html"));
	});

	ipcMain.on("video_window_info_request", () => {
		Window.webContents.send("video_window_info_responce", videoInfo);
	});

	ipcMain.on("fullscreen_request", () => {
		Window.setFullScreen(true);
	});

	ipcMain.on("fullscreen_exit_request", () => {
		Window.setFullScreen(false);
	});
	ipcMain.on("close", () => {
		app.quit();
	});
	ipcMain.on("minimize", () => {
		Window.minimize();
	});
	ipcMain.on("maximize", () => {
		Window.maximize();
	});
}
