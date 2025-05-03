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
        species = config.species,
        data = config.data,
        colors = config.colors,
        //console.log('data',data),
        //console.log('c1',config.colors)
        margin = {top: 20, right: 20, bottom: 25, left: 50},
        width_large = 1400 - margin.left - margin.right,
        width_small = 600 - margin.left - margin.right,
        //width = 600 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom,
        xScale = d3.scaleLinear().rangeRound([0, width_large]),
        yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
        //config.colors.map(el => el.color)
        color = d3.scaleOrdinal(colors) //d3.scaleOrdinal(d3.schemeCategory20),
        //color = d3.scaleOrdinal(config.colors.map(el => el.color))
        
        xAxis = d3.axisBottom(xScale),
        yAxis =  d3.axisLeft(yScale),
        xlabel = 'Major Species-Level Abundances (%) for Each Body Site'
        svg = d3.select("#"+domEle).append("svg")
                //.attr("width", width_large + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                //.style("width", width_large + 'px')
                .style("width", '80vw')
                
                .append("g")
                //working
                //.attr("class", "x-axis")  // Add a class for styling
                //.attr("id", "xAxis")  // Or an ID
                
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var stack = d3.stack()
            .keys(species)   // species
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
                   //console.log('species ',d,'i',i)
                   return species[i]+'-|-'+color(i)
               })
            
            .style("fill", function(d, i) { 
                //console.log('cl',d);
                
                return colors[i] 
            })
    
          layer.selectAll("rect")
              .data(function(d) { return d; })
              .enter().append("rect")
                .attr("y", function(d) { return yScale(d.data.site); })
                .attr("x", function(d) { return xScale(d[0]); })
                .attr("height", yScale.bandwidth())
                .attr("width", function(d) {  return xScale(d[1]) - xScale(d[0]) })

                .on("mouseover", function(event,d) { tooltip.style("display", null); })
                .on("mouseout", function() { tooltip.style("display", "none"); })
                //.on("mousemove", function(d,i) {
                .on("mousemove", function(event,d) {
                  //var xPosition = d3.mouse(this)[0] - 5;
                  //var yPosition = d3.mouse(this)[1] - 5;
                  //console.log('d.data',d.data);
                  var id_node = this.parentNode.id.split('-|-')
                  var site = d.data.site
                  
                  var abund = d.data[id_node[0]]
                  
                  
                  //console.log('d.data',d.data)
                  var html = '<div id="outer_div"><table><tr><td><span style="background:'+id_node[1]+';border:1px solid grey;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Species:</td><td><i>'+id_node[0]+'</i></td></tr>'
                  //var html = '<div id="outer_div"><table><tr><td><span style="background-color:'+color+';border:1px solid grey;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Species:</td><td><i>'+id_node[0]+'</i></td></tr>'
                  
                  // html += '<tr><td>Site:</td><td>'+ab_names[site_order[i]]+'</td></tr>'
                  html += '<tr><td>Site:</td><td>'+ab_names[site]+'</td></tr>'
                  //html += '<tr><td>Site:</td><td>'+site+'</td></tr>'
                  //html += '<tr><td>Color:</td><td>'+color+'</td></tr>'
                  //console.log('sp_per_site',sp_per_site) 
                  // site_order[i] == SUBP or AKE ...
                  //
                  //console.log('site_order[i]',i,site_order[i])
                  //html += '<tr><td>Abundance:</td><td>'+sp_per_site[site_order[i]][id_node[0]]+'%</td></tr></table></div>'
                  html += '<tr><td>Abundance:</td><td>'+abund+'%</td></tr></table></div>'
                  //var x = d3.event.pageX - document.getElementById('bar-chart').getBoundingClientRect().x + 10
                  //var y = d3.event.pageY - document.getElementById('bar-chart').getBoundingClientRect().y + 10
                  var matrix = this.getScreenCTM().translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
                  var pos = d3.select(this).node().getBoundingClientRect();
                  //console.log(matrix.e, matrix.f)
                  tooltip
                         //d3.mouse(container)::
                         //Returns the x and y coordinates of the current event relative to the specified container.     
                          //What you want is d3.event.pageX which gives you:
                          //An integer value, in pixels, indicating the X coordinate at which the mouse pointer was 
                          //located when the event occurred. This value is relative to the left edge of the entire document, 
                          //regardless of the current horizontal scrolling offset of the document.    
                              //console.log(d3.mouse(svg.node())[0],d3.mouse(this)[0])
                             // .style("left", d3.mouse(this)[0] + 155 + "px")  // X side-2-side home mbook
                             //  .style("top",  d3.mouse(this)[1] + 268 + "px")  // Y up-down home macbook
                        .style('top', event.pageY + 5 + 'px')
                        .style('left', event.pageX + 'px')

                        //.style("left", pos['x'] + 10 + "px")
                        //.style("top",  ( window.pageYOffset+pos['y'] + 10) + "px")


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
                "translate(" + (-10) + " ," + 
                               ( margin.top - 25) + ")")
          .style("text-anchor", "left")
          .style("font-size", "small")
          .text(xlabel);                          
    }  // end of draw
    
    
}
// function resize() {
//         console.log('in resize')
//         const containerWidth = d3.select('#bar-chart').node().offsetWidth; // Get container width
//         d3.select('svg')
//             .attr('width', containerWidth)
//             .attr('height', containerWidth / 1.6); // Example aspect ratio
// 
//         // Update D3 elements within the SVG based on the new width
//         d3.selectAll('.bar')
//             .attr('width', containerWidth / 10); // Example bar width
//     }
// d3.select(window).on('resize', resize); // Call resize on window resize
// resize()

