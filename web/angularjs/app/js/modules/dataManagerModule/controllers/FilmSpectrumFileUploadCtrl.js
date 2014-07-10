(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  /** FilmSpectrumFileUploadCtrl
   *  Controls experimental data file upload (via ajax).
   *
   *  On file upload $emits 'NewFilmSpectrumFileUploaded' event.
   *
   */
  app.controller('FilmSpectrumFileUploadCtrl', function($scope, $upload, $http, DataManager, FileManager) {
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

          // $emit NewSpectrumFileUpload event to notify calculation controller.
          console.log('debug', 'DataManager: emitting \'NewFilmSpectrumFileUploaded\' event');
          $scope.$emit('NewFilmSpectrumFileUploaded', $scope.uploadedFileName);
        }).error(function() {
            console.log('debug', 'file upload error');
            $scope.fileUploadError = true;
        });
      }
    }
  }); // end FilmSpectrumFileUploadCtrl
})(); // end closure

