  angular.module("birdstories", [])


  .controller("SectionsCtrl", function($http) {
    var self = this;

    this.entries = [];

    // Load CSV data.
    $http.get('/data/data.csv')
        .success(function(csvData, status, headers, config) {

          // Convert CSV to JSON.
          var jsonData = Papa.parse(csvData, {header: true});
          self.entries = jsonData.data;

          console.log('entries after http', self.entries);

          self.initMapbox(self.entries);
        });


    L.mapbox.accessToken = 'pk.eyJ1IjoidG9zaGtpIiwiYSI6IkhnbG04NVkifQ.-KMIPyJnuh78Rtw9_jkp2g';

    // Ugly.
    this.initMapbox = function(entries) {
      var places = {
        type: 'FeatureCollection', 
        features: []
      };

      // Add points defined in the spreadsheet.
      places.features = entries.map(function(entry) {
        return {
          geometry: {
            type: 'Point', 
            coordinates: [parseFloat(entry.Latitude), parseFloat(entry.Longitude)] 
          },
          properties: {
            id: 'point' + entry.ID, //fix this
            zoom: parseInt(entry.Zoom)
          }, 
          type: 'Feature'
        }
      });

      // Add cover point.
      places.features.unshift(
        {
          geometry: {
            type: 'Point', 
            coordinates: [15.053327,60.125433] 
          },
          properties: {
            id: 'cover', 
            zoom: 4
          }, 
          type: 'Feature'
        }
      );

      // Add end point.
      places.features.push(
        {
          geometry: {
            type: 'Point', 
            coordinates: [15.053327,60.125433] 
          },
          properties: {
            id: 'end',
            zoom: 4
          }, 
          type: 'Feature'
        }
      );

      console.log('NEW places', places);


      /*
      var oldPlaces = { 
        type: 'FeatureCollection', 
        features: [
          { 
            geometry: {
              type: "Point", 
              coordinates: [15.053327,60.125433] 
            },
            properties: {
              id: "cover", 
              zoom:11
            }, 
            type: 'Feature'
          },
      { geometry: { type: "Point", coordinates: [15.053327,60.125433] },
        properties: { id: "one" }, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [13.952636,58.676937] },
        properties: { id: "two"}, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [12.818555, 55.382036] },
        properties: { id: "three",zoom:12 }, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [9.140625,45.336701] },
        properties: { id: "four"}, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [14.436035,35.978006] },
        properties: { id: "five"}, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [8.964843,16.804541] },
        properties: { id: "six",zoom:5}, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [-8.613281,16.299051] },
        properties: { id: "seven",zoom:8}, type: 'Feature' },
      { geometry: { type: "Point", coordinates: [15.053327,60.125433] },
        properties: { id: "end", zoom:3 }, type: 'Feature' }
      ]};
      */

      var map = L.mapbox.map('map', 'toshki.kobn7gkf',{zoomControl: false});
      var placesLayer = L.mapbox.featureLayer(places).addTo(map);

      console.log(placesLayer);

      // disable dragging and zooming
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        // disable the tap handler, if present
        if (map.tap) {
          map.tap.disable();
        }

      var narrative = document.getElementById('narrative'),
        sections = narrative.getElementsByTagName('section'),
        currentId = '';

      setId('cover');

      function setId(newId) {
        if(newId === currentId) return;

        placesLayer.eachLayer(function(layer){
          if (layer.feature.properties.id === newId) {
            map.setView(layer.getLatLng(), layer.feature.properties.zoom || 8,{pan:{animate:true},zoom:{animate:true}} );
            layer.setIcon(L.mapbox.marker.icon({
              'marker-color': '#333'
            }));
          } else {
              layer.setIcon(L.mapbox.marker.icon({
                  'marker-color': '#333'
              }));
            }
        });
        for (var i=0; i<sections.length; i++) {
          sections[i].className = sections[i].id === newId ? 'active' : ''; 
        }
        currentId = newId;
      }
      narrative.onscroll = function(e) {
          var narrativeHeight = narrative.offsetHeight;
          var newId = currentId;
          // Find the section that's currently scrolled-to.
          // We iterate backwards here so that we find the topmost one.
          for (var i = sections.length - 1; i >= 0; i--) {
              var rect = sections[i].getBoundingClientRect();
              if (rect.top >= 200 && rect.top <= (narrativeHeight+200)) {  /* This works, but SS+MT don't know why. We added 200 to make sections turn active before the previous has finished scrolling to the top */
                  newId = sections[i].id;
              }
          };
          setId(newId);
      };



    }

  });