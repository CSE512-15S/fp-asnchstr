sessionId = 0;
graph_width = 400;
graph_height = 300;
calt_graph_width = 190;
calt_graph_height = 100;
calt_box_height = 450;
selection_margin = 20;
unselected_formula_margin = "30%";
loc_colors = ["blue", "orange", "green", "purple"];
selected_loc = -1;
highlighted_loc = -1;
ranges = -1;

d3.json("initial-quadratic.json", function(error, data){
    if (error) return console.warn(error);
    sessionId = data.sessionId;
    global_data = data;
    render_chosen_formula(data);
});

function render_chosen_formula(data){
    var sfbox = d3.select("body").append("div")
        .classed("selectedFormulaBox", true)
        .style("width", graph_width+"px")
        .style("margin-left", unselected_formula_margin);

    // The texified formula
    sfbox.append("p").classed("formula", true)
        .text("$$"+data.formula+"$$");
    
    var draw = sfbox
        .append("svg")
        .attr("width", graph_width+"px")
        .attr("height", graph_height+"px");
    
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

    ranges = data.loc_ranges;

    // Add links to the math once it's finished rendering.
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    MathJax.Hub.Queue(add_loc_links);
}

function add_loc_links(){
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
    if (highlighted_loc != -1)
        unhighlight_location(highlighted_loc);
    highlighted_loc = loc_number;
}
function unhighlight_location(loc_number){
    if (highlighted_loc != loc_number)
        return;
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
    highlighted_loc = -1;
}
function select_location(loc_number){
    selected_loc = loc_number;
    var sfbox = d3.select(".selectedFormulaBox");
    sfbox.transition()
        .duration(1000)
        .styleTween("margin-left", function(){ return d3.interpolate(unselected_formula_margin, "0%"); });
    var unused_selections = d3.selectAll(".rangeIndicator:not(.loc"+loc_number+"range)");
    unused_selections.transition()
        .duration(1000)
        .attr("opacity", 0);
    unhighlight_location(loc_number);
    d3.selectAll(".location")
        .on('click', null)
        .on('mouseover', null)
        .on('mouseout', null);
    d3.json("quadratic-selected.json", function(error, data){
        if (error) return console.warn(error);
        location_selected(data);
    });
}
function location_selected(data){
    d3.select(".formula")
        .text("$$"+data.selectedFormula+"$$");
    var caltboxes = d3.select("body").selectAll(".caltdiv")
        .data(data.calts)
        .enter().append("div")
        .classed("caltdiv", true)
        .style("height", calt_box_height + "px");
    // The texified formula
    var stepboxes = caltboxes.selectAll(".stepdiv")
        .data(function(d, i){ return d.steps; })
        .enter().append("div")
        .classed("stepdiv", true);
    stepboxes.append("p").classed("calt_step", true)
        .text(function(d,i) {
            if (d.rule == "simplify"){
                return "and simplify to:";
            }
            return "Apply the rule $$"+ d.rule + "$$ to get: ";
        });
    stepboxes.append("p").classed("calt_formula", true)
        .text(function(d,i) { return "$$" + d.prog + "$$"; });
    
    var draws = caltboxes
        .append("svg")
        .attr("class", "calt_graph");
    
    // The graph of error that sits under it.
    var graph = draws
        .append("image")
        .classed("graph", true)
        .attr("xlink:href", function(d, i) { return d.graph; })
        .attr("height", "100%")
        .attr("width", "100%");
    
    draws.selectAll(".rangeIndicator")
        .data(ranges.filter(function (r) { return r.locid == selected_loc; }))
        .enter().append("rect")
        .classed("rangeIndicator", true)
        .attr("x", function(d, i) {return d.start*calt_graph_width;})
        .attr("width", function(d, i) { return (d.end - d.start) * calt_graph_width;})
        .attr("y", 0)
        .attr("height", calt_graph_height)
        .attr("opacity", .3)
        .attr("fill", loc_colors[selected_loc]);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}
