// grab weather info

var apiKey = 'a2672ea41a1a0f8685ae5e3fe009ef93';

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function locationSuccess(pos) {
  // request here
  
  
  // construct URL
  var urlWeather = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude + '&appid=' + apiKey;

  // send request to OpenWeatherMap
  xhrRequest(urlWeather, 'GET', 
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);

      // temperature in Kelvin requires adjustment
      var temperature = Math.round(json.main.temp - 273.15);
      console.log('Temperature is ' + temperature);

      // conditions
      var conditions = json.weather[0].main;      
      console.log('Conditions are ' + conditions);
       
      // assemble dictionary using keys
        var dictionary = {
          'TEMPERATURE': temperature,
          'CONDITIONS': conditions
        };
        
        // send to pebble
        Pebble.sendAppMessage(dictionary,
          function(e) {
            console.log('weather info sent to pebble');
          },
          function(e) {
            console.log('error sending weather info to pebble');
          }
        );
    }      
  );
  

}

function locationError(err) {
  console.log('error requesting location!');
}
  
function getWeather() {
  
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}


function getPrice() {
   var cryptoData;
    
    // begin crypto
    
    var cryptoUrl = 'https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=20';
    var cryptoArray = [5];  
  
    // send request
    xhrRequest(cryptoUrl, 'GET', function(responseText) {
      cryptoData = JSON.parse(responseText);
      console.log('cryptodata', cryptoData);
      // sent prices back to watch 
      
      // sort data
      for (var i = 0; i < cryptoData.length; i++) {
        if (cryptoData[i].symbol == "BTC") {
          
          cryptoArray[0] = cryptoData[i];
        }
        if (cryptoData[i].symbol == "ETH") {
          cryptoArray[1] = cryptoData[i];
        }
        if (cryptoData[i].symbol == "LTC") {
          console.log('ltc checking in,', cryptoData[i].price_usd);
          cryptoArray[2] = cryptoData[i];
        }
        
      }
      
      var dictionary = {
        'BTC': cryptoArray[0].price_usd,
        'ETH': cryptoArray[1].price_usd,
        'LTC': cryptoArray[2].price_usd
      };
      
      console.log('dictionary', JSON.toString(dictionary));
      
      // send to pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('price info sent to pebble');
        },
        function(e) {
          console.log('error sending price info to pebble');
        }
      );

    });
}








// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log('PebbleKit JS ready!');
    
    getWeather();
    getPrice();
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    getWeather();
    getPrice();
  }                     
);