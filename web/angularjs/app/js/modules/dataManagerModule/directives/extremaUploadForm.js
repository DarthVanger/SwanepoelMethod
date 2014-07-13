(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  app.directive('extremaUploadForm', function(DATA_MANAGER_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'EA',
      templateUrl: DATA_MANAGER_MODULE_TEMPLATES_PATH + 'extrema-upload-form.html'
    }
  });
})(); // end closure
