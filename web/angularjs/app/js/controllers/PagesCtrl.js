(function() {
  'use strict';

  var app = angular.module('app');

  /** 
   *  Controls page switching
   *
   */
  app.controller('PagesCtrl', function($scope, $location) {
    $scope.activePage = 'finding-extrema';
    $location.path('/' + $scope.activePage);
    $scope.test = true;

    $scope.$on('switchPage', function(event, message) {
      console.log('debug', 'PagesCtrl: catched \'switchPage\', pageName = ' + message.pageName);
      $scope.activePage = message.pageName; 
      $location.path('/' + $scope.activePage);
    });
  }); // end PagesCtrl 
})(); // end closure

