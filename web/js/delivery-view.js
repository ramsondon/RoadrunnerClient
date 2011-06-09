jQuery(function() {
	
	var map;
	var image;
	var markersArray = [];
	var directionDisplay;
	var infowindow = null;
	var directionsService = new google.maps.DirectionsService();

	function initialize() {
		var home = new google.maps.LatLng(47.413417, 9.744417);
		var mapOptions = {
			zoom: 12,
			center: home,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		};
		map = new google.maps.Map(document.getElementById("map_canvas"),
			mapOptions
		);
		
		image = new google.maps.MarkerImage('/img/marker_pos.png',
				// This marker is 20 pixels wide by 32 pixels tall.
				new google.maps.Size(20, 32),
				// The origin for this image is 0,0.
				new google.maps.Point(0,0),
		      	// The anchor for this image is the base of the flagpole at 0,32.
		      	new google.maps.Point(0, 32));
		
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		$('.delivery-entry').each(function() {
			drawDirections($(this).attr('id'));
			drawPositions($(this).attr('id'));
		});
		
	}

	function addMarker(location, title) {
		var marker = new google.maps.Marker({
			position: location,
			map: map,
			icon: image,
			title: title
		});
		google.maps.event.addListener(marker, 'click', function() {
			if (infowindow) {
				infowindow.close();
			}
			infowindow = new google.maps.InfoWindow({content: title});
			infowindow.open(map,marker);
		});
		markersArray.push(marker);
	}

	// Removes the overlays from the map, but keeps them in the array
	function clearOverlays() {
		if (markersArray) {
			for (i in markersArray) {
				markersArray[i].setMap(null);
			}
		}
	}

	// Shows any overlays currently in the array
	function showOverlays() {
		if (markersArray) {
			for (i in markersArray) {
				markersArray[i].setMap(map);
			}
		}
	}

	// Deletes all markers in the array by removing references to them
	function deleteOverlays() {
		if (markersArray) {
			for (i in markersArray) {
				markersArray[i].setMap(null);
			}
			markersArray.length = 0;
		}
	}

	function drawDirections(id) {
		$.getJSON('/delivery/directions/' + id, function(route) {
			options = {
				origin: route.origin,
				destination: route.destination,
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			}
			directionsService.route(options, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(result);
				}
			});
		});
	}
	
	function drawPositions(id) {
		$.getJSON('/delivery/routes/' + id, function(routes) {
			for (var i = 0; i < routes.length; i++) {
				var route = routes[i];
				for (var j = 0; j < route.length; j++) {
					addMarker(new google.maps.LatLng(route[j].lat, route[j].lng), 
							"Position reached at: " + new Date(route[j].time*1000));
//					if (j+1 < route.length) {
//						drawLine(route[j], route[j+1]);
//					}
				}
				
			}
		});
	}
	
//	function drawLine(a, b) {
//		line = [[parseFloat(a.lng), parseFloat(a.lat)],[parseFloat(b.lng), parseFloat(b.lat)]];
//		var geojson = {
//				"type": "LineString",
//				"coordinates": line
//			};
//		
//		console.log(geojson);
//
//			var options = {
//				strokeColor: "#FFFF00",
//				strokeWeight: 7,
//				strokeOpacity: 1.0,
//				map: map
//			};
//
//			var vector = new GeoJSON(geojson, options);
//			vector.setMap(map);
//	} 

	initialize();

});