var MyApp = MyApp || {};
MyApp.file = (function() {
    function handleError(fnName, e) {
        var msg = '';

        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR'; break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';      break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';       break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';  break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';  break;
        default:
            msg = 'Unknown Error';      break;
        };

        console.log(fnName + '. Code: ' + e.code + '. Error: ' + msg);
    }

    function _resolveLocalFileSystemURL(url) {
        var d = new $.Deferred();
        function onSuccess(fileEntry) {
            console.log("_resolveLocalFileSystemURL url: " + url);
            d.resolve(fileEntry);
        }
        function onError(e) {
            handleError("_resolveLocalFileSystemURL", e);
            d.reject(e);
        }
        window.resolveLocalFileSystemURL(url, onSuccess, onError);
        return d;
    }

    function base() {
        var baseDir = cordova.file.externalDataDirectory;
//      var baseDir = "/";
        return _resolveLocalFileSystemURL(baseDir);
    }

    function getFile(filename, opts) {
        return function(dirEntry) {
            var d = new $.Deferred()
            dirEntry.getFile(
                filename,
                { create: opts.create, exclusive: opts.exclusive },
                function(fileEntry) {
                    console.log("getFile, fileEntry: " + JSON.stringify(fileEntry));
                    d.resolve(fileEntry);
                },
                function(e) {
                    handleError("getFile", e);
                    d.reject(e);
                });
            return d;
        }
    }

    function readFile(
        /*
         * The fileEntry object resulting from the call to resolveLocalFileSystemURL,
         * provided by cordova-plugin-file.
         */
        fileEntry
    ) {
        console.log("readFile. fileEntry: " + JSON.stringify(fileEntry));

        var d = new $.Deferred();

        /*
         * The cordova-plugin-file implementation of FileReader delegates
         * to the original FileReader implementation inside the web view.
         */
        var reader = new FileReader();

        reader.onloadend = function(e) {
            console.log("reader.onloadend, result: " + reader.result);
            d.resolve(reader.result);
        };
        reader.onerror = function(e) {
            handleError("readFile", e);
            d.reject(e);
        }

        try {
            /*
             * Fails, because the original FileReader of the web view expects a
             * File or Blob, and the file entry provided by
             * cordova-plugin-file's implementation resolveLocalFileSystemURL is
             * a simple JSONObject, which does not implement this interface.
             */
            reader.readAsText(fileEntry);
        } catch (e) {
            d.reject(e);
        }
        return d;
    }

    function toFileWriter(fileEntry) {
        var d = new $.Deferred();
        fileEntry.createWriter(function(fileWriter) {
            d.resolve(fileWriter);
        }, function(e) {
            handleError("createWriter", e);
            d.reject(e);
        });
        return d;
    }

    function writeFile(contents) {
        return function(fileWriter) {
            console.log("Saving to file: " + contents);

            var blob = new Blob([contents], { type: 'text/plain' });
            fileWriter.write(blob);
        }
    }

    function doRead(filename) {
        return base()
                .pipe(getFile(filename, { create: true }))
                .pipe(readFile);
    }

    function doSave(filename, contents) {
        return base()
            .pipe(getFile(filename, { create: true }))
            .pipe(toFileWriter)
            .done(writeFile(contents));
    }

    return { doRead: doRead, doSave: doSave };
})();
