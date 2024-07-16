

    
// HMP_Log_RefSeq V1V3
//LOGLOGLOG
// https://d3-graph-gallery.com/graph/lollipop_basic.html

  if(Object.keys(hmprefseqv1v3).length == 0){
     document.getElementById("plot_log_hmp_refseqv1v3_here").innerHTML = "<span class='nodata'>No Data</span>"
  }else{
    // append the svg object to the body of the page
    if(rank == 'species'){
       ///////////////////////////////////////////////////////////////////
       data = hmprefseqv1v3
       //console.log('data_ary')
       data_ary = hmprefseqv1v3.filter( (x) => { return x.avg > 0})
       ND_ary   = hmprefseqv1v3.filter( (x) => { return x.avg == 0})
       data = data_ary
       //console.log(ND_ary)
       var svg = d3.select("#plot_log_hmp_refseqv1v3_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
    var mouseover = function(e,d){ 
        var plotName = 'HMP 16S RefSeq V1-V3';//d3.select(this.parentNode).datum().key;
        var siteName = siteLongNames[d.site]
        var plotValue = d.avg;
        var prev = d.prev;
        tooltips.hmprefseqv1v3_log.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors3[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Abundance: " + plotValue+" % "+ "<br>" + "Prevalence: " + prev+" %")
         //console.log(e.x,e.y)
        return tooltips.hmprefseqv1v3_log.style("visibility", "visible");
     }
  
    var mousemove = function(e,d) {
        return tooltips.hmprefseqv1v3_log.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")

  }
  var mouseleave = function(d) {
    return tooltips.hmprefseqv1v3_log.style("visibility", "hidden");
  }
var abund_scale_x = d3.scaleBand()
  .range([ 0, (width/2)-gap ])
  .domain(hmprefseqv1v3.map(function(d) { return d.site; }))
  .padding(1);
var nd_axis = d3.scaleBand()
  .range([ 0, (width/2)-gap ])
  .domain(hmprefseqv1v3.map(function(d) { return d.site; }))
  .padding(1);

var prev_scale_x = d3.scaleBand()
  .range([ (width/2)+gap, width])
  .domain(hmprefseqv1v3.map(function(d) { return d.site; }))
  .padding(1);
  
  //let ndaxis = d3.axisBottom(nd)
//var scaley = d3.scaleLog()
var abund_scale_y = d3.scaleLog()
  //.domain([d3.min(data, function(d) { return +d.avg; }), d3.max(data, function(d) { return +d.avg; })])
  //.base(10)
  .range([ height, 0.0 ])
  .domain([1e-3, 1e2])
  
var prev_scale_y = d3.scaleLinear()
  .range([ height+15, 0.0 ])
  .domain([0, 100])

  
  //.range([ 20, height - 20])
  
  // Add scales to axis
var abund_y_axis = d3.axisLeft()
        .scale(abund_scale_y)
        .tickValues([0.001, 0.01, 0.1, 1, 10,100])
abund_y_axis.ticks(10, ",f")

var prev_y_axis = d3.axisLeft()
        .scale(prev_scale_y)
        
svg.append("g")
.attr("transform", "translate("+((width/2)+gap)+",0)")
 .call(prev_y_axis)

svg.append("g")
  .call(abund_y_axis)

// https://gist.github.com/kbroman/ded6a0784706a109c3a5
// svg.append("text")
//     .attr("text-anchor", "middle")
//     .attr("y", -height - 10)
//     .attr("x", width-180 )
//     .attr("transform", "rotate(90)")
//     .text("Prevalence (%) (open circles)");
  
svg.append("text")
    .attr("text-anchor", "start")
    .attr("y", -45)
    .attr("x", -height/2-60 )
    .attr("transform", "rotate(-90)")
    .text("Log % Abundance");
svg.append("text")
    .attr("text-anchor", "start")
    .attr("y", (width/2)-10)
    .attr("x", -height/2 -60 )
    .attr("transform", "rotate(-90)")
    .text("% Prevalence");
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", height- (7*height/10))
    .attr("x", -5 )
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style('fill', 'darkOrange')
    //.attr("transform", "rotate(-90)")
    .text("High");
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", height- (5*height/10))
    .attr("x", -5 )
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style('fill', 'darkOrange')
    //.attr("transform", "rotate(-90)")
    .text("Med");
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", height- (3*height/10))
    .attr("x", -5 )
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style('fill', 'darkOrange')
    //.attr("transform", "rotate(-90)")
    .text("Low");
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", height- (1*height/10))
    .attr("x", -5 )
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style('fill', 'darkOrange')
    //.attr("transform", "rotate(-90)")
    .text("Scarce");
    
svg.append("text")
    .attr("text-anchor", "end")
    .attr("y", height+20)
    .attr("x", -5 )
    .style("font-size", "11px")
    //.style('fill', 'black')
    //.attr("transform", "rotate(-90)")
    .text("ND");
    
svg.append("g")
  .attr("transform", "translate(0," + (height) + ")")
  .call(d3.axisBottom(abund_scale_x))
  .selectAll("text")
    .attr("transform", "translate(-5,20)rotate(-45)")
    .style("text-anchor", "end")

svg.append("g")
  .attr("transform", "translate(0," + (height+15) + ")")
  .call(d3.axisBottom(prev_scale_x))
  .selectAll("text")
    .attr("transform", "translate(-5,5)rotate(-45)")
    .style("text-anchor", "end")
    
svg.append("g")
  .attr("transform", "translate(0," + (height+ 15) + ")")
  .call(d3.axisBottom(nd_axis).tickValues([]))
  
    
svg.append("text")             
      .attr("transform",
            "translate(" + ((width/4 - 40)) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Body Site");
svg.append("text")             
      .attr("transform",
            "translate(" + ((width - 220)) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Body Site");
// Lines Abund- lollipop
svg.selectAll("myline_abund")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", function(d) { return abund_scale_x(d.site); })
    .attr("y1", height+20)
    .attr("x2", function(d) { return abund_scale_x(d.site); })
    .attr("y2", function(d) { return abund_scale_y(d.avg); })
    .attr("stroke", "grey")

// Circles Abund
svg.selectAll("mycircle_abund")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return abund_scale_x(d.site); })
    .attr("cy", function(d) { return abund_scale_y(d.avg);  })
    .attr("r", "7")
     .attr("fill", function(d) {return site_colors3[d.site];})
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout",  mouseleave)

svg.selectAll("mycircle_nd")
  .data(ND_ary)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return nd_axis(d.site); })
    .attr("cy", height +15  )
    //.attr("cy", 0 )
    .attr("r", "7")
     .attr("fill", function(d) {return site_colors3[d.site];})
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout",  mouseleave)
    
// Lines Prev- lollipop
svg.selectAll("myline_prev")
  .data(hmprefseqv1v3)
  .enter()
  .append("line")
    .attr("x1", function(d) { return prev_scale_x(d.site); })
    .attr("y1", height+20)
    .attr("x2", function(d) { return prev_scale_x(d.site); })
    .attr("y2", function(d) { return prev_scale_y(d.prev); })
    .attr("stroke", "grey")

// Circles Prev
svg.selectAll("mycircle_prev")
  .data(hmprefseqv1v3)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return prev_scale_x(d.site); })
    .attr("cy", function(d) { return prev_scale_y(d.prev);  })
    .attr("r", "7")
     .attr("fill", function(d) {return site_colors3[d.site];})
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout",  mouseleave)
    
