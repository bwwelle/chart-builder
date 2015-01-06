var chart;
ChartBuilder = {
	allColors: [ "00ADEF", "0A57A4", "B20838", "FF6600","65B500","889CA2","FFB800","006065","780028","AF335C","BE597A","D28CA3","DCA6B8","993900","FF6600",
	"FF9900","FFB800","003300","006600","65B500","ACD733","889CA2","A0B0B5","B8C4C7","CFD7DA","000000"],
	curRaw: "",
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
			ticks: 5,
			formatter: null,
			color: null
		}
	],
	RemoveDefaultSettings:function()
	{
		var seriesOptionsName = window.localStorage.getItem("SeriesOptions_Name_0");
		var chartSize = window.localStorage.getItem("ChartSize");
		var chartOptions = window.localStorage.getItem("ChartOptions");
		var chartData = window.localStorage.getItem("ChartData");
		var leftAxisOptions = window.localStorage.getItem("LeftAxisOptions");
		var bottomAxisOptions = window.localStorage.getItem("BottomAxisOptions");

		var counter = 0;
		while (seriesOptionsName !== null)
		{
			window.localStorage.clear("SeriesOptions_Name_" + counter);
			window.localStorage.clear('SeriesOptions_Data_' + counter);
			window.localStorage.clear('SeriesOptions_Source_' + counter);
			window.localStorage.clear('SeriesOptions_Type_' + counter);
			window.localStorage.clear('SeriesOptions_Axis_' + counter);
			window.localStorage.clear('SeriesOptions_Color_' + counter);
			counter++;

			seriesOptionsName = window.localStorage.getItem("SeriesOptions_Name_" + counter);		
		}

		if(chartSize !== null)
		{
			window.localStorage.clear("ChartSize");
		}

		if(chartOptions !== null)
		{
			window.localStorage.clear("ChartOptions");
		}

		if(chartData !== null)
		{
			window.localStorage.clear("ChartData");
		}

		if(leftAxisOptions !== null)
		{
			window.localStorage.clear("LeftAxisOptions");
		}

		if(bottomAxisOptions !== null)
		{
			window.localStorage.clear("BottomAxisOptions");
		}
	},
	SaveAsDefaultSettings: function()
	{
		var g = chart;
		var currSeries;

		ChartBuilder.RemoveDefaultSettings();

		window.localStorage.setItem('ChartSize', $("#sizeItems").find("option:selected").text());

		for (var i=0; i < g.series.length; i++) {
			currSeries = g.series[i];

			window.localStorage.setItem('SeriesOptions_Name_' + i, currSeries.name);
			window.localStorage.setItem('SeriesOptions_Data_' + i, currSeries.data);
			window.localStorage.setItem('SeriesOptions_Source_' + i, currSeries.source);
			window.localStorage.setItem('SeriesOptions_Type_' + i, currSeries.type);
			window.localStorage.setItem('SeriesOptions_Axis_' + i, currSeries.axis);
			window.localStorage.setItem('SeriesOptions_Color_' + i, currSeries.color);
		}

		window.localStorage.setItem('ChartData', $('#csvInput').val());

		var chartOptions = {};
		chartOptions.Title = $("#chart_title").val();
		chartOptions.SourceLine = $("#sourceLine").val();
		chartOptions.CreditLine = $("#creditLine").val();		

		window.localStorage.setItem( 'ChartOptions', JSON.stringify(chartOptions) );

		var leftAxisOptions = {};
		leftAxisOptions.LeftAxisOptions = $("#left_axis_label").val();
		leftAxisOptions.LeftAxisPrefix = $("#left_axis_prefix").val();
		leftAxisOptions.LeftAxisSuffix = $("#left_axis_suffix").val();
		leftAxisOptions.NumberOfTicks = $("#left_axis_tick_num").find("option:selected").text();
		leftAxisOptions.LeftAxisMax = $("#left_axis_max").val();
		leftAxisOptions.LeftAxisMin = $("#left_axis_min").val();

		window.localStorage.setItem( 'LeftAxisOptions', JSON.stringify(leftAxisOptions) );

		var bottomAxisOptions = {};
		bottomAxisOptions.Label = $("#x_axis_label").val();
		bottomAxisOptions.Position = $("#x_axis_label_position").find("option:selected").text();
		bottomAxisOptions.TickDateFrequency = $("#x_axis_tick_date_frequency").find("option:selected").text();	
		bottomAxisOptions.DateFormat = $("#x_axis_date_format").find("option:selected").text();	

		window.localStorage.setItem( 'BottomAxisOptions', JSON.stringify(bottomAxisOptions) );		
	},
	getNewData: function(csv) {
		// Split the csv information by lines
		var csv_array = csv.split("\n");

        // Split the first element of the array by the designated separator
        // tab in this case
        var csv_matrix = [];
        var delim = String.fromCharCode(9);
        csv_matrix.push(csv_array[0].split(delim));

		// Get the number of columns
		var cols_num = csv_matrix[0].length;

		// If there aren't at least two columns, return null
		if(cols_num < 2) {
			return null;
		}

		// Knowing the number of columns that every line should have, split
		// those lines by the designated separator. While doing this, count
		// the number of rows
		var rows_num = 0;
		for(var i=1; i<csv_array.length; i++) {
			// If the row is empty, that is, if it is just an \n symbol, continue
			if(csv_array[i] == "") {
				continue;
			}

			// Split the row. If the row doesn't have the right amount of cols
			// then the csv is not well formated, therefore, return null
			var row = csv_array[i].split(delim);
			if(row.length != cols_num) {
				return null;
			}

			// Push row to matrix, increment row count, loop
			csv_matrix.push(row);
			rows_num++; 
		}

		// If there aren't at least two non empty rows, return null
		if(rows_num < 2) {
			return null;
		}

		return csv_matrix;
	},
	// Given the matrix containing the well formated csv, create the object that
	// is going to be used later
	makeDataObj: function(csv_matrix) {
		// Make the data array
		var data = [];
		for(var i=0; i<csv_matrix[0].length; i++) {
			// Object for a single column
			var obj = {name: csv_matrix[0][i], data: []};

			// Make the obj
			for(var j=1; j<csv_matrix.length; j++) {
				// If this is a date column
				if((/date/gi).test(obj.name)) {
					var value = Date.create(csv_matrix[j][i]);
					if(value == "Invalid Date") {
						return null;
					}
					obj.data.push(value);
				}
				// If it is the first column, containing the names
				else if(i == 0) {
					obj.data.push(csv_matrix[j][i]);
				}
				// If it's a data point
				else {
					var value = csv_matrix[j][i];

					if(value == "null" || value == "") {
						//allow for nulls or blank cells
						for (var z = 0; z < chart.series.length; z++) {
							//to account for area's lack of functionality to draw blanks correctly
		  					if (chart.series[z].type === "area" || chart.series[z].type === "stackedarea"){
		  						d3.select("#invalidDataSpan").text("Warning: Area/Stacked Area Series Cannot Have Blank Cells/Data");		  				
								
								return null;
		  					}
		  					else
		  					{
		  						value = null;
		  					}
		  				}		
					}
					else if (isNaN(value)){
						//data isn't valid
						return null;
					}
					else {
						value = parseFloat(value);
					}
					
					obj.data.push(value);
				}
			}

			data.push(obj);
		}

		return {data: data, datetime: (/date/gi).test(data[0].name)};
	},
	parseData: function(a) {
		var d = []
		var parseFunc;
		for (var i=0; i < a.length; i++) {
			if((/date/gi).test(a[i][0])){ //relies on the word date 
				parseFunc = this.dateAll
			}
			else if (i == 0) {
				parseFunc = this.doNothing
			}
			else {
				parseFunc = this.floatAll
			}
			
			d.push({
				"name": a[i].shift().split("..").join("\n"),
				"data":parseFunc(a[i]),
			});
			
		};
		for (var i = d.length - 1; i >= 0; i--){
			for (var j = d[i].length - 1; j >= 0; j--){
				if(d[i][j] == "" || d[i][j]==" ") {
					d[i][j] = null
				}
			};
		};
		return d
	},
	mergeData: function(a) {
		var d
		for (var i=0; i < a.data.length; i++) {
			d = a.data[i]
			if(i < chart.series.length) {
				a.data[i] = $.extend({},chart.series[i],d)
			}
			else {
				//defaults for new series
				a.data[i].type = "line"
			}
			
		};
		
		return a
	},
	pivotData: function(a){
		var o = []
		for (var i=0; i < a.length; i++) {
			if(a[i]) {
				for (var j=0; j < a[i].length; j++) {
					if(i == 0) {
						o.push([])
					}
					if(a[i][j] != null) {
						o[j][i] = a[i][j]
					}
				};
			}
			
		}
		return o
	},
	createTable: function(r,d){
		$table = $("#dataTable table")
		$table.text("")


		$table.append("<tr><th>"+r[0].join("</th><th>")+"</th></tr>")
		for (var i=1; i < r.length; i++) {
			if(r[i]) {
				if(d) {
					r[i][0] = Date.create(r[i][0]).format("{M}/{d}/{yy} {hh}:{mm}")
				}
				
				//add commas to the numbers
				for (var j = 0; j < r[i].length; j++) {
					r[i][j] = this.addCommas(r[i][j])
				};

				$("<tr><td>"+r[i].join("</td><td>")+"</td></tr>")
					.addClass(i%2 == 0? "otherrow":"row")
					.appendTo($table)
			}				
		};

		// append to 
		this.outputTableAsHtml($table);
	},


	// table_el is a jQuery element
	outputTableAsHtml: function(table_el){
		var html_str = table_el.parent().html();
		// throw in some sloppy newline subbing
		html_str = html_str.replace(/(<(?:tbody|thead))/g, "\n$1");
		html_str = html_str.replace(/(<\/(?:tr|tbody|thead)>)/g, "$1\n");
		html_str = html_str.split("<tbody><tr>").join("<tbody>\n<tr>")
		html_str = $.trim(html_str)
		$('#table-html').val(html_str);
	},



	floatAll: function(a) {
		for (var i=0; i < a.length; i++) {
			if(a[i] && a[i].length > 0 && (/[\d\.]+/).test(a[i])) {
				a[i] = parseFloat(a[i])
			}
			else {
				a[i] = null
			}
		};
		return a
	},
	dateAll: function(a) {
		for (var i=0; i < a.length; i++) {
			a[i] = Date.create(a[i])
		};
		return a
	},
	doNothing: function(a) {
		return a
	},
	inlineAllStyles: function() {
		var chartStyle, selector, cssText;
		
		for (var i = document.styleSheets.length - 1; i >= 0; i--){
			if(document.styleSheets[i].href && document.styleSheets[i].href.indexOf("gneisschart.css") != -1) {
				if (document.styleSheets[i].rules != undefined) {
					chartStyle = document.styleSheets[i].rules 
				}
				else {
					chartStyle = document.styleSheets[i].cssRules
				}
			}
		}
		if(chartStyle != null && chartStyle != undefined)
		{
			for (var i=0; i < chartStyle.length; i++) {
				if(chartStyle[i].type == 1) {
					//cssRule is a style rule
					selector = chartStyle[i].selectorText;
					cssText = chartStyle[i].style.cssText;
					d3.selectAll(selector).attr("style",cssText)
				}
			};
		}
	},
	createChartImage: function() {
		// Create PNG image
		var canvas = document.getElementById("canvas");
		canvas.width = $("#chartContainer").width();
		canvas.height = $("#chartContainer").height();		

		var canvasContext = canvas.getContext("2d")

		var svg = $.trim(document.getElementById("chartContainer").innerHTML)
		canvasContext.drawSvg(svg,0.5,0.5)

		var filename = [];
		for (var i=0; i < chart.series.length; i++) {
			filename.push(chart.series[i].name.split(" ").join(""));
		};
		
		if(chart.title.length > 0) {
			filename.unshift(chart.title)
		}
		
		filename = filename.join("-").replace(/[^\w\d]+/gi, '-');
		
		$("#downloadImageLink").attr("href",canvas.toDataURL("png"))
			.attr("download",function(){ return filename + "_chartbuilder.png"
			});
			
			
		// Create SVG image
		var svgString = $("#chartContainer").html()
		//add in all the things that validate SVG
		svgString = '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg xmlns="http://www.w3.org/2000/svg" ' + svgString.split("<svg ")[1]
		
	$("#downloadSVGLink").attr("href","data:text/svg,"+ encodeURIComponent(svgString.split("PTSerif").join("PT Serif")) )
		.attr("download",function(){ return filename + "_chartbuilder.svg"
		})

		var icon = this.setFavicon()

		
		//this.storeLocalChart(filename)		
	},
	setFavicon: function() {
		//set favicon to image of chart
		var favicanvas = document.getElementById("favicanvas")
		favicanvas.width = 64;
		favicanvas.height = 64;
		
		var faviCanvasContext = favicanvas.getContext("2d")
		faviCanvasContext.translate(favicanvas.width / 2, favicanvas.height / 2);
		
		var svg = $.trim(document.getElementById("chartContainer").innerHTML)
		faviCanvasContext.drawSvg(svg,-16,-8,32,32)
		
		var icon = favicanvas.toDataURL("png");
		$("#favicon").attr("href",icon)

		return icon;
	},
	redraw: function() {
		$(".seriesItemGroup").detach();
		$(".selectBox").detach();
		var g = chart;
		var currSeries;
		var seriesContainer = $("#seriesItems");
		var sizesContainer = $("#sizeItems");
		var isMultiAxis = false;
		var sizeValues;	

		for(var i=0;i<g.chartsizes.length;i++)
		{
			currSize = g.chartsizes[i];
			sizesItem = $('<option class="selectBox" value="'+currSize.data +'"'+currSize.selected + '>'+currSize.name + '</option>')

			if(currSize.selected !=="")
			{
				sizeValues=currSize.data.split(",");
				$('#topSection').css({ height: Number(sizeValues[1]) + 57 +"px" });
				$('.chartContainer').css({ width: sizeValues[0] });
				$('.chartContainer').css({ height: sizeValues[1] });
				chart.width(sizeValues[0]);	
				chart.height(sizeValues[1]);			

				d3.select("#ground").attr("width",sizeValues[0]);
				d3.select("#ground").attr("height",sizeValues[1]);
				d3.select("#xBackground").attr("width",sizeValues[0]);
				d3.select("#titleContainer").attr("width",sizeValues[0]);
				d3.select("#titleBackground").attr("width", sizeValues[0]);
				d3.select("#xAxis").attr("width", sizeValues[0]);

				var widthInputBox = $("#widthInput");
				var heightInputBox = $("#heightInput");

				widthInputBox.val(sizeValues[0]);
				heightInputBox.val(sizeValues[1]);

				var height = Number(sizeValues[1])

				if(currSize.name == "Custom Size")
				{
					d3.select("#widthInput").attr('disabled', null);
					d3.select("#heightInput").attr('disabled', null);
				}
				else
				{
					d3.select("#widthInput").attr('disabled', "disabled");
					d3.select("#heightInput").attr('disabled', "disabled");
				}

				if(height > 500)
				{
					$('#staticContainer').css({ position: "absolute" });
				}
				else
				{
					$('#staticContainer').css({ position: "fixed" });
				}
			}

			sizesContainer.append(sizesItem);
		}			
		
		// loops through the series data
		for (var i=0; i < g.series.length; i++) {
			currSeries = g.series[i];
			
			// create the series input for each set of series data
			seriesItem = $('<div class="seriesItemGroup">\
				<label for="'+this.idSafe(currSeries.name.split(" ").join(""))+'_color">'+currSeries.name+'</label>\
				<input id="'+this.idSafe(currSeries.name.split(" ").join(""))+'_color" name="'+this.idSafe(currSeries.name.split(" ").join(""))+'" type="text" />\
				<select class="typePicker" id="'+this.idSafe(currSeries.name.split(" ").join(""))+'_type">\
					<option '+(currSeries.type=="line"?"selected":"")+' value="line">Line</option>\
					<option '+(currSeries.type=="column"?"selected":"")+' value="column">Column</option>\
					<option '+(currSeries.type=="stackedcolumn"?"selected":"")+' value="stackedcolumn">Stacked Column</option>\
					<option '+(currSeries.type=="bargrid"?"selected":"")+' '+(g.xAxis.type === "date"?"disabled":"")+' value="bargrid">Bar Grid</option>\
					<option '+(currSeries.type=="scatter"?"selected":"")+' value="scatter">Scatter</option>\
					<option '+(currSeries.type=="area"?"selected":"")+' value="area">Area</option>\
					<option '+(currSeries.type=="stackedarea"?"selected":"")+' value="stackedarea">Stacked Area</option>\
				</select>\
				<input id="'+this.idSafe(currSeries.name.split(" ").join(""))+'_check" name="'+this.idSafe(currSeries.name.split(" ").join(""))+'_check" type="checkbox" />\
				<div class="clearfix"></div>\
			</div>');
			
			// each set of series data is assigned the next color in the colors array
			var color = currSeries.color ? currSeries.color.replace("#","") : g.colors[i].replace("#","");
			currSeries.color = "#"+color;
			
			// append the series data inputs to the series input container
			seriesContainer.append(seriesItem);

			// assigns variables for the three main things you'd change about the series data
			// picker for color; typer for chart type; and axer for axes
			var picker = seriesItem.find("#"+this.idSafe(currSeries.name.split(" ").join(""))+"_color").colorPicker({pickerDefault: color, colors:this.allColors});
			var typer = seriesItem.find("#"+this.idSafe(currSeries.name.split(" ").join(""))+"_type")
			var axer = seriesItem.find("#"+this.idSafe(currSeries.name.split(" ").join(""))+"_check") 

			ChartBuilder.setChartArea();
			
			// check if the current series' data is being used to create a right axis
			if ( g.series[i].axis == 1 ) {
				axer.prop("checked",true)
				isMultiAxis = true;
			}

			// not sure we need this - unless it's being stored somewhere
			else {
				axer.prop("checked",false)
			}
			
			// assigns the current index (i) to the current data series (seriesItem) inputs									
			seriesItem.data("index",i)
			
			// tracks changes to picker
			// assigns the new color to the data series' color property and redraws
			picker.change(function() {
				chart.series[$(this).parent().data().index].color = $(this).val()
				ChartBuilder.redraw()
			});
			
			// tracks changes to typer
			// assigns the new type to the data series' type property
			typer.change(function() {
				var val = $(this).val();

				var index = $(this).parent().data().index;
				chart.series[index].type = val;

				ChartBuilder.setChartArea();

				var csv = ChartBuilder.curRaw;
	  			var newData = ChartBuilder.getNewData(csv);
	  			if(newData == null) {
						ChartBuilder.showInvalidData();
	  				return;
	  			}

	  			// if the current chart is a bargrid, but then a date chart is entered
			  	// swithc all of the bargrids to a line
			  	if ( chart.splitSeriesByType(chart.series).bargrid.length > 0 && chart.xAxis.type === "date" ){
			  		var seriesByType = {
						"line": [],
						"column": [],
						"stackedcolumn": [],
						"bargrid": [],
						"scatter": [],
						"area": [],
						"stackedarea": []
					};

			  		for (var i = 0; i < chart.series.length; i++) {
			  			if (chart.series[i].type === "bargrid"){
			  				chart.series[i].type = "line";
			  			}
			  			seriesByType[chart.series[i].type].push(chart.series[i]);
			  		}
			  	}
	  
	  			dataObj = ChartBuilder.makeDataObj(newData);

	  			if(dataObj == null) {
						ChartBuilder.showInvalidData();
	  				return;
	  			}

	  			d3.select("#invalidDataSpan").text("Warning: Data is Invalid");
				ChartBuilder.hideInvalidData();
	  
	  			ChartBuilder.createTable(newData, dataObj.datetime);
	  			
	  			chart.series.unshift(chart.xAxisRef)
	  			dataObj = ChartBuilder.mergeData(dataObj)
	  			
	  			if(dataObj.datetime) {
	  				chart.xAxis.type = "date";
	  				chart.xAxis.formatter = chart.xAxis.formatter?chart.xAxis.formatter:"mm/dd/yyyy";
	  			}
	  			else {
	  				chart.xAxis.type = "ordinal";
	  			}
	  			chart.xAxisRef = [dataObj.data.shift()]
	  			
	  			chart.series = dataObj.data;
				
				// removes the right y axis when it is not in use
				if ( chart.yAxis.length > 1 && chart.isBargrid() ) {
					for ( var i = 0; i < chart.series.length; i++ ){
						if (chart.series[i].axis === 1){
							chart.series[i].axis = 0;
						}
					}
					chart.yAxis.pop();
				}
				ChartBuilder.updateTitle();
				chart.setXScales();
				ChartBuilder.redraw();
				ChartBuilder.updateYLabels();
				chart.redraw();
				ChartBuilder.updateInterface();
				//ChartBuilder.redraw();

			});
			
			// tracks changes to axer
			axer.change(function() {
				var axis = $(this).is(':checked') ? 1 : 0;
				chart.series[$(this).parent().data().index].axis = axis

				//updateAxers
				// a checkbox was checked
				if (axis === 1){

					// loop through all of the seires data and see if anything else has an axis of 1
					// if so, then set that one to 0
					for ( var i = 0; i < chart.series.length; i++ ){
						var selectedElem = $(this).attr("id"),
							curr = ChartBuilder.idSafe(chart.series[i].name.split(" ").join("")) + "_check";

						if ( (chart.series[i].axis === 1) && (curr !== selectedElem) ){
							$("#" + curr).removeAttr("checked");
							chart.series[i].axis = 0;
							chart.yAxis[1].domain = d3.extent( chart.series[$(this).parent().data().index].data )
						}
					}
				}
				
				// if the user wants a right axis and it hasn't been created, create one
				if(!chart.yAxis[axis]){
					chart.yAxis[axis] = {
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
						color: null,
					}
				}
				
				// removes the right y axis when it is not in use
				if( (chart.yAxis.length > 1 && axis == 0) ) {
					chart.yAxis.pop()
				}

				var selectedSize = $("#sizeItems :selected").text();

				for(var i=0;i<g.chartsizes.length;i++)
				{
					sizeValues=currSize.data.split(",");
							
					if(g.chartsizes[i].name == selectedSize)
					{
						g.chartsizes[i].selected= "selected";

						if(g.chartsizes[i].name == "Custom Size")
						{
							var width = $("#widthInput").val();
							var height = $("#heightInput").val();

							g.chartsizes[i].data = width +"," + height;
						}
					}
					else
					{
						g.chartsizes[i].selected = "";

						if(g.chartsizes[i].name == "Custom Size")
						{
							g.chartsizes[i].data= "600,343";
						}	
					}
				}
				
				chart.setYScales()
					.setYAxes()
					.setXAxis()
					.setLineMakers();
				ChartBuilder.redraw();
				ChartBuilder.updateYLabels();
				ChartBuilder.redraw();
			})
			
			chart.redraw();
		}
		
		
		var yAxisObj = []
		for (var i = g.yAxis.length - 1; i >= 0; i--){
			var cur = g.yAxis[i]
			yAxisObj[i] = {
				domain: cur.domain,
				tickValues: cur.tickValues,
				prefix: cur.prefix,
				suffix: cur.suffix,
				ticks: cur.ticks,
				formatter: cur.formatter
			}
		};
		
		var xAxisObj = {
			domain: g.xAxis.domain,
			prefix: g.xAxis.prefix,
			suffix: g.xAxis.suffix,
			type: g.xAxis.type,
			formatter: g.xAxis.formatter
		}
		
		if(isMultiAxis){
			$("#rightAxisControls").removeClass("hide")
		}
		else {
			$("#rightAxisControls").addClass("hide")
		}
		
		
		var state = {
			container: g.container,
			colors: g.colors,
			title: g.title,
			padding : g.padding,
			xAxis: xAxisObj,
			yAxis: yAxisObj,
			series: g.series,
			xAxisRef: g.xAxisRef,
			sourceline: g.sourceline,
			creditline: g.creditline
		}

		
		chart = g;
		ChartBuilder.inlineAllStyles();
		ChartBuilder.updateInterface();
	},

	updateInterface: function() {
		$(".previousCharts").css("display", "none");
		
		if ( chart.xAxis.type !== "date" ){
			$('.x_axis_tick_num_group').css("display", "none");
			$('.x_axis_date_format_group').css("display", "none");
			$('[type=checkbox]').css("display", "");
			$('[value=bargrid]').css("display", "");
		}
		else {
			$('.x_axis_tick_num_group').css("display", "");
			$('.x_axis_date_format_group').css("display", "");
			$('[type=checkbox]').css("display", "none");
			$('[value=bargrid]').css("display", "none");
		}

		if ( chart.isBargrid() ){
			$('[type=checkbox]').css("display", "none");
			$('#bottomAxisControls').css("display", "none");
			$('#left_axis_tick_num').css("display", "none");
			$('.left_axis_max_group').css("display", "none");
			$('.left_axis_min_group').css("display", "none");
			$('.left_axis_tick_num_group').css("display", "none");
			$('#rightYLabel').css("display", "none");
		} 
		else {
			$('[type=checkbox]').css("display", "");
			$('#bottomAxisControls').css("display", "");
			$('#left_axis_tick_num').css("display", "");
			$('.left_axis_max_group').css("display", "");
			$('.left_axis_min_group').css("display", "");
			$('.left_axis_tick_num_group').css("display", "");
			$('#rightYLabel').css("display", "");
		}

		if (chart.series.length < 2){
			$('[type=checkbox]').css("display", "none");
		}



		
	},

	setChartArea: function() {
		var notBargrid = 0;

		// if isBargrid is false
		if ( !chart.isBargrid() ) {

			// test if any of series data types have been set to "bargrid"
			// if so, set isBargrid to true
			for ( var i = 0; i < chart.series.length; i++ ){
				if ( chart.series[i].type === "bargrid"){
					chart.isBargrid(true);
					break;
				}
			}

			if (chart.isBargrid()){

				if (chart.splitSeriesByType(chart.series).bargrid.length === 1){

					if ( chart.state.hasLegend === true ){
						chart.state.hasLegend = false;
						chart.padding.top -= chart.padding.legend;
					}
				}	

				var numBars = chart.splitSeriesByType(chart.series).bargrid[0].data.length,
						totalBarHeight = numBars * chart.bargrid.barHeight,
						totalBarSpacing = (numBars - 1) * chart.bargrid.barSpacing,
						metaSpacing = d3.select("#metaInfo")[0][0] === null ? 20 : 20 + chart.padding.meta;

				ChartBuilder.updateYLabels();
				chart.height( totalBarHeight + totalBarSpacing + chart.padding.top + metaSpacing);
				d3.select("#ground").attr("height", chart.height());		
				$("#chartContainer").css("height", chart.height());
				
				
				chart.height( parseFloat($("#chartContainer").css("height")) );

				if ( d3.select("#metaInfo")[0][0] !== null){
					d3.select("#metaInfo").attr("transform", "translate(0," + (chart.height() - chart.padding.meta) +")");
				}
			}
			// else
			// {
			// 	ChartBuilder.updateYLabels();

			// 	chart.width( parseFloat($("#chartContainer").css("width")) );
			// 	d3.select("#ground").attr("height", chart.height());		
			// 	d3.select("#ground").attr("width", chart.width());	
				
				
			// 	chart.height( parseFloat($("#chartContainer").css("height")) );

			// 	if ( d3.select("#metaInfo")[0][0] !== null){
			// 		d3.select("#metaInfo").attr("transform", "translate(0," + (chart.height() - chart.padding.meta) +")");
			// 	}
			// }
		}

		// if isBargrid is true
		else {

			// test if any of series data types that were "bargrid" are no longer
			for ( var i = 0; i < chart.series.length; i++ ){
				if ( chart.series[i].type === "bargrid"){
					chart.isBargrid(true);

					if (chart.splitSeriesByType(chart.series).bargrid.length > 1){
						if (chart.state.hasLegend === false){
							chart.state.hasLegend = true;
							chart.padding.top += chart.padding.legend;
						}
						if (chart.state.hasMultiBargrids === false){
							chart.state.hasMultiBargrids = true;
						}
					}
					else {
						if (chart.state.hasLegend === true){
							chart.state.hasLegend = false;
							chart.padding.top -= chart.padding.legend;
						}
						chart.state.hasMultiBargrids = false;
					}

					var numBars = chart.splitSeriesByType(chart.series).bargrid[0].data.length,
						totalBarHeight = numBars * chart.bargrid.barHeight,
						totalBarSpacing = (numBars - 1) * chart.bargrid.barSpacing,
						metaSpacing = d3.select("#metaInfo")[0][0] === null ? 20 : 20 + chart.padding.meta;
					metaSpacing = (chart.state.hasMultiBargrids === true) ? metaSpacing + 14 : metaSpacing;

				ChartBuilder.updateYLabels();
				chart.height( totalBarHeight + totalBarSpacing + chart.padding.top + metaSpacing);
				d3.select("#ground").attr("height", chart.height());
				$("#chartContainer").css("height", chart.height() );
				chart.height( parseFloat($("#chartContainer").css("height")) );

				if ( d3.select("#metaInfo")[0][0] !== null){
					d3.select("#metaInfo").attr("transform", "translate(0," + (chart.height() - chart.padding.meta) +")");
				}
					break;
				} 
				else {
					notBargrid++;
				}
			}

			// if not series data types are set to "bargrid", set isBargrid to false and adjust the height of the chart
			if ( notBargrid === chart.series.length ){
				chart.isBargrid(false);
				//d3.select("#metaInfo").attr("transform", "translate(0,323)");

				chart.height(343);
				d3.select("#ground").attr("height", chart.height());				
				$("#chartContainer").css("height", chart.height());
				chart.height( parseFloat($("#chartContainer").css("height")) );

				if ( d3.select("#metaInfo")[0][0] !== null){
					d3.select("#metaInfo").attr("transform", "translate(0," + (chart.height() - chart.padding.meta) +")");
				}
				chart.redraw();
			}

			// need to adjust the chart height in the event that a right y label is present when switching to bargrid
			if ( chart.isBargrid() && d3.select("#rightYLabel")[0][0] !== null ){
				d3.select("#rightYLabel").remove();
				if ( d3.select("#leftYLabel")[0][0] === null || chart.yAxis[0].label === "" ){
					chart.height( chart.height() - chart.padding.yLabel );
					$("#chartContainer").css("height", chart.height());
					chart.height( parseFloat($("#chartContainer").css("height")) );
				}
			}
		}
	},
	updateTitle: function( that ){
		
		// if the title field and chart.title both contain an empty string, do nothing
		if (that !== undefined && (chart.title === "" && that.value === "")){
			chart.hasTitle = false;
			return;
		}

		// if a title needs to be generated because there is not enough series data for a legend
		else if (that === undefined){
			if ( !chart.isBargrid() ){
				if (chart.title === "" && chart.series.length === 1){
					var val = chart.series[0].name;
					chart.title = val;
					$("#chart_title").val(chart.title);
					d3.select("#titleBackground").attr("fill-opacity", 1);
					chart.titleLine.text(chart.title);
					chart.state.hasTitle = true;
					if (chart.state.hasLegend === true) {
						chart.state.hasLegend = false;
						chart.padding.top -= chart.padding.legend;
					}
					chart.padding.top += chart.padding.title;
					ChartBuilder.updateYLabels();
					ChartBuilder.setChartArea();
					chart.setYScales().redraw();
				} else if (chart.title !== "") {
					var val = chart.series[0].name;
					chart.title = val;
					$("#chart_title").val(chart.title);
					chart.titleLine.text(chart.title);
					chart.state.hasTitle = true;
					if (chart.state.hasLegend === true){
						chart.state.hasLegend = false;
						chart.padding.top -= chart.padding.legend;
					}
					ChartBuilder.updateYLabels();
					ChartBuilder.setChartArea();
					chart.setYScales().redraw();
				}
			} 
			else {
				if (chart.splitSeriesByType(chart.series).bargrid.length === 1){
					chart.title = chart.splitSeriesByType(chart.series).bargrid[0].name;
					$("#chart_title").val(chart.title);
					d3.select("#titleBackground").attr("fill-opacity", 1);
					chart.titleLine.text(chart.title);
					
					if (chart.state.hasTitle === false){
						chart.state.hasTitle = true;
						chart.padding.top += chart.padding.title;
						ChartBuilder.updateYLabels();
						ChartBuilder.setChartArea();
					}
					chart.setYScales().redraw();
				}
			}
		}
		
		// if the user is changing the value of chart.title and chart.title is empty
		else if (chart.title === ""){
  				var val = that.value;
  				chart.title = val;
				d3.select("#titleBackground").attr("fill-opacity", 1);
  				chart.titleLine.text(chart.title);
				chart.state.hasTitle = true;
				chart.padding.top += chart.padding.title;
				ChartBuilder.updateYLabels();
				ChartBuilder.setChartArea();
				chart.setYScales().redraw();
  		}

  		// if both chart.title and the title field's values are not an empty string 
  		else {
  			var val = $(that).val();
  			chart.title = val;
  			chart.titleLine.text(chart.title);
  			if (chart.title === ""){
				d3.select("#titleBackground").attr("fill-opacity", 0);
				chart.state.hasTitle = false;
				chart.padding.top -= chart.padding.title;
  				chart.titleLine.text(chart.title);
				ChartBuilder.updateYLabels();
				chart.setYScales().redraw();
  			}
  		}	
	},
	updateYLabels: function( that ){
		var axisId = 0,
			yLabel;

		// if the user is updating one of the y axis label fields
		if ( that !== undefined ) {
			
			// determine which y axis (if there are 2) is being modified 
			yLabel = "#" + d3.select(that).attr("id").split("_")[0] + "YLabel";
			axisId = d3.select(that).attr("id") === "left_axis_label" ? 0 : 1;

			// if the yLabel doesn't exist, then create it
			if ( chart.yAxis[ axisId ].label === undefined ){
		 		chart.createYLabel( axisId );
			}

			// if the yLabel is an empty string, but the user is entering a label that is not an empty string
			if ( chart.yAxis[ axisId ].label === "" && that.value !== "" ) {

				// does another yLabel exist that isn't an empty string
				if ( chart.state.hasYLabel === true ) {
					chart.yAxis[ axisId ].label = that.value;
					d3.select( yLabel ).text( chart.yAxis[ axisId ].label ).attr( "y", 14 );
				}
				
				// the user is entering the first yLabel
				else {
					chart.yAxis[ axisId ].label = that.value;
					d3.select( yLabel ).text( chart.yAxis[ axisId ].label ).attr( "y", 14 );
					d3.select( ".yLabelLine" ).attr( "transform", "translate(0,0)" );
					chart.state.hasYLabel = true;
					chart.padding.top += chart.padding.yLabel;
					chart.setYScales().redraw();
				}
			}

			// if the user just removed the value within the yLabel field
			else if ( chart.yAxis[ axisId ].label !== "" && that.value === "" ){
				chart.yAxis[ axisId ].label = that.value;
				d3.select( yLabel ).text( chart.yAxis[ axisId ].label );

				// if there is only 1 y axis
				if ( !chart.yAxis[1] ){
					
					// if there's no y label on the left axis
					if ( chart.yAxis[ 0 ].label === "" ){
						d3.select( ".yLabelLine" ).attr( "transform", "translate(0,"+ (-chart.padding.top) +")" );
						chart.state.hasYLabel = false;
						chart.padding.top -= chart.padding.yLabel;
						chart.setYScales().redraw();
					}
				} 

				// if there are 2 axis but the left axis y label was never created
				else if ( chart.yAxis[ 0 ].label === undefined ){
					d3.select( ".yLabelLine" ).attr( "transform", "translate(0,"+ (-chart.padding.top) +")" );
					chart.state.hasYLabel = false;
					chart.padding.top -= chart.padding.yLabel;
					chart.setYScales().redraw();
				}
				
				// there are 2 y axis
				else {

					// the last y label is being removed 
					if ( (axisId === 0 && chart.yAxis[ 1 ].label === "" ) || (axisId === 1 && chart.yAxis[ 0 ].label === "" ) ) {
						d3.select( ".yLabelLine" ).attr( "transform", "translate(0,"+ (-chart.padding.top) +")" );
						chart.state.hasYLabel = false;
						chart.padding.top -= chart.padding.yLabel;
						chart.setYScales().redraw();
					}

					// the other axis has a y label
					else {
						chart.yAxis[ axisId ].label = that.value;
						d3.select( yLabel ).text( chart.yAxis[ axisId ].label );
					}
				}
			}
			
			// just updating the y label value
			else {
				chart.yAxis[ axisId ].label = that.value;
				d3.select( yLabel ).text( chart.yAxis[ axisId ].label );

			}
		}

		// handles an edge case - where a right axis label was added and then the right axis was removed
		if ( $("#rightAxisControls").hasClass("hide") && $("#right_axis_label").val() !== "" ){
			$("#right_axis_label").val("");
			$("#right_axis_prefix").val("");
			$("#right_axis_suffix").val("");
			$("#right_axis_max").val("");
			$("#right_axis_min").val("");

			d3.select("#rightYLabel").text("");
			
			if ( chart.yAxis[ 0 ].label === undefined ) {
				d3.select( ".yLabelLine" ).attr( "transform", "translate(0,"+ (-chart.padding.top) +")" );
				chart.state.hasYLabel = false;
				chart.padding.top -= chart.padding.yLabel;
			}
			
			else if ( chart.yAxis[ 0 ].label === "" ) {
				d3.select( ".yLabelLine" ).attr( "transform", "translate(0,"+ (-chart.padding.top) +")" );
				chart.state.hasYLabel = false;
				chart.padding.top -= chart.padding.yLabel;
			}
		}
		
		d3.select("#yLabelContainer").attr("transform", "translate("+ chart.padding.left +","+ (chart.padding.top - chart.padding.yLabel) +")");
	},

	updateXLabel: function( that ){
		
		// if the x label is being added
		if ( chart.xAxis.label === "" && that.value !== "" ){
			chart.xAxis.label = that.value;
			d3.select("#xAxis").append("text")
				.attr("id", "xLabel")
				.attr("fill", "#9F9F9F")
				.attr("y", chart.padding.xAxis - 5)
				.attr("x", chart.getXLabelPosition( $("#x_axis_label_position").val() ))
				.text(chart.xAxis.label);
			chart.padding.xAxis += chart.padding.xLabel;
			d3.select("#xBackground").attr("height", Math.abs(chart.padding.xAxis));
			chart.state.hasXLabel = true;
			//chart.setXAxis();
		}

		// if the x label is being removed
		else if ( chart.xAxis.label !== "" && that.value === "" ){
			chart.xAxis.label = that.value;
			d3.select("#xLabel").remove();
			chart.padding.xAxis -= chart.padding.xLabel;
			d3.select("#xBackground").attr("height", Math.abs(chart.padding.xAxis));
			chart.state.hasXLabel = false;
			//chart.setXAxis();
		}

		// the current value is being updated with a value that isn't an empty string
		else {
			chart.xAxis.label = that.value;
			d3.select("#xLabel").text( chart.xAxis.label );
		}
	},

	getAllInputData: function() {
		var d = {}, $el;
		var elems = $("input, textarea, select:not(#previous_charts)").each(function() {
			$el = $(this)
			d[$el.attr("id")] = $el.val()
		})
		return d
	},
	storeLocalChart: function(name) {
		try {
			localStorage["savedCharts"][0]
		}
		catch(e) {
			localStorage["savedCharts"] = JSON.stringify([])
		}
		
		var allcharts = JSON.parse(localStorage["savedCharts"])
		newChart = this.getAllInputData()
		newChart.name = name
		allcharts.push(newChart)
		localStorage["savedCharts"] = JSON.stringify(allcharts);
	},
	getLocalCharts: function() {
		var charts = []
		try {
			charts = JSON.parse(localStorage["savedCharts"])
		}
		catch(e){ /* Fail Silently */}
		
		return charts
	},
	loadLocalChart: function(d) {
		for (var key in d) {
			if(key != "name") {
				$("#"+key).val(d[key])
				//$("#"+key).text(d[key])
			}
		}
		$("input, textarea, select:not(#previous_charts)").keyup().change()
	},
	idSafe: function(s) {
		s = s.replace(/[^\w\d]+/gi,"-")
		return s
	},
	addCommas: function(nStr)
	{
		if(nStr.indexOf("/") >= 0 || nStr.indexOf("-") >= 0) {
			return nStr;
		}
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2'); //TODO localize this
		}
		return x1 + x2;
	},
	actions: {		
		chart_size_change: function(index,that) {
			var selectedSize = $(that).find("option:selected").text();
			var g = chart;
			var sizeValues;

			for(var i=0;i<g.chartsizes.length;i++)
			{
				if(g.chartsizes[i].name == selectedSize)
				{
					g.chartsizes[i].selected= "selected";
					
					sizeValues = g.chartsizes[i].data;
				}
				else
				{
					if(g.chartsizes[i].name == "Custom Size")
					{
						g.chartsizes[i].data = "600,343";
					}

					g.chartsizes[i].selected = "";	
				}
			}
			
			var splitSizeValues = sizeValues.split(",");
			var chartWidth = splitSizeValues[0];
			var chartHeight = splitSizeValues[1];
			var widthInputBox = $("#widthInput");
			var heightInputBox = $("#heightInput");


			widthInputBox.val(chartWidth);
			heightInputBox.val(chartHeight);

			if(selectedSize == "Custom Size" && $("#heightInput")!==undefined)
			{
				d3.select("#widthInput").attr('disabled', null);
				d3.select("#heightInput").attr('disabled', null);
			}
			else
			{
				d3.select("#widthInput").attr('disabled', "disabled");
				d3.select("#heightInput").attr('disabled', "disabled");
			}

			$('#topSection').css({ height: Number(splitSizeValues[1]) + 57 +"px" });

			$('.chartContainer').css({ width: chartWidth });
			$('.chartContainer').css({ height: chartHeight });

			chart.width(chartWidth);		
			chart.height(chartHeight);	
			d3.select("#ground").attr("width", chartWidth);
			d3.select("#ground").attr("height", chartHeight);
			d3.select("#titleContainer").attr("width",chartWidth);
			d3.select("#titleBackground").attr("width", chartWidth);
			d3.select("#xAxis").attr("width", chartWidth);			

			d3.select("#xBackground").remove();	
			d3.select("#leftAxis").remove();
			d3.select("#rightAxis").remove();	
			d3.select("#yLabelContainer").remove();

			chart.setYAxes(true);

			var rightAxisLabel = $("#right_axis_label").val();
			var leftAxisLabel = $("#left_axis_label").val();
			var bottomAxisLabel = $("#x_axis_label").val();
			var createdLabelContainer = false;

			if (rightAxisLabel !== "" && rightAxisLabel !== undefined)
			{				
				chart.yAxis[ 1 ].label = undefined;
				g.labelContainer=undefined;
				$("#right_axis_label").keyup();

				createdLabelContainer = true;
			}

			if(leftAxisLabel !== "" && leftAxisLabel !== undefined)
			{
				if(createdLabelContainer == false)
				{
					g.labelContainer = undefined;
				}

				chart.yAxis[ 0 ].label = undefined;
				$("#left_axis_label").keyup();
			}

			ChartBuilder.setChartArea();					
			chart.redraw();

			if(bottomAxisLabel !== "" && bottomAxisLabel !== undefined)
			{
				d3.select("#xLabel").attr("x", chart.getXLabelPosition( $("#x_axis_label_position").val() ));
			}

			if(chart.metaInfo !== undefined)
			{
				chart.metaInfo.remove();
			}

			if ( chart.creditline !== "" || chart.sourceline !== "")
			{
				chart.appendMeta();
			}

			if(Number(chartHeight) > 500)
			{
				$('#staticContainer').css({ position: "absolute" });
			}
			else
			{
				$('#staticContainer').css({ position: "fixed" });
			}
		},
		axis_prefix_change: function(index,that) {
			chart.yAxis[index].prefix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_suffix_change: function(index,that) {
			chart.yAxis[index].suffix.value = $(that).val();
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_tick_num_change: function(index,that) {
			chart.yAxis[index].ticks = parseInt($(that).val())
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_max_change: function(index,that) {
			var val = parseFloat($(that).val())
			if(isNaN(val)) {
				val = null
			}
			chart.yAxis[index].domain[1] = val;
			chart.setYScales();
			chart.getLongestYValue();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_min_change: function(index,that) {
			var val = parseFloat($(that).val())
			if(isNaN(val)) {
				val = null
			}
			chart.yAxis[index].domain[0] = val;
			chart.setYScales();
			chart.getLongestYValue();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		},
		axis_label_change: function( that ) {
			
			ChartBuilder.updateXLabel( that );
			ChartBuilder.redraw();
			ChartBuilder.inlineAllStyles();
		},
		axis_label_position: function( that ){
			var val = $(that).val();
			d3.select("#xLabel").attr("x", chart.getXLabelPosition(val))
			switch (val){
				case "Right":
					d3.select("#xLabel").attr("text-anchor", "end");
					break;
				case "Left":
					d3.select("#xLabel").attr("text-anchor", "start");
					break;
				case "Center":
					d3.select("#xLabel").attr("text-anchor", "middle");
				default :
					break;
			}
		},
		axis_tick_override_change: function(index,that) {
			var val = $(that).val()
			val = val.split(",")
			if(val.length > 1) {
				for (var i = val.length - 1; i >= 0; i--){
					val[i] = parseFloat(val[i])
				};
			}
			else {
				val = null
			}
			chart.yAxis[index].tickValues = val
			chart.setYScales();
			ChartBuilder.redraw()
			ChartBuilder.inlineAllStyles();
		}
	},
	showInvalidData: function() {
		$("#inputDataHeading").addClass("inputDataHInvData");
		$("#invalidDataSpan").removeClass("hide");
	},
	hideInvalidData: function() {
		$("#inputDataHeading").removeClass("inputDataHInvData");
		$("#invalidDataSpan").addClass("hide");
	}
}

// Create default config for chartbuilder
ChartBuilder.getDefaultConfig = function() {
  var chartConfig = {};
  
  chartConfig.colors = ["00ADEF", "0A57A4", "B20838", "FF6600","65B500","889CA2","FFB800","006065","780028","AF335C","BE597A","D28CA3","DCA6B8","993900","FF6600",
	"FF9900","FFB800","003300","006600","65B500","ACD733","889CA2","A0B0B5","B8C4C7","CFD7DA", "000000"];	

  
  return chartConfig;
}

// Starts applicatoin given config object
ChartBuilder.start = function(config) {

  // Create config
  var chartbuilderDefaultConfig = ChartBuilder.getDefaultConfig();
  var chartConfig = $.extend(Gneiss.defaultGneissChartConfig, chartbuilderDefaultConfig, config);
  
  $(document).ready(function() {
  	
  	//construct a Gneisschart using default data
  	//this should change to be more like this http://bost.ocks.org/mike/chart/
    chart = new Gneiss(chartConfig);  

    var defaultSize = window.localStorage.getItem('ChartSize');
    var defaultLeftAxisOptions = localStorage.getItem('LeftAxisOptions');
    var defaultRightAxisOptions = localStorage.getItem('RightAxisOptions');
    var defaultBottomAxisOptions = localStorage.getItem('BottomAxisOptions');

    if (defaultSize != null)
    {
	    for(var i=0;i<chart.chartsizes.length;i++)
		{
			if(chart.chartsizes[i].name == defaultSize)
			{
				chart.chartsizes[i].selected= "selected";
				
				sizeValues = chart.chartsizes[i].data;
			}
			else
			{
				if(chart.chartsizes[i].name == "Custom Size")
				{
					chart.chartsizes[i].data = "600,343";
				}

				chart.chartsizes[i].selected = "";	
			}
		}
	}

	var seriesIndex = 0;
	var seriesName = window.localStorage.getItem('SeriesOptions_Name_' + seriesIndex);

	var chartOptions = JSON.parse(window.localStorage.getItem('ChartOptions'));
	var bottomAxisOptions = JSON.parse(window.localStorage.getItem('BottomAxisOptions'));

	if(bottomAxisOptions != null)
	{
		for(var i=0;i<chart.xAxis.labelPosition.length;i++)
		{
			if(chart.xAxis.labelPosition[i].name == bottomAxisOptions.Position)
			{
				chart.xAxis.labelPosition[i].selected = "selected";
			}
			else
			{
				chart.xAxis.labelPosition[i].selected = "";
			}
		}

		for(var i=0;i<chart.xAxis.dateFrequency.length;i++)
		{
			if(chart.xAxis.dateFrequency[i].name == bottomAxisOptions.TickDateFrequency)
			{
				chart.xAxis.dateFrequency[i].selected = "selected";
			}
			else
			{
				chart.xAxis.dateFrequency[i].selected = "";
			}
		}

		for(var i=0;i<chart.xAxis.dateFormat.length;i++)
		{
			if(chart.xAxis.dateFormat[i].name == bottomAxisOptions.DateFormat)
			{
				chart.xAxis.dateFormat[i].selected = "selected";
			}
			else
			{
				chart.xAxis.dateFormat[i].selected = "";
			}
		}
	}


	if (chartOptions !== null)
	{	
		chart.state.hasTitle = true;
		chart.title = chartOptions.Title;
		chart.creditline = chartOptions.CreditLine;
		chart.sourceline = chartOptions.SourceLine;
	}	
	


	if(window.localStorage.getItem('ChartData')!==null && window.localStorage.getItem('ChartData') !== undefined)
	{
		var newData = ChartBuilder.getNewData(window.localStorage.getItem('ChartData'));

		dataObj = ChartBuilder.makeDataObj(newData);

		if(dataObj == null) {
			ChartBuilder.showInvalidData();
			return;
		}

		d3.select("#invalidDataSpan").text("Warning: Data is Invalid");

		ChartBuilder.hideInvalidData();

		ChartBuilder.createTable(newData, dataObj.datetime);
		
		chart.series.unshift(chart.xAxisRef)
		dataObj = ChartBuilder.mergeData(dataObj)
		
		if(dataObj.datetime) {
			chart.xAxis.type = "date";
			chart.xAxis.formatter = chart.xAxis.formatter?chart.xAxis.formatter:"mm/dd/yyyy";
		}
		else {
			chart.xAxis.type = "ordinal";
		}

		chart.xAxisRef = [dataObj.data.shift()]			

		chart.series = dataObj.data;

		//$('#csvInput').val(newData);
		//$('#curRaw').val(newData);

	}

	while(seriesName!==undefined && seriesName!==null)
	{
		chart.series[seriesIndex].name = seriesName;

		chart.series[seriesIndex].source = window.localStorage.getItem('SeriesOptions_Source_' + seriesIndex);
		chart.series[seriesIndex].type = window.localStorage.getItem('SeriesOptions_Type_' + seriesIndex);
		//chart.series[seriesIndex].axis = localStorage.getItem('SeriesOptions_Axis_' + seriesIndex);
		chart.series[seriesIndex].color = window.localStorage.getItem('SeriesOptions_Color_' + seriesIndex);

		seriesIndex++;

		seriesName = window.localStorage.getItem('SeriesOptions_Name_' + seriesIndex);
	}


	// if(defaultData !== null)
	// {
	// 	$("#csvInput").val(defaultData);
	// 	$("#csvInput").keyup();
	// }



  	// Scale the chart up so the outputted image looks good on retina displays
  	//$("#chart").attr("transform", "scale(2)");
  	
  	//populate the input with the data that is in the chart
  	$("#csvInput").val(function() {
  		var data = []
  		var val = ""
  
  		data[0] = chart.xAxisRef[0].data
  		data[0].unshift(chart.xAxisRef[0].name)
  
  		for (var i = 0; i < chart.series.length; i++) {
  			data[i+1] = chart.series[i].data
  			data[i+1].unshift(chart.series[i].name)
  		};
  
  		data = ChartBuilder.pivotData(data)
  
  		for (var i = 0; i < data.length; i++) {
  			data[i] = data[i].join("\t")
  		}; 
  		return data.join("\n")
  	})
  
  	//load previously made charts
  	//var savedCharts = ChartBuilder.getLocalCharts();
  	//var chartSelect = d3.select("#previous_charts")
  					//.on("change",function() {
  						//ChartBuilder.loadLocalChart(d3.select(this.selectedOptions[0]).data()[0])
  					//})
  	
  	//chartSelect.selectAll("option")
  			//.data(savedCharts)
  			//.enter()
  			//.append("option")
  			//.text(function(d){return d.name?d.name:"Untitled Chart"})
  	
	$('#popupBoxClose').click( function() {           
        unloadPopupBox();
    });

  	$("#saveAsDefaultButton").click(function() {
		ChartBuilder.SaveAsDefaultSettings();

 		loadPopupBox();
  	})

  	$("#removeDefaultSettingsButton").click(function() {
		ChartBuilder.RemoveDefaultSettings();		

		location.reload();
  	})

  	
  	$("#createImageButton").click(function() {
			ChartBuilder.inlineAllStyles();

		  if($("#downloadLinksDiv").hasClass("hide")) {
				$("#downloadLinksDiv").removeClass("hide");
				ChartBuilder.createChartImage();
			}
			//$("#downloadLinksDiv").toggleClass("hide");
  	})
		  	
  	 function loadPopupBox() {    // To Load the Popupbox
            $('#popup_box').fadeIn("slow");
            $("#container").css({ // this is just for style
                "opacity": "0.3" 
            });        
        }        

     function unloadPopupBox() {    // TO Unload the Popupbox
            $('#popup_box').fadeOut("slow");
            $("#container").css({ // this is just for style       
                "opacity": "1" 
            });
        }    

	$("#x_axis_tick_date_frequency").change(function(){
		var val = $(this).val().split(" ")
		//if the selected option has two words set it as the number of ticks
		//else set ticks to null
		chart.xAxis.ticks = val.length > 1 ? val : val = 'auto' ? 5 : null
		ChartBuilder.redraw()
		ChartBuilder.inlineAllStyles();
	})


  	$("#csvInput").bind("paste", function(e) {
  		//do nothing special
  	})

  	
  	/*
  	//
  	// add interactions to chartbuilder interface
  	//
  	*/

  	$("#heightInput").keyup(function() {
		var chartHeight=$(this).val();
		var selectedSize = $("#sizeItems :selected").text();

		$('#topSection').css({ height: Number(chartHeight) + 57 +"px" });

		$('.chartContainer').css({ height: chartHeight });
		chart.height(chartHeight);	
		d3.select("#ground").attr("height", chartHeight);

		d3.select("#xBackground").remove();	
		d3.select("#leftAxis").remove();
		d3.select("#rightAxis").remove();	

		if(selectedSize == "Custom Size")
		{
			for(var i=0;i<chart.chartsizes.length;i++)
			{
				if(chart.chartsizes[i].name == "Custom Size")
				{
					var width = $("#widthInput").val();
					var height = $("#heightInput").val();

					chart.chartsizes[i].data = width +"," + height;
				}
			}
		}				

		chart.setYAxes(true);

		ChartBuilder.setChartArea();		
		chart.redraw();

		if(chart.metaInfo !== undefined)
		{
			chart.metaInfo.remove();
		}

		if ( chart.creditline !== "" || chart.sourceline !== "")
		{
			chart.appendMeta();
		}

		if(Number(chartHeight) > 500)
		{
			$('#staticContainer').css({ position: "absolute" });
		}
		else
		{
			$('#staticContainer').css({ position: "fixed" });
		}

  	})

	$(document).ready(function() {
	    $('input[type!="button"][type!="submit"][id!="widthInput"][id!="heightInput"], select, textarea[id!="csvInput"]')
	         .val('')
	         .blur();

	    var leftAxisOptions = JSON.parse(window.localStorage.getItem('LeftAxisOptions'));
	    var bottomAxisOptions = JSON.parse(window.localStorage.getItem('BottomAxisOptions'));

		if(leftAxisOptions !== null)
		{
			$('#left_axis_max').val(leftAxisOptions.LeftAxisMax).change();
			$('#left_axis_min').val(leftAxisOptions.LeftAxisMin).change();
		}

	    //to set the default values of the pull down menus
	    $('#left_axis_tick_num').val(Number(chart.yAxis[0].ticks)).change();
	    $('#x_axis_tick_num').val(Number(chart.xAxis.ticks)).change();


	    if(chart.title != "" && chart.state.hasTitle != false)
	    {
	    	var chartTitle = chart.title;
	    	var creditLine = chart.creditline;
	    	var sourceLine = chart.sourceline;

			$('#chart_title').val(chartTitle);
			$('#sourceLine').val(sourceLine);
			$('#creditLine').val(creditLine);

			d3.select("#titleBackground").attr("fill-opacity", 1);
			chart.titleLine.text(chart.title);
			chart.padding.top += chart.padding.title;

			if ( chart.creditline !== "" || chart.sourceline !== "")
			{
				chart.appendMeta();
			}

			ChartBuilder.updateYLabels();
			ChartBuilder.setChartArea();
			chart.setYScales().redraw();
		}

		var bottomAxisLabel = $('#x_axis_label'); 
	    var axisLabelContainer = $('#x_axis_label_position');
	    var axisDateFormatContainer = $('#x_axis_date_format');
	    var axisDateFrequencyContainer = $('#x_axis_tick_date_frequency');
	    var axisLabelPositionHTML;
	    var axisDateFormatHTML;
	    var axisDateFrequencyHTML;


	    for (var i=0; i<chart.xAxis.labelPosition.length; i++)
	    {
	    	if (chart.xAxis.labelPosition[i].selected == "selected")
	    	{
	    		axisLabelPositionHTML = "<option selected>" + chart.xAxis.labelPosition[i].name + "</option>";
	    	}
	    	else
	    	{
	    		axisLabelPositionHTML = "<option>" + chart.xAxis.labelPosition[i].name + "</option>";
	    	}

	    	axisLabelContainer.append(axisLabelPositionHTML);
	    }

	    if(bottomAxisOptions !== null)
	    {
	    	bottomAxisLabel.val(bottomAxisOptions.Label).keyup();
	    }

	    for (var i=0; i<chart.xAxis.dateFormat.length; i++)
	    {
	    	if (chart.xAxis.dateFormat[i].selected == "selected")
	    	{
	    		axisDateFormatHTML = $('<option value="' + chart.xAxis.dateFormat[i].name + '" selected>' + chart.xAxis.dateFormat[i].name + '</option>');
	    	}
	    	else
	    	{
	    		axisDateFormatHTML = $('<option value="' + chart.xAxis.dateFormat[i].name + '">' + chart.xAxis.dateFormat[i].name + '</option>');
	    	}

	    	axisDateFormatContainer.append(axisDateFormatHTML);
	    }

	    for (var i=0; i<chart.xAxis.dateFrequency.length; i++)
	    {
	    	if (chart.xAxis.dateFrequency[i].selected == "selected")
	    	{
	    		axisDateFrequencyHTML = $('<option value="' + chart.xAxis.dateFrequency[i].name + '" selected>' + chart.xAxis.dateFrequency[i].name + '</option>');
	    	}
	    	else
	    	{
	    		axisDateFrequencyHTML = $('<option value="' + chart.xAxis.dateFrequency[i].name + '">' + chart.xAxis.dateFrequency[i].name + '</option>');
	    	}

	    	axisDateFrequencyContainer.append(axisDateFrequencyHTML);
	    }

	    $('#x_axis_tick_date_frequency').val($("#x_axis_tick_date_frequency").find("option:selected").text()).change();

	    $('#x_axis_date_format').val($("#x_axis_date_format").find("option:selected").text()).change();
	});

  	 $("#widthInput").keyup(function() {
		var chartWidth=$(this).val();	
		var selectedSize = $("#sizeItems :selected").text();

		$('.chartContainer').css({ width: chartWidth });
		chart.width(chartWidth);	
		d3.select("#ground").attr("width", chartWidth);
		d3.select("#titleContainer").attr("width",chartWidth);
		d3.select("#titleBackground").attr("width", chartWidth);
		d3.select("#xAxis").attr("width", chartWidth);		

		d3.select("#xBackground").remove();	
		d3.select("#leftAxis").remove();
		d3.select("#rightAxis").remove();	
		d3.select("#yLabelContainer").remove();				

		chart.setYAxes(true);

		var rightAxisLabel = $("#right_axis_label").val();
		var leftAxisLabel = $("#left_axis_label").val();
		var bottomAxisLabel = $("#x_axis_label").val();

		var createdLabelContainer = false;

		if (rightAxisLabel !== "")
		{				
			chart.yAxis[ 1 ].label = undefined;
			chart.labelContainer=undefined;
			$("#right_axis_label").keyup();

			createdLabelContainer = true;
		}

		if(leftAxisLabel !== "")
		{
			if(createdLabelContainer == false)
			{
				chart.labelContainer = undefined;
			}
			
			chart.yAxis[ 0 ].label = undefined;
			$("#left_axis_label").keyup();
		}

		if(selectedSize == "Custom Size")
		{
			for(var i=0;i<chart.chartsizes.length;i++)
			{
				if(chart.chartsizes[i].name == "Custom Size")
				{
					var width = $("#widthInput").val();
					var height = $("#heightInput").val();

					chart.chartsizes[i].data = width +"," + height;
				}
			}	
		}	

		ChartBuilder.setChartArea();		
		chart.redraw();

		if(bottomAxisLabel !== "" && bottomAxisLabel !== undefined)
		{
			d3.select("#xLabel").attr("x", chart.getXLabelPosition( $("#x_axis_label_position").val() ));
		}


		if(chart.metaInfo !== undefined)
		{
			chart.metaInfo.remove();
		}

		if ( chart.creditline !== "" || chart.sourceline !== "")
		{
			chart.appendMeta();
		}
  	})

  	$("#csvInput").keyup(function() {

  		//check if the data is different
  		if( $(this).val() != ChartBuilder.curRaw) {
  			//cache the the raw textarea value
  			ChartBuilder.curRaw = $(this).val()
 			
  			ChartBuilder.updateInterface();
  			
  			if($("#right_axis_max").val().length == 0 && $("#right_axis_min").val().length == 0) {
  					chart.yAxis[0].domain = [null,null];
  			}
  			
  			if(chart.yAxis.length > 1 && $("#left_axis_max").val().length == 0 && $("#left_axis_min").val().length == 0) {
  					chart.yAxis[1].domain = [null,null];
  			}
  			
  			var csv = $("#csvInput").val();
  			var newData = ChartBuilder.getNewData(csv);
  			if(newData == null) {
					ChartBuilder.showInvalidData();
  				return;
  			}

  			// if the current chart is a bargrid, but then a date chart is entered
		  	// swithc all of the bargrids to a line
		  	if ( chart.splitSeriesByType(chart.series).bargrid.length > 0 && chart.xAxis.type === "date" ){
		  		var seriesByType = {
					"line": [],
					"column": [],
					"stackedcolumn": [],
					"bargrid": [],
					"scatter": [],
					"area": [],
					"stackedarea": []
				};

		  		for (var i = 0; i < chart.series.length; i++) {
		  			if (chart.series[i].type === "bargrid"){
		  				chart.series[i].type = "line";
		  			}
		  			seriesByType[chart.series[i].type].push(chart.series[i]);
		  		}
		  	}
  
  			dataObj = ChartBuilder.makeDataObj(newData);

  			if(dataObj == null) {
					ChartBuilder.showInvalidData();
  				return;
  			}

  			d3.select("#invalidDataSpan").text("Warning: Data is Invalid");

			ChartBuilder.hideInvalidData();
  
  			ChartBuilder.createTable(newData, dataObj.datetime);
  			
  			chart.series.unshift(chart.xAxisRef)
  			dataObj = ChartBuilder.mergeData(dataObj)
  			
  			if(dataObj.datetime) {
  				chart.xAxis.type = "date";
  				chart.xAxis.formatter = chart.xAxis.formatter?chart.xAxis.formatter:"mm/dd/yyyy";
  			}
  			else {
  				chart.xAxis.type = "ordinal";
  			}
  			chart.xAxisRef = [dataObj.data.shift()]			


  			chart.series = dataObj.data;


  			if(newData[0].length == 2)
  			{
	  			for (var i=0; i < chart.series.length; i++) {
	  				chart.series[i].axis =0;

	  				d3.select("#rightAxis").remove();

					if($("#right_axis_label").val() !== undefined && $("#right_axis_label").val() !== "")
					{
						$(".yLabelLine").detach();
						d3.select("#yLabelContainer").remove();
						$("#right_axis_label").val("");

						chart.labelContainer=undefined;
						$("#right_axis_label").keyup();
						d3.select("#yLabelContainer").remove();

						chart.yAxis.splice(1,1);
					}	
				}
			}

  			if (chart.state.hasLegend === true && chart.series.length < 2) {
		  		chart.state.hasLegend = false;
		  		chart.padding.top -= chart.padding.legend;
		  		ChartBuilder.updateTitle();
		  	}		    			

			ChartBuilder.setChartArea();
  			
  			chart.setYScales()
  				.setXScales()
  				.setLineMakers();
  				
  			ChartBuilder.redraw();
  			ChartBuilder.inlineAllStyles();
  			ChartBuilder.updateInterface();
  		}
  

  	}).keyup() 


	$("#sizeItems").change(function() {
  		ChartBuilder.actions.chart_size_change(0,this)
  	})
  	
	$("#left_axis_label").keyup(function() {
  		ChartBuilder.updateYLabels(this);
  		ChartBuilder.setChartArea();
  	})

  	$("#left_axis_prefix").keyup(function() {
  		ChartBuilder.actions.axis_prefix_change(0,this)
  	})
  
  	$("#left_axis_suffix").keyup(function() {
  		ChartBuilder.actions.axis_suffix_change(0,this)
  	})
  
  	$("#left_axis_tick_num").change(function() {
  		ChartBuilder.actions.axis_tick_num_change(0,this)
  	})
  
  	$("#left_axis_max").keyup(function() {
  		ChartBuilder.actions.axis_max_change(0,this)
  	})
  
  	$("#left_axis_min").keyup(function() {
  		ChartBuilder.actions.axis_min_change(0,this)
  	})
  
  	$("#left_axis_tick_override").keyup(function() {
  		ChartBuilder.actions.axis_tick_override_change(0,this)
  	})

  	$("#right_axis_label").keyup(function() {
  		ChartBuilder.updateYLabels(this);
  		ChartBuilder.setChartArea();
  	})

  	$("#right_axis_prefix").keyup(function() {
  		ChartBuilder.actions.axis_prefix_change(1,this)
  	})
  	
  	$("#right_axis_suffix").keyup(function() {
  		ChartBuilder.actions.axis_suffix_change(1,this)
  	})
  	
  	$("#right_axis_tick_num").change(function() {
  		ChartBuilder.actions.axis_tick_num_change(1,this)
  	})
  	
  	$("#right_axis_max").keyup(function() {
  		ChartBuilder.actions.axis_max_change(1,this)
  	})
  	
  	$("#right_axis_min").keyup(function() {
  		ChartBuilder.actions.axis_min_change(1,this)
  	})
  	
  	$("#right_axis_tick_override").keyup(function() {
  		ChartBuilder.actions.axis_tick_override_change(1,this)
  	})

  	$("#x_axis_label").keyup(function() {
  		ChartBuilder.actions.axis_label_change(this)
  	})

  	$("#x_axis_label_position").change(function() {
  		ChartBuilder.actions.axis_label_position(this)
  	})
  	
  	$("#x_axis_tick_num").change(function() {
  		chart.xAxis.ticks = parseInt($(this).val())
  		ChartBuilder.redraw()
  		ChartBuilder.inlineAllStyles();
  	})
  	
  	$("#x_axis_date_format").change(function() {
  		var val = $(this).val()
  		chart.xAxis.formatter = val
  		ChartBuilder.redraw()
  		ChartBuilder.inlineAllStyles();
  	})
  	
  	$("#creditLine").keyup(function() {
  		
  		// capture the current value of the field
  		var val = $(this).val()

  		// if the chart's creditline property is empty, but the field is not
  		if ( chart.creditline === "" && val !== ""){
  			
  			// if the metaInfo group doesn't exist, add it
	  		if ( d3.select("#metaInfo")[0][0] === null ){
	  			chart.appendMeta();
	  			ChartBuilder.setChartArea();
	  			chart.redraw();
	  		}
	  		chart.creditline = val;
			chart.creditLine.text(chart.creditline);
  		} 
  		
		if (chart.creditline !== ""){
  			chart.creditline = val;
			chart.creditLine.text(chart.creditline);
  		} 

		// there is no metadata entered into the credit or source fields, remove the group
  		if ( (chart.sourceline === "" && val === "") && (chart.creditline === "" && val === "") ){
  			chart.metaInfo.remove();
  			ChartBuilder.setChartArea();
  			chart.redraw();
  		}
  	});

  	$("#sourceLine").keyup(function() {
  		
  		// capture the current value of the field
  		var val = $(this).val();

  		// if the chart's sourceline property is empty, but the field is not
  		if ( chart.sourceline === "" && val !== ""){
  			
  			// if the metaInfo group doesn't exist, add it
	  		if ( d3.select("#metaInfo")[0][0] === null ){
	  			chart.appendMeta();
	  			ChartBuilder.setChartArea();
	  			chart.redraw();
	  		}
	  		chart.sourceline = val;
			chart.sourceLine.text(chart.sourceline);
  		}
  		if (chart.sourceline !== ""){
  			chart.sourceline = val;
			chart.sourceLine.text(chart.sourceline);
  		} 
  		// store the capture value in the chart's creditline property
  		// use that value to update the text value
		

		// there is no metadata entered into the credit or source fields, remove the group
  		if ( (chart.sourceline === "" && val === "") && (chart.creditline === "" && val === "") ){
  			chart.metaInfo.remove();
  			ChartBuilder.setChartArea();
  			chart.redraw();
  		}
  	});	
  	
  	$("#chart_title").keyup(function() {
  		ChartBuilder.updateTitle(this);
  		//chart.resize();
  		ChartBuilder.setChartArea();
  		
  	});
  	
  	$(".downloadLink").click(function() {
  		$("#downloadLinksDiv").addClass("hide");
  	})
  })
};
