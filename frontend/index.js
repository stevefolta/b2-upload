const getUploadDetailsURL = "http://localhost:3000/getUploadDetails";

var uploadFileInput = null;

async function getUploadDetails() {
	return new Promise((resolve, reject) => {
		console.log("Starting getUploadDetails...");
		let xhr = new XMLHttpRequest();
		xhr.withCredentials = false;
		xhr.addEventListener("readystatechange", function() {
			console.log(`readystatechange: ${this.readyState}`);
			if (this.readyState == this.DONE) {
				console.info(`Got details: `, this.responseText);
				const details = JSON.parse(this.responseText);
				resolve(details);
				}
			});
		console.log("Opening...");
		xhr.open("GET", getUploadDetailsURL);
		console.log("Sending...");
		xhr.send(null);
		console.log("Sent...");
		});
	}

function hashString(digest) {
	const hashArray = Array.from(new Uint8Array(digest)); 	// convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); 	// convert bytes to hex string
	return hashHex;
	}

async function uploadClicked() {
	const uploadDetails = await getUploadDetails();
	let file = uploadFileInput.files[0];
	for (const file of uploadFileInput.files) {
		let buffer = await file.arrayBuffer();
		let digest = await crypto.subtle.digest('SHA-1', buffer);
		console.log(`SHA1: `, hashString(digest));
		//*** Upload the file.
		}
	}

document.addEventListener("DOMContentLoaded", () => {
	uploadFileInput = document.getElementById('file-input');
	const uploadFileButton = document.getElementById('upload-button');
	uploadFileButton.addEventListener("click", uploadClicked);
	});

