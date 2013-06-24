var width = 1000,
	height = 500;

var proj = d3.geo.albersUsa()
		.scale(1300)
		.translate([width / 2, height / 2]);

var path = d3.geo.path()
		.projection(proj);

var zoom = d3.behavior.zoom()
    .translate(proj.translate())
    .scale(proj.scale())
    .scaleExtent([height*.33, 4 * height])
    .on("zoom", zoom);


var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(zoom);

function zoom() {
	proj.translate(d3.event.translate).scale(d3.event.scale);
	svg.selectAll("path").attr("d", path);
	circles
  		.attr("cx", function(d){return proj([d.long, d.lat])[0];})
		.attr("cy", function(d){return proj([d.long, d.lat])[1];});
}

var borders = svg.append("g");

var radiusScale = d3.scale.pow().exponent(.5)

var colorScale = d3.scale.quantile();

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 1e-6)
    .style("background", "rgba(250,250,250,.7)");

tooltip.append("img")
	.attr("id", "tooltipImg")
	.attr("height", 200)
	.attr("width", 200)
	.style("opacity", "1");

queue()
	.defer(d3.json, "us-states.json")
	.defer(d3.csv, "simpleHOS.csv")
	.defer(d3.csv, "drg/057.csv")
	.await(ready);

function ready(error, topology, hospitals, drg){
	borders.selectAll("path")
		.data(topology.features)
	.enter()
		.append("svg:path")
		.attr("d", path)
		.attr("class", "border")

	drg.forEach(function(d){
		d.dischargeNum 	= +d.dischargeNum;
		d.avCharges 	= +d.avCharges;
		d.avPayments 	= +d.avPayments;
	});

	hosIDmap = drg.map(function(d){ return d.hosID; });
	hospitals.forEach(function(hospital){
		if (hosIDmap.indexOf(hospital.hosID) != -1){
			hospital.drg = drg[hosIDmap.indexOf(hospital.hosID)];
		}
		else{
			hospital.drg = false;
		}
	});

	radiusScale.range([1, 5])
				.domain(d3.extent(hospitals.map( function(d){ return d.drg ? d.drg.dischargeNum : undefined; } )));

	colorScale.range(["#FFFF66", "#FFFF00", "#E68000", "#D94000", "#CC0000"])
				.domain(hospitals.map( function(d){ return d.drg ? d.drg.avPayments : undefined; } ));
	colorScale.range(['blue', 'purple', 'red']);

	circles = svg.append("g").selectAll("circle")
		.data(hospitals).enter()
			.append("circle")
				.attr("cx", function(d){ return proj([d.long, d.lat])[0]; })
				.attr("cy", function(d){ return proj([d.long, d.lat])[1]; })
				.attr("r", 	function(d){ return d.drg ? radiusScale(d.drg.dischargeNum) : 0; })
				.attr("id", function(d){ return "id" + d.hosId; })
				.style("fill", function(d){ return d.drg ? colorScale(d.drg.avPayments) : 0; })
		.on("mouseover", function(d){
			d3.select(this)
				.attr("stroke", "black")
				.attr("stroke-width", 1)
				.attr("fill-opacity", 1);

			tooltip
			    .style("left", (d3.event.pageX + 5) + "px")
			    .style("top", (d3.event.pageY - 5) + "px")
			    .transition().duration(300)
			    .style("opacity", 1)
			    .style("display", "block")

			updateDetails(d);
			})
		.on("mouseout", function(d){
			d3.select(this)
				.attr("stroke", "")
				.attr("fill-opacity", function(d){return 1;})

			tooltip.transition().duration(700).style("opacity", 0);
		});

	lb = 1.370;
	metorsCF = crossfilter(metors),
		all = metorsCF.groupAll(),
		year = metorsCF.dimension(function(d){return d.year;}),
		years = year.group(function(d){return Math.floor(d/10)*10;}),
		mass = metorsCF.dimension(function(d){return d.mass}),
		masses = mass.group(function(d){ 
			var rv = Math.pow(lb, Math.floor(Math.log(d)/Math.log(lb)))
			return rv;}),
		type = metorsCF.dimension(function(d){return d.type_of_meteorite;}),
		types = type.group();

		cartoDbId = metorsCF.dimension(function(d){return d.id;});
		cartoDbIds = cartoDbId.group()

	var charts = [
		barChart()
				.dimension(year)
				.group(years)
			.x(d3.scale.linear()
				.domain([1490,2020])
				.rangeRound([-1, 20*24-5])),

		barChart()
				.dimension(mass)
				.group(masses)
			.x(d3.scale.log().base([lb])
				.domain([1,25000001])
				.rangeRound([0,20*24]))
	];

	var chart = d3.selectAll(".chart")
			.data(charts)
			.each(function(chart){chart.on("brush", renderAll).on("brushend", renderAll)});

	d3.selectAll("#total")
			.text(metorsCF.size());


	function render(method){
		d3.select(this).call(method);
	}


	lastFilterArray = [];
	metors.forEach(function(d, i){
		lastFilterArray[i] = 1;
	});

	function renderAll(){
		chart.each(render);

		var filterArray = cartoDbIds.all();
		filterArray.forEach(function(d, i){
			if (d.value != lastFilterArray[i]){
				lastFilterArray[i] = d.value;
				d3.select("#id" + d.key).transition().duration(500)
						.attr("r", d.value == 1 ? 2*radiusScale(metors[i].mass) : 0)
					.transition().delay(550).duration(500)
						.attr("r", d.value == 1 ? radiusScale(metors[i].mass) : 0);

			}
		})

		d3.select("#active").text(all.value());
	}

	window.reset = function(i){
		charts[i].filter(null);
		renderAll();
	}

	renderAll();
}


var printDetails = [
					{'var': 'name', 'print': 'Name'},
					{'var': 'type_of_meteorite', 'print': 'Type'},
					{'var': 'mass_g', 'print': 'Mass(g)'},
					{'var': 'year', 'print': 'Year'}];

function updateDetails(metor){
	var image = new Image();
	image.onload = function(){
		document.getElementById("tooltipImg").src = 'pictures/' + metor.cartodb_id + '.jpg';}
	image.src = 'pictures/' + metor.cartodb_id + '.jpg';

	tooltip.selectAll("div").remove();
	tooltip.selectAll("div").data(printDetails).enter()
		.append("div")
			.append('span')
				.text(function(d){return d.print + ": ";})				
				.attr("class", "boldDetail")
			.insert('span')
				.text(function(d){return metor[d.var];})
				.attr("class", "normalDetail");
}