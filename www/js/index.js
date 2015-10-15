function changeLabel() {
    var id = "deviceready";
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
}

function logPluginFile() {
    console.log("1. cordova.file: " + cordova.file);
}

function prepareButtons() {
    var btnSave     = document.getElementById("btnSave"),
        btnRead     = document.getElementById("btnRead"),
        txtToSave   = document.getElementById("txtToSave"),
        txtFilename = document.getElementById("txtFilename");

    function doSave() {
        console.log("doSave");

        var filename = txtFilename.value;
        var contents = txtToSave.value;
        MyApp.file.doSave(filename, contents)
        	.done(function() {
                alert("Saved correctly.");
            })
            .fail(function(e) {
                alert("Error saving: " + e.toString());
            });
    }

    function doRead() {
        console.log("doRead");

        var txtContents = document.getElementById("txtContents");
        var filename = txtFilename.value;

        
        MyApp.file.doRead(filename).done(function(contents) {
            console.log("doRead, contents: " + contents);
            txtContents.value = contents;
        }).fail(function(e) {
            var msg = "doRead failed, e: " + e.toString();
            console.log(msg);
            alert(msg);
        });
    }

    btnSave.addEventListener("click", doSave, false);
    btnRead.addEventListener("click", doRead, false);
}

function onDeviceReady() {
    changeLabel();
    logPluginFile();
    prepareButtons();
}

document.addEventListener("deviceready", onDeviceReady, false);
