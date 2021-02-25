b2-upload
=====

This is code for a web page to upload files to a Backblaze B2 bucket.  It's based on [Matt Welke's example](https://github.com/mattwelke/upload-file-to-backblaze-b2-from-browser-example).  It has the following differences from that:

- Its only dependencies are Node and Express.
- The backend is a single .js file -- there isn't so much code that it needs to be spread out into separate modules.
- The frontend shows progress, allows multiple files to be selected and uploaded, and has other small affordances.