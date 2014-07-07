/** fileManagerModule
 *
 *  Provides services and controllers for file managment.
 *  
 */
(function() {
  var app = angular.module('fileManagerModule', ['angularFileUpload', 'calculationEngineModule']);

  /** FileSystemAPI service
   *  Provides API to get/upload files on server.
   */
  app.service('FileSystemAPI', function($q, $http) {
    /** getFileContents
     *  Gets contents of file named @param filename.
     *
     *  @return object {data: fileContents}
     */
    this.getFileContents = function(filename) {
      console.log('debug', 'getFileContents called, filename = ' + filename);
      var deferred = $q.defer();
      deferred.resolve(
        $http.get("/get-file-contents/" + filename)
          .success(function(response) {
            //console.log('debug', 'FileSystemAPI::getFileContents: success, response: ' + response);
            console.log('debug', 'FileSystemAPI::getFileContents: success');
            return response;
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


  /** ExperimentalDataManager service
   *  Responsible for managing files.
   */
  app.service('ExperimentalDataManager', function($q, FileSystemAPI) {
    var self = this;

    this.experimentalData = {
      points: 'not loaded yet',
      isLoaded: false
    };

    /**
     *  Parses csv string to double array.
     *  
     *  @return double array of points.
     *  E.g. [ [1,2], [2, 4], ... ]
     */
    this.parseCsvString = function(csvString) {
        var parsedData = $.csv.toArrays(csvString);
        console.log('debug', 'parseCsvString(): parsing ok'); 
        return parsedData;
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

    /** getLastUploadedExperimentalData
     *  Gets last uploaded file from server,
     *  parses it to double-array,
     *  and returns via promise object.
     *
     *  @return Promise object with double-array experimental data in result.data
     */
    this.getLastUploadedExperimentalData = function() {
      console.log('debug', 'getLastUploadedFileContents called');
      var deferred = $q.defer();
      deferred.resolve(
        FileSystemAPI.getFileContents('lastUploaded.csv').then(function(response) {
            //console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success, response.data: ' + response.data);
            console.log('debug', 'ExperimentalDataManager::getLastUploadedFileContents: success');
            var fileContents = response.data;
            var experimentalData = self.parseCsvString(fileContents);
            return {data: experimentalData};
        })
      );
      return deferred.promise;
    };
  });

  
  /** ExperimentalDataFileUploadController
   *  Controls experimental data file upload (via ajax).
   *
   *  Uploads file on server, then gets it contents from server,
   *  parses it from csv to arrays, and  $Emits 'ExperimentalDataLoaded',
   *  with parsed data as argument.
   *
   *  TBD: create separate method for getting file contents, parsing, and emitting.
   *  Let this controller control only ajax file upload.
   */
  app.controller('ExperimentalDataFileUploadController', function($scope, $upload, $http, ExperimentalDataManager, FileSystemAPI) {
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
          console.log('debug', 'uploaded file name: ' + $scope.uploadedFileName);
          $scope.fileUploadSuccess = true;
          // now get this file contents from server
          FileSystemAPI.getFileContents($scope.uploadedFileName).then(function(result) {
            var fileContents = result.data;
            var experimentalData = ExperimentalDataManager.parseCsvString(fileContents);
            //CalculationEngine.applySwanepoelMethod(experimentalData);
            //CalculationController.applySwanepoelMethod(experimentalData);
            //ExperimentalDataManager.experimentalData.points = experimentalData;
            //ExperimentalDataManager.experimentalData.isLoaded = true;
            //console.log('ExperimentalDataManager.experimentalData now = ' + ExperimentalDataManager.experimentalData);
            console.log('debug', 'ExperimentalDataManager: emitting \'ExperimentalDataLoaded\' event');
            $scope.$emit('ExperimentalDataLoaded', experimentalData);
          });
        }).error(function() {
          console.log('debug', 'file upload error');
          $scope.fileUploadError = true;
        });
      }
    }
  });

})();
