#' Dependencies for d3fc
#'
#' @param offline \code{logical} to use local file dependencies.  If \code{FALSE},
#'          then the dependencies use the unpkg.com cdn as its \code{src}.
#'
#' @return \code{\link[htmltools]{htmlDependency}}
#' @importFrom htmltools htmlDependency
#' @export
html_dependency_d3fc <- function(offline=TRUE){
  hd <- htmltools::htmlDependency(
    name = "d3fc",
    version = d3fc_version(),
    src = system.file("htmlwidgets/d3fc/build",package="rd3fc"),
    script = c("d3fc.min.js")
  )

  if(!offline) {
    hd$src <- list(href="//unpkg.com/d3fc/build/d3fc.min.js")
  }

  hd
}
