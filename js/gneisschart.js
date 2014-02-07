/*
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
```````````***`````````````***```````***```````````***````````````******```````````************``````************````
```````***********`````````***```````***``````````*****```````````**********```````************``````************````
`````***`````````***```````***```````***`````````***`***``````````***`````***``````````***```````````````````***`````
````***```````````***``````***```````***````````***```***`````````***``````***`````````***`````````````````***```````
````***```````````***``````***```````***```````***`````***````````***********``````````***```````````````***`````````
````***``````***`***```````***```````***``````*************```````*********````````````***``````````````***``````````
`````***```````****`````````***`````***``````***************``````***````***```````````***````````````***````````````
```````*************`````````*********``````***```````````***`````***`````***``````````***```````````************````
```````````***`````**```````````***````````***`````````````***````***``````***`````````***```````````************````
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
*/
var yAxisIndex;

//add prepend ability
Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

Date.setLocale('en');

//A default configuration 
//Should change to more d3esque methods e.g. http://bost.ocks.org/mike/chart/
Gneiss.defaultGneissChartConfig = {
	container: "#chartContainer", //css id of target chart container
	editable: true, // reserved for enabling or dissabling on chart editing
	legend: true, // whether or not there should be a legend
	title: "", // the chart title 
	colors: [ "00ADEF", "0A57A4", "B20838", "FF6600","65B500","889CA2","FFB800","006065","780028","AF335C","BE597A","D28CA3","DCA6B8","993900","FF6600",
	"FF9900","FFB800","003300","006600","65B500","ACD733","889CA2","A0B0B5","B8C4C7","CFD7DA", "000000"],
	bargrid: {
		barHeight: 30,
		barSpacing: 2,
		gutterSpacing: 20,
		longestValue: 0
	},
	state: {
		hasTitle: false,
		hasLegend: false,
		hasYLabel: false,
		hasXLabel: false,
		hasMultiBargrids: false
	},
	padding :{
		top: 20,
		bottom: 0,
		left: 20,
		right: 20,
		legend: 14,
		title: 20,
		source: 20,
		meta: 20,
		yLabel: 26,
		xLabel: 15,
		xAxis: 36,
		bargrid: 14
	},
	xAxis: {
		label: "",
		domain: [0,100],
		prefix: "",
		suffix: "",
		type: "linear",
		formatter: null,
		mixed: true,
		ticks: 5
	},
	yAxis: [
		{
			domain: [null,null],
			tickValues: null,
			prefix: {
				value: "",
				use: "top" //can be "top" "all" "positive" or "negative"
			},
			suffix: {
				value: "",
				use: "top"
			},
			ticks: 4,
			formatter: null,
			color: null
		}
	],
	series: [
		{
			name: "Revenue",
			data: [ 65.50, 60.20, 68.30, 73.80, 77.30 ],
			source: "",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Net Income",
			data: [ 20.60, 18.20, 19.60, 24.20, 18.80 ],
			source: "",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Free Cash Flow",
			data: [ 22.20, 20.10, 22.20, 30.30, 35.10 ],
			source: "",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Area Data",
			data: [ 12.20, 30.10, 21.20, 31.30, 34.10 ],
			source: "",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Stacked Area Data",
			data: [ 14.20, 56.10, 64.20, 21.30, 34.10 ],
			source: "",
			type: "line",
			axis: 0,
			color: null
		}
	],
	xAxisRef: [
		{
			name: "Years",
			data: ["1", "2", "3", "4", "5"]
		}
	],
	sourceline: "",
	creditline: ""
};

Gneiss.dateParsers = {
	"mm/dd/yy": function(d) { return [d.getMonth() + 1, d.getDate(), String(d.getFullYear()).split("").splice(2,2).join("")].join("/"); },
  	"mm/dd/yyyy": function(d) { return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("/"); },
  	"month":function(d) { 
  		var month = d.getMonth() + 1;
  		if (month === 1){
  			return [d.format('{Month}'), String(d.getFullYear()).split("").splice(2,2).join("")].join(" '");
  		}
  		else {
  			return String(d.format('{Month}')); 
  		}
  	},
  	"month(abbr)":function(d) { 
  		var month = d.getMonth() + 1;
  		if (month === 1){
  			return [String(d.format('{Month}')).slice(0,3), String(d.getFullYear()).split("").splice(2,2).join("")].join(" '");
  		}
  		else {
  			return String(d.format('{Month}')).slice(0,3); 
  		}
  	},
  	"month 'yy":function(d) { return [d.format('{Month}'), String(d.getFullYear()).split("").splice(2,2).join("")].join(" '"); },
  	"month(abbr) 'yy":function(d) { return [String(d.format('{Month}')).slice(0,3), String(d.getFullYear()).split("").splice(2,2).join("")].join(" '"); },
  	"year":function(d) { return d.getFullYear(); }
};
//   //"ddmmyyyy": function(d) { return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join("/"); },
//   "mmdd": function(d) { return [d.getMonth() + 1, d.getDate()].join("/"); },
//   "Mdd": function(d) {
//     var month = d.getMonth() + 1;
//     if(month == 5) {
//       return d.format('{Mon}') + " " + d.getDate();
//     } 
//     else { 
//       return d.format('{Mon}.') + " " + d.getDate();
//     }
//   },
//   "ddM": function(d) {
//     var month = d.getMonth() + 1;
//     if(month == 5) {
//       return "" + d.getDate() + " " + d.format('{Mon}');
//     } 
//     else { 
//       return "" + d.getDate() + " " + d.format('{Mon}.');
//     }
//   },
//   "mmyy": function(d) { return [d.getMonth() + 1, String(d.getFullYear()).split("").splice(2,2).join("")].join("/"); },
//   "yy": function(d) { return "’" + String(d.getFullYear()).split("").splice(2,2).join(""); },
//   "yyyy": function(d) { return "" + d.getFullYear(); },
//   "MM": function(d) {
//     var month = d.getMonth() + 1;
//     if(month == 1) {
//       return "" + d.getFullYear();
//     }
//     else {
//       return d.format('{Month}');
//     }
//   },
//   "M": function(d) {	
//     var month = d.getMonth() + 1;
//     if(month == 1) {
//       return "’" + String(d.getFullYear()).split("").splice(2,2).join("");
//     } 
//     else if(month == 5) {
//       return d.format('{Mon}');
//     }
//     else {
//       return d.format('{Mon}.');
//     }
//   },
//   "hmm": function(d) {
//     if(Date.getLocale().code == 'en') {
//       return d.format('{12hr}:{mm}');
//     } else {
//       return d.format('{24hr}:{mm}');
//     }
//   }
// };

Gneiss.helper = {
  multiextent: function(a, key) {
    // Find the min and max values of multiple arrays
    var data = [];
    var ext;
    
    for (var i = a.length - 1; i >= 0; i--) {
      ext = d3.extent(key ? key(a[i]) : a[i]);
      data.push(ext[0]);
      data.push(ext[1]);
    }
    
    return d3.extent(data);
  },
  columnXandHeight: function(d, domain) {
    //a function to find the proper value to cut off a column
    if(d > 0 && domain[0] > 0) {
      return domain[0];
    }
    else if (d < 0 && domain[1] < 0) {
      return domain[1];
    }			
    return 0;
  },
  exactTicks: function(domain,numticks) {
    numticks -= 1;
    var ticks = [];
    var delta = domain[1] - domain[0];
    for (var i=0; i < numticks; i++) {
      ticks.push(domain[0] + (delta/numticks)*i);
    };
    ticks.push(domain[1]);
    
    if(domain[1]*domain[0] < 0) {
      //if the domain crosses zero, make sure there is a zero line
      var hasZero = false;
      for (var i = ticks.length - 1; i >= 0; i--) {
        //check if there is already a zero line
        if(ticks[i] == 0) {
          hasZero = true;
        }
      };
      if(!hasZero) {
        ticks.push(0);
      }
    }
    
    return ticks;
  },  
  transformCoordOf: function(elem){
    var separator = elem.attr("transform").indexOf(",") > -1 ? "," : " ";
    var trans = elem.attr("transform").split(separator);
    return { x: (trans[0] ? parseFloat(trans[0].split("(")[1]) : 0), y: (trans[1] ? parseFloat(trans[1].split(")")[0] ): 0) };
  }
};

