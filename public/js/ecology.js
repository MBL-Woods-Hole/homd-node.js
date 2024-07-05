  
  // set the dimensions and margins of the graph

      //.range(["gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"])
      // ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", 
      //"#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99"
    
    siteLongNames = {
    'AKE': '(AKE) Attached Keratinized Gingiva (oral)', //Attached_Keratinized_gingiva
    'ANA': '(ANA) Anterior Nares (nasal)', //#Anterior_nares
    'BMU': '(BMU) Buccal Mucosa (oral)', //#Buccal_mucosa
    'HPA': '(HPA) Hard Palate (oral)', //#Hard_palate
    'LAF': '(LAF) Left Antecubital Fossa (skin)', //#L_Antecubital_fossa  # not in HMP
    'PERIO': '(PERIO) Periodontal (oral)',  //# ONLY in HMP Meta
    'LRC': '(LRC) Left Retroauricular Crease (skin)',  //#L_Retroauricular_crease
    'MVA': '(MVA) Mid Vagina',  //#Mid_vagina
    'PFO': '(PFO) Posterior Fornix (vaginal)',  //#Posterior_fornix
    'PTO': '(PTO) Palatine Tonsils (oral)',  //#Palatine_Tonsils
    'RAF': '(RAF) Right Antecubital Fossa (skin)',  //#R_Antecubital_fossa
    'RRC': '(RRC) Right Retroauricular Crease (skin)',  //#R_Retroauricular_crease
    'SAL': '(SAL) Saliva (oral)',  //#Saliva
    'STO': '(STO) Stool (gut)',  //#Stool
    'SUBP': '(SUBP) Subgingival Plaque (oral)', //#Subgingival_plaque
    'SUPP': '(SUPP) Supragingival Plaque (oral)', //#Supragingival_plaque
    'THR': '(THR) Throat (oral)',  //#Throat
    'TDO': '(TDO) Tongue Dorsum (oral)',  //#Tongue_dorsum
    'VIN': '(VIN) Vaginal Introitus '   //#Vaginal_introitus
    }
    site_colors2 = {
    'AKE': '#3366cc', //Attached_Keratinized_gingiva
    'ANA': '#0099c6', //#Anterior_nares
    
    'BMU':  '#ff9900', //#Buccal_mucosa
    'HPA':  '#109618', //#Hard_palate
    'LAF':  '#990099', //#L_Antecubital_fossa  # not in HMP
    'PERIO': '',  //# ONLY in HMP Meta
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
    // ----------------
    // Create  tooltips
    // ----------------
    var tooltips = {}
    tooltips.hmprefseqv1v3 = d3.select("#plot_hmp_refseqv1v3_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")
    tooltips.hmprefseqv3v5 = d3.select("#plot_hmp_refseqv3v5_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")
    tooltips.dewhirst = d3.select("#plot_dewhirst_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")
    tooltips.erenv1v3 = d3.select("#plot_erenv1v3_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")
    tooltips.erenv3v5 = d3.select("#plot_erenv3v5_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")
    tooltips.hmpmetaphlan = d3.select("#plot_hmp_metaphlan_here").append("div").style("position", "absolute").style('font-size','12').style("z-index", "10").style("visibility", "hidden").style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px")

////////////////////////////////////////////////////////////

// HMP_RefSeq V1V3
  if(Object.keys(hmprefseqv1v3).length == 0){
     document.getElementById("plot_hmp_refseqv1v3_here").innerHTML = "<span class='nodata'>No Data</span>"
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
   
    if(max.hmp_refseqv1v3 < 0.001){
       max_ceil = 0.001
    }else if(max.hmp_refseqv1v3 < 0.01){
       max_ceil = 0.01
    }else if(max.hmp_refseqv1v3 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.hmp_refseqv1v3)  // smallest at 1.0
    }
    //console.log('max.hmp_metaphlan',max.hmp_metaphlan)

    // append the svg object to the body of the page
    var svg = d3.select("#plot_hmp_refseqv1v3_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis
    var mouseover = function(e,d){ 
         var plotName = 'HMP 16S RefSeq V1-V3';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.hmprefseqv1v3.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.hmprefseqv1v3.style("visibility", "visible");
         
         //tooltips.hmptablev1v3.html(hmpv1v3table)
         //return tooltips.hmptablev1v3.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.hmprefseqv1v3.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.hmprefseqv1v3.style("visibility", "hidden");
    //return tooltips.hmptablev1v3.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(hmprefseqv1v3.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    .attr("transform", "rotate(-90)")
    .text("% Abundance");
// Bars
svg.selectAll("mybar")
  .data(hmprefseqv1v3)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)

  } // end else

////////////////////////////////////////////////////////////
// HMP_RefSeq V3V5
  if(Object.keys(hmprefseqv3v5).length == 0){
     document.getElementById("plot_hmp_refseqv3v5_here").innerHTML = "<span class='nodata'>No Data</span>"
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
  
    if(max.hmp_refseqv3v5 < 0.001){
       max_ceil = 0.001
    }else if(max.hmp_refseqv3v5 < 0.01){
       max_ceil = 0.01
    }else if(max.hmp_refseqv3v5 < 0.1){
       max_ceil = 0.1
    }else{
       max_ceil = Math.ceil(max.hmp_refseqv3v5)  // smallest at 1.0
    }
    //console.log('max.hmp_metaphlan',max.hmp_metaphlan)

    // append the svg object to the body of the page
    var svg = d3.select("#plot_hmp_refseqv3v5_here")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // X axis
    var mouseover = function(e,d){ 
         var plotName = 'HMP 16S RefSeq V3-V5';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.hmprefseqv3v5.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.hmprefseqv3v5.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.hmprefseqv3v5.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.hmprefseqv3v5.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(hmprefseqv3v5.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    .attr("transform", "rotate(-90)")
    .text("% Abundance");
// Bars
svg.selectAll("mybar")
  .data(hmprefseqv3v5)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)

  } // end else
  //
  // Dewhirst
  //
  
  if(Object.keys(dewhirst).length == 0){
     document.getElementById("plot_dewhirst_here").innerHTML = "<span class='nodata'>No Data</span>"
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
          "translate(" + margin.left + "," + margin.top + ")")
       

    
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(e,d){ 
         var plotName = 'Dewhirst 35x9';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.dewhirst.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.dewhirst.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.dewhirst.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.dewhirst.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(dewhirst.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    
    .attr("transform", "rotate(-90)")
    .text("% Abundance");

// Bars
svg.selectAll("mybar")
  .data(dewhirst)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)
}
  //
  // Erenv1v3
  //
  //
  if(Object.keys(erenv1v3).length == 0){
     document.getElementById("plot_erenv1v3_here").innerHTML = "<span class='nodata'>No Data</span>"
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
  
        var mouseover = function(e,d){ 
         var plotName = 'Eren (2014) V1-V3';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.erenv1v3.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.erenv1v3.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.erenv1v3.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.erenv1v3.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(erenv1v3.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    .attr("transform", "rotate(-90)")
    .text("% Abundance");
// Bars
svg.selectAll("mybar")
  .data(erenv1v3)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)

  }
  
  

  //
  // Erenv3v5
  //
  //
  if(Object.keys(erenv3v5).length == 0){
     document.getElementById("plot_erenv3v5_here").innerHTML = "<span class='nodata'>No Data</span>"
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
    // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(e,d){ 
         var plotName = 'Eren (2014) V3-V5';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.erenv3v5.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.erenv3v5.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.erenv3v5.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.erenv3v5.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(erenv3v5.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    .attr("transform", "rotate(-90)")
    .text("% Abundance");
// Bars
svg.selectAll("mybar")
  .data(erenv3v5)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)

}


  // HMP_MetaPhlan
  if(Object.keys(hmpmetaphlan).length == 0){
     document.getElementById("plot_hmp_metaphlan_here").innerHTML = "<span class='nodata'>No Data</span>"
  }else{
    //console.log(sdata)
    //max = max([item.avg for item in data])
    //max = Math.max.apply(Math, data.map(function(o) { return o.avg; }))
    
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
  
    var mouseover = function(e,d){ 
         var plotName = 'HMP Metaphlan';//d3.select(this.parentNode).datum().key;
         var siteName = siteLongNames[d.site]
         var plotValue = d.avg;
         tooltips.hmpmetaphlan.html(plotName+"<br>"+"Lineage: "+lineage+"<br>"+"Site: <span style='border:1px solid black;padding:1px 8px;background:"+site_colors2[d.site]+";'></span>&nbsp;&nbsp;" + siteName + "<br>" + "Value: " + plotValue+"% Abundance")
         return tooltips.hmpmetaphlan.style("visibility", "visible");
     }
  
  var mousemove = function(e,d) {
    //console.log('this',this)
    return tooltips.hmpmetaphlan.style("left", (e.pageX+20) + "px")
                                  .style("top",  (e.pageY) + "px")
  }
  var mouseleave = function(d) {
    return tooltips.hmpmetaphlan.style("visibility", "hidden");
  }
  
  // X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(hmpmetaphlan.map(function(d) { return d.site; }))
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
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("x", -100 )
    .attr("transform", "rotate(-90)")
    .text("% Abundance");
// Bars
svg.selectAll("mybar")
  .data(hmpmetaphlan)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.site); })
    .attr("y", function(d) { return y(d.avg); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.avg); })
    .attr("fill", function(d) {
            return site_colors2[d.site];
     })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)

  } // end else



function change_view(v,r,t){
    console.log(v,r,t)
    window.open('ecology?rank='+r+'&name='+t+'&page='+v,'_self')
}

 