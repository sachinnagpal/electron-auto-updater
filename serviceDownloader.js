
const https = require('https');
const fs = require('fs-extra');
const downloadFileService = async function(url) {
  console.log("coming in here")
  let localPath = "/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/downloads/"
  let fileFullPath = localPath + url.split("/").pop()
  // let fileFullPath = "C:\\ProgramData\\O4S\\" + url.split("/").pop()
  // log.info(`filePath : ${fileFullPath}`)
  if (fileFullPath.includes("uid-manager")) {
    // log.info("Deleting uid manager")
    // fs.unlinkSync(fileFullPath)
  }
  // let fileFullPath = localPath + url.split("/").pop()  
  // log.info('downloading file from url: ' + url)

  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {

      let fileName = url.split("/").pop()
      const filePath = fs.createWriteStream(fileFullPath);
      resp.pipe(filePath);
      filePath.on('finish', () => {
        filePath.close();
        log.info('Download Completed');
        resolve('File downloaded')
        // childWindow.webContents.send('file:downloaded', fileName);
      })
    }).on("error", (err) => {
      reject(new Error(err.message))
    });
  })
}

module.exports = {
  downloadFileService,
}