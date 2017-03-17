# translate quantmod::chart_Series to d3fc

library(quantmod)
library(d3r)
library(d3fc)

sp500 <- getSymbols("^GSPC", auto.assign=FALSE)
sp500w <- to.weekly(sp500)

cs <- chart_Series(sp500w)

# examine the chart_Series environment to replicate each
#  of the pieces
listviewer::jsonedit(
  jsonlite::toJSON(as.list(cs$Env), force=TRUE, auto_unbox=TRUE)
)

# data
cs$Env$xdata

# x axis
# bottom ticks
index(cs$Env$xdata[cs$Env$axt,])
# bottom major ticks
index(cs$Env$xdata[cs$Env$atbt,])
# top ticks and ?location?
cs$Env$axis_ticks(cs$Env$xdata)
# limits
index(cs$Env$xdata[cs$Env$xlim,])

# y axis
# ticks
cs$Env$alabels
# limits
cs$Env$ylim[[2]]

