//   // Prep the tooltip bits, initial display is hidden
// var div = d3.select("body").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);
//             
// function handleMouseOver (event, d) {
//        d3.select(this).attr("fill", "orange");
//        tooltip.style("visibility", "visible");
// };
//   
// function handleMouseMove (event, d) {
//       var xPosition = d3.mouse(this)[0] - 5;
//       var yPosition = d3.mouse(this)[1] - 5;
//       //console.log(xPosition,yPosition)
//       tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
//       tooltip.select("text").text('Species: '+species[d]);
// };
// function handleMouseOut (event, d) {
//        d3.select(this).attr("fill", "blue");
//        tooltip.style("visibility", "hidden");
// };
  // https://gist.github.com/gawain91/9fedf9a94d615a4f540fc2ff5792c952
var initStackedBarChart = {
    draw: function(config) {
        me = this,
        domEle = config.element,
        stackKey = config.key,
        data = config.data,
        margin = {top: 20, right: 20, bottom: 25, left: 150},
        width = 1200 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom,
        xScale = d3.scaleLinear().rangeRound([0, width]),
        yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
        color = d3.scaleOrdinal(config.colors) //d3.scaleOrdinal(d3.schemeCategory20),
        xAxis = d3.axisBottom(xScale),
        yAxis =  d3.axisLeft(yScale),
        xlabel = 'Major Species-Level Abundances for Each Oral Site'
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
            yScale.domain(plot_order)
            xScale.domain([0, 100]).nice('%');

        var layer = svg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .attr("id", function(d,i) {   // needed to find species and color for ttip
                   //console.log(species[i])
                   return species[i]+'-|-'+color(i)
               })
            
            .style("fill", function(d, i) { return color(i); })
    
          layer.selectAll("rect")
              .data(function(d) { return d; })
              .enter().append("rect")
                .attr("y", function(d) { return yScale(d.data.site); })
                .attr("x", function(d) { return xScale(d[0]); })
                .attr("height", yScale.bandwidth())
                .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) })

                .on("mouseover", function() { tooltip.style("display", null); })
                .on("mouseout", function() { tooltip.style("display", "none"); })
                .on("mousemove", function(d,i) {
                  var xPosition = d3.mouse(this)[0] - 5;
                  var yPosition = d3.mouse(this)[1] - 5;
                  var id_node = this.parentNode.id.split('-|-')
                  var html = '<div id="outer_div"><table><tr><td><span style="background:'+id_node[1]+';border:1px solid grey;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Species:</td><td><i>'+id_node[0]+'</i></td></tr>'
                  html += '<tr><td>Oral Site:</td><td>'+ab_names[site_order[i]]+'</td></tr>'
                  html += '<tr><td>Abundance:</td><td>'+sp_per_site[site_order[i]][id_node[0]]+'%</td></tr></table></div>'
                  
                  tooltip
                              .style("left", d3.mouse(this)[0] + 155 + "px")
                              .style("top",  d3.mouse(this)[1] + 268 + "px")
                              .style("display", "inline-block")
                              .style("margin",  "10px")
                              .style("padding",  "10px")
                              .style("width","auto")
                              .style("text-align","left")
                              //.style("width",species[i].length +"px")
                              .html(html);
                });
              
        var tooltip = d3.select("body").append("div").attr("class", "toolTip");             

        svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height+5) + ")")
        .call(xAxis);

        svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxis); 
        
     
        // text label for the x axis
        svg.append("text")             
          .attr("transform",
                "translate(" + (-80) + " ," + 
                               ( margin.top - 25) + ")")
          .style("text-anchor", "left")
          .style("font-size", "small")
          .text(xlabel);                          
    }  // end of draw
}


