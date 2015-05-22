d3.json("initial-quadratic.json", function(error, json){
    if (error) return console.warn(error);
    render_formula(json);
});

function render_formula(json){
}
