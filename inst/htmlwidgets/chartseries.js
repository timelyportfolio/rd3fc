HTMLWidgets.widget({

  name: 'chartseries',

  type: 'output',

  factory: function(el, width, height) {

    function convert_data(x) {
      var data = x.xdata.map( function(d,i) {
        var row = {};
        row.date = new Date(x.date[i]) || i;
        row.open = d[0];
        row.high = d[1];
        row.low = d[2];
        row.close = d[3];
        return row;
      });

      return data;
    }

    return {

      renderValue: function(x) {

        var data = convert_data(x);

        // from https://d3fc.io/introduction/getting-started.html
        //  with minor modifications

        var yExtent = fc.extentLinear()
          .accessors([
            function(d) {
              return d.high;
            },
            function(d) {
              return d.low;
            }
          ]);

        var xExtent = fc.extentDate()
          .accessors([function(d) {
            return d.date;
          }]);

        var gridlines = fc.annotationSvgGridline();
        var candlestick = fc.seriesSvgCandlestick()
          .crossValue(function(d) {return new Date(d.date)});
        var multi = fc.seriesSvgMulti()
          .series([gridlines, candlestick]);

        var chart = fc.chartSvgCartesian(
          fc.scaleDiscontinuous(d3.scaleTime()),
          d3.scaleLinear()
        )
          .yDomain(yExtent(data))
          .xDomain(xExtent(data))
          .plotArea(multi)
          .decorate(function(a,b,c){
            debugger;
          });

        d3.select(el)
          .datum(data)
          .call(chart);

        var crosshair = fc.annotationSvgCrosshair()
          .xScale(chart.xCopy())
          .yScale(chart.yCopy());



      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
