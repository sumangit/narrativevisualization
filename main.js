function stackValue(d, key) {
    return d[key];
}

function stackBarChart(state) {
    // Compute values.
    console.log("state in stackBarChart", state)

    // set the dimensions and margins of the graph
    //var margin = {top: 10, right: 30, bottom: 20, left: 50},
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
       
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    // Parse the Data
    d3.csv("project_data_"+state+".csv", function(data) {
    //var state = d3.map(data, function(d){return(d.Province_State)})
    console.log("data[0]",data[0])
   
        console.log("test")
      // List of subgroups = header of the csv files = soil condition here
      //var subgroups = data.columns.slice(1)
      var subgroups =['Active(Myriad)', 'Deaths(Myriad)', 'Recovered(Myriad)']
      console.log(subgroups)
    
      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var months = d3.map(data, function(d){return(d.Month)}).keys()
        console.log("months",months)
      // Add X axis
      var x = d3.scaleBand()
          .domain(months)
          .range([0, width])
          .padding([0.2])
      svg.append("g")
        .attr("transform", "translate(500," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));
    
      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 300])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
      // color palette = one color per subgroup
      var color = d3.scaleOrdinal()
        .domain(subgroups)
       // .range(['#e41a1c','#377eb8','#4daf4a'])
       .range(['green','red','blue'])
    
      //stack the data? --> stack per subgroup
      var stackedData = d3.stack()
        .keys(subgroups)
        (data)
    console.log("stackedData",stackedData)
      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { return color(d.key); })
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { //console.log("d.data.Month",d.data.Month);
            return x(d.data.Month); })
            .attr("y", function(d) { //console.log("d[1]",d[1]);
            return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
   // }
    })
    
 
}

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
        //states.forEach(function(state){
        //    console.log(state.properties.name)
        //});
    
         svg.selectAll(".state").data(states).enter().append("path")
         .attr("class", "state").attr("d",path)
         /*.on('mouseover', function(d) {
             d3.select(this).classed("selected",true)
             console.log(d.properties.name)
         })
         .on('mouseout', function(d) {
            d3.select(this).classed("selected",false)
        }) */
        .on("click", function(d) {
            d3.select(this).classed("selected",true)
            //console.log(d.properties.name)
           // stackBarChart(d.properties.name)
           
           displayLineChart(d.properties.name)
        })
    })
}

function displayLineChart(state) {
    // Prep data for displaying on chart
 console.log("state",state) 
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
// console.log("Hi",data)
if (error) throw error;

// format the data
data.forEach(function(d) {
  d.Date = parseTime(d.Date);
  d.Active = +d.Active;
  //console.log(d.Date, d.Active)
});

// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.Date; }));
y.domain([0, d3.max(data, function(d) { return d.Active; })]);

// Add the valueline path.
svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueline);

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
  var labels = [{
    data: { date: "1/15/21", Recovered: 261672 },
    //dy: 37,
    //dx: -142
  }, {
    data: { date: "1/16/21", Recovered: 325717 },
    //dy: -137,
    //dx: 0
  }, {
    data: { date: "1/17/21", Recovered: 300337 },
    //dy: 37,
    //dx: 42
  }].map(function (l) {
    l.note = Object.assign({}, l.note, { title: "Recovered: " + l.data.Recovered,
      label: "" + l.data.date });
     // console.log("l",l)
    return l;
  });

  var timeFormat = d3.timeFormat("%m/%d/%y");

  window.makeAnnotations = d3.annotation().annotations(labels).type(d3.annotationCalloutElbow).accessors({ x: function x(d) {
     // console.log("window.d.date",d.date)
      //return x(parseTime(d.date));
      return x(parseTime(d.date));
    },
    y: function y(d) {
      //console.log("window.d.Recovered",d.Recovered)
      return y(d.Recovered);
    }
  }).accessorsInverse({
    date: function date(d) {
      return timeFormat(x.invert(d.x));
    },
    Recovered: function Recovered(d) {
      return y.invert(d.y);
    }
  }).on('subjectover', function (annotation) {

    //cannot reference this if you are using es6 function syntax
    this.append('text').attr('class', 'hover').text(annotation.note.title).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 50 : -40).attr('x', -15);

    this.append('text').attr('class', 'hover').text(annotation.note.label).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 70 : -60).attr('x', -15);
  }).on('subjectout', function (annotation) {
    this.selectAll('text.hover').remove();
  });
 // window.makeResize = d3.annotation().annotations(resize).type(d3.annotationXYThreshold);
  svg.append("g").attr("class", "annotation-test").call(makeAnnotations);
 
});
  
  }