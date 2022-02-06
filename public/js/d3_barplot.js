
  
  
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
  width, // outer width, in pixels
  height = 140, // outer height, in pixels - height of entire graph
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yDomain, // array of y-values
  yRange, // [bottom, top]
  yPadding = 0.1, // amount of y-range to reserve to separate bars
  zDomain, // array of z-values
  offset = d3.stackOffsetExpand, // stack offset method
  order = d3.stackOrderNone, // stack order method
  //order = site_names,
  xFormat = "%", // a format specifier string for the x-axis
  xLabel='Major Species Abundances for each oral site', // a label for the x-axis
  //colors = d3.schemeTableau10, // array of colors
  //colors = d3.schemePaired,
  //colors = d3.schemeSpectral[11],
  //colors
  colors = colors2,
  //colors = d3.scaleOrdinal(d3.schemeCategory20)
  //colors = d3.schemeSpectral[11],
  //colors = d3.interpolateSpectral(0.5),
  //colors = d3.interpolateRgb("red", "blue")(0.5)
  //colors = d3.scaleSequential().interpolator(d3.interpolateBrBG).domain([0,99])
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
  //const color =  colors;
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
      .attr("height", yScale.bandwidth());

  if (title) bar.append("title")
      .text(({i}) => title(i));

  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
          //.attr("x", width - marginRight)
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
// function get_colors2(unit_names){
//   var colors = [];
//   for(var n in unit_names){
//     //alert(unit_names[n]);
//     col = string_to_color_code(unit_names[n]);
//     //console.log(col);
//     colors.push({tax:unit_names[n],color:col});
//   }
//   return colors;
// }
function string_to_color_code(str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
}
