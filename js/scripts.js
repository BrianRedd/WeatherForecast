/* --------------------------------------------------------
* Filename: scripts.js
* Description: General scripts for Weather Forecast

* Author: R. Brian Redd 
--------------------------------------------------------*/

$(document).ready(function() {

    /* Variables */
    var zipcode;
    var city;
    var fc = 0; //Fahrenheit (0) or Celsius (1)
    var units = [{
        system: "imperial",
        unit: "Fahrenheit"
    }, {
        system: "metric",
        unit: "Celsius"
    }];
    var barGraph = true;
    var svgWidth = $(".container").width(),
        svgHeight = 120;
    var $locForm = $("#locationForm");
    var $err = $("#errors");
    var $cityName = $(".city");
    var $unit = $(".degreeUnits");
    var $graphBtn = $locForm.find("#graphTypeBtn");
    var $hidden = $("h5");
    var $welcome = $("#welcome");
    var $icons = $(".weather_icons");
    var $wind = $(".wind_direction");

    var margin = { top: 0, right: 40, bottom: 15, left: 50 };
    var width = svgWidth - margin.left - margin.right;

    /* Constants */
    const apiKEY = "eb02d0472566fca615fc7006e81869d3";
    const apiURL = "http://api.openweathermap.org/data/2.5/forecast?id=524901&units=" + units[fc].system + "&APPID=" + apiKEY;
    const iconURL = "http://openweathermap.org/img/w/";
    const windDirection = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const tempColorArray = ["#FF00FF", "#9E00FF", "#0000FF", "#007EFF", "#00CCFF", "#05F7F7", "#7FFF00", "#F7F705", "#FFCC00", "#FF9900", "#FF4F00", "#CC0000", "#A90303", "#BA3232"];

    /* jQuery Events */

    // form submit
    $locForm.find("#locationFormSubmit").click(() => {
        zipcode = null;
        city = null;
        city = $locForm.find('input[name="city"]').val();
        zipcode = $locForm.find('input[name="zipcode"]').val();
        if (zipcode) {
            window.location.href = window.location.href.split('?')[0] + "?zipcode=" + zipcode;
        } else if (city) {
            window.location.href = window.location.href.split('?')[0] + "?city=" + city;
        } else {
            $err.html("<h2>Please enter either a valid Zip Code or a U.S City</h2>");
        }
    });

    // form clear
    $locForm.find("#clearLocationForm").click(() => {
        zipcode = null;
        city = null;
        $hidden.addClass("hidden");
        $welcome.removeClass("hidden");
        $(".container").find("svg").empty();
        $icons.empty();
        $wind.empty();
        $locForm.find('input[name="zipcode"]').val('');
        $locForm.find('input[name="city"]').val('');
    });

    // form change graph type
    $graphBtn.click(() => {
        barGraph = !barGraph;
        if (barGraph) {
            $graphBtn.text("Line Graph");
            getWeather();
        } else {
            $graphBtn.text("Bar Graph");
            getWeather();
        }
    });

    $hidden.click(function() {
        console.log($(this).attr("action"));
        $(".container").find("." + $(this).attr('action')).slideToggle();
    });

    /* Functions */

    // fire data load and display process
    function getWeather() {

        // clear any existing display
        $(".container").find("svg").empty();

        // populate form data with query string parameters
        if (zipcode) {
            $locForm.find('input[name="zipcode"]').val(zipcode);
        }
        if (city) {
            $locForm.find('input[name="city"]').val(city);
        }

        // load data from API if query strings are populated
        if (city) {
            dataStoredLocally(null, city);
        } else if (zipcode) {
            dataStoredLocally(zipcode, null);
        }
    }

    // get query string parameters
    var getURLParameter = (params) => {
        let pageURL = decodeURIComponent(window.location.search.substring(1)),
            URLVariables = pageURL.split('&'),
            queryName;
        for (let i = 0; i < URLVariables.length; i++) {
            queryName = URLVariables[i].split('=');
            if (queryName[0] === params) {
                return queryName[1] === undefined ? true : queryName[1];
            }
        }
    }

    // is data for city already contained in sessionStorage?
    function dataStoredLocally(zip, city) {
        if (!zip && !city) return;
        let data = null;
        let storedCity = city;
        if (zip) {
            storedCity = localStorage.getItem(zip);
        }
        if (storedCity) {
            console.log("Data found in session storage.");
            data = JSON.parse(sessionStorage.getItem(storedCity));
        }
        if (!data) {
            console.log("No data stored locally.");
            loadWeatherJSON(zip, city);
        } else {
            parseData(data);
        }
    }

    // load data from OpenWeatherMap
    function loadWeatherJSON(zip, city) {
        let query = "&";
        let valid = true;
        let data = null;
        if (city) {
            query += "q=" + city + ",us";
        } else if (zip) {
            query += "zip=" + zip + ",us";
        } else {
            valid = false;
            $err.html("<h2>Could not get data from server.</h2");
        }
        if (valid) {
            console.log(apiURL + query);
            $.getJSON(apiURL + query, (response) => {
                    console.log("API access: success");
                    data = response;
                    if (zip) { // if zip code was entered, map it to city name in localStorage
                        localStorage.setItem(zip, data.city.name);
                    }
                    // write response data to sessionStorage under city name key
                    sessionStorage.setItem(data.city.name, JSON.stringify(data));
                    parseData(data);
                })
                .fail((error) => {
                    console.log(error);
                    if (error.responseJSON) {
                        data = "Error: " + error.responseJSON.message;
                    } else {
                        data = "Error: Unable to get response from Server!";
                    }
                    $err.html("<h2>" + data + "</h2>");
                });
        }
    }

    // parse data
    function parseData(d) {
        $hidden.removeClass("hidden");
        $welcome.addClass("hidden");
        if (!d) return;
        let data = d.list;
        let temp_Data = [];
        let humidity_Data = [];
        let cloud_Data = [];
        let precipitation_Data = [];
        data.forEach((forecast) => {
            let precipitation = 0;
            if (forecast.rain && forecast.rain['3h']) {
                precipitation += +forecast.rain['3h'];
            }
            if (forecast.snow && forecast.snow['3h']) {
                precipitation += +forecast.snow['3h'];
            };
            let date = new Date(forecast.dt * 1000);
            temp_Data.push({
                date: date,
                temp: Math.round(+forecast.main.temp * 10) / 10
            });
            humidity_Data.push({
                date: date,
                humidity: +forecast.main.humidity
            });
            cloud_Data.push({
                date: date,
                cloud: +forecast.clouds.all
            });
            precipitation_Data.push({
                date: date,
                precipitation: Math.round(+precipitation * 100) / 100
            });
        });
        populateWeatherIcons(data);
        if (barGraph) {
            drawBarChart(temp_Data, "temp", "#FFCC00");
            drawBarChart(humidity_Data, "humidity", "#6AB0EB");
            drawBarChart(cloud_Data, "cloud", "#CCCCCC");
            drawBarChart(precipitation_Data, "precipitation", "#0053A7");
        } else {
            drawLineChart(temp_Data, "temp", "#FFCC00");
            drawLineChart(humidity_Data, "humidity", "#6AB0EB");
            drawLineChart(cloud_Data, "cloud", "#CCCCCC");
            drawLineChart(precipitation_Data, "precipitation", "#0053A7");
        }
        drawDayAxes(temp_Data);
        $cityName.html("for <span>" + d.city.name + ", USA</span>");
    };

    // Line Chart
    function drawLineChart(data, type, color) {
        let SvgHeight = (type === "temp") ? svgHeight * 2 : svgHeight;
        let MarginTop = (type === "temp") ? margin.top * 2 : margin.top;
        let height = SvgHeight - MarginTop - margin.bottom;
        let barWidth = width / (data.length - 1);
        let svg = d3.select('svg.' + type)
            .attr("width", svgWidth)
            .attr("height", SvgHeight);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + MarginTop + ")");
        let x = d3.scaleTime()
            .range([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        let line = d3.line()
            .x((d) => { return x(d.date) })
            .y((d) => { return y(d[type]) });
        let area = d3.area()
            .x((d) => { return x(d.date) })
            .y0(height)
            .y1((d) => { return y(d[type]) });
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d[type] }));
        // line
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1)
            .attr("d", line);
        // fill
        g.append("path")
            .datum(data)
            .attr("fill", color)
            .attr("d", area);
        // bar text
        data.shift(); // updates text to display end of period value, not start of period
        let bartext = g.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", (d) => {
                let valX = -(y(d[type]) + 32);
                if (valX < -(height - 10)) valX = -(height - 10);
                return valX;
            })
            .attr("y", (d, i) => {
                return (barWidth * i) + (barWidth - ((barWidth - 17) / 2))
            })
            .attr("class", "dataText")
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .text((d) => {
                let value = d[type];
                if (value !== 0) {
                    return d[type];
                }
            });
        drawAxes(g, data, x, y, height);
    };

    // Bar Chart
    function drawBarChart(data, type, color) {
        let SvgHeight = (type === "temp") ? svgHeight * 2 : svgHeight;
        let MarginTop = (type === "temp") ? margin.top * 2 : margin.top;
        let height = SvgHeight - MarginTop - margin.bottom;
        let barWidth = width / (data.length - 1);
        let svg = d3.select('svg.' + type)
            .attr("width", svgWidth)
            .attr("height", SvgHeight);
        let g = svg.append('g')
            .attr("transform", "translate(" + margin.left + "," + MarginTop + ")");
        let x = d3.scaleTime()
            .range([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d[type] }));
        let bar = g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", (d) => {
                return y(d[type]);
            })
            .attr("height", (d) => {
                return height - y(d[type]);
            })
            .attr("width", barWidth + 1)
            .attr("transform", (d, i) => {
                let translate = [barWidth * i, 0];
                return "translate(" + translate + ")";
            })
            .attr("fill", (d) => {
                if (type !== "temp" || fc === 1) {
                    return color;
                } else {
                    let grade = Math.floor(d[type] / 10) + 2;
                    if (grade < 0) grade = 0;
                    if (grade > 13) grade = 13;
                    return tempColorArray[grade];
                }
            })
            // bar text
        let bartext = g.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", (d) => {
                let valX = -(y(d[type]) + 32);
                if (valX < -(height - 10)) valX = -(height - 10);
                return valX;
            })
            .attr("y", (d, i) => {
                return (barWidth * i) + (barWidth - ((barWidth - 17) / 2))
            })
            .attr("class", "dataText")
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .text((d) => {
                let value = d[type];
                if (value !== 0) {
                    return d[type];
                }
            });
        drawAxes(g, data, x, y, height);
    }

    function drawAxes(g, data, x, y, height) {
        // axes
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(data.length / 2)
                .tickSize(-height, 0, 0)
                .tickFormat(d3.timeFormat('%I %p'))
            )
            .select(".domain")
            .remove();
        g.append("g")
            .call(d3.axisLeft(y));

    }

    function drawDayAxes(data) {
        let svg1 = d3.select('svg.days_bottom')
            .attr("width", svgWidth)
            .attr("height", 30);
        let svg2 = d3.select('svg.days_top')
            .attr("width", svgWidth)
            .attr("height", 30);
        let g1 = svg1.append("g")
            .attr("transform", "translate(" + margin.left + ", 15 )");
        let g2 = svg2.append("g")
            .attr("transform", "translate(" + margin.left + ", 0 )");
        let x = d3.scaleTime()
            .range([0, width]);
        x.domain(d3.extent(data, (d) => { return d.date }));
        g1.append("g")
            .attr("transform", "translate(0, 0)")
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickSize(-30, 0, 0)
                .tickFormat(d3.timeFormat('%a %d %b'))
            );
        g2.append("g")
            .attr("transform", "translate(0, 15)")
            .call(d3.axisTop(x)
                .ticks(5)
                .tickSize(-30, 0, 0)
                .tickFormat(d3.timeFormat('%a %d %b'))
            );
    };

    function populateWeatherIcons(data) {
        // Enable Bootstrap tooltips
        $(function() {
            $('[data-toggle="tooltip"]').tooltip()
        })
        let barWidth = width / (data.length - 1);
        let icons = "";
        let wind = "";
        for (let i = 0; i < data.length; i++) {
            icons += "<image class='icons' src='" + iconURL + data[i].weather[0].icon + ".png' data-toggle='tooltip' data-placement='bottom' title='" + data[i].weather[0].description + "' alt='" + data[i].weather[0].description + "' width='" + barWidth + "'/>";
            let winddir = Math.floor((data[i].wind.deg + 11.25) / 22.5);
            wind += "<div style='text-align:center;width:" + barWidth + "px'><image src='images/arrow.svg' style='opacity:0.5;transform:rotate(" + data[i].wind.deg + "deg);' width='" + (barWidth * 0.8) + "' data-toggle='tooltip' data-placement='top' title='" + windDirection[winddir] + " at " + (Math.round(data[i].wind.speed * 10) / 10) + " MPH' alt='" + windDirection[winddir] + "'/><br/><span>" + (Math.round(data[i].wind.speed * 10) / 10) + "</span></div>";
        }
        $icons.html(icons);
        $wind.html(wind);
    }

    /* OnLoad Events */

    zipcode = getURLParameter("zipcode");
    city = getURLParameter("city");
    $unit.text(units[fc].unit);

    getWeather();

});