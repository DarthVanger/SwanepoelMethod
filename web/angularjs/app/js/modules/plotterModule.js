(function() {
  var app = angular.module('plotterModule', []);
  app.service('Plotter', Plotter);


  function Plotter() {
    var self = this;

    this.plotHeight = '400px';
    this.plotWidth = '90%';
    
    this.calculationsOutputArea = document.getElementById('calculations-output-area');

    this.plotOptions = {
      lines: { show: false },
      points: { show: true, fill: true, radius: 1, symbol: 'circle' },
      grid: { hoverable: true },
      tooltip: true
    };


    this.spawnPlot = function(plotId, data) {
      var plotDiv = document.createElement('div'); 
      plotDiv.style.height = self.plotHeight; 
      plotDiv.style.width = self.plotWidth; 
      plotDiv.id = plotId;

      self.calculationsOutputArea.appendChild(plotDiv);
      self.plot(plotId, data); 
    }

    this.plot = function(plotId, data) {
      console.log('Plotter: plotting to #' + plotId);
      $.plot($('#' + plotId), data, self.plotOptions);
    }
  }
})();
