function USAMap() {
console.log("hello")
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
            console.log("hi");
           displayLineChart(d.properties.name)
        })
        
    })
}

function displayLineChart(state) {
  console.log("hi");
// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 100},
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
.y(function(d) { return y(d.Confirmed); });
var valueDeathline = d3.line()
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.Deaths); });
var valueRecoveredline = d3.line()
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.Recovered); });

d3.selectAll("#chart").html(null);
var svg = d3.select("#chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

var Confirmed_cases;


console.log("Confirmed_cases",Confirmed_cases)
// Get the data
d3.csv("project_data_"+state+".csv", function(error,data) {

if (error) throw error;

// format the data
data.forEach(function(d) {
  
  if(d.Date == "11/1/21")
    Confirmed_cases_nov = d.Confirmed;
  if(d.Date == "8/1/21")
    Confirmed_cases_aug = d.Confirmed;
  if(d.Date == "3/1/21")
    Confirmed_cases_mar = d.Confirmed;
  console.log("Confirmed_cases",Confirmed_cases)
  d.Date = parseTime(d.Date);
  d.Confirmed = +d.Confirmed;
  
  console.log(d.Date, d.Confirmed)
});
var x_label;
var y_label;
// Scale the range of the data
x.domain(d3.extent(data, function(d) { return x_label=d.Date; }));
y.domain([0, d3.max(data, function(d) { return y_label=d.Confirmed; })]);

// Add the valueline path.
svg.append("path")
  .data([data]).transition().duration(300).delay(100)
  .attr("class", "line")
  .attr("d", valueline);

// Add the valueline path.
svg.append("path")
  .data([data]).transition().duration(300).delay(200)
  .attr("class", "line")
  .attr("d", valueDeathline).style("stroke","red");

svg.append("path")
  .data([data]).transition().duration(300).delay(300)
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
    x: 400,
    y: 200,
    dy: 7,
    dx: 6
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: state + ":", label: "" + Confirmed_cases_nov });
    l.x = x(parseTime("11/1/21"))
    l.y = y(Confirmed_cases_nov)
    return l;
  });

  const annotations_aug = [{
    note: {
      //label: "Covid cases in ",
      bgPadding: 20,
      //title: "Annotations :)"
    },
    //can use x, y directly instead of data
    
    className: "show-bg",
    x: 400,
    y: 200,
    dy: 7,
    dx: 6
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: state + ":", label: "" + Confirmed_cases_aug });
    l.x = x(parseTime("8/1/21"))
    l.y = y(Confirmed_cases_aug)
    return l;
  });

  const annotations_mar = [{
    note: {
      //label: "Covid cases in ",
      bgPadding: 20,
      //title: "Annotations :)"
    },
    //can use x, y directly instead of data
    
    className: "show-bg",
    x: 400,
    y: 200,
    dy: 7,
    dx: 6
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: state + ":", label: "" + Confirmed_cases_mar });
    l.x = x(parseTime("3/1/21"))
    l.y = y(Confirmed_cases_mar)
    return l;
  });

  const timeFormat = d3.timeFormat("%m/%d/%y")

  const type = d3.annotationCalloutElbow
  const makeAnnotations = d3.annotation()
  .type(type)
  .annotations(annotations)

  const makeAnnotations_aug = d3.annotation()
  .type(type)
  .annotations(annotations_aug)

  const makeAnnotations_mar = d3.annotation()
  .type(type)
  .annotations(annotations_mar)

  console.log("test")
  svg.append("g")
  .attr("class", "annotation-group")
  .call( makeAnnotations )

  svg.append("g")
  .attr("class", "annotation-group")
  .call( makeAnnotations_aug )

  svg.append("g")
  .attr("class", "annotation-group")
  .call( makeAnnotations_mar )

 
});
  
}