  /** 
   * Controls applying of swanepoel formulas to extrema array. 
   *
   */
(function() { 
   'use strict';

   var app = angular.module('calculationModule');

   app.controller('FormulasCtrl', function($scope, DataManager, Calculus, Formulas, Plotter) {
      var self = this;
      var handsontableOptions = {
        contextMenu: true,
        colWidths: [100, 100, 100],
        colHeaders: ['wavelength', 'T minima', 'T Maxima'],
        columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'}, {type: 'numeric', format: '0.00'}]
      }

      $scope.test = 'Formulas Ctrl test';

      $scope.$watch('activePage', function(newValue, oldValue) {
        console.log('debug', 'FormulasCtrl: activePage now = ' + newValue); 
        if($scope.activePage == 'applying-swanepoel-formulas') {
          handsontableOptions.data = $scope.finalExtremaArray;
          $('#extrema-table-formulas-page').handsontable(handsontableOptions);
        }
      });

    }); // end FormulasCtrl
})(); // end closure
