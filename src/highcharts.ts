import Highcharts       from "highcharts"
import highchartsMore   from "highcharts/highcharts-more"
import highcharts3d     from "highcharts/highcharts-3d"
import exporting        from "highcharts/modules/exporting"
import offlineExporting from "highcharts/modules/offline-exporting"
import exportData       from "highcharts/modules/export-data"
import noDataToDisplay  from "highcharts/modules/no-data-to-display"
import patternFill      from "highcharts/modules/pattern-fill"
import annotations      from "highcharts/modules/annotations"
import accessibility    from "highcharts/modules/accessibility"
// import venn          from "highcharts/modules/venn"

// Initialize modules
highchartsMore(Highcharts)
exporting(Highcharts)
highcharts3d(Highcharts)
offlineExporting(Highcharts)
exportData(Highcharts)
noDataToDisplay(Highcharts)
patternFill(Highcharts)
annotations(Highcharts)
accessibility(Highcharts)
// venn(Highcharts)

export * from "highcharts"
export default Highcharts