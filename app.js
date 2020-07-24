/*jshint esversion: 6 */

var app = new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
        mainPage: 'Home',
        totalVisitors: '18000',
        todaysDate: '',
        titleStatus: 'Busy',
        yesterdaysDate: '',
        currentTime: '',
        currentTemp: '',
        weatherImage: '',

        parkingCount: '50',

        Entrances: ['BRCA',],
        entranceDisplay: '',
        entranceCount: '',
        entranceCountYesterday: '',
        entranceDateUpdated: '',
        entrancePeople: 'N/A',

    },
    created: function () {
        this.getTodaysDate();
        this.getWeatherAPI();
        this.fetchData();
    },
    methods:{
        statRefresh: function () {
        },
        resetPages: function () {
        },
        getAPIData_safe: function (data, fields, def){
			//data = json object api return data
			//fields = array of data fields tree
			//def = default return value if nothing is found
			var ret = def;
			var multiEntrance = false;
			try{
				if(i == 0 && tdata.hasOwnProperty(f + "1")){multiEntrance = true;}
				var tdata = data;
				for(var i = 0; i < fields.length; i++){
					let f = fields[i];
					if(tdata.hasOwnProperty(f)){
						if(i == fields.length - 1){
							ret = tdata[f];
						}else{
							tdata = tdata[f];
						}
					}
				}
			}catch(err){
				console.log(err);
			}
			return ret;
        },
        fetchData: function(){
            var vm = this;
            axios.get("https://trailwaze.info/bryce/request.php").then(response => {
                //Today
				vm.entranceCount = this.getAPIData_safe(response.data, ["BRCAEntrance1", "Today", "count"], 0);
				vm.entranceCount += this.getAPIData_safe(response.data, ["BRCAEntrance1", "Today", "count"], 0);
				//Yesterday
				var entranceMultiplier = this.getAPIData_safe(response.data, ["BRCAEntrance1", "Yesterday", "multiplier"], 2.6);
				vm.entranceCountYesterday = this.getAPIData_safe(response.data, ["BRCAEntrance1", "Yesterday", "count"], "N/A");
                vm.entranceDateUpdated = this.getAPIData_safe(response.data, ["BRCAEntrance1", "Yesterday", "date"], "N/A");
                if(vm.entranceCount > 0){vm.entranceDisplay = vm.entranceCount + " vehicles | " + Math.round(vm.entranceCount * entranceMultiplier) + " visitors";}
            }).catch(error => {
                vm = "Fetch " + error;
            });
        },
        getTodaysDate: function () {
            var date = new Date();
            var yesterday = new Date(date);
            yesterday.setDate(yesterday.getDate()-1);
            var days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

            var fulldate = days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
            this.todaysDate = fulldate;
            var yesterdayDate = days[yesterday.getDay()] + ", " + months[yesterday.getMonth()] + " " + yesterday.getDate() + " " + yesterday.getFullYear();
            this.yesterdaysDate = yesterdayDate;

            var hours = date.getHours();
            var time = "AM";
            if(hours > 12){
                hours -= 12;
                time = "PM";
            }
            var minutes = date.getMinutes();
            if (minutes<10){
                minutes = "0" + minutes;
            }
            this.currentTime = hours + ":" + minutes + time;
        },
        getWeatherAPI: function() {
			var vm = this;				
			axios.get("https://forecast.weather.gov/MapClick.php?lat=37.1838&lon=-113.0032&unit=0&lg=english&FcstType=dwml").then(response => {
				let parser = new DOMParser();
				let doc = parser.parseFromString(response.data, "text/xml");
				var currentWeather = doc.getElementsByTagName("data")[1];
				var temp = currentWeather.getElementsByTagName("temperature")[0];
				var tempVal = temp.getElementsByTagName("value")[0].childNodes[0].nodeValue;
				var icon = currentWeather.getElementsByTagName("icon-link")[0].childNodes[0].nodeValue;
                vm.currentTemp = tempVal;
				this.checkWeatherImage(icon);								 
			}).catch(error => {
                vm = "Fetch " + error;
            });
        },
        checkWeatherImage: function(icon){
            console.log("weather:", icon);
            if (icon == null || icon == "NULL" || icon == "null"){
                this.weatherImage = "icons/blueBison.svg";
                return;
            }
            const hours = new Date().getUTCHours();
			var timeOfDay = "weatherNight";
			if(hours <= 2 || (hours > 12 && hours < 24  )){
                timeOfDay = "weather";
            }
            icon = "./icons/"+ timeOfDay + icon.substr(icon.lastIndexOf("/")).replace(".png",".svg");
            this.weatherImage = icon;
        },
    }
});