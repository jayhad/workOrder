/**
 * @author Jay Gruber
 * @author Adam Gomes
 */
var workOrderController = function($scope, $filter, $document, $http, $timeout) {
	var controller = this;
	var workOrders = [];

	var resetFields = function() {
    	getDate();
    	controller.workDescription = '';
    	controller.workDescriptionPlaceholder = 'Enter work description here... (300 words maximum)';
    	controller.severity = '';
    	controller.latitude = '';
    	controller.longitude = '';
    	controller.altitude = '';
    	controller.locationButton = 'Get location';
    	controller.gettingLocation = false;
    	controller.locationError = '';
    	controller.showInput = false;
    	controller.sendingRequest = false;
    };

    var getDate = function() {
		controller.date = new Date();
	};

	resetFields();

	var getGeoLocation = function() {
		controller.locationError = '';
		navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, {timeout:5000});
		controller.gettingLocation = true;
		controller.sendingRequest = true;
	};

	var handleLocationSuccess = function(position) {
		$scope.$apply(function() {
			controller.latitude = position.coords.latitude;
			controller.longitude = position.coords.longitude;
			controller.altitude = position.coords.altitude;
			controller.locationButton = 'Update location';
			controller.gettingLocation = false;
			controller.sendingRequest = false;
		});
	};

	var handleLocationError = function(error) {
		$scope.$apply(function() {
			switch(error.message) {
				case "PERMISSION_DENIED":
					controller.locationError = "Permission for location request was denied.";
					break;
				case "POSITION_UNAVAILABLE":
					controller.locationError = "Location information could not be retrieved.";
					break;
				case "TIMEOUT":
					controller.locationError = "Timeout occured while getting location.";
					break;
				default:
					controller.locationError = "An unknown error has occurred.";
					break;
			}

			if (controller.locationButton === "Try again") {
				controller.locationError += " Please enter location details manually.";
				controller.showInput = true;
				controller.locationRequired = true;
			}
			else {
				controller.locationButton = "Try again";
				controller.gettingLocation = false;
			}
			controller.sendingRequest = false;
		});
	};

	var checkLocationInfo = function() {
		if (controller.latitude === '' || controller.longitude === '' || controller.altitude === '') {
			if (!controller.showInput)
				controller.locationError = "Please click '" + controller.locationButton + ".";
			return false;
		}
		return true;
	};

	var getFormData = function() {
		return {
			firstName: controller.firstName,
			lastName: controller.lastName,
			date: controller.date,
			workDescription: controller.workDescription,
			severity: controller.severity,
			latitude: controller.latitude,
			longitude: controller.longitude,
			altitude: controller.altitude
		};
	};

	var addWorkOrder = function() {
		if (!controller.checkLocationInfo())
			return false;

		var workOrder = getFormData();
		controller.workOrders.push(workOrder);
		localStorage.setItem('workOrders', JSON.stringify(controller.workOrders));
		controller.sendWorkOrdersToServer();
	};

	var sendWorkOrdersToServer = function() {
		controller.sendingRequest = true;
		$http.post('workOrders/add', controller.workOrders)
           .success(controller.postSuccess)
           .error(controller.postFailure);
    };

    var postSuccess = function(response) {
    	controller.workOrders = [];
        localStorage.removeItem('workOrders');
        controller.setResultMessage(response, controller.resultMessage);
        controller.resetFields();
    };

    var postFailure= function(response) {
    	controller.setResultMessage('Could not connect to server. Saving to localStorage.', controller.resultMessage);
        controller.resetFields();
    };

    var setResultMessage = function(data, element) {
    	controller.resultMessage = data;
    	$timeout(function() {
    		controller.resultMessage = "";
    	}, 5000);
    };

    var sendLocalStorageData = function() {
    	if (localStorage.length > 0) {
    		var localStorageData = JSON.parse(localStorage.getItem('workOrders'));
    		localStorageData.forEach(function(workOrder) {
    			controller.workOrders.push(workOrder);
    		});

    		controller.sendWorkOrdersToServer();
    		controller.resultMessage = "Attempting to send " + localStorageData.length + " work orders from localStorage to the server.";
    	}
    };

    var getWordCount = function(text, maxWordCount) {
    	var max = maxWordCount;
    	var words = text ? text.split(/\s+/) : 0;
    	var wordsRemaining = words ? max - words.length : max;

    	if (wordsRemaining <= 0) {
    		controller.wordsRemainingColor = 'red';
    		controller.workDescription = controller.deleteExtraWords(words, max);
    	}

    	return(wordsRemaining + " words remaining.");
    };

    var deleteExtraWords = function(words, maxWordCount) {
    	var result =  words.slice(0, maxWordCount);
    	return result.join(' ');
    };

	controller.getDate = getDate;
	controller.handleLocationSuccess = handleLocationSuccess;
	controller.handleLocationError = handleLocationError;
	controller.getGeoLocation = getGeoLocation;
	controller.checkLocationInfo = checkLocationInfo;
	controller.getFormData = getFormData;
	controller.addWorkOrder = addWorkOrder;
	controller.workOrders = workOrders;
	controller.sendWorkOrdersToServer = sendWorkOrdersToServer;
	controller.postSuccess = postSuccess;
	controller.postFailure = postFailure;
	controller.setResultMessage = setResultMessage;
	controller.resetFields = resetFields;
	controller.sendLocalStorageData = sendLocalStorageData;
	controller.getWordCount = getWordCount;
	controller.deleteExtraWords = deleteExtraWords;

	$document.ready(controller.sendLocalStorageData);
};

angular.module('workorder', [])
       .controller('WorkOrderController', workOrderController);