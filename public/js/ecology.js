  
  // set the dimensions and margins of the graph
  w = 350
  h = 300
  var margin = {top: 30, right: 30, bottom: 70, left: 40},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;
      //.range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"])
      // ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", 
      //"#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"
      site_colors1 = {
    'AKE': 'gold', //Attached_Keratinized_gingiva
    'ANA': 'blue', //#Anterior_nares
    'BMU':  'green', //#Buccal_mucosa
    'HPA':  'yellow', //#Hard_palate
    'LAF':  'black', //#L_Antecubital_fossa  # not in HMP
    'PERIO': 'grey',  //# ONLY in HMP
    'LRC': 'darkgreen',  //#L_Retroauricular_crease
    'MVA': 'pink',  //#Mid_vagina
    'PFO': 'brown',  //#Posterior_fornix
    'PTO': 'slateblue',  //#Palatine_Tonsils
    'RAF': 'grey1',  //#R_Antecubital_fossa
    'RRC': 'orange',  //#R_Retroauricular_crease
    'SAL': '#3366cc',  //#Saliva
    'STO': '#dc3912',  //#Stool
    'SUBP': '#ff9900', //#Subgingival_plaque
    'SUPP': '#109618', //#Supragingival_plaque
    'THR': '#990099',  //#Throat
    'TDO': '#0099c6',  //#Tongue_dorsum
    'VIN':'#dd4477'   //#Vaginal_introitus
    }
    site_colors2 = {
    'AKE': '#3366cc', //Attached_Keratinized_gingiva
    'ANA': '#0099c6', //#Anterior_nares
    
    
    'BMU':  '#ff9900', //#Buccal_mucosa
    'HPA':  '#109618', //#Hard_palate
    'LAF':  '#990099', //#L_Antecubital_fossa  # not in HMP
    'PERIO': '',  //# ONLY in HMP
    'LRC': '#dd4477',  //#L_Retroauricular_crease
    'MVA': '#66aa00',  //#Mid_vagina
    'PFO': 'yellow',  //#Posterior_fornix
    'PTO': '#316395',  //#Palatine_Tonsils
    'RAF': '#994499',  //#R_Antecubital_fossa
    'RRC': '#22aa99',  //#R_Retroauricular_crease
    'SAL': '#dc3912',  //#Saliva
    
    
    'STO': 'brown',  //#Stool
    'SUBP': 'slateblue', //#Subgingival_plaque
    'SUPP': 'red', //#Supragingival_plaque
    'THR': 'pink',  //#Throat
    'TDO': 'black',  //#Tongue_dorsum
    'VIN':'grey'   //#Vaginal_introitus
    }
  //
  // Dewhirst
  //
  
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
  var site_array = ddata.map(function(d) { return d.site; })
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(site_array)
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
    var colors_array =[]
    for(s in site_array){
       colors_array.push(site_colors2[site_array[s]])
    }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
  var colors = d3.scaleOrdinal().range(colors_array);
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
      var site_array = edatav3v5.map(function(d) { return d.site; })
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(site_array)
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
    var colors_array =[]
    for(s in site_array){
       colors_array.push(site_colors2[site_array[s]])
    }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
    var colors = d3.scaleOrdinal().range(colors_array);

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
      var site_array = edatav1v3.map(function(d) { return d.site; })
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(site_array)
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
        var colors_array =[]
        for(s in site_array){
           colors_array.push(site_colors2[site_array[s]])
        }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      var colors = d3.scaleOrdinal().range(colors_array);
      //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
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
  var site_array = ndatav1v3.map(function(d) { return d.site; })
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(site_array)
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
        var colors_array =[]
        for(s in site_array){
           colors_array.push(site_colors2[site_array[s]])
        }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      var colors = d3.scaleOrdinal().range(colors_array);
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
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
  var site_array = ndatav3v5.map(function(d) { return d.site; })
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(site_array)
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
        var colors_array =[]
        for(s in site_array){
           colors_array.push(site_colors2[site_array[s]])
        }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      var colors = d3.scaleOrdinal().range(colors_array);
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
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
  var site_array = hmpdata.map(function(d) { return d.site; })
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(site_array)
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
        var colors_array =[]
        for(s in site_array){
           colors_array.push(site_colors2[site_array[s]])
        }
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"]);
      var colors = d3.scaleOrdinal().range(colors_array);
    //var colors = d3.scaleOrdinal().range(["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", ]);
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
