
    this.parseExperimentalDataFile = function(uploadedFileName) {
      console.log('parseExpeData called');
      FileSystemAPI.getFileContents(uploadedFileName).then(function(result) {
        console.log('file contents: ' + result.data);
        var csv = result.data;
        var parsedData = $.csv.toArrays(csv);
        console.log('debug', 'FileManager::parseExperimentalDataFile: parsing ok');
        return parsedData;
      });
    }
