// var labelMargin = 60;
//   
// var svg = d3.select("svg"),
//     margin = {top: 20, right: 20, bottom: 50, left: 40},
//     width = +svg.attr("width") - margin.left - margin.right,
//     height = +svg.attr("height") - margin.top - margin.bottom - labelMargin,
//     g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// 
// // set x scale
// var x = d3.scaleBand()
//     .rangeRound([0, width])
//     .paddingInner(0.05)
//     .align(0.1);
// 
// // set y scale
// var y = d3.scaleLinear()
//     .rangeRound([height, 0]);
// 
// // set the colors
// var z = d3.scaleOrdinal()
//     .range(["#98abc5", "#7b6888", "#a05d56", "#d0743c", "#ff8c00"]);
//     
// var keys = data.columns.slice(1, 6);
// 
//   data.sort(function(a, b) { return a.total; });
//   x.domain(data.map(function(d) { return d.departamento; }));
//   y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
//   z.domain(keys);
// 
//   g.append("g")
//     .selectAll("g")
//     .data(d3.stack().keys(keys)(data))
//     .enter().append("g")
//       .attr("fill", function(d) { return z(d.key); })
//     .selectAll("rect")
//     .data(function(d) { return d; })
//     .enter().append("rect")
//       .attr("x", function(d) { return x(d.data.departamento); })
//       .attr("y", function(d) { return y(d[1]); })
//       .attr("height", function(d) { return y(d[0]) - y(d[1]); })
//       .attr("width", x.bandwidth())
//     .on("mouseover", function() { tooltip.style("display", null); })
//     .on("mouseout", function() { tooltip.style("display", "none"); })
//     .on("mousemove", function(d) {
//       console.log(d);
//       var xPosition = d3.mouse(this)[0] - 5;
//       var yPosition = d3.mouse(this)[1] - 5;
//       tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
//       tooltip.select("text").text(d[1]-d[0]);
//     });
// 
//   var nuHeight = -180;
//   
//   g.append("g")
//       .attr("class", "axis")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x))
//         .selectAll("text")
//         .attr("transform", "rotate(45)")
//       .attr("text-anchor", "start");
// 
//   g.append("g")
//       .attr("class", "axis")
//       .call(d3.axisLeft(y).ticks(null, "s"))
//     .append("text")
//       .attr("x", 2)
//       .attr("y", y(y.ticks().pop()) + 0.5)
//       .attr("dy", "0.32em")
//       .attr("fill", "#000")
//       .attr("font-weight", "bold")
//       .attr("text-anchor", "start");
// 
//   var legend = g.append("g")
//       .attr("font-family", "sans-serif")
//       .attr("font-size", 10)
//       .attr("text-anchor", "end")
//     .selectAll("g")
//     .data(keys.slice())
//     .enter().append("g")
//       .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
// 
//   legend.append("rect")
//       .attr("x", width - 19)
//       .attr("width", 19)
//       .attr("height", 19)
//       .attr("fill", z);
// 
//   legend.append("text")
//       .attr("x", width - 24)
//       .attr("y", 9.5)
//       .attr("dy", "0.32em")
//       .text(function(d) { t = ""; if(d == "inviable.perc"){ t = "Sanitariamente inviable"} else if (d == "alto.perc"){ t = "Riesgo alto"} else if (d == "medio.perc"){ t = "Riesgo medio"} else if (d == "bajo.perc"){ t = "Riesgo bajo"} else {t = "Sin riesgo"}; return t });
// });
// 
//   // Prep the tooltip bits, initial display is hidden
//   var tooltip = svg.append("g")
//     .attr("class", "tooltip")
//     .style("display", "none");
//       
//   tooltip.append("rect")
//     .attr("width", 60)
//     .attr("height", 20)
//     .attr("fill", "white")
//     .style("opacity", 0.5);
// 
//   tooltip.append("text")
//     .attr("x", 30)
//     .attr("dy", "1.2em")
//     .style("text-anchor", "middle")
//     .attr("font-size", "12px")
//     .attr("font-weight", "bold");
// var $liveTip = $('<div id="livetip_chart"></div>').hide().appendTo('body'),
//     $win = $(window),
//     showTip;
//  
// var tip = {
//   title: '',
//   offset: 12,
//   delay: 50,
//   position: function(event) {
//     var positions = {x: event.pageX, y: event.pageY};
//     var dimensions = {
//       x: [
//         $win.width(),
//         $liveTip.outerWidth()
//       ],
//       y: [
//         $win.scrollTop() + $win.height(),
//         $liveTip.outerHeight()
//       ]
//     };
//     for ( var axis in dimensions ) {
//       if (dimensions[axis][0] <dimensions[axis][1] + positions[axis] + this.offset) {
//         positions[axis] -= dimensions[axis][1] + this.offset;
//       } else {
//         positions[axis] += this.offset;
//       }
//     }
//     $liveTip.css({
//       top: positions.y,
//       left: positions.x
//     });
//   }
// }; 

