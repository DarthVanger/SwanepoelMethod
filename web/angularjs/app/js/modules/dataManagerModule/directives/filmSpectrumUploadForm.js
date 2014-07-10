(function() {
  'use strict';

  var app = angular.module('dataManagerModule');

  app.directive('filmSpectrumUploadForm', function(DATA_MANAGER_MODULE_TEMPLATES_PATH) {
    return {
      restrict: 'A',
      templateUrl: DATA_MANAGER_MODULE_TEMPLATES_PATH + 'filmSpectrumUploadForm.html'
    }
  });
})(); // end closure
