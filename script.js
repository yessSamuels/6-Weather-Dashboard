$(document).ready(function() {

    //Search History, start with empty array and push city input answers into it
    // var searchArray = [];
    var searchArray = JSON.parse(localStorage.getItem("searchArray")) || [];

    //On click (after input of text) we want to pull current day,  5 day data, and update our searchArray
    $("#search-button").on("click", function(event) {
        event.preventDefault();
        var savedCity = $("#city-input").val().trim();
        pullCurrentWeather(savedCity);
        pullFiveDayWeather();
        searchArray.push(savedCity);
        updateSearchArray();
        console.log(savedCity)
        localStorage.setItem("searchArray", JSON.stringify(searchArray));
    })

    //When button of city is clicked, populate that data
    $(document).on("click", ".clickable-city", function(e) {
        console.log($(this).data("name"))
        pullCurrentWeather($(this).data("name"));
        pullFiveDayWeather($(this).data("name"));

    });

    function updateSearchArray() {
        //Display searchArray.  Clear then append for loop
        $("#search-history").empty();
        for (var i = 0; i < searchArray.length; i++) {
            var newCity = $("<button>");
            newCity.addClass("clickable-city");
            newCity.attr("data-name", searchArray[i]);
            newCity.text(searchArray[i]);
            $("#search-history").append(newCity);
        }
    }

    //Pull Current Weather data function
    function pullCurrentWeather(cityCurrent) {
        // cityCurrent = cityCurrent || $("#city-input").val().trim();
        console.log(cityCurrent);
        console.log("hello")
        var currentQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityCurrent + "&appid=397227bf482a5ff23f440af123eee801";
        //Push city input into searchArray
        // searchArray.push(cityCurrent);

        $.ajax({
            url: currentQueryURL,
            method: "GET"
        }).then(function(response) {
            // console.log(response);
            //Feed information onto the site
            //Name, date, weather type
            var weatherPic = $("#weather-pic")
            weatherPic.attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png")
            $("#current-status").text(cityCurrent + " " + moment().format("MMMM Do YYYY"));

            //Temperature
            var reasonableTemp = (response.main.temp - 273.15) * 1.80 + 32
            $("#current-temperature").text("Temperature: " + reasonableTemp.toFixed(0) + " \xB0F");

            //Humidity
            $("#current-humidity").text("Humidity: " + response.main.humidity + "%")

            //Wind Speed
            $("#current-windspeed").text("Windspeed: " + response.wind.speed + "mph")

            //Need to pull different api to get UV index, based on lat and lon from prev
            var lon = response.coord.lon
            var lat = response.coord.lat
            var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=397227bf482a5ff23f440af123eee801"
            $.ajax({
                url: uvIndexURL,
                method: "GET"
            }).then(function(response) {
                var uv = $("<span>");
                var color
                switch (true) {
                    case response.value > 2 && response.value <= 5:
                        color = "yellow"
                        break;
                    case response.value > 5 && response.value <= 6:
                        color = "orange"
                        break;
                    case response.value > 6 && response.value <= 7:
                        color = "red"
                        break;
                    case response.value > 7:
                        color = "purple"
                        break;
                    case response.value < 2:
                        color = "green"

                    default:
                        break;
                }
                uv.css("background-color", color);
                uv.text(response.value);
                $("#current-uvindex").text("UV Index: ")
                $("#current-uvindex").append(uv)
            })


        });

    }

    //Pull 5-Day Weather data function
    function pullFiveDayWeather(cityCurrent) {
        cityCurrent = cityCurrent || $("#city-input").val().trim();
        var fiveDayQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityCurrent + "&appid=397227bf482a5ff23f440af123eee801";

        $.ajax({
            url: fiveDayQueryURL,
            method: "GET"
        }).then(function(response) {
            // console.log(response)
            var forecastEls = $(".forecast")
            console.log(forecastEls);
            for (i = 0; i < forecastEls.length; i++) {
                $(forecastEls[i]).empty();
                //Because the weather app gives you the 5 day forecast in 3 hour intervals, starting with the morning.  You multiple by 8 (there are 8 3 hour intervals in a day) and then I added 4, so it would give it's 3pm weather prediction, opposed to 6am. 
                var forecastIndex = i * 8 + 4;
                //The new date function takes into account milliseconds, so I multiplied by 1000 as the oringal number only went to seconds. 
                var forecastDate = new Date(response.list[forecastIndex].dt * 1000);
                var forecastDay = forecastDate.getDate();
                var forecastMonth = forecastDate.getMonth() + 1;
                var forecastYear = forecastDate.getFullYear();
                var futureDate = $("<div>").text(forecastMonth + "/" + forecastDay + "/" + forecastYear)
                $(forecastEls[i]).append(futureDate);

                //Append weather icon
                console.log(response.list[forecastIndex].weather[0].icon);
                var weatherPic2 = $("<img>")
                weatherPic2.attr("src", "https://openweathermap.org/img/wn/" + response.list[forecastIndex].weather[0].icon + "@2x.png")
                console.log(weatherPic2);
                $(forecastEls[i]).append(weatherPic2);

                //Append Temperature
                var reasonableTemp2 = (response.list[forecastIndex].main.temp - 273.15) * 1.80 + 32
                var futureTemp = $("<div>").text("Temp: " + reasonableTemp2.toFixed(0) + " \xB0F");
                $(forecastEls[i]).append(futureTemp);

                //Append Humidity
                var futureHumidity = $("<div>").text("Humidity: " + response.list[forecastIndex].main.humidity + "%");
                $(forecastEls[i]).append(futureHumidity);

            }
        });

    }
    updateSearchArray();
});