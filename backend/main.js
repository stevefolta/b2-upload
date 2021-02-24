http = require('http');
https = require('https');
express = require('express');
fs = require('fs');

function maybeReadFile(path) {
	let contents = "";
	try {
		contents = fs.readFileSync(path, "utf-8");
		}
	catch (e) {}
	return contents;
	}

// Read the arguments.
let settings = {
	b2ApplicationKey: '',
	b2KeyID: '',
	addCORSHeader: false,
	frontendServerURL: "http://localhost:8000",
	port: 3000,
	};
var pendingSetting = '';
process.argv.slice(2).forEach((arg) => {
	let uncolonedArg = '';
	if (arg.endsWith(':'))
		uncolonedArg = arg.slice(0, -1);
	if (pendingSetting != '') {
		let settingType = typeof(settings[pendingSetting]);
		if (settingType == "number")
			settings[pendingSetting] = parseInt(arg);
		else if (settingType == "boolean")
			settings[pendingSetting] = (arg == "true");
		else if (['frontendServerURL'].includes(pendingSetting))
			settings[pendingSetting] = arg;
		else
			settings[pendingSetting] = maybeReadFile(arg).trim();
		pendingSetting = '';
		}
	else if (uncolonedArg != '' && Object.keys(settings).includes(uncolonedArg))
		pendingSetting = uncolonedArg;
	else
		console.log(`Unknown argument: ${arg}`);
	})


async function getUploadDetailsRoute(request, result, next) {
	console.log("Got request...");
	if (settings.addCORSHeader)
		result.set("Access-Control-Allow-Origin", settings.frontendServerURL);
	try {
		let authDetails = await getAuthDetails();
		let uploadDetails = await getUploadDetails(authDetails);
		result.json(uploadDetails);
		console.log("Returned upload details.");
/***
		let fakeUploadDetails = {
			authToken: "upload-auth-token",
			uploadUrl: "upload-url"
			};
		result.json(fakeUploadDetails);
		console.log("Returned fake upload details.");
***/
		}
	catch (e) {
		console.error("Error getting B2 upload details:", e.message);
		result.status(500).send();
		}
	}

async function jsonAPICall(url, options, data) {
	return new Promise((resolve, reject) => {
		let protocol = (url.startsWith("https:") ? https : http);
		let request = protocol.request(url, options, (response) => {
			const { statusCode } = response;
			const contentType = response.headers['content-type'];
			let error;
			if (statusCode != 200) {
				error = new Error(`Request failed: ${statusCode}`);
				/***
				console.log(response.statusMessage);
				response.setEncoding('utf8');
				response.on('data', (chunk) => { console.log(chunk); });
				***/
				}
			else if (!/^application\/json/.test(contentType))
				error = new Error(`Content type "${contentType}" instead of JSON.`);
			if (error) {
				response.resume();
				reject(error);
				return;
				}
			response.setEncoding('utf8');
			let rawData = '';
			response.on('data', (chunk) => { rawData += chunk; });
			response.on('end', () => {
				try {
					const parsedData = JSON.parse(rawData);
					resolve(parsedData);
					}
				catch (e) {
					reject(e);
					}
				});
			});
		request.on('error', (e) => { reject(e) });
		if (data)
			request.write(data);
		request.end();
		});
	}

async function getAuthDetails() {
	let requestOptions = {
		method: "GET",
		auth: settings.b2KeyID + ':' + settings.b2ApplicationKey,
		};
	let result = await jsonAPICall("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", requestOptions);
	return {
		apiURL: result.apiUrl,
		authToken: result.authorizationToken,
		bucketID: result.allowed.bucketId,
		};
	}

async function getUploadDetails(authDetails) {
	let { apiURL, authToken, bucketID } = authDetails;
	let body = {
		bucketId: bucketID,
		};
	let bodyText = JSON.stringify(body);
	let requestOptions = {
		method: "POST",
		headers: {
			'Authorization': authToken,
			'Content-Length': Buffer.byteLength(bodyText),
			},
		};
	let result = await jsonAPICall(`${apiURL}/b2api/v2/b2_get_upload_url`, requestOptions, bodyText);
	return {
		authToken: result.authorizationToken,
		uploadURL: result.uploadUrl,
		};
	}

// Start the server.
let app = express();
app.use(express.json());
app.use('/getUploadDetails', getUploadDetailsRoute);
app.set('port', settings.port);
let server = http.createServer(app);
server.listen(settings.port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
	if (error.syscall != 'listen')
		throw error;
	switch (error.code) {
		case 'EACCES':
			console.error("Port requires elevated priviledges.");
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error("Port is already in use.");
			process.exit(1);
			break;
		default:
			throw error;
		}
	}

function onListening() {
	console.log(`Listening on ${server.address().port}...`);
	}


