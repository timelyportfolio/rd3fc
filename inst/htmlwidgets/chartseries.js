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
            return xScale(d.date);
          })
          .y(function(d) {
            return yScale(d.close);
          })
          .xLabel(function(d) {
            return d3.timeFormat('%b %d, %Y')(d.date);
          })
          .yLabel(function(d) {
            return d.close;
          })
          .decorate(function(el, data) {
            el.select('.right-handle text')
              .attr('text-anchor', 'end')
              .attr('x', -2)
              .attr('dy', '1em')
              .attr('dx', '-0.32em');
          });

        var draw_crosshair = function() {
          d3.event.preventDefault();
          d3.event.stopPropagation();

          var crosshair_el = d3.select(this).select(".d3fc-crosshair-container");
          var pt = d3.mouse(this) || d3.touch(this);
          var data = [find_point({ x: pt[0], y: pt[1] })];
          crosshair_el.datum(data);
          crosshair_el.call(crosshair);
        };

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
            el.on("mouseover", draw_crosshair);
            el.on("mousemove", draw_crosshair);
            el.on("touchstart", draw_crosshair);
            el.on("touchmove", draw_crosshair);
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
