  
  // set the dimensions and margins of the graph
  w = 350
  h = 300
  var margin = {top: 30, right: 30, bottom: 70, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;
  //
  // Dewhirst
  //
  //
  //
  // console.log('s',max.nihv1v3)
//   console.log('d',max.dewhirst)
//   console.log('e',max.erenv1v3)
  
  if(Object.keys(ddata).length == 0){
     document.getElementById("plot_dewhirst_here").innerHTML = '<small>No Data</small>'
  }else{
    
    if(max.dewhirst < 0.001){
       max_ceil = 0.001
    }else if(max.dewhirst < 0.01){
       max_ceil = 0.01
    }else if(max.dewhirst < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.dewhirst)  // smallest at 1.0
    }
    //max_ceil = Math.ceil(max.dewhirst) 
    // append the svg object to the body of the page
    var svg = d3.select("#plot_dewhirst_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis horizontal
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(ddata.map(function(d) { return d.site; }))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis - vertical
  var y = d3.scaleLinear();
   // .domain([0, max_ceil])
   // .range([ height, 0]);
   //console.log('max_ceil',max_ceil) 
   //console.log('d3.min(data)',d3.min(ddata)) 
   //console.log('d3.max(data)',d3.max(ddata))
  y.domain([0, max_ceil]);
  y.range([ height, 0]);  
  
  //y.range([ , -height]);  
  svg.append("g")
    .call(d3.axisLeft(y));
    
    // Bars
    var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
  //var colors = d3.scaleOrdinal().domain(ddata).range(d3.schemeSet2);
  svg.selectAll("mybar")
    .data(ddata)
    .enter()
    .append("rect")
    .attr("x", function(d) { 
      //console.log('x(d.site)', d.site, x(d.site))
      return x(d.site); 
    })
    .attr("y", function(d) { 
       //console.log('y(d.avg)', d.avg, y(d.avg))
       return y(d.avg); 
    
    })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(ddata, i) {
              return colors(i);
    });
  }
  //
  // Erenv3v5
  //
  //
  if(Object.keys(edatav3v5).length == 0){
     document.getElementById("plot_erenv3v5_here").innerHTML = '<small>No Data</small>'
  }else{
     //max_ceil = Math.ceil(max.erenv3v5)
    if(max.erenv3v5 < 0.001){
       max_ceil = 0.001
    }else if(max.erenv3v5 < 0.01){
       max_ceil = 0.01
    }else if(max.erenv3v5 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.erenv3v5)  // smallest at 1.0
    }
    //console.log(max.eren)
    
    // append the svg object to the body of the page
    var svg = d3.select("#plot_erenv3v5_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
      // X axis
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(edatav3v5.map(function(d) { return d.site; }))
        .padding(0.2);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, max_ceil])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
    // Bars
    var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      //var colors = d3.scaleOrdinal().domain(edata).range(d3.schemeSet2);
      svg.selectAll("mybar")
        .data(edatav3v5)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.site); })
        .attr("y", function(d) { return y(d.avg); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.avg); })
        .attr("fill", function(edatav3v5, i) {
                  return colors(i);
            });
  }
  //
  // Erenv1v3
  //
  //
  if(Object.keys(edatav1v3).length == 0){
     document.getElementById("plot_erenv1v3_here").innerHTML = '<small>No Data</small>'
  }else{
    //console.log(edata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
    //max_ceil = Math.ceil(max.erenv1v3)
    if(max.erenv1v3 < 0.001){
       max_ceil = 0.001
    }else if(max.erenv1v3 < 0.01){
       max_ceil = 0.01
    }else if(max.erenv1v3 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.erenv1v3)  // smallest at 1.0
    }
    //console.log(max.eren)
    
    
    

    // append the svg object to the body of the page
    var svg = d3.select("#plot_erenv1v3_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
      // X axis
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(edatav1v3.map(function(d) { return d.site; }))
        .padding(0.2);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, max_ceil])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
        // Bars
      var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      //var colors = d3.scaleOrdinal().domain(edata).range(d3.schemeSet2);
      svg.selectAll("mybar")
        .data(edatav1v3)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.site); })
        .attr("y", function(d) { return y(d.avg); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.avg); })
        .attr("fill", function(edatav1v3, i) {
                  return colors(i);
                 });
  }
  // NIH V1V3
    if(Object.keys(ndatav1v3).length == 0){
     document.getElementById("plot_nihv1v3_here").innerHTML = '<small>No Data</small>'
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
    //max_ceil = Math.ceil(max.nihv1v3)
    if(max.nihv1v3 < 0.001){
       max_ceil = 0.001
    }else if(max.nihv1v3 < 0.01){
       max_ceil = 0.01
    }else if(max.nihv1v3 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.nihv1v3)  // smallest at 1.0
    }
    

    // append the svg object to the body of the page
    var svg = d3.select("#plot_nihv1v3_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(ndatav1v3.map(function(d) { return d.site; }))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, max_ceil])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
    
    // Bars
    var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
  //var colors = d3.scaleOrdinal().domain(ndatav1v3).range(d3.schemeSet1);
  svg.selectAll("mybar")
    .data(ndatav1v3)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(ndatav1v3, i) {
              return colors(i);
             });
  } // end else

  // NIH V3V5
    if(Object.keys(ndatav3v5).length == 0){
     document.getElementById("plot_nihv3v5_here").innerHTML = '<small>No Data</small>'
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
    //max_ceil = Math.ceil(max.nihv1v3)
    if(max.nihv3v5 < 0.001){
       max_ceil = 0.001
    }else if(max.nihv3v5 < 0.01){
       max_ceil = 0.01
    }else if(max.nihv3v5 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.nihv3v5)  // smallest at 1.0
    }
    //console.log('max.nihv3v5',max.nihv3v5)

    // append the svg object to the body of the page
    var svg = d3.select("#plot_nihv3v5_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(ndatav3v5.map(function(d) { return d.site; }))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, max_ceil])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
    
    // Bars
    var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
  //var colors = d3.scaleOrdinal().domain(sdata).range(d3.schemeSet1);
  svg.selectAll("mybar")
    .data(ndatav3v5)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(ndatav3v5, i) {
              return colors(i);
             });
  } // end else

  // HMP_MetaPhlan
  if(Object.keys(hmpdata).length == 0){
     document.getElementById("plot_hmp_metaphlan_here").innerHTML = '<small>No Data</small>'
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
    //max_ceil = Math.ceil(max.nihv1v3)
    if(max.hmp_metaphlan < 0.001){
       max_ceil = 0.001
    }else if(max.hmp_metaphlan < 0.01){
       max_ceil = 0.01
    }else if(max.hmp_metaphlan < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.hmp_metaphlan)  // smallest at 1.0
    }
    //console.log('max.hmp_metaphlan',max.hmp_metaphlan)

    // append the svg object to the body of the page
    var svg = d3.select("#plot_hmp_metaphlan_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(hmpdata.map(function(d) { return d.site; }))
    .padding(0.2);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, max_ceil])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
    
    // Bars
    var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
  //var colors = d3.scaleOrdinal().domain(sdata).range(d3.schemeSet1);
  svg.selectAll("mybar")
    .data(hmpdata)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(hmpdata, i) {
              return colors(i);
             });
  } // end else


  // Segata