//   
// Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    //var subgroupName = d3.select(this.parentNode).datum().key;
    //var subgroupValue = d.data[subgroupName];
    tooltip
        //.html("subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
        .style("opacity", 1)
  }
  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
  }
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-normalized-horizontal-bar
function StackedBarChart(data, {
  x = d => d, // given d in data, returns the (quantitative) x-value
  y = (d, i) => i, // given d in data, returns the (ordinal) y-value
  z = () => true, // given d in data, returns the (categorical) z-value
  title, // given d in data, returns the title text
  marginTop = 30, // top margin, in pixels
  marginRight = 20, // right margin, in pixels
  marginBottom = 0, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width, in pixels
  height = 180, // outer height, in pixels
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yDomain, // array of y-values
  yRange, // [bottom, top]
  yPadding = 0.1, // amount of y-range to reserve to separate bars
  zDomain, // array of z-values
  offset = d3.stackOffsetExpand, // stack offset method
  order = d3.stackOrderNone, // stack order method
  xFormat = "%", // a format specifier string for the x-axis
  xLabel = xlabel, // a label for the x-axis
  colors = ccolors, //d3.schemeTableau10, // array of colors
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default y- and z-domains, and unique them.
  if (yDomain === undefined) yDomain = Y;
  if (zDomain === undefined) zDomain = Z;
  yDomain = new d3.InternSet(yDomain);
  zDomain = new d3.InternSet(zDomain);

  // Omit any data not present in the y- and z-domains.
  const I = d3.range(X.length).filter(i => yDomain.has(Y[i]) && zDomain.has(Z[i]));

  // If the height is not specified, derive it from the y-domain.
  if (height === undefined) height = yDomain.size * 25 + marginTop + marginBottom;
  if (yRange === undefined) yRange = [height - marginBottom, marginTop];

  // Compute a nested array of series where each series is [[x1, x2], [x1, x2],
  // [x1, x2], …] representing the x-extent of each stacked rect. In addition,
  // each tuple has an i (index) property so that we can refer back to the
  // original data point (data[i]). This code assumes that there is only one
  // data point for a given unique y- and z-value.
  const series = d3.stack()
      .keys(zDomain)
      .value(([, I], z) => X[I.get(z)])
      .order(order)
      .offset(offset)
    (d3.rollup(I, ([i]) => i, i => Y[i], i => Z[i]))
    .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));

  // Compute the default y-domain. Note: diverging stacks can be negative.
  if (xDomain === undefined) xDomain = d3.extent(series.flat(2));

  // Construct scales, axes, and formats.
  const xScale = xType(xDomain, xRange);
  const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding);
  const color = d3.scaleOrdinal(zDomain, colors);
  const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

  // Compute titles.
  if (title === undefined) {
    title = i => `${Y[i]}\n${Z[i]}\n${X[i].toLocaleString()}`;
  } else {
    const O = d3.map(data, d => d);
    const T = title;
    title = i => T(O[i], i, data);
  }
  
  
const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");
    
tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");  
  const bar = svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", ([{i}]) => color(Z[i]))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", ([x1, x2]) => Math.min(xScale(x1), xScale(x2)))
      .attr("y", ({i}) => yScale(Y[i]))
      .attr("width", ([x1, x2]) => Math.abs(xScale(x1) - xScale(x2)))
      .attr("height", yScale.bandwidth())
      .on("mouseover", mouseover)
      .on('mousemove', mousemove)
      
      ;

  if (title) bar.append("title")
      .text(({i}) => title(i));

  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
          .attr("x", 10)
          .attr("y", -22)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(xLabel));

  svg.append("g")
      .attr("transform", `translate(${xScale(0)},0)`)
      .call(yAxis);

     
  return Object.assign(svg.node(), {scales: {color}});
}

function get_colors(unit_names){
  var colors = [];
  for(var n in unit_names){
    col = string_to_color_code(unit_names[n]);
    colors.push(col);
  }
  return colors;
}

function string_to_color_code(str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
}
