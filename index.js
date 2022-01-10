const createWindow = require("./src/Back/createWindow.js");
const path = require("path");
const {
	app,
	ipcMain,
	dialog,
	Menu,
	globalShortcut,
	BrowserWindow,
} = require("electron");
const homeDir = require("os").homedir();
const findVideoInfo = require("./src/Back/findVideoInfo.js");
const axios = require('axios');
const fs = require('fs')
const moment = require('moment')
require('dotenv').config();

let Window = null;
let videoPath = `${homeDir}/Videos`;
let videoInfo = null;
let ytVideoData = null;

app.on("ready", async () => {
	const argv = process.argv[process.argv.length - 1];

	if(!argv) return openApp();

	const extension = argv.split('.').reverse()[0];
	const videoFormats = ['mp4', 'MP4', 'ogg', 'OGG', 'webm', 'WEBM', "wav", "WAV", 'vp8', 'VP8','vp9', 'VP9'];
	
	try {
		const givenFilesDir = argv.split('/').reverse().slice(1).reverse().join('/');
		const videoName = argv.split('/').reverse().slice(0,1).reverse().join('/');

		let givenVideoPath = path.join(process.cwd(), givenFilesDir);

		if(givenFilesDir[0] === '/'){
			givenVideoPath = givenFilesDir
		} else if (givenFilesDir[0] === '~'){
			givenVideoPath = givenFilesDir.replace('~', homeDir)
		}

		const lstat = fs.lstatSync(`${givenVideoPath}/${videoName}`);

		if(!extension || !videoFormats.includes(extension) || lstat.isDirectory()) {
			videoPath = `${givenVideoPath}/${videoName}`
			openApp();
			return
		}
		
		const givenPathContents = fs.readdirSync(givenVideoPath);
		
		const AllInfo = await findVideoInfo({path: givenVideoPath});
		const index = AllInfo.findIndex(e => e.path === `${givenVideoPath}/${videoName}`);
		if(givenPathContents.includes(videoName) && !lstat.isDirectory()){
			videoInfo = {
				name: videoName,
				time: moment(lstat.mtime).format("hh:mm A DD-MM-YY"),
				path: `${givenVideoPath}/${videoName}`,
				AllInfo,
				index,
			};
			Window = await createWindow({
				path: path.join(__dirname, "src/Front/Video/Video.html"),
			});
			Main();
		} else {
			openApp();
			return
		}
	} catch (e) {
		console.log(e);
		openApp();
		return
	}

});

app.on("window-all-closed", () => {
	app.quit();
});

async function openApp () {
	Window = await createWindow({
		path: path.join(__dirname, "src/Front/Home/Home.html"),
	});
	Main();
}

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
	ipcMain.on("open_dialog_request", async () => {
		const path = await dialog.showOpenDialog({
			properties: ["openDirectory"],
		});
		if (path.conceled) return;

		videoPath = path.filePaths[0];
		const videosInfo = findVideoInfo({ path: videoPath });
		Window.webContents.send("video_info_responce", videosInfo);
	});

	ipcMain.on('search_request', async (_, query) => {
		const res = await axios(`https://ak7488-proxy-server.herokuapp.com/yt/query?q=${query}`);
		Window.webContents.send('search_result', res.data);
	})

	ipcMain.on('yt_video_window_open_request', (_, data) => {
		ytVideoData = data;
		Window.loadFile(path.join(__dirname, "src/Front/ytVideo/ytVideo.html"));
	})

	ipcMain.on('yt_video_info_request', () => {
		Window.webContents.send('yt_video_info_responce', ytVideoData)
	})

	ipcMain.on('yt_home_window_open_request', () => {
		Window.setFullScreen(false);
				Window.loadFile(
					path.join(__dirname, "src/Front/ytHome/ytHome.html")
				);
	})

	const template = [
		{
			label: "Tools",
			submenu: [
				{
					label: "Relaod",
					click: () => {
						Window.reload();
					},
				},
				{
					label: "Dev tools",
					click: () => {
						BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
					},
				},
			],
		},
		{
			label: "Local",
			click: () => {
				Window.setFullScreen(false);
				Window.loadFile(
					path.join(__dirname, "src/Front/Home/Home.html")
				);
			},
		},
		{
			label: "Ytube",
			click: () => {
				Window.setFullScreen(false);
				Window.loadFile(
					path.join(__dirname, "src/Front/ytHome/ytHome.html")
				);
			},
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	globalShortcut.register("CommandOrControl+r", () => {
		if (!BrowserWindow.getFocusedWindow()) return;
		Window.reload();
	});

	globalShortcut.register("CommandOrControl+d", () => {
		if (!BrowserWindow.getFocusedWindow()) return;
		BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
	});
}