//   if(Object.keys(sdata).length == 0){
//      document.getElementById("plot_nihv1v3_here").innerHTML = '<small>No Data</small>'
//   }else{
//     //console.log(sdata)
//     //max = max([item.avg for item in data])
//     //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
//     //max_ceil = Math.ceil(max.nihv1v3)
//     if(max.nihv1v3 < 0.001){
//        max_ceil = 0.001
//     }else if(max.nihv1v3 < 0.01){
//        max_ceil = 0.01
//     }else if(max.nihv1v3 < 0.1){
//        max_ceil = 0.1
//     }else{
//        max_ceil = Math.ceil(max.nihv1v3)  // smallest at 1.0
//     }
//     
// 
//     // append the svg object to the body of the page
//     var svg = d3.select("#plot_nihv1v3_here")
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");
//   
//   // X axis
//   var x = d3.scaleBand()
//     .range([ 0, width ])
//     .domain(sdata.map(function(d) { return d.site; }))
//     .padding(0.2);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x))
//     .selectAll("text")
//     .attr("transform", "translate(-10,0)rotate(-45)")
//     .style("text-anchor", "end");
// 
//   // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, max_ceil])
//     .range([ height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(y));
//     
//     // Bars
//     var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
//   //var colors = d3.scaleOrdinal().domain(sdata).range(d3.schemeSet1);
//   svg.selectAll("mybar")
//     .data(sdata)
//     .enter()
//     .append("rect")
//     .attr("x", function(d) { return x(d.site); })
//     .attr("y", function(d) { return y(d.avg); })
//     .attr("width", x.bandwidth())
//     .attr("height", function(d) { return height - y(d.avg); })
//     .attr("fill", function(sdata, i) {
//               return colors(i);
//              });
//   } // end else
