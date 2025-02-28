// var outerRadius = 960 / 2,
//     innerRadius = outerRadius - 170;
//  https://gist.github.com/git-ashish/3aa81521f96e48198c80b4e2742bb6bc
var colors20 = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']
var outerRadius = 1500 / 2,
    //innerRadius = outerRadius - 170;
    innerRadius = outerRadius - 270;

var color = d3.scaleOrdinal()
    //.domain(["Bacteria", "Eukaryota", "Archaea"])
    .domain(phyla)
    // phyla
    //.range(d3.schemeCategory10)
    .range(colors20);

var cluster = d3.cluster()
    .size([360, innerRadius])
    .separation(function(a, b) { return 1; });

var svg = d3.select("#tree").append("svg")
    .attr("width", outerRadius * 2+200)
    .attr("height", outerRadius * 2+200)
    .attr('class',"tree")

// legend = svg => {
//   const g = svg
//     .selectAll("g")
//     .data(color.domain())
//     .join("g")
//       .attr("transform", (d, i) => `translate(${-outerRadius},${-outerRadius + i * 20})`);
// 
//   g.append("rect")
//       .attr("width", 18)
//       .attr("height", 18)
//       .attr("fill", color);
// 
//   g.append("text")
//       .attr("x", 24)
//       .attr("y", 9)
//       .attr("dy", "0.35em")
//       .text(d => d);
// }
var svg2 = d3.select("#legend").append("svg")
    .attr("width", 260)
    .attr("height", 370);
    
var legend = svg2.append("g")
    .attr("class", "legend")
  .selectAll("g")
  .data(color.domain())
  .enter().append("g")
    //.attr("transform", function(d, i) { return "translate(" + (50) + "," + (i * 20 + 50) + ")"; });
    .attr("transform", (d, i) =>{ return  'translate('+ 30 + "," + (i * 20 + 50) +')'; });

legend.append("rect")
    .attr("x", -18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", color);

legend.append("text")
    .attr("x", 4)
    .attr("y", 9)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .text(function(d) { 
       //console.log('d',d)  // domain
       return d; 
    });

var chart = svg.append("g")
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

//d3.text("life.txt", function(error, life) {
//  if (error) throw error;

  var root = d3.hierarchy(parseNewick(mydata), function(d) { return d.branchset; })
      .sum(function(d) { return d.branchset ? 0 : 1; })
      .sort(function(a, b) { return (a.value - b.value) || d3.ascending(a.data.length, b.data.length); });

  cluster(root);

  var input = d3.select("#show-length input").on("change", changed)
  var timeout = setTimeout(function() { input.property("checked", true).each(changed); }, 2000);

  setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
  setColor(root);

  var linkExtension = chart.append("g")
      .attr("class", "link-extensions")
    .selectAll("path")
    .data(root.links().filter(function(d) { return !d.target.children; }))
    .enter().append("path")
      .each(function(d) { d.target.linkExtensionNode = this; })
      .attr("d", linkExtensionConstant)
      .attr("stroke", function(d) { return d.target.color; });

  var link = chart.append("g")
      .attr("class", "links")
    .selectAll("path")
    .data(root.links())
    .enter().append("path")
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", linkConstant)
      .attr("stroke", function(d) { return d.target.color; });

  chart.append("g")
      .attr("class", "labels")
    .selectAll("text")
    .data(root.leaves())
    .enter().append("text")
      .attr("dy", ".31em")
      .attr("style","font-size:5px;")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 4) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { 
         
        phylum  = metadata[d.data.name].phylum
        species = metadata[d.data.name].species
         //console.log('d',d.data.name,'phylum',phylum)
         //return d.data.name.replace(/_/g, " "); 
         return d.data.name+'|'+phylum+'|'+species
       })
      .on("mouseover", mouseovered(true))
      .on("mouseout",  mouseovered(false));

  function changed() {
    clearTimeout(timeout);
    var t = d3.transition().duration(750);
    linkExtension.transition(t).attr("d", this.checked ? linkExtensionVariable : linkExtensionConstant);
    link.transition(t).attr("d", this.checked ? linkVariable : linkConstant);
  }

  function mouseovered(active) {
    return function(d) {
      d3.select(this).classed("label--active", active);
      //d3.select(this).style("color", function(d) { return d.x + "px"; })
      if(active) {
         var info_line = document.getElementById("taxon");
         
         //d3.select(event.currentTarget).style("margin", "20px");
         //console.log('pname',d3.select(event.currentTarget)._groups)
         //console.log('pname',d3.select(event.currentTarget)._groups[0])
         var color = d3.select(event.currentTarget)._groups[0][0]['__data__'].color
         var taxid = d3.select(event.currentTarget)._groups[0][0]['__data__'].data.name
         
         phylum  = metadata[taxid].phylum
         species = metadata[taxid].species
         info_line.innerHTML = 'RefSeqID: '+taxid+' | Phylum: '+phylum+' | Species: '+species;
         //console.log('pname',color)
         //console.log('pname',d3.select(event.currentTarget)._groups[0][0]['__data__']) //,metadata[name].phylum)
         //  var name = d.data.name;

         //console.log('mname',name,metadata)
         //color = color.domain().indexOf(phylum) >= 0 ? color(phylum) : d.parent ? d.parent.color : null;
          d3.select(event.currentTarget).style("fill", color);
          //d3.select(event.currentTarget).style("font-size:", "20px;");
          //d3.select(event.currentTarget).style("background", "black");
          //d3.select(event.currentTarget).style("background", "black");
      }else{
          d3.select(event.currentTarget).attr("r", 10).style("fill", "black");
      }
      
      d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
      do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = d.parent);
    };
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
//});

