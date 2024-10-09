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
import drilldown        from "highcharts/modules/drilldown"
// import cylinder      from "highcharts/modules/cylinder"
// import funnel        from "highcharts/modules/funnel"
// import heatmap       from "highcharts/modules/heatmap"
// import treemap       from "highcharts/modules/treemap"
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
drilldown(Highcharts)
// cylinder(Highcharts)
// treemap(Highcharts)
// funnel(Highcharts)
// heatmap(Highcharts)
// venn(Highcharts)

// Fix for zombie tooltip containers
// See https://github.com/highcharts/highcharts/issues/18490
Highcharts.wrap(Highcharts.Tooltip.prototype, 'hide', function(p, delay) {
    // @ts-ignore
    const tooltip = this;
    if (tooltip.options.destroyWhenHiding) {
        tooltip.destroy()
    } else {
        p(delay)
    }
});

export * from "highcharts"
export default Highcharts