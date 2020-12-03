// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 60,
    bottom: 80,
    left: 100
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// ===================================================================
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

//=====================================================================
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[chosenXAxis]))
        .range([0, chartWidth])
        .nice();

    return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])])
        .range([chartHeight, 0])
        .nice();

    return yLinearScale;

}

// =================================================================
// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// =================================================================
// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));


    return circlesGroup;
}

function renderAbbrX(abbrGroup, newXScale, chosenXaxis) {

    abbrGroup.transition()
        .duration(1000)
        // .attr("cx", d => newXScale(d[chosenXAxis]));
        .attr("x", d => newXScale(d[chosenXAxis]));

    return abbrGroup;
}
function renderCirclesY(circlesGroup, newYScale, chosenYaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}
function renderAbbrY(abbrGroup, newYScale, chosenYaxis) {

    abbrGroup.transition()
        .duration(1000)
        // .attr("cy", d => newYScale(d[chosenYAxis]));
        .attr("y", d => newYScale(d[chosenYAxis]));

    return abbrGroup;
}



// ========================================================================
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty:";
    } else if (chosenXAxis === "age") {
        var xLabel = "Age:"
    }
    else {
        var xLabel = "Household Income:";
    }

    if (chosenYAxis === "obesity") {
        var yLabel = "Obesity:"
    } else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:"
    } else {
        var yLabel = "Lacks Healthcare:"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        // .offset([-2, 0])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);
    abbrGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    abbrGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return [circlesGroup, abbrGroup];
}


// ====================================================================
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (data) {

    // parse data
    data.forEach(function (d) {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare;
    });
    console.log(data);
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5")
        .classed("stateCircle", true);

    // append initial state abbreviations
    var abbrGroup = chartGroup.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("fill", "black")
        .attr("dy", "0.35em")
        .attr("font-weight", 700)
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .text(d => d.abbr)
        .classed("stateText", true);

    // Create group for  2 x- axis labels
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");


    // Create group for  2 x- axis labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // append y axis labels
    var obesityLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (chartHeight / 2))
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (chartHeight / 2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 70)
        .attr("x", 0 - (chartHeight / 2))
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup)[0];
    var abbrGroup =  updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup)[1];

    // x axis labels event listener
    labelsGroupX.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
                abbrGroup = renderAbbrX(abbrGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup)[0];
                abbrGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup)[1];

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });


    // y axis labels event listener
    labelsGroupY.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
                abbrGroup = renderAbbrY(abbrGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, abbrGroup)[0];
                abbrGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup, abbrGroup)[1];

                // changes classes to change bold text
                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});