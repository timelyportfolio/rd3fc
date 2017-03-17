#' Interactive 'chart_Series'
#'
#' Convert \code{quantmod::chart_Series} to interactive d3fc htmlwidget chart.
#'
#' @import htmlwidgets
#'
#' @export
chartseries <- function(
  cs = NULL,
  width = NULL,
  height = NULL,
  elementId = NULL
) {

  # if cs not specified then try to get current.chob()
  if(is.null(cs)) try(cs <- current.chob())

  if(!inherits(cs, "replot")) {
    stop("cs should be chart_Series environment", call. = FALSE)
  }

  # not ideal but explicitly plot
  #  so the chart_Series object is built
  #  and all fields available for JavaScript
  #  so we can attempt to replicate exactly
  plot(cs)

  # add date information into the environment
  #   converted to milliseconds for JavaScript
  cs$Env$date <- as.numeric(index(cs$Env$xdata)) * 1000 * 24 * 60 * 60

  # forward options using x
  x = jsonlite::toJSON(
    as.list(cs$Env),
    dataframe = "rows",
    force = TRUE,
    auto_unbox = TRUE
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'chartseries',
    x,
    width = width,
    height = height,
    package = 'rd3fc',
    elementId = elementId
  )
}

#' Shiny bindings for chartseries
#'
#' Output and render functions for using chartseries within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a chartseries
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name chartseries-shiny
#'
#' @export
chartseriesOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'chartseries', width, height, package = 'rd3fc')
}

#' @rdname chartseries-shiny
#' @export
renderChartseries <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, chartseriesOutput, env, quoted = TRUE)
}


#' @import htmltools
#' @keywords internal
chartseries_html <- function(id, style, class, ...){
  tagList(
    tags$div(
      id = id, class = class, style = style
    ),
    d3r::d3_dep_v4(),
    html_dependency_d3fc()
  )
}
