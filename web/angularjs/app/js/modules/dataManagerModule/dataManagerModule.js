/** dataManagerModule
 *
 *  Provides services and controllers for experimental and calculation data managment.
 *  
 */
(function() {
  'use strict';

  var app = angular.module('dataManagerModule', ['angularFileUpload', 'calculationModule']);

  app.value('DATA_MANAGER_MODULE_TEMPLATES_PATH', '/angularjs/app/partials/dataManagerModule/');
  
})();
