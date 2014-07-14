(function() {
  'use strict';

  var app = angular.module('plotterModule', []);

  /** Plotter service
   *  Provides methods for plotting
   */
  app.service('Plotter', function() {
    var self = this;

    //this.plotHeight = '400px';
    //this.plotWidth = '90%';
    
    //this.calculationsOutputArea = document.getElementById('calculations-output-area');

    this.plotOptions = {
      lines: { show: false },
      points: { show: true, fill: true, radius: 1, symbol: 'circle' },
      grid: { hoverable: true },
      legend: { position: 'nw' },
      tooltip: true
    };


    //this.spawnPlot = function(plotId, data) {
    //  var plotDiv = document.createElement('div'); 
    //  plotDiv.style.height = self.plotHeight; 
    //  plotDiv.style.width = self.plotWidth; 
    //  plotDiv.id = plotId;

    //  self.calculationsOutputArea.appendChild(plotDiv);
    //  self.plot(plotId, data); 
    //}

    this.plot = function(plotId, data, options) {
      console.log('Plotter: plotting to #' + plotId);
      options = jsonConcat(self.plotOptions, options);
      $.plot($('#' + plotId), data, options);
    }
    
    var jsonConcat = function(o1, o2) {
     for (var key in o2) {
      o1[key] = o2[key];
     }
     return o1;
    }
  }); // end Plotter service
})(); // end closure
