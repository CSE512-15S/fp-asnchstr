sessionId = 0;
graph_width = 400;
graph_height = 300;
selection_margin = 20
loc_colors = ["blue", "orange", "green", "purple"]
global_data = 0;

d3.json("initial-quadratic.json", function(error, data){
    if (error) return console.warn(error);
    sessionId = data.sessionId;
    global_data = data;
    render_page(data);
});

function render_page(data){
    var bodybox = d3.select("body").append("div")
        .classed("bodybox", true);

    // The texified formula
    bodybox.append("p").classed("formula", true)
        .text("$$"+data.formula+"$$");
    
    var draw = bodybox
        .append("svg")
        .attr("width", graph_width+"px")
        .attr("height", graph_height+"px");
    bodybox.style("width", graph_width+"px");
    
    // The graph of error that sits under it.
    var graph = draw
        .append("image")
        .classed("graph", true)
        .attr("xlink:href", data.error_graph)
        .attr("height", graph_height+"px")
        .attr("width", graph_width+"px");
    
    draw.selectAll(".rangeIndicator")
        .data(data.loc_ranges)
        .enter().append("rect")
        .attr("class", function(d, i) {return "loc" + d.locid + "range"; })
        .classed("rangeIndicator", true)
        .attr("x", function(d, i) {return d.start*graph_width;})
        .attr("width", function(d, i) { return (d.end - d.start) * graph_width;})
        .attr("y", selection_margin)
        .attr("height", graph_height - selection_margin * 2)
        .attr("opacity", .3)
        .attr("fill", function(d, i) {return loc_colors[d.locid]; });

    // Add links to the math once it's finished rendering.
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    MathJax.Hub.Queue(add_links);
}

function add_links(){
    // Select all the parts of the formula marked as locations of
    // error.
    var locations = d3.selectAll(".location");
    // Give them an onclick function that selects them based on their
    // loc id, stored in the cssId field.
    locations.each(function(d, i) {
        var locIndex = d3.select(this).attr("id");
        d3.select(this)
            .on('click', function () {select_location(locIndex); })
            .on('mouseover', function () {highlight_location(locIndex); })
            .on('mouseout', function () {unhighlight_location(locIndex); });
    });
}
function highlight_location(loc_number){
    var affected_ranges = d3.selectAll(".loc"+loc_number+"range");
    affected_ranges
    // Grow the selection by ten percent on the top and bottom
        .attr("y", function() {
            var old = d3.select(this);
            return old.attr("y") - old.attr("height") * .05;
        })
        .attr("height", function() {
            var old = d3.select(this);
            return old.attr("height") * 1.1;
        })
    // Make it a little more opaque.
        .attr("opacity", 0.4);
}
function unhighlight_location(loc_number){
    var affected_ranges = d3.selectAll(".loc"+loc_number+"range");
    affected_ranges
        .attr("height", function() {
            return d3.select(this).attr("height") / 1.1;
        })
        .attr("y", function() {
            var old = d3.select(this);
            return Number(old.attr("y")) + old.attr("height") * .05;
        })
        .attr("opacity", 0.3);
}
function select_location(loc_number){
    alert("Session " + sessionId + " selected location " + loc_number + ".");
}
