/** fileManagerModule
 *
 *  Provides services and controllers for file managment.
 *  
 */
(function() {
  var app = angular.module('fileManagerModule', ['angularFileUpload', 'ngResource']);

  /** FileSystemAPI service
   *  Provides API to get and upload files on server.
   */
  app.service('FileSystemAPI', function($q, $http) {
    /** getFileContents
     *  Gets contents of file named @param filename.
     *
     *  @return object {data: fileContents}
     */
    this.getFileContents = function(filename) {
      var deferred = $q.defer();
      deferred.resolve(
        $http.get("/get-file-contents/" + filename)
          .success(function(response) {
            //console.log('debug', 'FileSystemAPI::getFileContents: response: ' + response.data);
            return response.data;
          })
          .error(function(response) {
            console.log('debug', 'fileManager: ajax get file failed');
          })
      );
      return deferred.promise;
    };

    /** uploadFile
     *  Uploads file to server.
     *
     *  @param filename String name of file to be stored.
     *  @param fileContents String contents of file to be stored.
     *
     *  @return Promise object
     */
    this.saveFile = function(filename, fileContents) {
      var deferred = $q.defer();
      deferred.resolve(
        $http({
          url: '/save-file',
          method: "POST",
          data: {
            'filename': filename,
            'fileContents': fileContents 
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config) {
            return data;
          }).error(function (data, status, headers, config) {
            return false;
          })
      );
      return deferred.promise;
    };
  });


  /** FileManager service
   *  Responsible for managing files.
   */
  app.service('FileManager', function(FileSystemAPI) {
    var self = this;
    /**
     *  Experimental data in double array format.
     *  E.g. [ [1,2], [3,4], ... ]
     */
    this.experimentalData = 'not loaded yet';

    /**
     *  Parses experimental data file from CSV to array.
     *  Updates self.experimentalData when finished.
     */
    this.parseExperimentalDataFile = function(uploadedFileName) {
      FileSystemAPI.getFileContents(uploadedFileName).then(function(result) {
        var csv = result.data;
        var parsedData = $.csv.toArrays(csv);
        self.experimentalData = parsedData;
        console.log('debug', 'FileManager::parseExperimentalDataFile: parsing ok');
      });
    }

    this.convertToCsv = function(data) {
      var csv = '';
      for(var i=0; i<data.length; i++) {
        for(var j=0; j<data[i].length; j++) {
          csv += data[i][j];
          if(j<data[i].length - 1) {
            csv += ',';
          }
        }
        csv += '\n'
      }
      return csv;
    }
  });

  
  /** ExperimentalDataFileUploadController
   *  Controls ajax experimental data file upload.
   *  Calls FileManager.parseExperimentalDataFile() on success
   */
  app.controller('ExperimentalDataFileUploadController', function($scope, $upload, $http, FileManager) {
    $scope.fileUploadSuccess = false;
    $scope.fileUploadError = false;
    $scope.onFileSelect = function($files) {
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: '/upload',
          method: 'POST',
          file: file,
          fileFormDataName: 'file',
        }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          // file is uploaded successfully
          console.log('debug', 'response data: ' + data);
          console.log('debug', 'response status: ' + status);
          $scope.uploadedFileName = data.uploadedFileName;
          $scope.fileUploadSuccess = true;
          FileManager.parseExperimentalDataFile(data.uploadedFileName);
        }).error(function() {
          console.log('debug', 'file upload error');
          $scope.fileUploadError = true;
        });
      }
    }
  });



  /** parseUploadedExperimentaData
   *  Parses uploaded experimental data file from CSV to array.
   *
   *  @param data String with contents of uploaded CSV file
   */
  var parseUploadedExperimentalData = function(fileContents) {
    
  }


})();
