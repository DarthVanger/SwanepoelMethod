'use strict';

/* Controllers */

var alerter = function() {
  return {
    alert: function(message) {
      alert(message);  
    }
  }
}

var phonecatApp = angular.module('phonecatApp', ['calculus'])
  .factory('alerter', alerter);

phonecatApp.controller('PhoneListCtrl', function($scope) {
  $scope.phones = [
    {'name': 'Nexus S',
     'snippet': 'Fast just got faster with Nexus S.'},
    {'name': 'Motorola XOOM™ with Wi-Fi',
     'snippet': 'The Next, Next Generation tablet.'},
    {'name': 'MOTOROLA XOOM™',
     'snippet': 'The Next, Next Generation tablet.'}
  ];
});

phonecatApp.controller('cos', function($scope) {
  $scope.testString = '';
  alerter.alert('asdf');

  $scope.cosPoints = [];
  for (var i=0; i<20*Math.PI; i+=0.1){ 
    $scope.cosPoints.push([i, Math.sin(i)]); 
  }

  var options = {
    lines: { show: false },
    points: { show: true, fill: true, radius: 1, symbol: 'circle' },
    grid: { hoverable: true },
    tooltip: true
  }

  $scope.drawPlot = function() {
    $.plot($('#flot-plot'), [
      { data: $scope.cosPoints, label: "experiment"},
      { data: $scope.derivatives, label: "derivative"},
      { data: $scope.extrema, label: "extrema"}
    ], options);
  }
 
  $scope.derivatives = [];
  $scope.extrema = [];
  $scope.findExtrema = function() {
  var previousDerivative = null;
    var func = $scope.cosPoints;
    for(var i=0; i<func.length-1; i++) {
      var x = func[i][0];
      var y = func[i][1];
      var derivative = (func[i+1][1]-func[i][1]) / (func[i+1][0]-func[i][0]); 
      $scope.derivatives.push([x, derivative]);
      if(previousDerivative*derivative < 0) {
        $scope.extrema.push([x,y]);
      }
      var previousDerivative = derivative;
    }
    $.plot($('#flot-extrema'), [$scope.derivatives], options);
  }
  $scope.findExtrema();
}

});
