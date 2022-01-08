const { ipcRenderer } = require("electron");
const moment = require("moment");

const video = document.getElementById("video");
const video_controls = document.querySelector("#video_controls");
const video_name = document.querySelector(".video_name");
const btn_play_pause = document.querySelector(".btn-play");
const input_range = document.querySelector(".input_range");
const btn_volume_up = document.querySelector(".btn_volume_up");
const btn_volume_down = document.querySelector(".btn_volume_down");
const btn_fullscreen = document.querySelector(".btn_fullscreen");
const volume_view = document.querySelector(".volume_view");
const play_back_rate = document.querySelector(".play_back_rate");
const play_back_rate_increase = document.querySelector(
	".play_back_rate_increase"
);
const play_back_rate_decrease = document.querySelector(
	".play_back_rate_decrease"
);
const btn_previous_video = document.querySelector(".btn_previous_video");
const btn_next_video = document.querySelector(".btn_next_video");
const go_back = document.querySelector(".go_back");

let isPlaying = true;
let volume = 5;
let playbackRate = 1;
let info = {};
let isFullScreen = false;
let controls = true;

// requesting video info
ipcRenderer.send("video_window_info_request", "");

// reciving video info from back end
ipcRenderer.on("video_window_info_responce", (_, data) => {
	loadVideo(data);
});

//window events

btn_play_pause.onclick = playPauseHandler;
btn_volume_up.onclick = increaseVolume;
btn_volume_down.onclick = decreaseVolume;
play_back_rate_increase.onclick = playbackRateIncrease;
play_back_rate_decrease.onclick = playbackRateDecrease;
btn_next_video.onclick = nextVideo;
btn_previous_video.onclick = previousVideo;
go_back.onclick = goBack;
btn_fullscreen.onclick = toggleFullScreen;
video.onplay = () => {
	btn_play_pause.innerText = "pause";
};

video.onpause = (e) => {
	btn_play_pause.innerText = "play_arrow";
};
video.onended = nextVideo;

video.addEventListener("timeupdate", (e) => {
	const duration = e.target.duration;
	const currentTime = e.target.currentTime || 0;

	input_range.max = duration;
	input_range.min = 0;
	input_range.value = currentTime;
});

input_range.onchange = (e) => {
	video.currentTime = e.target.value;
};

//functions
function playPauseHandler() {
	if (isPlaying) {
		video.pause();
		isPlaying = false;
	} else {
		video.play();
		isPlaying = true;
	}
}

function increaseVolume() {
	if (volume >= 9.75) return;
	volume = volume + 1;
	video.volume = volume / 10;
	volume_view.innerText = volume;
}

function decreaseVolume() {
	if (volume <= 0.25) return;
	volume = volume - 1;
	video.volume = volume / 10;
	volume_view.innerText = volume;
}

function playbackRateIncrease() {
	if (playbackRate >= 10) return;
	playbackRate = playbackRate + 0.5;
	video.playbackRate = playbackRate;
	play_back_rate.innerText = `Playback rare: ${playbackRate}`;
}

function playbackRateDecrease() {
	if (playbackRate <= 0.1) return;
	playbackRate = playbackRate - 0.5;
	video.playbackRate = playbackRate;
	play_back_rate.innerText = `Playback rare: ${playbackRate}`;
}
function loadVideo(data) {
	video.src = data.path;
	video.volume = volume / 10;
	info = data;
	video_name.innerText = data.name;
	input_range.value = 0;
	video.play();
	video.playbackRate = playbackRate;
	isPlaying = true;
}

function nextVideo() {
	let currentVideo = {},
		currentIndex = 0;
	if (info.AllInfo.length <= info.index + 1) {
		currentVideo = info.AllInfo[0];
		currentIndex = 0;
	} else {
		currentVideo = info.AllInfo[info.index + 1];
		currentIndex = info.index + 1;
	}
	loadVideo({
		AllInfo: info.AllInfo,
		index: currentIndex,
		name: currentVideo.name,
		path: currentVideo.path,
		time: moment(currentVideo.mtime).format("hh:mm A DD-MM-YY"),
	});
}

function previousVideo() {
	let currentVideo = {},
		currentIndex = 0;
	if (info.index <= 0) {
		currentIndex = info.AllInfo.length - 1;
		currentVideo = info.AllInfo[currentIndex];
	} else {
		currentVideo = info.AllInfo[info.index - 1];
		currentIndex = info.index - 1;
	}
	loadVideo({
		AllInfo: info.AllInfo,
		index: currentIndex,
		name: currentVideo.name,
		path: currentVideo.path,
		time: moment(currentVideo.mtime).format("hh:mm A DD-MM-YY"),
	});
}

function goBack() {
	ipcRenderer.send("load_home_window_request", "");
}

function toggleFullScreen() {
	if (isFullScreen) {
		btn_fullscreen.innerText = "fullscreen";
		isFullScreen = false;
		ipcRenderer.send("fullscreen_exit_request");
	} else {
		btn_fullscreen.innerText = "fullscreen_exit";
		isFullScreen = true;
		ipcRenderer.send("fullscreen_request");
	}
}

function toggleControls() {
	if (controls) {
		video_controls.classList.add("op-0");
		video_controls.classList.add("no_mouse");
		controls = false;
	} else {
		video_controls.classList.remove("op-0");
		video_controls.classList.remove("no_mouse");
		controls = true;
	}
}

window.onkeydown = (event) => {
	const key = event.key;

	switch (key) {
		case "j":
			previousVideo();
			break;
		case "l":
			nextVideo();
			break;
		case "k":
			playPauseHandler();
			break;
		case "u":
			increaseVolume();
			break;
		case "d":
			decreaseVolume();
			break;
		case "f":
			playbackRateIncrease();
			break;
		case "b":
			playbackRateDecrease();
			break;
		case "h":
			toggleControls();
			break;
		case "s":
			playPauseHandler();
			break;
		case "w":
			toggleFullScreen();
			break;
		case "n":
			nextVideo();
			break;
		case "p":
			previousVideo();
			break;
		case "c":
			ipcRenderer.send("close", "");
			break;
		case "m":
			ipcRenderer.send("minimize", "");
			break;
		case "M":
			ipcRenderer.send("maximize", "");
			break;
	}
};
