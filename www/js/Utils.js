var infoFile, infoText, settingsFile, settingsFileEntry, settingsText;
var email, photoName, autoSkip;
var imageList;
var rootDir, settingsDir;

//get all the information from the info file
function getInfo(funct) {
    var settingsDone=0;
    var imagesDone=0;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFileSys, fail);
	function gotFileSys(fileSys) {
		fileSys.root.getDirectory("canopyApp", {create:true}, getTheDir, fail);
	}
	function getTheDir(directory) {
		rootDir = directory;
		directory.getDirectory("settings", {create:true}, gotSettingsDir, fail);
	}
	function gotSettingsDir(dir) {
		settingsDir = dir;
		dir.getFile("canopyAppInfo.txt", {create: true}, fileSuccess, fail);
		dir.getFile("canopyAppSettings.txt", {create: true}, settingsSuccess, fail);
	}

	function fileSuccess(fileEntry) {
		fileEntry.file(gotFile, fail);
		infoFile = fileEntry;
	}
	function settingsSuccess(fileEntry) {
		settingsFileEntry = fileEntry;
		fileEntry.file(gotSettingsFile, fail);
	}
	function gotSettingsFile(file) {
		settingsFile = file;
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			settingsText = evt.target.result;
			//if (settingsText.length == 0 && window.location!="settings.html") {
				//if (confirm("Your settings haven't been set! Would you like to set them now?"))
					//window.location = "settings.html";
			//}
            if(settingsText.length==0) {
				email = "";
				photoName = "";
				autoSkip = "n";
            }
			else {
				email = extractText("email", settingsText);
				photoName = extractText("photoname", settingsText);
				autoSkip = extractText("autoskip", settingsText);
			}
            settingsDone=1;
		};
		reader.readAsText(file);
	}

	function gotFile(file) {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			infoText = evt.target.result;
			getImages();
		};
		reader.readAsText(file);
		
		//fetch the list of images
		function getImages() {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
			fileSys.root.getDirectory("canopyApp", {create:true},
				function(dir) {
					var directoryReader = dir.createReader();
						directoryReader.readEntries(fileSuccess,function(error){
							alert("Failed to list directory contents: " + error.code);});
			}, fail);}, fail);
			function fileSuccess(entries) {
				/*if (entries.length == 0 || entries.length == 1) {
					alert("No images found!");
					window.location = "index.html";
				}*/
				imageList = entries;
                imagesDone=1;
                checkDone();
			}
		}
	}
    function checkDone() {
    	var done=0;
        if(settingsDone==1 && imagesDone==1) {
            if(funct!=null && funct!=undefined)
                funct();
            done=1;
        }
        else {
            setTimeout(function(){if(done!=1) checkDone();},100);
        }
    }
}
function extractText(tagName, htmlString) {
	var div = document.createElement('div'); // Build a DOM element.
	div.innerHTML = htmlString; // Set its contents to the HTML string.
	var el = div.getElementsByTagName(tagName) // Find the target tag.
	return (el.length > 0) ? el[0].textContent : null; // Return its contents.
}
function deleteFile(file) {
	var entry = getFile(file, LocalFileSystem.PERSISTENT);
	entry.remove(function() {}, fail);
}



function renamePhoto(entry, newFileName) { //doesn't work
	var myFolderApp = "canopyApp";
	alert("entry "+entry);
	var file = entry.file(gotTheFile,function(){alert("1 Could not move file "+newFileName);});
	function gotTheFile() {
		var reader = new FileReader();
		reader.onloadend = function(evt) {
			alert("Reading it");
			if(evt.target.result == null) { // If you receive a null value the file doesn't exists
				alert("Do it");
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
					//The folder is created if doesn't exist
					fileSys.root.getDirectory( myFolderApp, {create:true, exclusive: false},
					function(directory) {
							entry.moveTo(directory, newFileName, function(){}, function(){alert("2 Could not move file "+newFileName);});
					}, function(){});
				}, function(){alert("3 Could not move file "+newFileName);});
			}
			else { // Otherwise the file exists
				alert("Already exists");
				return -1;
			}
		}
	};
	reader.readAsDataURL(file); 
}

function fail(mess) {
	alert("Failed because: "+mess);
}



//------ METHODS FOR MAGIC WAND ------  
function rgbToHex(r, g, b) {
	if (r > 255 || g > 255 || b > 255)
		throw "Invalid color component";
	return ((r << 16) | (g << 8) | b).toString(16);
}
function updateCanvas(c) {
	c.style.opacity = 0.99;
	setTimeout(function() {
		c.style.opacity = 1;
	}, 1);
}
function imgFail(message) {
	alert("Fetching image failed because: "+message);
	window.location = "index.html";
}



//-------------------------------------------------------------------------------------

function getPhotoDate(imgname) { //unused
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {
		fileSys.root.getDirectory("canopyApp", {create:false},
			function(directory) {
				directory.getFile(imgname, {create: false}, imgSuccess, imgFail);
		}, imgFail);}, 
	imgFail);

	function imgSuccess(img) {
		var date;
		img.getMetadata(function(meta) {
			date=meta.modificationTime;
			returnDate(date);
		}, fail);
		function returnDate(d) {
			return d;
		}
	}
	function imgFail(e) {
		alert("Failed to fetch image date: "+e.message);
	}
}

//if there is no email set, it returns 1. else, 0
function checkEmail() {
    if(email==null || email==undefined)
        return 1;
	email = email.trim();
	if (email == " ")
		email = null;
	if (email == null || email=="")
		return 1;
	else return 0;
}

function getPhotoPercent(imgname) {
	var n = "a"+imgname;
	return extractText(n, infoText);
}
function getPhotoName(imgname) {
	var n = "a"+imgname;
	return extractText(n+"name", infoText);
}
function getPhotoComments(imgname) {
	var n = "a"+imgname;
	return extractText(n+"comm", infoText);
}
function getPhotoGPS(imgname) {
	var n = "a"+imgname;
	return extractText(n+"gps", infoText);
}

function getSettingsFile() {
	return settingsFile;
}
function getSettingsText() {
	return settingsText;
}
function getSettingsFileEntry() {
	return settingsFileEntry;
}
function getDefaultPhotoName() {
	return photoName;
}
function getAutoSkip() {
	return autoSkip;
}
function getRootDir() {
	return rootDir;
}
function getSettingsDir() {
	return settingsDir;
}
function getInfoFile() {
	return infoFile;
}
function getEmail() {
	return email;
}
function getImageList() {
	return imageList;
}
function getInfoText() {
	return infoText;
}