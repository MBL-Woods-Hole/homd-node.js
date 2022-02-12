//   // Prep the tooltip bits, initial display is hidden
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
var tooltip = d3.select("#bar-chart")
    .append("div")
    .style("position", "absolute")
    .style("top", "200px")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "0px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "2px 2px 20px")
    .style("opacity", "0.9")
    .attr("id", "tooltip");
tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-weight", "bold");
			
function handleMouseOver (event, d) {
       d3.select(this).attr("fill", "orange");
       tooltip.style("visibility", "visible");
  };
  
  function handleMouseMove (event, d) {
      var xPosition = d3.mouse(this)[0] - 5;
	  var yPosition = d3.mouse(this)[1] - 5;
	  tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
	  tooltip.select("text").text('Species: '+species[d]);
  };

  function handleMouseOut (event, d) {
       d3.select(this).attr("fill", "blue");
       tooltip.style("visibility", "hidden");
  };
  // https://gist.github.com/gawain91/9fedf9a94d615a4f540fc2ff5792c952
var initStackedBarChart = {
    draw: function(config) {
        me = this,
        domEle = config.element,
        stackKey = config.key,
        data = config.data,
        margin = {top: 20, right: 20, bottom: 30, left: 150},
        width = 1100 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom,
        xScale = d3.scaleLinear().rangeRound([0, width]),
        yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
        color = d3.scaleOrdinal(config.colors) //d3.scaleOrdinal(d3.schemeCategory20),
        xAxis = d3.axisBottom(xScale),
        yAxis =  d3.axisLeft(yScale),
        svg = d3.select("#"+domEle).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		
        var stack = d3.stack()
            .keys(stackKey)   // species
            /*.order(d3.stackOrder)*/
            .offset(d3.stackOffsetNone);
    
        var layers= stack(data);
            yScale.domain(site_order.reverse())
            // yScale.domain(data.map(function(d) { 
//          console.log(d.site)
//          return d.site; }));
            xScale.domain([0, 100]).nice('%');

        var layer = svg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) { return color(i); })
            .on("mouseover", handleMouseOver)
       .on("mousemove", handleMouseMove)
       .on("mouseout", handleMouseOut)
            
            // .on("mouseover", function() { tooltip.style("display", "block"); })
//             .on("mouseout", function() { tooltip.style("display", "none"); })
//             .on("mousemove", function(d,i) {
//               console.log(species[i]);
//               var xPosition = d3.mouse(this)[0] - 5;
//               var yPosition = d3.mouse(this)[1] - 5;
//               tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
//               tooltip.select("text").text(species[i]);
//             });
    
    
          layer.selectAll("rect")
              .data(function(d) { 
              //console.log(d)
              return d; })
            .enter().append("rect")
              .attr("y", function(d) { return yScale(d.data.site); })
              .attr("x", function(d) { return xScale(d[0]); })
              .attr("height", yScale.bandwidth())
              .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) })
             

            svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height+5) + ")")
            .call(xAxis);

            svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(0,0)")
            .call(yAxis);                           
    }
}


