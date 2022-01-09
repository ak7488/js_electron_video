const {ipcRenderer} = require('electron');
const moment = require('moment')

const search = document.querySelector(".search");
const search_input = document.querySelector("#search_input");
const loader = document.querySelector('.loader');
const no_result_found = document.querySelector('.no_result_found');
const itemsContainer = document.getElementById("items_container");

let items = null;

search.onsubmit = onSearch

function onSearch(event) {
	event.preventDefault();
	ipcRenderer.send('search_request', search_input.value);
	loader.classList.add('show')
}

function itemBuilder (data) {
	itemsContainer.innerHTML = "";
	data.forEach((info, index) => {
		const video = document.createElement("img");
		video.src = info.snippet.thumbnails.medium.url;
		video.classList.add("item_video_preview");

		const name = document.createElement("p");
		name.innerText = info.snippet.title; 
		name.classList.add("item_name");

		const time = document.createElement("p");
		time.innerText = moment(info.snippet.publishTime).format("hh:mm A DD-MM-YY");
		time.classList.add("itme_time");

		const item = document.createElement("div");
		item.onclick = () => {
			ipcRenderer.send("yt_video_window_open_request", {
				name: info.snippet.title,
				time: moment(info.snippet.publishTime).format("hh:mm A DD-MM-YY"),
				AllInfo: items,
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

ipcRenderer.on('search_result', (_, data) => {
	loader.classList.remove('show')
	if(data === undefined || data.items === undefined || data.items.length === 0){
		no_result_found.classList.add('show')
		setTimeout(() => {
		  no_result_found.classList.remove('show')
		}, 5000)
	} else {
		items = data.items
		itemBuilder(items)
	}
})

window.onkeydown = (event) => {
	const key = event.key;

	switch (key) {
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
