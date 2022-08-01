function USAMap() {

    var margin = {top: 50, left: 50, right: 50, bottom: 50},
        height = 400 - margin.top - margin.bottom,
        width = 800 - margin.left - margin.right
    
    var svg = d3.select("#map").append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa()
        .translate([ width /2 , height / 2])
        .scale(850) 
    var path = d3.geoPath()
        .projection(projection)  
    
    var file = "us_states.topojson"
    
   
    d3.json(file, function(error, topology){
        //console.log("topology",topology)
        var states = topojson.feature(topology, topology.objects.us_states).features
       
         svg.selectAll(".state").data(states).enter().append("path")
         .attr("class", "state").attr("d",path)
         .on('mouseover', function(d) {
             d3.select(this).classed("selected",true)
             console.log(d.properties.name)
         })
         .on('mouseout', function(d) {
            d3.select(this).classed("selected",false)
        }) 
        .on("click", function(d) {
            d3.select(this).classed("selected",true)
           displayLineChart(d.properties.name)
        })
        
    })
}

function displayLineChart(state) {
  
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
width = 700 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%m/%d/%y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.Active); });
var valueDeathline = d3.line()
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.Deaths); });
var valueRecoveredline = d3.line()
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.Recovered); });


// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
d3.selectAll("#chart").html(null);
var svg = d3.select("#chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("project_data_"+state+".csv", function(error,data) {

if (error) throw error;

// format the data
data.forEach(function(d) {
  d.Date = parseTime(d.Date);
  d.Active = +d.Active;
  //console.log(d.Date, d.Active)
});
var x_label;
var y_label;
// Scale the range of the data
x.domain(d3.extent(data, function(d) { return x_label=d.Date; }));
y.domain([0, d3.max(data, function(d) { return y_label=d.Active; })]);

// Add the valueline path.
svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueline).transition();

// Add the valueline path.
svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueDeathline).style("stroke","red");

svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueRecoveredline).style("stroke","green");

// Add the X Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
  .call(d3.axisLeft(y));

  //Add annotations
  const annotations = [{
    note: {
      //label: "Covid cases in ",
      bgPadding: 20,
      //title: "Annotations :)"
    },
    //can use x, y directly instead of data
    
    className: "show-bg",
    dy: 37,
    dx: 62
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: "Covid cases in:" + state });
    return l;
  });

  const timeFormat = d3.timeFormat("%m/%d/%y")

  const type = d3.annotationCalloutElbow
  const makeAnnotations = d3.annotation()
  .type(type)
  .accessors({
    x_scale: d => x(parseTime("4/12/21")),
    y_scale: d => y(d.Recovered)
  })
  .accessorsInverse({
    date: d => timeFormat(x.invert(d.x)),
    Recovered: d => y.invert(d.y)
  })
  .annotations(annotations)

  console.log("test")
  svg.append("g")
  .attr("class", "annotation-group")
  .call( makeAnnotations )
 
});
  
}