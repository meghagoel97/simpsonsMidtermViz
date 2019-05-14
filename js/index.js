'use strict';


let data = 'no data';
let svgContainer = '';

let margin = {
    top: 20, 
    right: 20,
    bottom: 70, 
    left: 70
}
let width = 1000- margin.left - margin.right;
let height = 500-margin.top - margin.bottom;

window.onload = function() { 


    svgContainer = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    d3.csv("./data/finalData.csv")
        .then((csvData) => {
            console.log(csvData);
            data = csvData;
            makeGraph();
        });
}

function makeGraph() { 

    let avg_viewers_data = data.map((row) => parseFloat(row["Avg. Viewers (mil)"]));
    console.log(avg_viewers_data);
    let year_data = data.map((row) => parseFloat(row["Full Year"]));
    console.log(year_data);

    let axesLimits = findMinMax(year_data, avg_viewers_data);
    console.log(axesLimits);

    let mapFunctions = drawAxes(axesLimits, "Full Year", "Avg. Viewers (mil)", svgContainer, {min: 50, max: 800}, {min: 50, max: 450});

    let values = {
        avg : avg_viewers_data,
        year : year_data
    }
    plotData(mapFunctions, values);

    makeLabels(svgContainer);


    
}

function plotData(map, values) {

    console.log(values);
    let xMap = map.x;
    let yMap = map.y;

    var barPadding = 2; 
    var barWidth = (width/values.avg.length) - (2 * barPadding);
    console.log(barWidth);

    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svgContainer.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
            .attr('x', (s) => map.xScale(s['Full Year']))
            .attr('y', (s) => map.yScale(s['Avg. Viewers (mil)']))
            .attr('height', (s) => 450 - map.yScale(s['Avg. Viewers (mil)']))
            .attr('width', 20)
            .attr('fill', '#6aade4')
            .on("mouseover", function(d) {
                d3.select(this).style('stroke', 'black');
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.html('<h4>' + 'Season #' + d['Full Year'] +
                    '</h4>' + '<b>' + 'Year: ' + '</b>' + d['Full Year']
                    + "</br>" + '<b>' + 'Episodes: '  + '</b>' + d['Episodes']
                    + '</br>' + '<b>'+ 'Avg. Viewers (mil): '   + '</b>'+ d['Avg. Viewers (mil)']
                    + '</br>' + '</br>' + '<b>' + 'Most Watched Episode: '  + '</b>' + d["Most watched episode"] + '</br>'  + '<b>' +  'Viewers (mil): '  + '</b>'+ d["Viewers (mil)"] )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px" );
            })
            .on("mouseout", function(d) {
                d3.select(this).style('stroke', 'none');
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    svgContainer.selectAll()
        .data(data)
        .enter()
        .append('text')
        .style('font', '10px sans-serif')
        .attr('class', 'label')
        .attr('x', (s) => map.xScale(s['Full Year']))
        .attr('y', (s) => map.yScale(s['Avg. Viewers (mil)']))
        .attr("dy", "-.5em")
        .text(function(d) { return d['Avg. Viewers (mil)']; });

    makeAverageLine(values, map);

}

function makeAverageLine(values, map) {

    let avgData = values.avg;
    console.log(avgData);

    const avgViews = (
        avgData.reduce((total, d) => total + d, 0) / data.length
      ).toFixed(1);
    console.log(avgViews);

    svgContainer
        .append('line')
        .attr('x1', 50)
        .attr('x2', 800)
        .attr('y1', map.yScale(avgViews))
        .attr('y2', map.yScale(avgViews))
        .attr('stroke', 'white')
        .attr('stroke-width', 4)
        .style('cursor', 'pointer')
        .on('mouseover', function(d) {
            div.transition()
                .duration(200)
                .style('opacity', 1);
            div  
                .html(`Average = ${avgViews}`)
                .style('left', d3.event.pageX + 20 + 'px')
                .style('top', d3.event.pageY + 20 + 'px');

        })
        .on('mouseout', (d) => {
            div.transition()
                .style('opacity', 0)
                .style('display', 'none');
        });


    svgContainer
        .append('line')
        .attr('x1', 50)
        .attr('x2', 800)
        .attr('y1', map.yScale(avgViews))
        .attr('y2', map.yScale(avgViews))
        .attr('stroke', 'gray')
        .attr('stroke-dasharray', '5,3');

    svgContainer
        .append('text')
        .style('font', '10px sans-serif')
        .attr('class', 'avgLabel')
        .attr('x', 55)
        .attr('y', map.yScale(avgViews))
        .attr("dy", "-.5em")
        .text(avgViews);

}


function makeLabels(svg){ 

  svg.append('text')
    .attr('x', 400)
    .attr('y', 490)
    .style('font-size', '10pt')
    .text('Year');

  svg.append('text')
    .attr('transform', 'translate(15, 300)rotate(-90)')
    .style('font-size', '10pt')
    .text('Avg. Viewers (in millions)');
}



function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    
    let xValue = function(d) { return +d[x]; }
    

    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 1, limits.xMax + 1]) 
      .range([rangeX.min, rangeX.max]);
      console.log(xScale);

    let xMap = function(d) { return xScale(xValue(d)); };

    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    let yValue = function(d) { return +d[y]}

    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 2, limits.yMin - 2 ])
      .range([rangeY.min, rangeY.max]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }


function findMinMax(x, y) {
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    let yMin = d3.min(y);
    let yMax= d3.max(y);

    return {
        xMin : xMin,
        xMax : xMax,
        yMin : yMin,
        yMax : yMax
    }
}



