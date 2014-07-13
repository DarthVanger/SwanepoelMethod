(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  /** FilmSpectrumFileUploadCtrl
   *  Controls experimental data file upload (via ajax).
   *
   *  On file upload $emits 'NewFilmSpectrumFileUploaded' event.
   *
   */
  app.controller('ExtremaFileUploadCtrl', function($scope, $upload, $http, DataManager, FileManager) {
    $scope.uploadingFile = false;
    $scope.fileUploadSuccess = false;
    $scope.fileUploadError = false;
    $scope.onFileSelect = function($files) {
      $scope.uploadingFile = true;
      $scope.$emit('NewFilmSpectrumFileUploadStart');
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        $scope.upload = $upload.upload({
          url: '/upload',
          method: 'POST',
          file: file,
          data: {'directory': 'extrema'},
          fileFormDataName: 'file',
        }).progress(function(evt) {
          console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function(data, status, headers, config) {
          $scope.uploadingFile = false;
          // file is uploaded successfully
          console.log('debug', 'response data: ' + data);
          console.log('debug', 'response status: ' + status);
          $scope.uploadedFileName = data.uploadedFileName;
          console.log('debug', 'uploaded file name: ' + $scope.uploadedFileName);
          $scope.fileUploadSuccess = true;

          // $emit NewSpectrumFileUpload event to notify calculation controller.
          console.log('debug', 'DataManager: emitting \'NewExtremaFileUploaded\' event');
          $scope.$emit('NewExtremaFileUploaded', 'extrema/' + $scope.uploadedFileName);
        }).error(function() {
            $scope.uploadingFile = false;
            console.log('debug', 'file upload error');
            $scope.fileUploadError = true;
        });
      }
    }
  }); // end FilmSpectrumFileUploadCtrl
})(); // end closure

