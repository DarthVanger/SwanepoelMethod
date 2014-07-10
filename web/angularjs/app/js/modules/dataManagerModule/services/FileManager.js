(function() {
  'use strict';

  var app = angular.module('dataManagerModule');
  /** FileManager service
   *  Provides API to get/upload files on server.
   */
  app.service('FileManager', function($q, $http) {
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
  }); // end FileManager service
})(); // end closure
