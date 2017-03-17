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

        var gridlines = fc.annotationSvgGridline()
          .xDecorate(function(lines) {
            lines
              .style('stroke-width', '0.25px')
              .style('stroke-dasharray', 2);
          })
          .yDecorate(function(lines) {
            lines
              .style('stroke-width', '0.25px')
              .style('stroke-dasharray', 2);
          });
        var candlestick = fc.seriesSvgCandlestick()
          .crossValue(function(d) {return new Date(d.date)});
        var multi = fc.seriesSvgMulti()
          .series([gridlines, candlestick]);

        var xScale = fc.scaleDiscontinuous(d3.scaleTime())
          .discontinuityProvider(fc.discontinuitySkipWeekends());
        var yScale = d3.scaleLinear();

        var find_point = function(pt) {
          var row = d3.bisectRight(
            data.map(function(row){return row.date;}),
            xScale.invert(pt.x)
          );
          if(row === data.length) row = row - 1;
          var data_price = data[row];
          return data_price;
        }

        var crosshair = fc.annotationSvgCrosshair()
          .xScale(xScale)
          .yScale(yScale)
          .x(function(d) {
            // don't go into left axis
            return Math.min(d.x, xScale(data[data.length - 1].date));
          })
          .y(function(d) {
            return yScale(find_point(d).close);
          })
          .xLabel(function(d) {
            return d3.timeFormat('%b %d, %Y')(find_point(d).date);
          })
          .yLabel(function(d) {
            return find_point(d).close;
          })
          .decorate(function(el, data) {
            el.select('.right-handle text')
              .attr('text-anchor', 'end')
              .attr('x', -2)
              .attr('dy', '1em')
              .attr('dx', '-0.32em');
          });

        var chart = fc.chartSvgCartesian(
          xScale,
          yScale
        )
          .yDomain(yExtent(data))
          .xDomain(xExtent(data))
          .chartLabel(x.name)
          .plotArea(multi)
          .decorate(function(el, data){
            // left align chart title
            el.select('.chart-label')
              .style('text-align', 'left');

            var crosshair_el = el.select(".plot-area svg")
              .append("g")
              .classed("d3fc-crosshair-container", true);
            el.on("mouseover", function(){
              var point = d3.mouse(this);
              data = [{ x: point[0], y: point[1] }];
              crosshair_el.datum(data);
              crosshair_el.call(crosshair);
            });
            el.on("mousemove", function(){
              var point = d3.mouse(this);
              data = [{ x: point[0], y: point[1] }];
              crosshair_el.datum(data);
              crosshair_el.call(crosshair);
            });
          });

        d3.select(el)
          .datum(data)
          .call(chart);

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
