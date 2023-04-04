
let colors = ["blue" , "orange"];

var margin = {
    top: 80,
    right: 20,
    bottom: 30,
    left: 60
  },
  width = 920 - margin.left - margin.right,
  height = 630 - margin.top - margin.bottom;

var tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);


let svgcontainer = d3.select(".svg-wrap")
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'graph')
  .style("background-color", "white")
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
.then(data => {
    let times = data.map(t => {
        var parsedTime = t.Time.split(':');
        t.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
        return t.Time;
    })
    let years = getData(data, "Year" )
    let scaleX = createXAxis(years);
    let scaleY = createYAxis(times);

    createPlots(data,scaleX,scaleY);
})

function getData(data, key){
    return data.map(item => item[key]);
}

function createXAxis(years){
    var scaleX = d3
      .scaleLinear()
      .domain([d3.min(years)-1, d3.max(years)+1])
      .range([0, width]);

    let xAxis = d3.axisBottom(scaleX).tickFormat(d3.format('d'));

    svgcontainer.append('g')
    .call(xAxis)
    .attr("id", "x-axis")
    .attr('transform', `translate(0,${height})`); 
    return scaleX;
}

function createYAxis(times){
    var scaleY = d3
      .scaleTime()
      .domain([d3.min(times), d3.max(times)])
      .range([0, height]);

    let yAxis = d3.axisLeft(scaleY).tickFormat(d3.timeFormat('%M:%S'));

    svgcontainer.append('g')
    .call(yAxis)
    .attr("id", "y-axis")
    return scaleY;
}

function createPlots(data, scaleX, scaleY){
    svgcontainer.selectAll('.dot')
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) =>  scaleX(d.Year))
    .attr("cy", (d) =>  scaleY(d.Time ))
    .attr("r", 6)
    .attr("data-xvalue", d => d.Year )
    .attr("data-yvalue", d => d.Time.toISOString())
    .style("fill", (d) =>{
        if(d.Doping != "")return "blue";
        else return "orange";
    })
    .on('mouseover', (event, d)=>{
        tooltip.style("opacity", 0.9)
        tooltip
          .html(
            d.Name +
              ': ' +
              d.Nationality +
              '<br/>' +
              'Year: ' +
              d.Year +
              ', Time: ' +
              d3.timeFormat('%M:%S')(d.Time) +
              (d.Doping ? '<br/><br/>' + d.Doping : '')
          )
          .attr("data-year", d.Year)
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
    }).on('mouseout', function () {
        tooltip.style("opacity", "0");
    });

    createLegend();
}

function createLegend(){
    var legendContainer = svgcontainer.append('g').attr('id', 'legend');

    let legend = legendContainer
      .selectAll('#legend')
      .data(colors)
      .enter()
      .append('g')
      .attr('class', 'legend-label')
      .attr('transform', function (d, i) {
        return 'translate(0,' + (height / 2 - i * 20) + ')';
      });

      legend
      .append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', (d) => d);

      legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .style("fill", (d) => d)
      .style("font-size", 12)
      .text(function (d) {
        if (d === "blue") {
          return 'Doping allegations';
        } else {
          return 'No doping allegations';
        }
      });
}