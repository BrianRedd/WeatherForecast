/* --------------------------------------------------------
* Filename: scripts.js
* Description: General scripts for Weather Forecast

* Author: R. Brian Redd 
--------------------------------------------------------*/

$(document).ready(function() {

    /* Variables */
    var $locForm = $("#locationForm");
    var $chart = $("#weatherChart");
    var $err = $("#errors");
    var $cityName = $(".city");
    var zipcode;
    var city;
    var units = "imperial";
    var svgWidth = $(".container").width(),
        svgHeight = 150;

    var margin = { top: 10, right: 20, bottom: 30, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    /* Constants */
    const apiKEY = "eb02d0472566fca615fc7006e81869d3";
    const apiURL = "http://api.openweathermap.org/data/2.5/forecast?id=524901&units=" + units + "&APPID=" + apiKEY;
    const iconURL = "http://openweathermap.org/img/w/";
    const windDirection = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    /* jQuery Events */

    // form submit
    $locForm.find("#locationFormSubmit").click(() => {
        zipcode = null;
        city = null;
        city = $locForm.find('input[name="city"]').val();
        zipcode = $locForm.find('input[name="zipcode"]').val();
        console.log("zipcode", zipcode, "city", city);
        if (zipcode) {
            window.location.href = window.location.href.split('?')[0] + "?zipcode=" + zipcode;
        } else if (city) {
            window.location.href = window.location.href.split('?')[0] + "?city=" + city;
        } else {
            alert("Please enter either a valid Zip Code or a U.S City");
        }
    });

    // form clear
    $locForm.find("#clearLocationForm").click(() => {
        zipcode = null;
        city = null;
        $locForm.find('input[name="zipcode"]').val('');
        $locForm.find('input[name="city"]').val('');
    })

    /* Functions */

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
        console.log("dataStoredLocally", zip, city);
        if (!zip && !city) return;
        let data = null;
        let storedCity = city;
        if (zip) {
            storedCity = localStorage.getItem(zip);
        }
        console.log("storedCity?", storedCity);
        if (storedCity) {
            data = JSON.parse(sessionStorage.getItem(storedCity));
        }
        console.log("data?", data);
        if (!data) {
            loadWeatherJSON(zip, city);
        } else {
            parseData(data);
        }
    }

    // load data from OpenWeatherMap
    function loadWeatherJSON(zip, city) {
        console.log("loadWeatherJSON", zip, city);
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
                    console.log("success", response);
                    data = response;
                    if (zip) { // if zip code was entered, map it to city name in localStorage
                        localStorage.setItem(zip, data.city.name);
                    }
                    // write response data to sessionStorage under city name key
                    sessionStorage.setItem(data.city.name, JSON.stringify(data));
                    console.log(response.list.length);
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

    // display data in DOM
    function parseData(d) {
        if (!d) return;
        let data = d.list;
        let temp_Data = [];
        let humidity_Data = [];
        let cloud_Data = [];
        let precipitation_Data = [];
        //let content = "<ul>";
        data.forEach((forecast, idx) => {
            let precipitation = 0;
            if (forecast.rain['3h']) {
                precipitation += forecast.rain['3h'];
            }
            if (forecast.snow) {
                precipitation += forecast.rain['3h'];
            };
            //let winddir = Math.floor((forecast.wind.deg + 11.25) / 22.5);
            /*let date = new Date(forecast.dt * 1000);
            let hour = date.getHours() % 12;
            if (hour === 0) hour = 12;
            let dateTimeString = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + ", " + hour + ":00 " + ((date.getHours() < 12) ? " AM" : " PM");*/
            /*content += "<li><b>Date/Time: " + dateTimeString + "</b><ul>";
            content += "<li>Weather: " + forecast.weather[0].main + " (" + forecast.weather[0].description + ")</li>";
            content += "<li>Temperature: " + forecast.main.temp + " degrees</li>";
            content += "<li>Humidity: " + forecast.main.humidity + "</li>";
            content += "<li>Cloud cover: " + forecast.clouds.all + "%</li>";
            content += "<li>Wind: " + Math.round(forecast.wind.speed * 100) / 100 + " MPH from " + Math.round(forecast.wind.deg * 100) / 100 + " degrees [" + windDirection[winddir] + "]</li>";
            content += "<li>Precipitation : " + Math.round(precipitation * 100) / 100 + " inches over last three hours</li>";
            content += "</ul></li>";*/
            temp_Data.push({
                date: new Date(forecast.dt * 1000),
                temp: +forecast.main.temp
            });
            humidity_Data.push({
                date: new Date(forecast.dt * 1000),
                humidity: +forecast.main.humidity
            });
            cloud_Data.push({
                date: new Date(forecast.dt * 1000),
                clouds: +forecast.clouds.all
            });
            precipitation_Data.push({
                date: new Date(forecast.dt * 1000),
                precip: precipitation
            });
        });
        drawTemperatureChart(temp_Data);
        drawHumidityChart(humidity_Data);
        drawCloudCoverChart(cloud_Data);
        drawPrecipitationChart(precipitation_Data);
    };

    function drawTemperatureChart(data) {
        let svg = d3.select('svg.temp')
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleTime()
            .rangeRound([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        let line = d3.line()
            .x((d) => { return x(d.date) })
            .y((d) => { return y(d.temp) });
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d.temp }));
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Temperature");
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#006A5C")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);
    };

    function drawHumidityChart(data) {
        let svg = d3.select('svg.humidity')
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleTime()
            .rangeRound([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        let line = d3.line()
            .x((d) => { return x(d.date) })
            .y((d) => { return y(d.humidity) });
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d.humidity }));
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("% Humidity");
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#7C0044")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);
    };

    function drawCloudCoverChart(data) {
        let svg = d3.select('svg.cloud')
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleTime()
            .rangeRound([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        let line = d3.line()
            .x((d) => { return x(d.date) })
            .y((d) => { return y(d.clouds) });
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d.clouds }));
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("% Cloud Cover");
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#F3AA85")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);
    };

    function drawPrecipitationChart(data) {
        let svg = d3.select('svg.precipitation')
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let x = d3.scaleTime()
            .rangeRound([0, width]);
        let y = d3.scaleLinear()
            .rangeRound([height, 0]);
        let line = d3.line()
            .x((d) => { return x(d.date) })
            .y((d) => { return y(d.precip) });
        x.domain(d3.extent(data, (d) => { return d.date }));
        y.domain(d3.extent(data, (d) => { return d.precip }));
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Precipitation");
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#0053A7")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", line);
    };

    /* OnLoad Events */

    zipcode = getURLParameter("zipcode");
    city = getURLParameter("city");

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

});