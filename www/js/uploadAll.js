
var attachList=[];
var emailBody="";
var filesList, infotxt, infofile;
function readyAndEmailFiles(f, txt, file) {
    filesList=f;
    infotxt=txt;
    infofile=file;
    continueReady(0);
}
function continueReady(i) {
    //alert("i "+i+", len "+filesList.length);
    if(i<filesList.length) {
        if(filesList[i].isFile) {
            readyFileForUpload(filesList[i], i, filesList.length);
        }
        else continueReady(i++);
    }
}

function readyFileForUpload(file, i, max) {
    var name = getPhotoName(file.name);
    var maskname2 = "mask-"+file.name;
    maskname2 = maskname2.replace(/.jpg/g , "");
    var maskname = maskname2+".txt";
    //maskname = maskname+".png";
    
    var ret = "--"+file.name+"--\nName: "+name+"\n";
    
    file.getMetadata(function(meta) {
        var date=meta.modificationTime;
        ret = ret+"Date: "+date+"\n";}, fail);
    
    //alert("maskname: "+maskname+"\nmaskname2: "+maskname2);
    var dir = getRootDir();
    dir.getFile(maskname, {create: false}, maskSuccess, function(){continueUpload(file, i, max, ret);});
    function maskSuccess(m) {
        m.file(gotImgFile, fail);
        function gotImgFile(f) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                var mask64 = evt.target.result;
                mask64=mask64.substring(22,mask64.length);
                mask64='base64:'+maskname2+'.png//'+mask64;
                //attachList.push(mask64);
                pushFile(mask64);
                continueUpload(file, i, max, ret);
            };
            reader.readAsText(f);
        }
        
        //var p = m.fullPath.replace('file:/', 'absolute:');
        //attachList.push(p);
    }
    
    function continueUpload(file, i, max, ret) {
        /*ret = ret+
        "GPS: "+getThing('gps', file.name)+"\n"+
        "Percent: "+getThing('', file.name)+"\n"+
        "Comment: "+getThing('comm', file.name)+"\n\n";*/
        ret = ret+
        "GPS: "+getPhotoGPS(file.name)+"\n"+
        "Percent: "+getPhotoPercent(file.name)+"\n"+
        "Comment: "+getPhotoComments(file.name)+"\n\n";
        
        var temp = file.fullPath.replace('file:/', 'absolute:');		//android
        
        //var temp=file.toURL();										//iOS
        //temp=temp.replace("file://","");
        
        //attachList.push(temp);
        pushFile(temp);
        //count++;
        uploaded(file);
        emailBody+=ret;
        if((i+1)==max)
            finishReady();
        else
            continueReady(i+1);
    }
    
    function pushFile(f) {
        for(var i=0; i<attachList.length; i++) {
            if(attachList[i]==f)
                return;
        }
        attachList.push(f);
    }
    
    function uploaded(file) {
        infofile.createWriter(
            function (writer) {
                writer.onwrite = function(evt) {
                    console.log("Write Success");
                };
                n = "a"+file.name;
                writer.seek(infotxt.indexOf("<"+n+"upload>"));
                var strEnd = infotxt.substring(getEndUpload(), infotxt.length);
                writer.write("<"+n+"upload>y</"+n+"upload>"+strEnd);
                writer.onwriteend = function(evt) {
                    //if (count==list.length)
                      //  window.location = "archive.html";
                }
                              
                function getEndUpload() {
                    var s = "</"+n+"upload>";
                    var e = infotxt.indexOf(s);
                    return (e+s.length);
                }
            },
        function(){});
    }
}

function finishReady() {
    //alert(email+"\n\n"+emailBody);
    window.plugin.email.open({
        to: [email],
        subject: 'CanopyApp Pictures',
        body: emailBody,
        attachments: attachList
    });
    window.location = "archive.html";
}

