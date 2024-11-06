// NOTE: This file must have ts extension and not tsx! It contains some
// configuration variables which are shared between and imported by both tsx
// files from the bundle and ts CLI scripts from the bin folder.


// These are computed at runtime and will not be saved on the server
export const ReadOnlyPaths = [
    "exporting",
    "tooltip",
    "chart.type",
    "series.[].data",
    "series.[].color",
    "series.[].dataSorting",
    "chart.options3d.depth",
    "yAxis.allowDecimals",
    "yAxis.labels.format",
    "plotOptions.series.events",
    "plotOptions.series.dataSorting",
    "plotOptions.series.states.hover.opacity",
    "plotOptions.pie.dataLabels.formatter",
    "plotOptions.pie.dataLabels.useHTML",
    "plotOptions.areasplinerange.linkedTo",
    "plotOptions.areasplinerange.marker.enabled",
    "plotOptions.areasplinerange.marker.states.hover.enabled",
    "plotOptions.areasplinerange.states.hover.enabled",
    "plotOptions.errorbar.linkedTo",
    "plotOptions.line.dataSorting",
    "tooltip",
    "xAxis.type",
    "xAxis.crosshair",
    "lang",
    "noData"
];
