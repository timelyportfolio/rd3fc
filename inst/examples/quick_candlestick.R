# devtools::install_github("timelyportfolio/rd3fc")

library(d3r)
library(rd3fc)
library(htmltools)
library(quantmod)

sp500 <- getSymbols("^GSPC", auto.assign=FALSE)
sp500 <- to.weekly(sp500)
# not necessary but convenient
#  remove GSPC. from colnames
#  and make them lowercase
colnames(sp500) <- tolower(
  gsub(x=colnames(sp500), pattern="sp500\\.", replacement="")
)

# make https://d3fc.io/introduction/getting-started.html in R with R data

# create script to make chart with d3fc
script_chart <- "
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
    return new Date(d.date);
  }]);

var gridlines = fc.annotationSvgGridline();
var candlestick = fc.seriesSvgCandlestick()
  .crossValue(function(d) {return new Date(d.date)});
var bollinger = fc.seriesSvgArea()
  .crossValue(function(d) { return new Date(d.date); })
  .mainValue(function(d) { return d.upper; })
  .baseValue(function(d) { return d.lower; });


var multi = fc.seriesSvgMulti()
  .series([gridlines, bollinger, candlestick]);

var chart = fc.chartSvgCartesian(
  fc.scaleDiscontinuous(d3.scaleTime()),
  d3.scaleLinear()
)
  .yDomain(yExtent(data))
  .xDomain(xExtent(data))
  .plotArea(multi);

d3.select('#chart')
  .datum(data)
  .call(chart);
"

# assemble our page
app <- tagList(
  div(id="chart", style="width:100%; height:250px;"),
  tags$script(
    HTML(
      sprintf(
"
var data = %s;
// add bollinger bands
fc.indicatorBollingerBands().value(d=>d.close)(data).map(function(d,i) {
  data[i] = Object.assign(d, data[i])
});

%s
",
        jsonlite::toJSON(
          data.frame(
            date = index(sp500),
            sp500,
            stringsAsFactors = FALSE
          )
        ),
        script_chart
      )
    )
  ),
  d3_dep_v4(),
  html_dependency_d3fc()
)

browsable(app)