svg.selectAll("myline_grid1")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", 0)
    .attr("y1", height- (3*height/5))
    .attr("x2", width/2-gap)
    .attr("y2", height- (3*height/5))
    .attr("stroke", "brown")
    //.attr("stroke-opacity", '0.5');
    .attr('opacity', 0.02)
svg.selectAll("myline_grid2")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", 0)
    .attr("y1", height- (2*height/5))
    .attr("x2", width/2-gap)
    .attr("y2", height- (2*height/5))
    .attr("stroke", "brown")
    //.attr("stroke-opacity", '0.5');
    .attr('opacity', 0.02)
svg.selectAll("myline_grid3")
  .data(data)
  .enter()
  .append("line")
    .attr("x1", 0)
    .attr("y1", height- (1*height/5))
    .attr("x2", width/2-gap)
    .attr("y2", height- (1*height/5))
    .attr("stroke", "brown")
    //.attr("stroke-opacity", '0.5');
    .attr('opacity', 0.02)

  

  

       
       //////////////////////////////////////////////////////////////////
  }else{  // NOT species level
    var svg = d3.select("#plot_log_hmp_refseqv1v3_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
    var mouseover = function(e,d){ 
        var plotName = 'HMP 16S RefSeq V1-V3';//d3.select(this.parentNode).datum().key;
        var siteName = siteLongNames[d.site]
        var plotValue = d.avg;
        var prev = d.prev;
        tooltips.hmprefseqv1v3_log.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors3[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Abundance: " + plotValue+" % "+ "<br>" + "Prevalence: " + prev+" %")
         //console.log(e.x,e.y)
        return tooltips.hmprefseqv1v3_log.style("visibility", "visible");
     }
  
    var mousemove = function(e,d) {
        return tooltips.hmprefseqv1v3_log.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")

  }
  var mouseleave = function(d) {
    return tooltips.hmprefseqv1v3_log.style("visibility", "hidden");
  }
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(hmprefseqv1v3.map(function(d) { return d.site; }))
  .padding(1);
//let ndaxis = d3.axisBottom(nd)
var y = d3.scaleSymlog()
  //.domain([d3.min(data, function(d) { return +d.avg; }), d3.max(data, function(d) { return +d.avg; })])
  .domain([0, d3.max(hmprefseqv1v3, function(d) { return +d.avg; })])
  //.constant()
  .range([ height, 0.0 ]);

svg.append("g")
  .call(d3.axisLeft(y).scale(y));

svg.append("text")
    .attr("text-anchor", "middle")
    .attr("y", -45)
    .attr("x", -150 )
    .attr("transform", "rotate(-90)")
    .text("Log % Abundance");

svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
    
svg.append("text")             
      .attr("transform",
            "translate(" + ((width/2)-50) + " ," + 
                           (height + margin.top + 10) + ")")
      .style("text-anchor", "middle")
      .text("Body Site");
// Lines
svg.selectAll("myline")
  .data(hmprefseqv1v3)
  .enter()
  .append("line")
    .attr("x1", function(d) { return x(d.site); })
    .attr("x2", function(d) { return x(d.site); })
    .attr("y1", function(d) { return y(d.avg);  })
    .attr("y2", y(0))
    .attr("stroke", "grey")

// Circles
svg.selectAll("mycircle")
  .data(hmprefseqv1v3)
  .enter()
  .append("circle")
    .attr("cx", function(d) { return x(d.site); })
    .attr("cy", function(d) { return y(d.avg); })
    .attr("r", "7")
     .attr("fill", function(d) {return site_colors3[d.site];})
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout",  mouseleave)
  

  } // end else LOG
  } // end else species


