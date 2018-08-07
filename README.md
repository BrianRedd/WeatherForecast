# Weather Forecast App

## Introduction

This web application pulls data for your five-day forecast via a jQuery AJAX call to https://openweathermap.org/api, based on either Zip Code or US City Name. It stores the data in sessionStorage by city name (if zip code is used to request the data, the city name is mapped to the zip code and stored in localStorage). Any new request will first check sessionStorage for city data, to eliminate unnecessary calls to the API.

Once retrieved, the data for the five day forecast is rendered using simple D3js bar chart or line chart (temperature, humidity, cloud cover, and precipitation, all charted in three hour increments); there is a button in the navigation bar to toggle between these two views. In addition, icons from OpenWeatherMap for local weather conditions are displayed at the top (Bootstrap tooltips display the description during mouse-over). Also, wind direction and speed are displayed at the bottom.

The headers for chart can be clicked to hide or show the chart.

Users can enter a zip code or city name in the top navigation bar; this information is translated to URL-based query strings (which can also be used directly). Each new request is a new URL, so browser history will store each request.

The page is mobile-friendly; if the screen size changes, refreshing the page will re-render the weather charts to fit the screen.

## Installation

For Node/NPM enabled environments, download/clone this project, run `>npm install`, and then `>npm start` to load the page locally utilizing lite-server.

