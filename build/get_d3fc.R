# get current version from Github
get_d3fc_latest <- function(){
  gsub(
    x=github::get.latest.release("d3fc", "d3fc")$content$tag_name,
    pattern="v",
    replacement=""
  )
}

# get newest d3fc
download.file("https://unpkg.com/d3fc/build/d3fc.min.js", "./inst/htmlwidgets/d3fc/build/d3fc.min.js")

# write function with newest version
#  for use when creating dependencies
cat(
  sprintf(
    "#'@keywords internal\nd3fc_version <- function(){'%s'}\n",
    get_d3fc_latest()
  ),
  file = "./R/meta.R"
)
