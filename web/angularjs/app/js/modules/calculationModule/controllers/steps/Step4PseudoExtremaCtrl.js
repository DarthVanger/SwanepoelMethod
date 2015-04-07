(function() { 
  'use strict';

  var app = angular.module('calculationModule');

  app.controller('Step4PseudoExtremaCtrl', function($scope, $http, $compile, DataManager, Calculus, Formulas, Plotter, LoadingIndicator) {
    var self = this;

    console.log("Step4 init (finding pseudo extrema)");
    LoadingIndicator.global.hide();

    findPseudoExtrema();
    //saveFinalExtremaTable();
    //bindListenersToPlot();

    function findPseudoExtrema() {
      LoadingIndicator.global.show();
      Calculus.findPseudoExtrema(DataManager.data.minima, DataManager.data.maximaEnvelope, function(pseudoMaxima) {
        console.log('debug', '$scope.findPseudoExtrema: pseudoMaxima = ' + pseudoMaxima);
        DataManager.data.pseudoMaxima = pseudoMaxima; 

        Calculus.findPseudoExtrema(DataManager.data.maxima, DataManager.data.minimaEnvelope, function(pseudoMinima) {
          console.log('debug', '$scope.findPseudoExtrema: pseudoMinima = ' + pseudoMinima);
          DataManager.data.pseudoMinima = pseudoMinima; 
          DataManager.data.finalMinima = pseudoMinima; 
          generateFinalExtremaTable();
        });
      });
    }

    function saveFinalExtremaTable() {
      var handsontable = $('#handsontable');//.data('handsontable');
      var finalExtremaArray = handsontable.getData();

      // save data to DataManger service to pass it to the next step
      // with new design it's already saved it previous steps
      //DataManager.data.extrema = finalExtremaArray;
      //DataManager.data.filmSpectrum = $scope.filmSpectum;
      //DataManager.data.envelopes.minima = $scope.minimaEnvelope;
      //DataManager.data.envelopes.maxima = $scope.maximaEnvelope;

      DataManager.data.finalExtremaArray = finalExtremaArray;
      DataManager.saveFileFromArray(finalExtremaArray, 'finalExtrema.csv', 'extrema').then(function(result) {
        console.log('debug', '$scope.downloadFinalExtremaTable(): save file success, link = ' + result.link);
        $scope.finalExtremaFileLink = result.link;
        $scope.finalExtremaFileReady = true;
      });
    }

    /**
     * Plots pseudo extrema with envelopes
     */
    function plotPseudoExtrema() {
      // set envelopes data before extrema so envelopes are under extrema, not over
      Plotter.data[1] = {
        data: DataManager.data.minimaEnvelope,
        label: "minimaEnvelope",
        color: "#ccf"
      };
      Plotter.data[2] = {
        data: DataManager.data.maximaEnvelope,
        label: "maximaEnvelope",
        color: "#fcc"
      };
      Plotter.data[3] = {
        data: DataManager.data.envelope.auxiliaryPoints.minima,
        points: {radius: 4},
        color: "#ccf"
      };
      Plotter.data[4] = {
        data: DataManager.data.envelope.auxiliaryPoints.maxima,
        points: {radius: 4},
        color: "#fcc"
      };
      Plotter.data[5] = {
        data: DataManager.data.finalMinima,
        label: "minima",
        points: {radius: 4},
        color: "blue"
      } 
      Plotter.data[6] = {
        data: DataManager.data.finalMaxima,
        label: "maxima",
        points: {radius: 4},
        color: "red"
      }
      Plotter.plot();
    }

      /**
       *  Generates final extrema table from extrema and pseudoextrema,
       *  and shows it using handsontable.
       */ 
      function generateFinalExtremaTable() {
        DataManager.data.finalMinima = DataManager.sort(DataManager.data.minima.concat(DataManager.data.pseudoMinima));
        DataManager.data.finalMaxima = DataManager.sort(DataManager.data.maxima.concat(DataManager.data.pseudoMaxima));
        var finalExtremaArray = [];
        for(var i=0; i<DataManager.data.finalMinima.length; i++) {
          var wavelength =  parseFloat(DataManager.data.finalMinima[i][0]);
          var T_m = parseFloat(DataManager.data.finalMinima[i][1]);
          var T_M = parseFloat(DataManager.data.finalMaxima[i][1]);
          finalExtremaArray.push([wavelength, T_m, T_M]);
        }
        DataManager.data.finalExtremaArray = finalExtremaArray;
        plotPseudoExtrema();
        var finalExtremaTable = $('#handsontable').handsontable({
          data: finalExtremaArray,
          contextMenu: true,
          colWidths: [100, 100, 100],
          colHeaders: ['wavelength', 'T minima', 'T Maxima'],
          columns: [{type: 'numeric', format: '0.0'}, {type: 'numeric', format: '0.00'}, {type: 'numeric', format: '0.00'}]
        });
        saveFinalExtremaTable();
      }

      function saveFinalExtremaTable() {
        var handsontable = $('#handsontable').data('handsontable');
        var finalExtremaArray = handsontable.getData();

        // save data to DataManger service to pass it to the next step
        DataManager.data.extrema = finalExtremaArray;
        // fix the 's' differnece in variable names between 'finding extrema' and 'applying swanepoel formulas :)
        DataManager.data.envelopes.minima = DataManager.data.envelope.minima;
        DataManager.data.envelopes.maxima = DataManager.data.envelope.maxima;

        DataManager.saveFileFromArray(finalExtremaArray, 'finalExtrema.csv', 'extrema').then(function(result) {
          console.log('debug', '$scope.downloadFinalExtremaTable(): save file success, link = ' + result.link);
          $scope.finalExtremaFileLink = result.link;
          $scope.finalExtremaFileReady = true;
          LoadingIndicator.global.hide();
        });
      }

    $scope.continueToApplyingSwanepoelFormulas = function() {
      $scope.$emit('switchPage', {
        pageName: 'applying-swanepoel-formulas'
      });
    }
  }); // end controller
})(); // end closure
