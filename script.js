var region = "us-east-1";
var accessKeyId = "AKIARJQTUCEJCXUTS5YK";
var secretAccessKey = "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";

AWS.config.update({
    region: region,
    credentials: new AWS.Credentials(accessKeyId, secretAccessKey)
});

var s3 = new AWS.S3();

function refreshFileList(bucketname) {
    var tableBody = document.querySelector("#fileTable tbody");
    tableBody.innerHTML = "";

    s3.listObjectsV2({ Bucket: bucketname }, (err, data) => {
        if (err) {
            console.log("Error fetching file list", err);
        } else {
            data.Contents.forEach((object) => {
                var fileRow = document.createElement('tr');

                var fileNameCell = document.createElement('td');
                fileNameCell.textContent = object.Key;
                fileRow.appendChild(fileNameCell);

                var fileSizeCell = document.createElement("td");
                fileSizeCell.textContent = object.Size;
                fileRow.appendChild(fileSizeCell);

                var downloadCell = document.createElement('td');
                var downloadLink = document.createElement('a');

                // Generate a pre-signed URL with the 'response-content-disposition' parameter
                var params = {
                    Bucket: bucketname,
                    Key: object.Key,
                    ResponseContentDisposition: 'attachment; filename="' + object.Key + '"'
                };

                downloadLink.href = s3.getSignedUrl("getObject", params);
                downloadLink.textContent = "Download";

                downloadCell.appendChild(downloadLink);
                fileRow.appendChild(downloadCell);

                var deleteCell = document.createElement('td');
                var deleteButton = document.createElement('button');
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener('click', () => {
                    deleteFile(bucketname, object.Key); // Pass object.Key as the parameter
                });

                deleteCell.appendChild(deleteButton);
                fileRow.appendChild(deleteCell);

                tableBody.appendChild(fileRow);
            });
        }
    });
}

function uploadFiles(bucketname){
    let files = document.getElementById('fileInput').files

    var fileCount = files.length

    for(var i=0;i<fileCount;i++){
        var file = files[i];
        var params = {
            Bucket:bucketname,
            Key:file.name,
            Body:file
        }

        s3.upload(params,(err,data) => {
            console.log("file uploaded")
            refreshFileList(bucketname)
        })
    }
}

function deleteFile(bucketname, objectKey) { // Corrected the parameter name to objectKey
    var params = {
        Bucket: bucketname,
        Key: objectKey // Use objectKey instead of object,Key
    };

    s3.deleteObject(params, (err, data) => {
        if (err) {
            console.log("Error deleting file", err);
        } else {
            console.log("File deleted successfully");
            refreshFileList(bucketname);
        }
    });
}

refreshFileList("cloudcrowd");



