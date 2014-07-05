(function() {
  var app = angular.module('plotter', []);
  app.service('plotter', Plotter);

  var options = {
    lines: { show: false },
    points: { show: true, fill: true, radius: 1, symbol: 'circle' },
    grid: { hoverable: true },
    tooltip: true
  };

  function Plotter() {
    this.plot = function(plotSelector, data) {
      $.plot($(plotSelector), data, options);
    }
  }
})();
