var getUploadDetailsURL = "http://localhost:3000/getUploadDetails";

var uploadFileInput = null;
var uploadFileButton = null;

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
	// When testing on localhost, we could just do one getUploadDetails() for all
	// the files.  On a real server, that doesn't work.  Actually, it has nothing
	// to do with being on a server, it's just that I tested with a small file
	// first, so it completed before the first one started.  Actually, we're
	// kicking off simultaneous uploads.  We should serialize them, or (better)
	// make the UI show that they're simultaneous.

	let file = uploadFileInput.files[0];
	for (const file of uploadFileInput.files) {
		showFileUploadStart(file.name);
		let buffer = await file.arrayBuffer();
		let digest = await crypto.subtle.digest('SHA-1', buffer);
		let hash = hashString(digest);
		console.log(`SHA1: `, hash);
		const uploadDetails = await getUploadDetails();

		// Upload the file.
		let xhr = new XMLHttpRequest();
		xhr.addEventListener('load', (event) => {
			showFileUploadDone(file.name);
			console.info(`XHR response: ${xhr.response}`);
			});
		xhr.upload.addEventListener('progress', updateProgress);
		xhr.addEventListener('error', () => {
			showUploadError(file.name, xhr.response.status);
			});
		xhr.upload.addEventListener('error', () => {
			showUploadError(file.name, xhr.response.status);
			});
		xhr.open("POST", uploadDetails.uploadURL);
		xhr.setRequestHeader("Content-Type", "b2/x-auto");
		xhr.setRequestHeader("Authorization", uploadDetails.authToken);
		xhr.setRequestHeader("X-Bz-File-Name", encodeURIComponent(file.name));
		xhr.setRequestHeader("X-Bz-Content-Sha1", hash);
		xhr.send(file);
		}
	}

function filesChanged() {
	uploadFileButton.disabled = (uploadFileInput.files.length == 0);
	}

function showFileUploadStart(fileName) {
	let progressBar = document.getElementById('upload-progress');
	progressBar.hidden = false;
	document.getElementById('which-file').hidden = false;
	document.getElementById('uploading-file').textContent = fileName;
	document.getElementById('error-message').hidden = true;
	}

function updateProgress(event) {
	let progressBar = document.getElementById('upload-progress');
	progressBar.hidden = false; 	// In case it's showing multiple simultaneous uploads...
	document.getElementById('which-file').hidden = false; 	// Ditto.
	if (event.lengthComputable) {
		let percentage = event.loaded / event.total * 100;
		progressBar.setAttribute("value", `${percentage}`);
		progressBar.textContent = `${percentage}%`;
		}
	else
		progressBar.removeAttribute("value");
	}

function showFileUploadDone(fileName) {
	document.getElementById('upload-progress').hidden = true;
	document.getElementById('which-file').hidden = true;
	let fileElement = document.createElement("div");
	fileElement.setAttribute("class", "uploaded-file");
	fileElement.textContent = fileName;
	let uploadedFilesElement = document.getElementById('uploaded-files');
	uploadedFilesElement.hidden = false;
	uploadedFilesElement.appendChild(fileElement);
	}

function showUploadError(fileName, errorCode) {
	document.getElementById('upload-progress').hidden = true;
	document.getElementById('which-file').hidden = true;
	let errorMessageElement = document.getElementById('error-message');
	errorMessageElement.hidden = false;
	errorMessageElement.textContent = `Error uploading "${fileName}": ${errorCode}`;
	}


document.addEventListener("DOMContentLoaded", () => {
	uploadFileInput = document.getElementById('file-input');
	uploadFileInput.addEventListener('input', filesChanged);
	uploadFileButton = document.getElementById('upload-button');
	uploadFileButton.addEventListener("click", uploadClicked);
	});


