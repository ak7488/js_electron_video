const { ipcRenderer } = require("electron");
const moment = require("moment");

// App constants
const itemsContainer = document.getElementById("items_container");
const page_num_view = document.querySelector(".page_num_view");
const next = document.querySelector(".next");
const previous = document.querySelector(".previous");

// App variables
let videoData = null;
let currentVideoDataSection = null;
let page = 1;
let totalPage = 1;

// requesting video info
ipcRenderer.send("video_info_request", "");

// reciving video info from back end
ipcRenderer.on("video_info_responce", (_, data) => {
	videoData = data;
	currentVideoDataSection = data.slice(0, 20);
	totalPage = Math.ceil(data.length / 20);
	itemBuilder(currentVideoDataSection);
	page_num_view.innerText = `Page: ${page}/${totalPage}`;
});

// building and displaying Video items
const itemBuilder = (data) => {
	itemsContainer.innerHTML = "";
	data.forEach((info, index) => {
		const video = document.createElement("video");
		video.src = info.path;
		video.preload = false;
		video.classList.add("item_video_preview");

		const name = document.createElement("p");
		(name.innerText = info.name), name.classList.add("item_name");

		const time = document.createElement("p");
		time.innerText = moment(info.mtime).format("hh:mm A DD-MM-YY");
		time.classList.add("itme_time");

		const item = document.createElement("div");
		item.onclick = () => {
			ipcRenderer.send("video_window_open_request", {
				name: info.name,
				time: moment(info.mtime).format("hh:mm A DD-MM-YY"),
				path: info.path,
				AllInfo: videoData,
				index,
			});
		};
		item.classList.add("item");
		item.appendChild(video);
		item.appendChild(name);
		item.appendChild(time);

		itemsContainer.appendChild(item);
	});
};

next.onmouseenter = showBtn;
previous.onmouseenter = showBtn;
page_num_view.onmouseenter = showBtn;
next.onmouseleave = hideBtn;
previous.onmouseleave = hideBtn;
page_num_view.onmouseleave = hideBtn;
next.onclick = nextPageHandler;
previous.onclick = previousPageHandler;

function showBtn() {
	next.classList.add("show_btn");
	page_num_view.classList.add("show_btn");
	previous.classList.add("show_btn");
}

function hideBtn() {
	next.classList.remove("show_btn");
	page_num_view.classList.remove("show_btn");
	previous.classList.remove("show_btn");
}

function nextPageHandler() {
	if (page >= totalPage) return;
	page = page + 1;
	currentVideoDataSection = videoData.slice((page - 1) * 20, page * 20);
	itemBuilder(currentVideoDataSection);
	page_num_view.innerText = `Page: ${page}/${totalPage}`;
}

function previousPageHandler() {
	if (page <= 1) return;
	page = page - 1;
	currentVideoDataSection = videoData.slice((page - 1) * 20, page * 20);
	itemBuilder(currentVideoDataSection);
	page_num_view.innerText = `Page: ${page}/${totalPage}`;
}

window.onkeydown = (event) => {
	const key = event.key;

	switch (key) {
		case "ArrowRight":
			nextPageHandler();
			break;
		case "ArrowLeft":
			previousPageHandler();
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
