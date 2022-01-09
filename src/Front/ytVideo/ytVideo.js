const {ipcRenderer} = require("electron");
const ytdl = require('ytdl-core')

ipcRenderer.send('yt_video_info_request', '')

const loader = document.querySelector('.loader')
const formats_element = document.querySelector('.formats');
const video = document.querySelector('#video');
const audio = document.querySelector('#audio');
const video_controls = document.querySelector('#video_controls')
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

let info = null;
let AllVideos = null
let audio_format = null
let isPlaying = true;
let volume = 5;
let playbackRate = 1;
let isFullScreen = false;
let controls = true;
let index = 0;

btn_play_pause.onclick = playPauseHandler;
btn_volume_up.onclick = increaseVolume;
btn_volume_down.onclick = decreaseVolume;
play_back_rate_increase.onclick = playbackRateIncrease;
play_back_rate_decrease.onclick = playbackRateDecrease;
btn_next_video.onclick = nextVideo;
btn_previous_video.onclick = previousVideo;
go_back.onclick = goBack;
btn_fullscreen.onclick = toggleFullScreen;
video.onplay = (e) => {
	btn_play_pause.innerText = "pause";
	audio.currentTime = e.target.currentTime
	audio.play();
};

video.onpause = (e) => {
	btn_play_pause.innerText = "play_arrow";
	audio.currentTime = e.target.currentTime
	audio.pause();
};

video.addEventListener("timeupdate", (e) => {
	const duration = e.target.duration;
	const currentTime = e.target.currentTime || 0;

	input_range.max = duration;
	input_range.min = 0;
	input_range.value = currentTime;
});

input_range.onchange = (e) => {
	video.currentTime = e.target.value;
	audio.currentTime = e.target.value;
};

ipcRenderer.on('yt_video_info_responce', async(_, data) => {
	video_name.innerText = data.name
	info = await ytdl.getInfo(data.AllInfo[data.index].id.videoId);
	AllVideos = data.AllInfo;
	index = data.index
	audio_format = info.formats.filter(e => e.mimeType.includes('audio/mp4'))
	loader.classList.remove('show');
	loadFormats(info.formats.filter(e => !(e.mimeType.includes('audio/mp4') || e.qualityLabel === null)))
})

function loadFormats (formats) {
	formats_element.innerHTML = ''
	formats_element.classList.add('show_f')
	formats.forEach(format => {
		const p = document.createElement('p');
		p.innerText = `${format.qualityLabel} ${format.container}`;
		p.classList.add('format');
		p.onclick = () => {
			formats_element.classList.remove('show_f')
			loadVideo(format)
		}
		formats_element.appendChild(p)
	})
}

function loadVideo(videoFormat) {
	video.src = videoFormat.url;
	audio.src = audio_format[0].url;
	video.currentTime = 0;
	audio.currentTime = 0;
	video.playbackRate = playbackRate;
	audio.playbackRate = playbackRate;
	video.volume = volume / 10;
	audio.volume = volume / 10;
	input_range.value = 0;
	video_controls.classList.add('show_f')
	console.log(videoFormat)
	video.play();
	audio.play();
}

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
	audio.volume = volume / 10;
	volume_view.innerText = volume;
}

function decreaseVolume() {
	if (volume <= 0.25) return;
	volume = volume - 1;
	audio.volume = volume / 10;
	volume_view.innerText = volume;
}

function playbackRateIncrease() {
	if (playbackRate >= 10) return;
	playbackRate = playbackRate + 0.5;
	video.playbackRate = playbackRate;
	audio.playbackRate = playbackRate;
	play_back_rate.innerText = `Playback rare: ${playbackRate}`;
}

function playbackRateDecrease() {
	if (playbackRate <= 0.1) return;
	playbackRate = playbackRate - 0.5;
	video.playbackRate = playbackRate;
	audio.playbackRate = playbackRate;
	play_back_rate.innerText = `Playback rare: ${playbackRate}`;
}

async function nextVideo() {
	if(AllVideos.length <= index + 1) return
	loader.classList.add('show');
	const info = await ytdl.getInfo(AllVideos[index + 1].id.videoId);
	video_name.innerText = info.videoDetails.title
	audio_format = info.formats.filter(e => e.mimeType.includes('audio/mp4'))
	loader.classList.remove('show');
	loadFormats(info.formats.filter(e => !(e.mimeType.includes('audio/mp4') || e.qualityLabel === null)))
}

async function previousVideo() {
	if (index <= 0) return
	loader.classList.add('show');
	const info = await ytdl.getInfo(AllVideos[index - 1].id.videoId);
	video_name.innerText = info.videoDetails.title
	audio_format = info.formats.filter(e => e.mimeType.includes('audio/mp4'))
	loader.classList.remove('show');
	loadFormats(info.formats.filter(e => !(e.mimeType.includes('audio/mp4') || e.qualityLabel === null)))
}

function goBack() {
	ipcRenderer.send("yt_home_window_open_request", "");
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