b2-upload
=====

This is code for a web page to upload files to a Backblaze B2 bucket.  It's based on [Matt Welke's example](https://github.com/mattwelke/upload-file-to-backblaze-b2-from-browser-example), but has been rewritten.  It has the following differences from that:

- Its only dependencies are Node and Express.
- The backend is a single .js file -- there isn't so much code that it needs to be spread out into separate modules.
- The frontend shows progress, allows multiple files to be selected and uploaded, and has other small affordances.

Prepping the bucket
-----

You'll need the B2 CLI tool.  <code>b2 update-bucket --corsRules "$(cat cors-rules)" <i>bucket-name</i> allPublic</code>.  The CORS rules here are designed for a "drop box", so they only allow uploading by the client, not downloading.

Running the backend
-----

You'll need to install it using `npm install` or `nix-build -A package`.  (There *is* a way to handle that from a Nix derivation, but I'm not gonna explain that here.)

Run it like <code>node backend.js <i>options</i></code>.  These `options` arguments are available:

<code>b2ApplicationKey: <i>path</i></code>: path to file containing the B2 application key (required)  
<code>b2KeyID: <i>path</i></code>: path to file containing the B2 key id (required)  
<code>port: <i>port</i></code>: IP port to listen on (default: 3000)  
<code>addCORSHeader: true</code>: Adds "Access-Control-Allow-Origin" header  
<code>frontendServerURL: <i>url</i></code>: Contents of the "Access-Control-Allow-Origin" header

The application key and key ID are separate files to accomodate Docker secrets (not that I've tried that myself).

Configuring the frontend
-----

Add a `local.js` file that sets the `getUploadDetailsURL` variable to the URL of the backend.  Serve with the webserver of your choice.

Don't forget to require authentication to access the page!