function Gneiss(config)
{ 	
	var containerElement;
	var defaultPadding;
	var containerId;
	var seriesByType;
	var width;
	var height;
	var isBargrid;
	
	this.containerId = function Gneiss$containerId(elem) {
		if (!arguments.length) {
			return containerId;
		}
		containerId = elem;
	};
	
	this.containerElement = function Gneiss$containerElement(elem) {
		if (!arguments.length) {
			return containerElement;
		}
		containerElement = elem;
	};
	
	this.defaultPadding = function Gneiss$defaultPadding(padding) {
		if (!arguments.length) {
			return defaultPadding;
		}
		defaultPadding = padding;
	};
	
	this.width = function Gneiss$width(w) {
		if (!arguments.length) {
			return width;
		}
		width = w;
	};
	
	this.height = function Gneiss$height(h) {
		if (!arguments.length) {
			return height;
		}
		height = h;
	};
	
	this.seriesByType = function Gneiss$seriesByType(sbt) {
		if (!arguments.length) {
			return seriesByType;
		}
		seriesByType = sbt;
	};
	
	this.isBargrid = function Gneiss$isBargrid(b) {
		if (!arguments.length) {
			return isBargrid;
		}
		isBargrid = b;
	};

	this.updatedStackedData = function Gneiss$updatedStackedData(b) {
		if (!arguments.length) {
			return updatedStackedData;
		}
		updatedStackedData = b;
	};

	this.getStackedAreaData = function Gneiss$getStackedAreaData(){
		// var datapoints = [],
		// 	g = this;

		// d3.selectAll('.seriesStackedArea').selectAll('text').each(function(){
		// 	var el = d3.select(this)[0][0];
		// 	extremes.push( parseFloat( el.getBoundingClientRect().width ) )
		// });

		// return d3.extent(extremes)[1]; 
	};
	
	this.build = function Gneiss$build(config) {
		/*
			Initializes the chart from a config object
		*/
		
		if(!config) {
			throw new Error("build() must be called with a chart configuration");
		}
		
		$.extend(this, config);
		var g = this;
		 
		// Set container as a jQuery object wrapping the DOM element specified in the config
		if(!config.container) {
			throw new Error("build() must be called with a chart configuration with a 'container' property");
		}
		
		g.containerId(config.container);
		g.containerElement($(g.containerId()));
				
		g.defaultPadding($.extend({}, config.padding)); // deep copy the padding configuration
		
		//append svg to container using svg
		g.chart = d3.select(g.containerId()).append("svg")
			.attr("id","chart")
			.attr("width","100%") //set width to 100%
			.attr("height","100%"); //set height to 100%
			
		g.width(g.containerElement().width()); //save the width in pixels
		g.height(g.containerElement().height()); //save the height in pixels
		
		//add rect, use as a background to prevent transparency
		g.chart.append("rect")
			.attr("id","ground")
			.attr("width", g.width())
			.attr("height", g.height())
			.attr("fill","#FFFFFF");  //background color of graph
		
		
		//group the series by their type
		g.seriesByType(this.splitSeriesByType(g.series));
		this.updateGraphPropertiesBasedOnSeriesType(g, g.seriesByType());
		
		var titleContainer = g.chart.append("g")
			.attr("id","titleContainer")
			.attr("width", g.width())
			.attr("height", g.height())
			.attr("transform","translate(0,0)");

		titleContainer.append("rect")
			.attr("id", "titleBackground")
			.attr("width", g.width())
			.attr("height", g.padding.title)
			.attr("fill", "#666")
			.attr("fill-opacity", "0");

		g.titleLine = titleContainer.append("text")
			.attr("y",13)
			.attr("x", g.padding.left)
			.attr("id","titleLine")
			.attr("fill", "#FFF")
			.text(g.title);
		
		this.calculateColumnWidths()
			.setYScales(true)
			.setXScales(true)
			.setYAxes(true)
			.setXAxis(true);
		this.drawSeriesAndLegend(true);


		return this;
	};
  
	this.numberFormat = d3.format(",");
  
	this.resize = function Gneiss$resize(){
		/*
			Adjusts the size dependent stored variables
		*/
		var g = this;
    
		// Save the width and height in pixels
		g.width(g.containerElement().width());
		g.height(g.containerElement().height());
    
		// Insert a background rectangle to prevent transparency
		d3.select("rect#ground")
			.attr("width", g.width())
			.attr("height", g.height());
      
		
		return this;
	};
  
  this.setYScales = function Gneiss$setYScales(first) {
		// var g = this,
		// 	axisIndex = 0,
		// 	dataValues = [],
		// 	dataValues2 = [],
		// 	extremes = [],
		// 	ex;

		// if ( !g.isBargrid() ){
					
		// 	// grab all of the data values and store them in an array
		// 	// and if one data series is being plotted on the right axis, store those values in a separate array
		// 	for ( var i = 0; i < g.series.length; i++ ){
		// 		for ( var j = 0; j < g.series[i].data.length; j++ ){
		// 			dataValues.push( g.series[i].data[j] ); 
		// 			if (g.series[i].axis === 1){
		// 				dataValues2.push( g.series[i].data[j] );
		// 			}
		// 		}
		// 	}

		// 	if ( g.yAxis[1] !== undefined ){
		// 		g.yAxis[1].domain = d3.extent(dataValues2);
		// 		g.yAxis[1].range = [ g.height() - g.padding.bottom, g.padding.top ];
		// 		g.yAxis[1].scale = d3.scale.linear()
		// 			.domain(g.yAxis[1].domain)
		// 			.range(g.yAxis[1].range).nice();
		// 	}

		// 	g.yAxis[0].domain = d3.extent(dataValues);
		// 	g.yAxis[0].range = [ g.height() - g.padding.bottom, g.padding.top ];
		// 	g.yAxis[0].scale = d3.scale.linear()
		// 			.domain(g.yAxis[0].domain)
		// 			.range(g.yAxis[0].range).nice();
		// }

		// else {
		// 	for (var i = g.yAxis.length - 1; i >= 0; i--){
		// 		g.yAxis[i].domain[0] = Math.min(g.yAxis[i].domain[0],0);
		// 		g.yAxis[i].scale.range([
		// 			g.padding.left,
		// 			(g.width() / g.seriesByType().bargrid.length) - g.padding.right
		// 			]).nice();				
		// 	};
		// }

		/*
			calculates and saves the y-scales from the existing data
		*/
		var g = this;
		/*
		*
		* Y AXIS SECTION
		*
		*/	
		//calculate number of yaxes and their maxes and mins
		var axisIndex = 0;
		var extremes = [];
		var ex;
		for (var i = g.series.length - 1; i >= 0; i--){
			
			//CHANGE if there is no axis set to 0
			if(!g.series[i].axis) {
				g.series[i].axis = 0;
			}
					
			axisIndex = g.series[i].axis;
			
			//CHANGE check if there are any extremes for the current axis
			if(extremes[axisIndex] === undefined) {
				extremes[axisIndex] = [];
			}			
			
			if(g.yAxis[axisIndex] === undefined) {
				console.error(g.series[i].name + " ["+i+"] is associated with axis " + axisIndex + ", but that axis does not exist");
			}
			
			//calculate extremes of current series and add them to extremes array
			e = d3.extent(g.series[i].data);

			extremes[axisIndex].push(Math.floor(e[0]));
			extremes[axisIndex].push(Math.ceil(e[1]));
		};
		
		for (var i = extremes.length - 1; i >= 0; i--){
			var ex = d3.extent(extremes[i]),
				axis;

			g.yAxis[i].domain[0] = ex[0];
			g.yAxis[i].domain[1] = ex[1];

			// apply min/max for the left y axis if there are any
			if (i===0){
				if ( $("#left_axis_min").val() !== "" ){
					g.yAxis[i].domain[0] = $("#left_axis_min").val();
				}
				if ( $("#left_axis_max").val() !== "" ){
					g.yAxis[i].domain[1] = $("#left_axis_max").val();
				}
			}

			// apply min/max for the right y axis if there are any
			if (i===1){
				if ( $("#right_axis_min").val() !== "" ){
					g.yAxis[i].domain[0] = $("#right_axis_min").val();
				}
				if ( $("#right_axis_max").val() !== "" ){
					g.yAxis[i].domain[1] = $("#right_axis_max").val();
				}
			}

			for (var i = extremes.length - 1; i >= 0; i--){
				var ex = d3.extent(extremes[i])
				if(g.yAxis[i].domain[0] == null) {
					g.yAxis[i].domain[0] = ex[0];
				}
				
				if(g.yAxis[i].domain[1]  == null) {
					g.yAxis[i].domain[1] = ex[1];
				}
			};
		};
		
		//set extremes in y axis objects and create scales
		for (var i = g.yAxis.length - 1; i >= 0; i--) {
			//g.yAxis[i].domain = d3.extent(extremes[i])
			if(first || !g.yAxis[i].scale) {
				g.yAxis[i].scale = d3.scale.linear()
					.domain(g.yAxis[i].domain);
			}
			else {
				//set extremes in y axis objects and update scales
				//g.yAxis[i].domain = d3.extent(g.yAxis[i].domain);  //BWW - Removed because it was inverting the min/max axis value
				g.yAxis[i].scale.domain(g.yAxis[i].domain);
			}	
		};		
		
		if(g.isBargrid()) {
			var sets = g.splitSeriesByType(g.series).bargrid,
				numSets = sets.length,
				gutters = Math.ceil((numSets - 1) * g.bargrid.gutterSpacing),
				longestXValue = Math.ceil(this.getLongestXValue()),
				spaceAfterXValue = 10,
				largestYValue = 0,
				values,
				spaceBeforeValues = 3 * numSets,
				currentYValue,
				startingPosition = Math.ceil( g.padding.left + longestXValue + spaceAfterXValue ),
				chartingWidth = Math.floor(g.width() - g.padding.left - g.padding.right - Math.ceil(longestXValue) - spaceAfterXValue);
			
			// find the largest Y Value (used to set the domain for the y axis)
			for ( var i = 0; i < numSets; i++ ){
				for ( var j = 0; j < sets[i].data.length; j++ ){
					currentYValue = sets[i].data[j];
					largestYValue = (currentYValue > largestYValue) ? currentYValue : largestYValue;
				}
			}

			// if prefixes and suffixes are applied to the topmost data value
			if ( g.yAxis[0].prefix.use === "top" ){
				var valueSizes = [];

				for ( var i = 0; sets[i]; i++ ){
					d3.selectAll(".seriesColumn").selectAll("text").each(function(d,index){
						if (index === 0){
							d3.select(this).text( g.yAxis[0].prefix.value + sets[i].data[index] + g.yAxis[0].suffix.value );
						}
						else {
							d3.select(this).text( sets[i].data[index] );
						}
						valueSizes.push( Math.ceil( d3.select(this)[0][0].getBoundingClientRect().width ));
					});
				}
				g.bargrid.longestValue = d3.extent(valueSizes)[1];
				values = g.bargrid.longestValue * numSets;
			}

			g.yAxis[0].domain[0] = Math.min(g.yAxis[0].domain[0],0);
			g.yAxis[0].domain[1] = largestYValue;
			g.yAxis[0].scale.domain(g.yAxis[0].domain);
			g.yAxis[0].range = [ Math.floor(startingPosition), Math.floor(startingPosition) + Math.floor(( chartingWidth - values - gutters - spaceBeforeValues) / numSets )];
			g.yAxis[0].scale.range( g.yAxis[0].range );
		}
		else {
			for (var i = g.yAxis.length - 1; i >= 0; i--){
				
				if ( d3.select("#metaInfo")[0][0] !== null ){
					g.yAxis.range = [g.height() - g.padding.xAxis - g.padding.meta - 20, g.padding.top];
				}
				else {
					g.yAxis.range = [g.height() - g.padding.xAxis - 20, g.padding.top];
				}
				g.yAxis[i].scale.range(g.yAxis.range);
			};
		}

		//rangeArray = [ g.padding.top, g.height() - g.padding.bottom ]
		
		return this;
	};
  
  this.setXScales = function Gneiss$setXScales(first) {
		/*
			calculate and store the x-scales
		*/
		var g = this;
		var dateExtent;
		var shortestPeriod = Infinity;
		
		if(first) {
			//create x scales
			
			/*
			*
			* X AXIS SECTION
			*
			*/

			//calculate extremes of axis
			if(g.xAxis.type == "date") {
				dateExtent = d3.extent(g.xAxisRef[0].data);
				g.xAxis.scale = d3.time.scale()
					//.domain(Gneiss.multiextent(g.series,function(d){return d.data}))
					.domain(dateExtent)
				
				//calculate smallest gap between two dates
				for (var i = g.xAxisRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(g.xAxisRef[0].data[i] - g.xAxisRef[0].data[i+1]))
				}
				
				g.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {
				//calculate longest series and store series names
				var maxLength = 0;
				for (var i = g.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, g.series[i].data.length)
				};
				g.xAxis.scale = d3.scale.ordinal()
					.domain(g.xAxisRef[0].data)
					
				g.maxLength = maxLength;
			}
			
		}
		else {
			//update the existing scales

			//calculate extremes of axis
			if(g.xAxis.type == "date") {
				dateExtent = d3.extent(g.xAxisRef[0].data);
				g.xAxis.scale = d3.time.scale()
					//.domain(Gneiss.multiextent(g.series,function(d){return d.data}))
					.domain(dateExtent)

				//calculate smallest gap between two dates
				for (var i = g.xAxisRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(g.xAxisRef[0].data[i] - g.xAxisRef[0].data[i+1]))
				}
				
				g.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {
				//calculate longest series
				var maxLength = 0;
				for (var i = g.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, g.series[i].data.length)
				};
				g.xAxis.scale = d3.scale.ordinal().domain(g.xAxisRef[0].data)
				
				g.maxLength = maxLength;
			}
		}
		var rangeArray = [],
			longestYValue;

		// if isBargrid evaluates to false
		if ( !g.isBargrid() ){

			longestYValue = this.getLongestYValue();

			
			// if there is more than 1 y axis
			if ( g.yAxis.length > 1 ){

				// if some of the data is being presented as a bar chart
				if (g.xAxis.hasColumns){
					rangeArray = [ longestYValue + ( g.padding.left * 2 ) + (g.columns.columnGroupWidth / 2), g.width() - longestYValue - (g.padding.right * 2) - (g.columns.columnGroupWidth / 2) ];
				}

				else {
					rangeArray = [ longestYValue + ( g.padding.left * 2 ), g.width() - longestYValue - (g.padding.right * 2) ];
				}

				// add the range to chart object as a property
				g.xAxis.range = rangeArray;
			}

			// if there is only 1 y axis
			else {
				
				// if some of the data is being presented as a bar chart
				if (g.xAxis.hasColumns){
					rangeArray = [ longestYValue + ( g.padding.left * 2 ) + (g.columns.columnGroupWidth / 2), g.width() - g.padding.right - (g.columns.columnGroupWidth / 2) ]; 
				}

				else {
					rangeArray = [ longestYValue + ( g.padding.left * 2 ), g.width() - g.padding.right ]; 
				}
				
				// add the range to chart object as a property
				g.xAxis.range = rangeArray;
			}
		}
		
		// if isBargrid evaluates to true
		else {
			var numSets = g.series[0].data.length;
			rangeArray = [ g.padding.top, g.padding.top + (numSets * g.bargrid.barHeight) + ((numSets - 1) * g.bargrid.barSpacing) - g.bargrid.barHeight  ];
		}
		
		// set the scale using the ranges calculated
		if ( g.xAxis.type === "date" ) {
			g.xAxis.scale.range(rangeArray);
		}

		else {
			g.xAxis.scale.rangePoints(rangeArray);
		}
		
		return this;		
	};

	this.getLongestDataValue = function Gneiss$getLongestDataValue(){
		var extremes = [],
			g = this;

		d3.selectAll('.seriesColumn').selectAll('text').each(function(){
			var el = d3.select(this)[0][0];
			extremes.push( parseFloat( el.getBoundingClientRect().width ) )
		});

		return d3.extent(extremes)[1]; 
	};

	this.getLongestYValue = function Gneiss$getLongestYValue(){
		var extremes = [],
			g=this;

		d3.selectAll('.yAxis').selectAll('text').each(function(){
			var el = d3.select(this)[0][0];
			extremes.push( parseFloat(el.getBoundingClientRect().width) )
		});

		return g.isBargrid() ? d3.extent(extremes)[1]+18 : d3.extent(extremes)[1]; 
	};	

	this.getLongestXValue = function Gneiss$getLongestXValue(){
		var extremes = [];

		d3.selectAll('#xAxis').selectAll('g').selectAll('text').each(function(){
			var el = d3.select(this)[0][0];
			extremes.push( parseFloat( el.getBoundingClientRect().width ))
		});

		return d3.extent(extremes)[1]; 
	};
  
  this.setLineMakers = function Gneiss$setLineMakers(first) {
		var g = this;

		for (var i = g.yAxis.length - 1; i >= 0; i--){
			if(first || !g.yAxis[i].line) {
						g.yAxis[i].line = d3.svg.line();
						g.yAxis[i].line.y(function(d,j){return d||d===0?g.yAxis[yAxisIndex].scale(d):null})
						g.yAxis[i].line.x(function(d,j){return d||d===0?g.xAxis.scale(g.xAxisRef[0].data[j]):null})
			}
			else {
				for (var i = g.yAxis.length - 1; i >= 0; i--){
					g.yAxis[i].line.y(function(d,j){return d||d===0?g.yAxis[yAxisIndex].scale(d):null})
					g.yAxis[i].line.x(function(d,j){return d||d===0?g.xAxis.scale(g.xAxisRef[0].data[j]):null})
				};
			}

		}
		return this;
	};
  
  this.setYAxes = function Gneiss$setYAxes(first) {
		/*
		*
		* Y-Axis Drawing Section
		*
		*/
		var g = this;
		var curAxis;
		var axisGroup;

		
		//CHANGE
		if(g.yAxis.length == 1 ){
			d3.select("#rightAxis").remove()
		}

		for (var i = g.yAxis.length - 1; i >= 0; i--){
			curAxis = g.yAxis[i]
			
			//create svg axis
			if(first || !g.yAxis[i].axis) {	
				g.yAxis[i].axis = d3.svg.axis()
					.scale(g.yAxis[i].scale)
					.orient(i==0?"right":"left")
					.tickSize(40) //Length of y-axis tick size
					//.ticks(g.yAxis[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis[i].tickValues?g.yAxis[i].tickValues:Gneiss.helper.exactTicks(g.yAxis[i].scale.domain(),g.yAxis[0].ticks))
					
				//append axis container

				axisGroup = g.chart.append("g")
					.attr("class","axis yAxis")
					.attr("id",i==0?"leftAxis":"rightAxis")
					.attr("transform",i==0?"translate("+g.padding.left+",0)":"translate("+( g.width()-g.padding.right)+",0)")
					.attr("fill", "none") //Background color for y axis
					.call(g.yAxis[i].axis)
			}
			else {
				g.yAxis[i].axis//.ticks(g.yAxis[0].ticks) // I'm not using built in ticks because it is too opinionated
					.tickValues(g.yAxis[i].tickValues?g.yAxis[i].tickValues:Gneiss.helper.exactTicks(g.yAxis[i].scale.domain(),g.yAxis[0].ticks))
					
				axisGroup = g.chart.selectAll(i==0?"#leftAxis":"#rightAxis")
					.call(g.yAxis[i].axis)
				
			}
				
			//adjust label position and add prefix and suffix
			var topAxisLabel, minY = Infinity;
			
			this.customYAxisFormat(axisGroup, i);
			
			
			axisGroup
				.selectAll("g")
				.each(function(d,j) {
					//create an object to store axisItem info
					var axisItem = {}
					
					//store the position of the axisItem
					//(figure it out by parsing the transfrom attribute)
					axisItem.y = parseFloat(d3.select(this)
						.attr("transform")
							.split(")")[0]
								.split(",")[1]
						)
					
					//store the text element of the axisItem
					axisItem.text = d3.select(this).select("text")
						//.attr("stroke","#000000")  //color for Y axis text

					//store the line element of the axisItem	
					axisItem.line = d3.select(this).select("line")
						.attr("stroke","#E6E6E6")
						
					
					//apply the prefix as appropriate
					switch(curAxis.prefix.use) {
						case "all":
							//if the prefix is supposed to be on every axisItem label, put it there
							axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
						break;
						
						case "positive":
							//if the prefix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "negative":
							//if the prefix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "top":
							//do nothing
						break;
					}
					
					//apply the suffix as appropriate
					switch(curAxis.suffix.use) {
						case "all":
							//if the suffix is supposed to be on every axisItem label, put it there
							axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
						break;

						case "positive":
							//if the suffix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "negative":
							//if the suffix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "top":
							//do nothing
						break;
					}
					
					//find the top most axisItem
					//store its text element
					if(axisItem.y < minY) {
						topAxisLabel = axisItem.text
						g.topAxisItem = axisItem
						minY = axisItem.y
					}
					
					
					if(parseFloat(axisItem.text.text()) == 0) {
						if(d == 0) {
							//if the axisItem represents the zero line
							//change it's class and make sure there's no decimal
							//axisItem.line.attr("stroke","#666666")
							d3.select(this).classed("zero", true)
							axisItem.text.text("0")
							axisItem.line.attr("x2","1000") // the zero line length
						}
						else {
							// A non-zero value was rounded into a zero
							// hide the whole group
							d3.select(this).style("display","none");
						}
						
					}
				})
				
			//add the prefix and suffix to the top most label as appropriate
			if(curAxis.suffix.use == "top" && curAxis.prefix.use == "top") {
				//both preifx and suffix should be added to the top most label
				if(topAxisLabel) {
					topAxisLabel.text(g.yAxis[i].prefix.value + topAxisLabel.text() + g.yAxis[i].suffix.value)
				}
				else {
					
				}
				
			}
			else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + g.yAxis[i].suffix.value)
			}
			else if(curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(g.yAxis[i].prefix.value + topAxisLabel.text())
			}
			
		};

		if ( g.isBargrid() ){
			d3.selectAll(".yAxis").style("display","none");
		}
		else {
			d3.selectAll(".yAxis").style("display","");
		}

		
		d3.selectAll(".yAxis").each(function(){this.parentNode.prependChild(this);})
		d3.selectAll("#ground").each(function(){this.parentNode.prependChild(this);})
		
		return this;
	};
  
	this.customYAxisFormat = function Gneiss$customYAxisFormat(axisGroup, i) {
		axisGroup.selectAll("g")
			.each(function(d,j) {
				//create an object to store axisItem info
				var axisItem = {}
				
				//store the position of the axisItem
				//(figure it out by parsing the transfrom attribute)
				axisItem.y = parseFloat(d3.select(this)
					.attr("transform")
						.split(")")[0]
							.split(",")[1]
					)
				
				//store the text element of the axisItem
				//align the text right position it on top of the line
				axisItem.text = d3.select(this).select("text")
					.attr("text-anchor",i==0?"start":"end")
					.attr("fill", "#666666")  //y-axis text color
					.attr("x", 0)
					.attr("y", 11)
				});
	};
  
  this.createYLabel = function Gneiss$createYLabel( i ) {
		var g = this;

		if ( g.labelContainer === undefined ) {
			
			// append label container
			g.labelContainer = g.chart.append("g")
				.attr("id", "yLabelContainer")
				.attr("class", "yLabel")
				.attr("transform", "translate(" + g.padding.left + "," + g.padding.top + ")");

			var yPathData = [ { "x": 0, "y": 0 },  { "x": g.width() - g.padding.left - g.padding.right,  "y": 0 } ];
			
			var lineFunction = d3.svg.line()
	            .x(function(d) { return d.x; })
	            .y(function(d) { return d.y; })
	        	.interpolate("linear");

			g.labelContainer.append("path")
				.attr("class", "yLabelLine")
				.attr("d", lineFunction(yPathData))
	    		.attr("stroke", "#E6E6E6");
	    }

		g.labelContainer.append("text")
			.attr("id", i===0 ? "leftYLabel" : "rightYLabel")
			.attr("text-anchor", i===0 ? "start" : "end")
			.attr("fill", "#AAA")
			.attr("y", 0)
			.attr("x", i===0 ? 0 : g.width() - g.padding.left - g.padding.right)
			.text(g.yAxis[i].label);

		g.yAxis[i].label = "";	
	};

  this.setXAxis = function Gneiss$setXAxis(first) {
		var g = this;
    
		if(first) {
			/*
			*
			* X-Axis Drawing Section
			*
			*/
			// set the formatter property back to null if the x axis type isn't date
			if ( g.xAxis.type !== "date" ){
				g.xAxis.formatter = null;
			}

			g.xAxis.axis = d3.svg.axis()
				.scale(g.xAxis.scale)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickFormat(g.xAxis.formatter ? Gneiss.dateParsers[g.xAxis.formatter] : function(d) {return d})
				.ticks(g.xAxis.ticks); 
				
			// if(g.xAxis.type == "date") {
				
			// 	switch(g.xAxis.formatter) {
			// 	   // "mmddyyyy":
			// 	   // "mmdd"
			// 		case "yy":
			// 			g.xAxis.axis.ticks(d3.time.years,1)
			// 		break;
					
			// 		case "yyyy":
			// 			g.xAxis.axis.ticks(d3.time.years,1)
			// 		break;
					
			// 		case "MM":
			// 			g.xAxis.axis.ticks(d3.time.months,1)
			// 		break;
					
			// 		case "M":
			// 			g.xAxis.axis.ticks(d3.time.months,1)
			// 		break;
			// 	   // "hmm"

			// 		case "YY":
			// 			g.xAxis.axis.ticks(d3.time.years,1)
			// 		break;
			// 	}
			// }
				
			var xAxis = g.chart.append("g")
				.attr("class",'axis')
				.attr("id","xAxis")
				.call(g.xAxis.axis);
	  		
	  		if ( d3.select("#metaInfo")[0][0] === null ){
				xAxis.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.xAxis) +")")
			}
			else {
				xAxis.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.xAxis - g.padding.meta) +")")
			}


			// the charts that aren't bargrids require special svg elements
			// they are added in and positioned here
			if ( !g.isBargrid() ){
				
				var xPathData = [ { "x": 0, "y": 0 },  { "x": g.width(),  "y": 0 } ],
					lineFunction = d3.svg.line()
			            .x(function(d) { return d.x; })
			            .y(function(d) { return d.y; })
			        	.interpolate("linear");

			    xAxis.append("path")
					.attr("class", "xLabelLine")
					.attr("d", lineFunction(xPathData))
		    		.attr("stroke", "#AAA");
				
				
				d3.select("#xAxis").insert("rect", "g")
		    		.attr("id", "xBackground")
					.attr("width", g.width())
					.attr("height", Math.abs(g.padding.xAxis))
					.attr("fill", "#F5F5F5")  //background color of x axis
					.attr("transform", "translate(0,0)");
			}
		}

		// if this isn't the first time through
		else {

			// need to remove the elements that were created before for non-bargrid charts
			if ( g.isBargrid() ){
				d3.select(".xLabelLine").remove();
				// d3.select(".xSourceLine").remove();
				d3.select("#xLabel").remove();
				if (chart.state.hasXLabel === true){
					chart.state.hasXLabel = false;
					chart.padding.xAxis -= chart.padding.xLabel;
					d3.select("#xBackground").attr("height", Math.abs(chart.padding.xAxis));
					chart.xAxis.label = "";
					$("#x_axis_label").val("");
				}
				d3.select("#xBackground").remove();
			}

			// check if the required svg elements for all charts but the bargrid exist
			// if not, we need to add them all back in
			if ( !g.isBargrid() ){

				if (d3.select("#xBackground")[0][0] === null) {
					var xAxis = d3.select("#xAxis"),
						xPathData = [ { "x": 0, "y": 0 },  { "x": g.width(),  "y": 0 } ],
						lineFunction = d3.svg.line()
				            .x(function(d) { return d.x; })
				            .y(function(d) { return d.y; })
				        	.interpolate("linear");

				    d3.select(".xLabelLine").remove();

					xAxis.append("path")
						.attr("class", "xLabelLine")
						.attr("d", lineFunction(xPathData))
			    		.attr("stroke", "#AAA");

					d3.select("#xAxis").insert("rect", "g")
			    		.attr("id", "xBackground")
						.attr("width", g.width())
						.attr("height", Math.abs(g.padding.xAxis))
						.attr("fill", "#F5F5F5")
						.attr("transform", "translate(0,0)");
				}
			}

			// set the formatter property back to null if the x axis type isn't date
			if ( g.xAxis.type !== "date" ){
				g.xAxis.formatter = null;
			}
				g.xAxis.axis.scale(g.xAxis.scale)
				.tickFormat(g.xAxis.formatter ? Gneiss.dateParsers[g.xAxis.formatter] : function(d) { return d; })
				.ticks(g.xAxis.ticks)
				.orient(g.isBargrid() ? "left" : "bottom")
				.tickPadding(4)  //padding for xaxis tick value to the bottom of the tick 
				.tickSize(g.isBargrid() ? 0 : 6);
			
				
			
			// if(g.xAxis.type == "date") {
			// 	var timeSpan = g.xAxis.scale.domain()[1]-g.xAxis.scale.domain()[0],
			// 	months = timeSpan/2592000000,
			// 	years = timeSpan/31536000000;
				
			// 	if(years > 20) {
			// 		yearGap = 5;
			// 	}
			// 	else {
			// 		yearGap = 1;
			// 	}
			// 	switch(g.xAxis.formatter) {
			// 	   // "mmddyyyy":
			// 	   // "mmdd"
			// 		case "yy":
			// 			g.xAxis.axis.ticks(d3.time.years,yearGap)
			// 		break;
					
			// 		case "yyyy":
			// 			g.xAxis.axis.ticks(d3.time.years,yearGap)
			// 		break;
					
			// 		case "MM":
			// 			g.xAxis.axis.ticks(d3.time.months,1)
			// 		break;
					
			// 		case "M":
			// 			g.xAxis.axis.ticks(d3.time.months,1)
			// 		break;
			// 	   // "hmm"

			// 		case "YY":
			// 			g.xAxis.axis.ticks(d3.time.years,1)
			// 		break;
			// 	}
			// }
			
			if ( d3.select("#metaInfo")[0][0] === null ){
				g.chart.selectAll("#xAxis")
					.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.xAxis) +")")
					.call(g.xAxis.axis);
			}
			else {
				g.chart.selectAll("#xAxis")
					.attr("transform",g.isBargrid() ? "translate(" + g.padding.left + ",0)" : "translate(0," + (g.height() - g.padding.xAxis - g.padding.meta) +")")
					.call(g.xAxis.axis);
			}

		}
		
		g.chart.selectAll("#xAxis g text")
			.attr("text-anchor", g.xAxis.type == "date" ? (g.seriesByType().column.length>0 && g.seriesByType().line.length == 0 && g.seriesByType().scatter.length == 0 ? "middle":"middle"): (g.isBargrid() ? "end":"middle"))  //BWW Changed so that the xaxis text will line in the middle with the tick mark
			//.attr("text-anchor", g.isBargrid ? "end":"middle")
			.each(function() {
				var pwidth = this.parentNode.getBoundingClientRect().width;
				var attr = this.parentNode.getAttribute("transform");
				var attrx = Number(attr.split("(")[1].split(",")[0]);
				var attry = Number(attr.split(")")[0].split(",")[1]);
				var counter = 0;

				
				if(!g.isBargrid()) {
					// fix labels to not fall off edge when not bargrid
					if ( (pwidth / 2) + attrx >  g.width() - g.padding.right) {
						this.setAttribute("x",Number(this.getAttribute("x"))-(pwidth + attrx -  g.width() + g.padding.right))
						this.setAttribute("text-anchor","start")
					}
					else if (attrx - pwidth/2 < g.padding.left) {
						this.setAttribute("x",Number(this.getAttribute("x")) - g.getLongestYValue())
						this.setAttribute("text-anchor","start")
					}
					g.padding.left = g.defaultPadding().left
				}
				
				else {
					
					d3.select(this)
					.attr("x", g.getLongestXValue())
					.attr("y", g.state.hasLegend ? (g.bargrid.barHeight - ((g.bargrid.barHeight - 8) / 2) +12) : (g.bargrid.barHeight - ((g.bargrid.barHeight - 8) / 2) - 5) );
				
						//.attr("y",function(d,i) {return g.padding.top + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) + g.bargrid.barHeight - ((g.bargrid.barHeight-8)/2) });
				}


				// else {
				// 	// //adjust padding for bargrid
				// 	// if(g.padding.left - pwidth < g.defaultPadding().left) {
				// 	// 	g.padding.left = pwidth + g.defaultPadding().left;
				// 	// 	g.redraw() //CHANGE (maybe)
				// 	// }
					
				// }
			});

      
		return this;
	};
  this.getXLabelPosition = function Gneiss$getXLabelPosition( placement ) {
  	var g = this;

  	switch ( placement ) {
  		case "Left":
  			d3.select("#xLabel").attr("text-anchor", "start");
  			return g.padding.left;
  			break;
  		case "Right":
  			d3.select("#xLabel").attr("text-anchor", "end");
  			return g.width() - g.padding.right;
  			break;
  		case "Center":
  			d3.select("#xLabel").attr("text-anchor", "middle");
  			return g.width() / 2; 
  			break;
  	}
  };

  this.calculateColumnWidths = function Gneiss$calculateColumnWidths() {
		/*
			Calculate the proper column width for column charts
		*/
		
		var g = this;
			g.columns = {};
			g.columns.numColumnCharts = g.seriesByType().column.length;
			g.columns.totalColumns = g.series[0].data.length * g.columns.numColumnCharts;
			g.columns.columnSpacing = 2;

		// calculate gutterSpacing according to situation
		if (g.xAxis.type === "date"){

			if (g.seriesByType().column.length === 1){
				g.columns.gutterSpacing = 0;
				g.columns.totalColumnSpacing = (g.series[0].data.length - 1) * g.columns.columnSpacing;
			} 
			
			else {
				g.columns.gutterSpacing = 8;
				g.columns.totalColumnSpacing = ((g.columns.numColumnCharts - 1) * g.series[0].data.length) * g.columns.columnSpacing;
			}
		}
		else {
			g.columns.gutterSpacing = 16;
			g.columns.totalColumnSpacing = ((g.columns.numColumnCharts - 1) * g.series[0].data.length) * g.columns.columnSpacing;
		}

		g.columns.numGutters = (g.series[0].data.length < 2) ? 0 : g.series[0].data.length - 1;
		g.columns.totalGutters = g.columns.gutterSpacing * g.columns.numGutters;

			// if g.isBargrid evaluates to false, than calculate the available width for the chart
			if ( !g.isBargrid() ){
				g.columns.longestYValue = Math.ceil(this.getLongestYValue());
				if (g.seriesByType().column.length === 1){
					g.columns.range = Math.floor(( g.yAxis.length === 1 ) ? Math.floor( g.width() - ( g.padding.left * 2 ) - g.padding.right - Math.ceil(g.columns.longestYValue) ) : Math.floor( g.width() - ( g.padding.left * 2 ) - (g.padding.right*2) - ( Math.ceil(g.columns.longestYValue) * 2 ) ));
				}
				else {
					g.columns.range = Math.floor(( g.yAxis.length === 1 ) ? Math.floor( g.width() - ( g.padding.left * 2 ) - g.padding.right - Math.ceil(g.columns.longestYValue) ) : Math.floor( g.width() - ( g.padding.left * 2 ) - (g.padding.right*2) - ( Math.ceil(g.columns.longestYValue) * 2 ) ));
				}
			} 

			// bargrid has it's own method for calculating its available space
			else {
				g.columns.range = Math.floor( g.height() - g.padding.bottom );
			}

		// determine the width of each column				
		g.columns.columnWidth = ( g.columns.range - g.columns.totalGutters - g.columns.totalColumnSpacing ) / g.columns.totalColumns;
		g.columns.totalColumnWidths = g.columns.columnWidth * g.columns.totalColumns;
		g.columns.columnGroupWidth = (g.columns.columnWidth * g.columns.numColumnCharts) + (( g.columns.numColumnCharts - 1 ) * g.columns.columnSpacing );
		g.columns.columnGroupShift = g.columns.columnWidth + g.columns.columnSpacing;
		return this;
	};

	this.appendMeta = function Gneiss$appendMeta(){
		var g = this,
			sourcePathData = [ { "x": 0, "y": 0 },  { "x": g.width(),  "y": 0 } ],
			lineFunction = d3.svg.line()
	            .x(function(d) { return d.x; })
	            .y(function(d) { return d.y; })
	        	.interpolate("linear");

		g.metaInfo = g.chart.append("g")
			.attr("id","metaInfo")
			.attr("width", g.width())
			.attr("height", g.padding.meta)
			.attr("transform","translate(0," + (g.height() - g.padding.meta) + ")");
		
		g.metaInfo.append("path")
			.attr("class", "xSourceLine")
			.attr("d", lineFunction(sourcePathData))
    		.attr("stroke", "#AAA")
    		.attr("transform", "translate(0,-1)");

		g.metaBackground = g.metaInfo.append("rect")
			.attr("width", g.width())
			.attr("height", g.padding.meta)
			.attr("fill", "#FFF")
			.attr("transform", "translate(0,0)");

		g.sourceLine = g.metaInfo.append("text")
			.attr("text-anchor", "start")
			.attr("x", g.padding.left)
			.attr("y", g.padding.meta - 7)
			.attr("class", "metaText")
			.attr("fill", "#999")
			.text(g.sourceline);
		
		g.creditLine = g.metaInfo.append("text")
			.attr("text-anchor", "end")
			.attr("x", g.width() - g.padding.right)
			.attr("y", g.padding.meta - 7)
			.attr("class", "metaText")
			.attr("fill", "#999")
			.text(g.creditline);
	};	
  
  this.drawSeriesAndLegend = function Gneiss$drawSeriesAndLegend(first){
		this.drawSeries(first);
		this.drawLegend();
		return this;
	};
  
  this.drawSeries = function Gneiss$drawSeries(first) {
		/*
		*
		* Series Drawing Section
		*
		*/
		var g = this;
		
		//construct line maker Gneiss.helper functions for each yAxis
		this.setLineMakers(first);
		
		//store split by type for convenience
		var sbt = g.seriesByType();
				
		var lineSeries;
		var areaSeries;
		var stackedAreaSeries;
		
		if(first) {
			
			//create a group to contain series
			g.seriesContainer = g.chart.append("g")
				.attr("id","seriesContainer")
				
				
			lineSeries = g.seriesContainer.selectAll("path.seriesLine");
			areaSeries = g.seriesContainer.selectAll("path.seriesArea");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn");
			stackedAreaSeries = g.seriesContainer.selectAll("g.seriesStackedArea");

			var columnGroups
			var columnRects
			//var lineSeriesDots = g.seriesContainer.selectAll("g.lineSeriesDots")
			var scatterSeries = g.seriesContainer.selectAll("g.seriesScatter")
				
			//create a group to contain the legend items
			g.legendItemContainer = g.chart.append("g")
				.attr("id","legendItemContainer")
				
				//add columns to chart
				columnGroups = columnSeries.data(sbt.column)
					.enter()
					.append("g") 
						.attr("class","seriesColumn seriesGroup")
						.attr("fill",function(d,i){
							return d.color? d.color : g.colors[i+sbt.line.length]})
						.attr("transform",function(d,i){
							return "translate(0,0)"})
						
				columnGroups.selectAll("rect")
					.data(function(d,i){
						return d.data})
					.enter()
						.append("rect")
						.attr("width",g.columns.columnWidth)
						.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return Math.abs(g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
						.attr("x", function(d,i) {
							return g.xAxis.scale(g.xAxisRef[0].data[i])  - g.columns.columnWidth/2
							})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
								
				
				//add lines to chart
				lineSeries.data(sbt.line)
					.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M");  return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesLine seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})
						.attr("stroke-width",3)
						.attr("stroke-linejoin","round")
						.attr("stroke-linecap","round")
						.attr("fill","none")

				//add areas to chart
				areaSeries.data(sbt.area)
					.enter()
					.append("path")
						.attr("d",function(d,j) { //yAxisIndex = d.axis; 
							                      pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M");  							                      
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
							                      return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesArea seriesGroup")
						.attr("stroke",function(d,i){
							return d.color? d.color : g.colors[i]})
						.attr("stroke-width",0.1)
						//.attr("stroke-linejoin","round")
						//.attr("stroke-linecap","round")
						.attr("fill",function(d,i){
							return d.color? d.color : g.colors[i]})

				//add stacked areas to chart
				stackedAreaSeries.data(sbt.stackedarea)
					.enter()
					.append("path")
						.attr("d",function(d,j) { //yAxisIndex = d.axis; 
							                      pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M");  							                      
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
							                      return pathString.indexOf("NaN")==-1?pathString:"M0,0"})
						.attr("class","seriesStackedArea seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})
						.attr("stroke-width",0.1)
						//.attr("stroke-linejoin","round")
						//.attr("stroke-linecap","round")
						.attr("fill",function(d,i){
							return d.color? d.color : g.colors[i]})
		
				
				/*lineSeriesDotGroups = lineSeriesDots.data(sbt.line)
					.enter()
					.append("g")
					.attr("class","lineSeriesDots seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				lineSeriesDotGroups
					.filter(function(d){return d.data.length < 15})
					.selectAll("circle")
					.data(function(d){ return d.data})
					.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis.type=="date" ?
								g.xAxis.scale(g.xAxisRef[0].data[i]):
								g.xAxis.scale(i)) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
							*/
				
				//add scatter to chart
				scatterGroups = scatterSeries.data(sbt.scatter)
					.enter()
					.append("g")
					.attr("class","seriesScatter seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})

				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){ return d.data})
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return "translate("+(g.xAxis.type=="date" ?
								g.xAxis.scale(g.xAxisRef[0].data[i]):
								g.xAxis.scale(i)) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
		//this.orderPlotted();
		}
		else {
			//update don't create
			
			lineSeries = g.seriesContainer.selectAll("path.seriesLine");
			areaSeries = g.seriesContainer.selectAll("path.seriesArea");
			columnSeries = g.seriesContainer.selectAll("g.seriesColumn");
			scatterSeries = g.seriesContainer.selectAll("g.seriesScatter");
			stackedAreaSeries = g.seriesContainer.selectAll("path.seriesStackedArea");

			//lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
			var columnGroups
			var columnRects
			
			if(g.isBargrid()) {

				//add bars to chart
				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.bargrid)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
				
				var seriesColumns = columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : g.colors[i+g.series.length]})
						.attr("transform", "translate(0,0)");
				
				// var bargridLabel = columnGroups.selectAll("text.bargridLabel")
				// 	.data(function(d,i){return [d]})
				
						
				// bargridLabel.enter()
				// 		.append("text")
				// 		.attr("class","bargridLabel")
				// 		.text(function(d,i){return d.name})
				// 		.attr("x",g.yAxis[0].scale(0))
				// 		.attr("y",g.padding.top-18)
								
				// bargridLabel.transition()
				// 	.text(function(d,i){return d.name})
				// 	.attr("x",g.yAxis[0].scale(0))
				// 	.attr("y",g.padding.top-18)
				
				// bargridLabel.exit().remove()
				var setWidth = g.yAxis[0].range[1] - g.yAxis[0].range[0];

				// this determines where the next series will be plotted
				columnSeries.transition()
					.duration(1000)
					.attr("transform",function(d,i){
						if (i===0){
							return "translate(0,0)"
						}
						else {
							return "translate("+ ((i * setWidth) + (i*g.bargrid.gutterSpacing) + (i*g.bargrid.longestValue) + (i*3)) +",0)"
						}
					});
					
				columnGroups.exit().remove()
				
				
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
				
				columnRects.enter()
						.append("rect")
						.attr("height",g.bargrid.barHeight)
						.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
						.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d)):0)})
						.attr("y", g.state.hasLegend ? function(d,i) { return g.padding.top + 17 + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) } : function(d,i) { return g.padding.top + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) });
				
				columnRects.transition()
					.duration(500)
					.attr("height", g.bargrid.barHeight)
					.attr("width", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0)):0)})
					.attr("y", g.state.hasLegend ? function(d,i) { return g.padding.top + 17 + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) } : function(d,i) { return g.padding.top + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) });
				
				//add label to each bar
				var barLabels = columnGroups.selectAll("text.barLabel")
					.data(function(d,i){return d.data})
					
				barLabels.enter()
					.append("text")
					.attr("class","barLabel")
					.text(function(d,i){return g.numberFormat(d)})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
					.attr("y",g.state.hasLegend ? function(d,i) {return g.padding.top + 17 + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) + g.bargrid.barHeight - ((g.bargrid.barHeight-8)/2) } : function(d,i) {return g.padding.top + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) + g.bargrid.barHeight - ((g.bargrid.barHeight-8)/2) });
					
				barLabels.transition()
					.text(function(d,i){var yAxisIndex = d3.select(this.parentNode).data()[0].axis; return (i==0?g.yAxis[yAxisIndex].prefix.value:"") + g.numberFormat(d) + (i==0?g.yAxis[yAxisIndex].suffix.value:"")})
					.attr("x", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return 3 + g.yAxis[yAxisIndex].scale(0) - (d<0?Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0)):0) + Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(0))})
					.attr("y",g.state.hasLegend ? function(d,i) {return g.padding.top + 17 + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) + g.bargrid.barHeight - ((g.bargrid.barHeight-8)/2) } : function(d,i) {return g.padding.top + (g.bargrid.barHeight * i) + (g.bargrid.barSpacing * (i-1)) + g.bargrid.barHeight - ((g.bargrid.barHeight-8)/2) });
				
				//remove non bargrid stuff
				scatterSeries.remove()
				columnRects.exit().remove()
				//lineSeriesDotGroups.remove()
				lineSeries.remove()
				areaSeries.remove()
				stackedAreaSeries.remove()
			}
			else {
				//Not a bargrid
				//add columns to chart
				columnGroups = g.seriesContainer.selectAll("g.seriesColumn")
					.data(sbt.column)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
				
				//remove bargrid labels
				columnGroups.selectAll("text.barLabel").remove()
				
				columnGroups.enter()
					.append("g") 
						.attr("class","seriesColumn")
						.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*g.columns.columnGroupShift - (g.columns.columnGroupShift * (sbt.column.length-1)/2))+",0)"})
					
				columnSeries.transition()
					.duration(500)
					.attr("transform",function(d,i){return "translate("+(i*g.columns.columnGroupShift - (g.columns.columnGroupShift * (sbt.column.length-1)/2))+",0)"})
			
				columnGroups.exit().remove()
			
				columnRects = columnGroups.selectAll("rect")
					.data(function(d,i){
						return d.data})
				
				columnRects.enter()
						.append("rect")
						.attr("width",g.columns.columnWidth)
						.attr("height", function(d,i) {
							yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
						.attr("x",g.xAxis.type =="date" ?
							function(d,i) {
								g.calculateColumnWidths();
								if (i===0){
									if (g.columns.numColumnCharts === 1){
										return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts) * g.columns.columnSpacing);
									} 
									else {
										return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts-1) * g.columns.columnSpacing);
									}
								} 
								else {
									if (g.columns.numColumnCharts === 1){
										return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts) * g.columns.columnSpacing) + (i * g.columns.gutterSpacing);
									}
									else {
										return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts-1) * g.columns.columnSpacing) + (i * g.columns.gutterSpacing);
									}
								}}:
							function(i) {
								return g.xAxis.scale(i) - g.columns.columnWidth/2})
						.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
							return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
			
				columnRects.transition()
					.duration(500)
					.attr("width",g.columns.columnWidth)
					.attr("height", function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; return Math.abs(g.yAxis[yAxisIndex].scale(d) - g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())))})
					.attr("x",g.xAxis.type =="date" ?
						function(d,i) {
							g.calculateColumnWidths();
							if (i===0){
								if (g.columns.numColumnCharts === 1){
									return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts) * g.columns.columnSpacing);
								} 
								else {
									return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts-1) * g.columns.columnSpacing);
								}
							} 
							else {
								if (g.columns.numColumnCharts === 1){
									return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts) * g.columns.columnSpacing) + (i * g.columns.gutterSpacing);
								}
								else {
									return ( g.padding.left * 2 ) + g.columns.longestYValue + ((g.columns.numColumnCharts - 1) * (g.columns.columnWidth/2)) + ( ((g.columns.numColumnCharts - 1) * g.columns.columnSpacing)/2 ) + (i * (g.columns.numColumnCharts * g.columns.columnWidth)) + (i * (g.columns.numColumnCharts-1) * g.columns.columnSpacing) + (i * g.columns.gutterSpacing);
								}
							}}:
						function(i) {
							return g.xAxis.scale(i) - g.columns.columnWidth/2})
					.attr("y",function(d,i) {yAxisIndex = d3.select(this.parentNode).data()[0].axis; 
						return (g.yAxis[yAxisIndex].scale(d)-g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain()))) >= 0 ? g.yAxis[yAxisIndex].scale(Gneiss.helper.columnXandHeight(d,g.yAxis[yAxisIndex].scale.domain())) : g.yAxis[yAxisIndex].scale(d)})
					
				columnRects.exit().remove()
			
				//add lines
				lineSeries = g.seriesContainer.selectAll("path.seriesLine")
					.data(sbt.line)
					.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]});


				lineSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0L"); return pathString;})
						.attr("class","seriesLine")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})
						.attr("stroke-width",3)
						.attr("stroke-linejoin","round")
						.attr("stroke-linecap","round")
						.attr("fill","none");

				lineSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0M"); return pathString;})

				lineSeries.exit().remove()

				// **** AREAS

				areaSeries = g.seriesContainer.selectAll("path.seriesArea")
					.data(sbt.area)
					.attr("stroke",function(d,i){
						return d.color? d.color : g.colors[i]})
					.attr("fill", function(d,i){
						return d.color? d.color : g.colors[i]});


				areaSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; 
							                     pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0L"); 
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
							                     //Console.log(pathstring);
							                     return pathString;})
						.attr("class","seriesArea")
						.attr("stroke",function(d,i){
							                        return d.color? d.color : g.colors[i]})
						.attr("stroke-width",0.1)
						//.attr("stroke-linejoin","round")
						//.attr("stroke-linecap","round")
						.attr("fill", function(d,i){
							                        return d.color? d.color : g.colors[i]});

				areaSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0M"); 
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
												return pathString;})

				areaSeries.exit().remove()


				// **** STACKED AREAS
				stackedAreaSeries = g.seriesContainer.selectAll("path.seriesStackedArea")
					.data(sbt.stackedarea)
					.attr("stroke",function(d,i){
						return d.color? d.color : g.colors[i]
					})
					.attr("fill", function(d,i){
						return d.color? d.color : g.colors[i]});


				stackedAreaSeries.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; 
							                     pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0L"); 
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
							                     //Console.log(pathstring);
							                     return pathString;})
						.attr("class","seriesStackedArea")
						.attr("stroke",function(d,i){return d.color? d.color : g.colors[i]})
						.attr("stroke-width",0.1)
						//.attr("stroke-linejoin","round")
						//.attr("stroke-linecap","round")
						.attr("fill", function(d,i){
							                        return d.color? d.color : g.colors[i]});

				stackedAreaSeries.transition()
					.duration(500)
					.attr("d",function(d,j) { yAxisIndex = d.axis; pathString = g.yAxis[d.axis].line(d.data).split("L0,0L").join("M0,0M"); 
							                     var ymin = g.yAxis[d.axis].scale(Math.max(g.yAxis[d.axis].domain[0],0));
							                     var xmin = g.xAxis.range[0];
							                     var xmax = g.xAxis.range[1];
							                     pathString += "L"+xmax+","+ymin+"L"+xmin+","+ymin;
												return pathString;})

				stackedAreaSeries.exit().remove()


				//Add dots to the appropriate line series
				/*lineSeriesDotGroups = g.seriesContainer.selectAll("g.lineSeriesDots")
					.data(sbt.line)
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i]})
			
				lineSeriesDotGroups
					.enter()
					.append("g")
					.attr("class","lineSeriesDots")
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				lineSeriesDotGroups.exit().remove()
			
				lineSeriesDots = lineSeriesDotGroups.filter(function(d){return d.data.length < 15})
					.selectAll("circle")
					.data(function(d,i){return d.data})
					
				lineSeriesDotGroups.filter(function(d){return d.data.length > 15})
					.remove()
				
				
				lineSeriesDots.enter()
					.append("circle")
					.attr("r",4)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.transition()
					.duration(500)
					.attr("transform",function(d,i){
						yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							var y = d || d ===0 ? g.yAxis[yAxisIndex].scale(d) : -100;
							return "translate("+ g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + y + ")";
						})
			
				lineSeriesDots.exit().remove()*/
								
				//add scatter
				scatterGroups = g.seriesContainer.selectAll("g.seriesScatter")
					.data(sbt.scatter)
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
				
				scatterGroups.enter()
					.append("g")
					.attr("class","seriesScatter")
					.attr("fill",function(d,i){return d.color? d.color : g.colors[i+sbt.line.length+sbt.column.length]})
				
				scatterGroups.exit().remove()
				
				scatterDots = scatterGroups
					.selectAll("circle")
					.data(function(d){return d.data})
					
				scatterDots.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
					
				scatterDots.transition()
						.duration(500)
						.attr("transform",function(d,i){
							yAxisIndex = d3.select(this.parentNode).data()[0].axis;
							return "translate("+g.xAxis.scale(g.xAxisRef[0].data[i]) + "," + g.yAxis[yAxisIndex].scale(d) + ")"
							})
			}	
		}
		//this.reorderPlotted();
		return this;
	};
  
  this.drawLegend = function Gneiss$drawLegend() {
		var g = this,
			itemXPos = g.padding.left,
			itemYPos = g.padding.top,
			legendSpacing = 10;
		
		//remove current legends
		g.legendItemContainer.selectAll("g.legendItem").remove()
		
		// if isBargrid() is false
		if ( !g.isBargrid() ) {
			
			// if the legendLine does exist
			d3.select(".legendLine").remove();

			//add legend to chart
			var legendGroups = g.legendItemContainer.selectAll("g")
				.data(g.series);

			var legItems = 	legendGroups.enter()
				.append("g")
				.attr("class","legendItem")
				.attr("transform", "translate(" + g.padding.left + ",0)");

			legendGroups.exit().remove()

			// apply the labels for the legend
			var legLabels = legItems.append("text")
				.filter(function(){return g.series.length > 1})
				.attr("class","legendLabel")
				.attr("x",10)
				.attr("y",-7)
				.attr("fill","#666")
				.text(function(d,i){return d.name});

			if (g.series.length > 1) {
				// apply the color keys to the legend labels
				legItems.append("rect")
					.attr("width",6)
					.attr("height",6)
					.attr("x",0)
					.attr("y",-13)
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]})
			
				if (g.state.hasLegend === false){
					g.padding.top += g.padding.legend;
					g.state.hasLegend = true;
				}
			}	
		}

		// if isBargrid is true
		else {
			if (g.seriesByType().bargrid.length < 2){ 
				d3.select(".legendLine").remove();
			}

			//add legend to chart
			var legendGroups = g.legendItemContainer.selectAll("g")
				.data(g.seriesByType().bargrid);

			var legItems = legendGroups.enter()
				.append("g")
				.attr("class","legendItem")
				.attr("transform", "translate(" + g.padding.left + ",0)");

			legendGroups.exit().remove();

			// apply the labels for the legend
			var legLabels = legItems.append("text")
				.filter(function(){return g.seriesByType().bargrid.length > 1})
				.attr("class","legendLabel")
				.attr("x",10)
				.attr("y",-7)
				.attr("fill","#666")
				.text(function(d,i){return d.name});

			// if there is more than one set of data being plotted
			if ( g.seriesByType().bargrid.length > 1 ) {
			
				// apply the color keys to the legend labels
				legItems.append("rect")
					.attr("width",6)
					.attr("height",6)
					.attr("x",0)
					.attr("y",-13)
					.attr("fill", function(d,i){return d.color? d.color : g.colors[i]});
			
				var legendLine = [ { "x": g.padding.left, "y": g.padding.top },  { "x": g.width() - g.padding.right,  "y": g.padding.top } ];

				d3.select(".legendLine").remove();
					
				var lineFunction = d3.svg.line()
		            .x(function(d) { return d.x; })
		            .y(function(d) { return d.y; })
		        	.interpolate("linear");

				g.chart.append("path")
					.attr("class", "legendLine")
					.attr("d", lineFunction(legendLine))
		    		.attr("stroke", "#EFEFEF");

		    	if ( g.state.hasLegend === false ){
		    		g.padding.top += g.padding.legend;
					g.state.hasLegend = true;
		    	}		  
			}	
			if ( g.seriesByType().bargrid.length === 1 && g.state.hasLegend === true) {
				g.state.hasLegend = false;
				g.padding.top -= g.padding.legend;
			}		
		}

		// position all of the legend items
		// for ( var i = 0; i < legItems[0].length; i++ ){
		// 	var curr = legItems[0][i];
		// 	currWidth = parseFloat(curr.getBoundingClientRect().width);
		// 	d3.select(curr).attr("transform", "translate("+ itemXPos +","+ itemYPos +")");
		// 	itemXPos += currWidth + legendSpacing;
		// }

		// apply this code to position the legend to the right
		itemXPos = g.width() - g.padding.right;
		for ( var i = legItems[0].length-1; i >= 0; i-- ){
			var curr = legItems[0][i];
			currWidth = parseFloat(curr.getBoundingClientRect().width);
			itemXPos -= currWidth;
			d3.select(curr).attr("transform", g.state.hasYLabel ? "translate("+ itemXPos +","+ (itemYPos - g.padding.yLabel) +")" : "translate("+ itemXPos +","+ itemYPos +")");
			itemXPos -= legendSpacing;
		}
		
		
		
		return this;
	};
 
  
  this.splitSeriesByType = function Gneiss$splitSeriesByType(series) {
		/*
			Partition the data by the way it is supposed to be displayed
		*/
		var seriesByType = {
			line: [],
			column: [],
			bargrid: [],
			scatter: [],
			area: [],
			stackedarea: []
		};
		
		var newStackedArea;
		var count = 0;
		
		for (var i = 0; i < series.length; i++) 
		{
			if(series[i].type == 'stackedarea')
			{	
				var newColor = series[i].color;

				if(typeof(newStackedArea) === 'undefined'){
						newStackedArea = jQuery.extend(true, {}, series[i]);
				}
				else
				{
					for (var t=0; t<series[i].data.length; t++)
					{					
						var num = newStackedArea.data[t] + series[i].data[t];

						newStackedArea.data[t] += series[i].data[t];
					}
				}

				newStackedArea.color = newColor;

			 	seriesByType['stackedarea'].push(jQuery.extend(true, {}, newStackedArea)); 	
			 }
			 else
			 {
				seriesByType[series[i].type].push(series[i]);
			 }
		}
		
		return seriesByType;
	};
  
  this.updateGraphPropertiesBasedOnSeriesType = function Gneiss$updateGraphPropertiesBasedOnSeriesType(graph, seriesByType) {
		/* 
		  Update graph properties based on the type of data series displayed 
		*/
		if(seriesByType.column.length > 0) {
			graph.xAxis.hasColumns = true;
		}
		else {
			graph.xAxis.hasColumns = false;
		}
		
		if(seriesByType.bargrid.length > 0) {
			graph.isBargrid(true);
		}
		else {
			graph.isBargrid(false);
		}
	};
  
  this.redraw = function Gneiss$redraw() {
		/*
			Redraw the chart
		*/	
				
		//group the series by their type
		this.seriesByType(this.splitSeriesByType(this.series));
		this.updateGraphPropertiesBasedOnSeriesType(this, this.seriesByType());
		
		this.calculateColumnWidths();
		
		this.setYScales()
			.setXScales()
			.setYAxes()
			.setXAxis()
			.drawSeriesAndLegend()
			.orderPlotted()
		return this;
	};

	this.orderPlotted = function Gneiss$orderPlotted(){
		var orderedArr = [],
			i;

		d3.select("#seriesContainer").selectAll(".seriesScatter").each(function(){
			orderedArr.push(this);
		});

		d3.select("#seriesContainer").selectAll(".lineSeriesDots").each(function(){
			orderedArr.push(this);
		});

		d3.select("#seriesContainer").selectAll(".seriesLine").each(function(){
			orderedArr.push(this);
		});

		var selection = d3.select("#seriesContainer").selectAll(".seriesArea");

        function my_compare(z,k){ 
        	return z.data.max() - k.data.max();
        }

        selection.sort(my_compare);
        
 		selection.each(function(){
			orderedArr.push(this);
		});

		var selection = d3.select("#seriesContainer").selectAll(".seriesStackedArea");

        function my_compare(z,k){ 
        	return z.data.max() - k.data.max();
        }

        selection.sort(my_compare);
        
 		selection.each(function(){
			orderedArr.push(this);
		});

		// var selectiontest = d3.select("#seriesContainer").selectAll(".seriesStackedArea");

  //       function my_comparetest(x,y){ 
  //       	return x.data.max() - y.data.max();
  //       }

  //       selectiontest.sort(my_comparetest);
        
 	// 	selectiontest.each(function(){
		// 	orderedArr.push(this);
		// });

 	    // 	var seriesAreaArray = [],t;

		// selection.each(function(j){
		// 	seriesAreaArray.push(j.data.max());

		// });



		// for ( i = seriesAreaArray.length-1; i >= 0; i-- )
		// {
		// 	selection.each(function(l)
		// 	{
		// 		if (l.data.max() == seriesAreaArray[i])
		// 		{
		// 			orderedArr.push(this);
		// 		}
		// 	}
		// }


		// $.each(sort(selection,function(g){
		// 	return g.maxheight;
		// }),function(){
		// 	orderedArr.push(this);
		// });

		//     d3.select("#seriesContainer").selectAll(".seriesArea").sort().
		//     //sort(function(d){return d.maxheight();})
		//     each(function(){
		// 	orderedArr.push(this);
		// });

		// d3.select("#seriesContainer").selectAll(".seriesArea").each(function(){
		// 	orderedArr.push(this);
		// });

		d3.select("#seriesContainer").selectAll(".seriesColumn").each(function(){
			orderedArr.push(this);
		});

		for ( i = orderedArr.length-1; i >= 0; i-- ){
			orderedArr[i].parentNode.appendChild(orderedArr[i]);
		}
	};

  // Call build() when someone attempts to construct a new Gneiss object
  return this.build(config);
}