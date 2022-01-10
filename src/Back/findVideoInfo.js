const fs = require('fs');
const homeDir = require('os').homedir();

const findVideoInfo = ({path = homeDir, exclude = ['node', 'python', 'android'], include = ['mp4', 'MP4', 'ogg', 'OGG', 'webm', 'WEBM', "wav", "WAV", 'vp8', 'VP8','vp9', 'VP9']}) => {
	let AllInfo = []
	
	const main = ({path = homeDir}) => {
		if(exclude.includes(path.toLowerCase())) return;

		const AllFF = fs.readdirSync(path);

		AllFF.forEach(FF => {
			const newPath = `${path}/${FF}`
			const info = fs.lstatSync(newPath);

			if(info.isDirectory()){
				main({path: newPath})
			} else {
				include.forEach(e => {
					if(FF.includes(e)){
						AllInfo.push({
							...info,
							name: FF,
							path: newPath,
						})
					}
				})
			}
		})
	}

	main({path})

	return AllInfo;
};

module.exports = findVideoInfo

//findVideoInfo({path : '/home/anubhav/Videos'})