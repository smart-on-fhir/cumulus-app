export const SupportedChartTypes = {
    pie         : "Pie Chart",
    pie3d       : "Pie Chart 3D",
    donut       : "Donut Chart",
    donut3d     : "Donut Chart 3D",
    
    spline      : "Line Chart",
    areaspline  : "Area Chart",
    
    column      : "Column Chart",
    column3d    : "Column Chart 3D",
    
    bar         : "Bar Chart",
    bar3d       : "Bar Chart 3D"
}

/**
 * Charts that can only have one dimension plus count. They DO NOT support
 * grouping!
 */
export const SimpleCharts = [ "pie", "pie3d", "donut", "donut3d" ]