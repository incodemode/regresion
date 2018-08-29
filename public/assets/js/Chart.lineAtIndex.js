/*
const verticalLinePlugin = {
  getLinePosition: function (chart, pointIndex) {
      const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
      const data = meta.data;
      return data[pointIndex]._model.x;
  },
  renderVerticalLine: function (chartInstance, pointIndex) {
      const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
      const scale = chartInstance.scales['y-axis-0'];
      const context = chartInstance.chart.ctx;

      // render vertical line
      context.beginPath();
      context.strokeStyle = '#ff0000';
      context.moveTo(lineLeftOffset, scale.top);
      context.lineTo(lineLeftOffset, scale.bottom);
      context.stroke();

      // write label
      context.fillStyle = "#ff0000";
      context.textAlign = 'center';
      context.fillText('MY TEXT', lineLeftOffset, (scale.bottom - scale.top) / 2 + scale.top);
  },

  afterDatasetsDraw: function (chart, easing) {
      if (chart.config.lineAtIndex) {
          chart.config.lineAtIndex.forEach(pointIndex => this.renderVerticalLine(chart, pointIndex));
      }
  }
  };

  Chart.plugins.register(verticalLinePlugin);
  */
  var originalLineDraw = Chart.controllers.line.prototype.draw;
Chart.helpers.extend(Chart.controllers.line.prototype, {
  draw: function() {
    originalLineDraw.apply(this, arguments);

    var chart = this.chart;
    var ctx = chart.chart.ctx;

    var index = chart.config.data.lineAtIndex;
    if (index) {
      var xaxis = chart.scales['x-axis-0'];
      var yaxis = chart.scales['y-axis-0'];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index), yaxis.top);
      ctx.strokeStyle = '#ff0000';
      ctx.lineTo(xaxis.getPixelForValue(undefined, index), yaxis.bottom);
      ctx.stroke();
      ctx.restore();
    }
  }
});