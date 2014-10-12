(function() {
  'use strict';

  var app = angular.module('plotterModule', []);

  /** Plotter service
   *  Provides methods for plotting
   */
  app.service('Plotter', function(LoadingIndicator) {
    var self = this;

    this.plotId = 'plot';

    //this.plotHeight = '400px';
    //this.plotWidth = '90%';
    

    this.data = [];
    this.options = {
      lines: { show: false },
      points: { show: true, fill: true, radius: 1, symbol: 'circle' },
      grid: { hoverable: true },
      legend: { position: 'nw' },
      tooltip: true,
      tooltipOpts: {
          content: "%s | X: %x.2 | Y: %y.2"
      }
    };

    this.plot = function(plotId, data, options) {
      if (!plotId) plotId = self.plotId;
      if (!data) data = self.data;
      if (!options) options = self.options;
      
      console.log('Plotter: plotting to #' + plotId);
      $('#' + plotId).html('');
      options = jsonConcat(self.options, options);
      $.plot($('#' + plotId), data, options);
      LoadingIndicator.plot.hide();
    }

    this.setPlotToLoadingState = function() {
      $('#' + self.plotId).html('<img class="loading" src="/angularjs/app/img/loading-icon.gif" />');
    }
    
    var jsonConcat = function(o1, o2) {
     for (var key in o2) {
      o1[key] = o2[key];
     }
     return o1;
    }
  }); // end Plotter service
})(); // end closure