// Compute the maximum cumulative length of any node in the tree.
function maxLength(d) {
  return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
}

// Set the radius of each node by recursively summing and scaling the distance from the root.
function setRadius(d, y0, k) {
  d.radius = (y0 += d.data.length) * k;
  if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
}

// Set the color of each node by recursively inheriting.
function setColor(d) {
  
  var name = d.data.name;
  //console.log('pname',name) //,metadata[name].phylum)
  var phylum  =''
  if(metadata.hasOwnProperty(name)){
     phylum = metadata[name].phylum
  }
  
  //console.log('mname',name,metadata)
  d.color = color.domain().indexOf(phylum) >= 0 ? color(phylum) : d.parent ? d.parent.color : null;
  if (d.children) d.children.forEach(setColor);
}

function linkVariable(d) {
  return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
}

function linkConstant(d) {
  return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
}

function linkExtensionVariable(d) {
  return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
}

function linkExtensionConstant(d) {
  return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
}

// Like d3.svg.diagonal.radial, but with square corners.
function linkStep(startAngle, startRadius, endAngle, endRadius) {
  var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
      s0 = Math.sin(startAngle),
      c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
      s1 = Math.sin(endAngle);
  return "M" + startRadius * c0 + "," + startRadius * s0
      + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
      + "L" + endRadius * c1 + "," + endRadius * s1;
}

// https://codepen.io/mrobin604/pen/yjmrjj
shape = document.getElementsByClassName("tree")[0];
var mouseStartPosition = {x: 0, y: 0};
var mousePosition = {x: 0, y: 0};
var viewboxStartPosition = {x: 0, y: 0};
var viewboxPosition = {x: 0, y: 0};
var viewboxSize = {x: 1480, y: 1480};
var viewboxScale = 1.0;

var mouseDown = false;

shape.addEventListener("mousemove", mousemove);
shape.addEventListener("mousedown", mousedown);
shape.addEventListener("wheel", wheel);
function mousedown(e) {
  mouseStartPosition.x = e.pageX;
  mouseStartPosition.y = e.pageY;

  viewboxStartPosition.x = viewboxPosition.x;
  viewboxStartPosition.y = viewboxPosition.y;

  window.addEventListener("mouseup", mouseup);

  mouseDown = true;
}

function setviewbox()
{
  var vp = {x: 0, y: 0};
  var vs = {x: 0, y: 0};
  
  vp.x = viewboxPosition.x;
  vp.y = viewboxPosition.y;
  
  vs.x = viewboxSize.x * viewboxScale;
  vs.y = viewboxSize.y * viewboxScale;

  shape = document.getElementsByClassName("tree")[0];
  shape.setAttribute("viewBox", vp.x + " " + vp.y + " " + vs.x + " " + vs.y);
  
}

function mousemove(e)
{
  mousePosition.x = e.offsetX;
  mousePosition.y = e.offsetY;
  
  if (mouseDown)
  {
    viewboxPosition.x = viewboxStartPosition.x + (mouseStartPosition.x - e.pageX) * viewboxScale;
    viewboxPosition.y = viewboxStartPosition.y + (mouseStartPosition.y - e.pageY) * viewboxScale;

    setviewbox();
  }
  
  //var mpos = {x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale};
 // var vpos = {x: viewboxPosition.x, y: viewboxPosition.y};
  //var cpos = {x: mpos.x + vpos.x, y: mpos.y + vpos.y}
  
  //shape = document.getElementsByTagName("h1")[0];
  //shape.innerHTML = mpos.x + " " + mpos.y + " " + cpos.x + " " + cpos.y;
}

function mouseup(e) {
  window.removeEventListener("mouseup", mouseup);
  
  mouseDown = false;
}

function wheel(e) {
  var scale = (e.deltaY < 0) ? 0.8 : 1.2;
  
  if ((viewboxScale * scale < 8.) && (viewboxScale * scale > 1./256.))
  {  
    var mpos = {x: mousePosition.x * viewboxScale, y: mousePosition.y * viewboxScale};
    var vpos = {x: viewboxPosition.x, y: viewboxPosition.y};
    var cpos = {x: mpos.x + vpos.x, y: mpos.y + vpos.y}

    viewboxPosition.x = (viewboxPosition.x - cpos.x) * scale + cpos.x;
    viewboxPosition.y = (viewboxPosition.y - cpos.y) * scale + cpos.y;
    viewboxScale *= scale;
  
    setviewbox();
  }
}

