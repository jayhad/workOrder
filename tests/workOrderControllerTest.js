/**
 * @author Jay Gruber
 * @author Adam Gomes
 */
describe('workOrderControllerTest', function() {
  beforeEach(module('workorder'));

  beforeEach(inject(function($controller, $rootScope, _$httpBackend_, $timeout) {
    var scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    timeout = $timeout;

    controller = $controller('WorkOrderController', { $scope: scope });
    controller.button = "";
  }));

  it('canary is passing', function() {
    expect(true).to.be.eql(true);
  });

  it('controller.getDate returns current Date', function(done) {
    var expectedDate = new Date();
    controller.getDate();

    expect(controller.date.getFullYear()).to.be.eql(expectedDate.getFullYear());
    expect(controller.date.getMonth()).to.be.eql(expectedDate.getMonth());
    expect(controller.date.getDay()).to.be.eql(expectedDate.getDay());
    done();
  });

  it('controller.handleLocationSuccess updates the location fields correctly', function() {
    var position = {
      coords: {
        latitude: '45',
        longitude: '60',
        altitude: '10'
      }
    };

    controller.handleLocationSuccess(position);

    expect(controller.latitude).to.be.eql(position.coords.latitude);
    expect(controller.longitude).to.be.eql(position.coords.longitude);
    expect(controller.altitude).to.be.eql(position.coords.altitude);
    expect(controller.locationButton).to.be.eql('Update location');
  });

  it('controller.handleLocationError handles permission denied error', function() {
    var error = { message: "PERMISSION_DENIED" };
    controller.handleLocationError(error);

    var expected = "Permission for location request was denied.";
    expect(controller.locationError).to.be.eql(expected);
  });

  it('controller.handleLocationError handles position unavailable error', function() {
    var error = { message: "POSITION_UNAVAILABLE" };
    controller.handleLocationError(error);

    var expected = "Location information could not be retrieved.";
    expect(controller.locationError).to.be.eql(expected);
  });

  it('controller.handleLocationError handles timeout error', function() {
    var error = { message: "TIMEOUT" };
    controller.handleLocationError(error);

    var expected = "Timeout occured while getting location.";
    expect(controller.locationError).to.be.eql(expected);
  });

  it('controller.handleLocationError handles any other errors', function() {
    var error = { };
    controller.handleLocationError(error);

    var expected = "An unknown error has occurred.";
    expect(controller.locationError).to.be.eql(expected);
  });

  it('controller.handleLocationError changes hidden input if locationButton equal try again', function() {
    var error = { };
    controller.locationButton = "Try again";
    controller.handleLocationError(error);

    expect(controller.showInput).to.be.eql(true);
  });

  it('controller.handleLocationError locationButton to try again', function() {
    var error = { };
    controller.locationButton = "";
    controller.handleLocationError(error);

    expect(controller.locationButton).to.be.eql("Try again");
  });

  it('getGeoLocation calls getCurrentPosition', function() {
    var called = false;

    navigator = {
      geolocation: {
        getCurrentPosition: function() {
          called = true;
        }
      }
    };

    controller.getGeoLocation();

    expect(called).to.be.eql(true);
  });

  it('getGeoLocation calls successFunction', function(done) {
    var button = '';
    var position = { coords: { latitude: '45', longitude: '90' } };

    navigator = {
      geolocation: {
        getCurrentPosition: function(successFunction) {
          controller.handleLocationSuccess(position);
          expect(controller.locationButton).to.be.eql('Update location');
          done();
        }
      }
    };
    controller.getGeoLocation();
  });

  it('getGeoLocation calls errorFunction', function(done) {
    navigator = {
      geolocation: {
        getCurrentPosition: function(successFunction, errorFunction) {
          var error = { message: '' };
          controller.handleLocationError(error);
          expect(controller.locationError).to.be.eql('An unknown error has occurred.');
          done();
        }
      }
    };
    controller.getGeoLocation();
  });

  it('getFormData return valid JSON', function() {
    var workOrder = controller.getFormData();

    expect(workOrder.hasOwnProperty('firstName')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('lastName')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('date')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('workDescription')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('severity')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('latitude')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('longitude')).to.be.eql(true);
    expect(workOrder.hasOwnProperty('altitude')).to.be.eql(true);
  });

  it('checkLocationInfo returns true if showInput is false', function() {
    controller.showInput = true;

    var expected = controller.checkLocationInfo();
    expect(controller.showInput).to.be.eql(true);
  });

  it('checkLocationInfo returns false if latitude is empty', function() {
    controller.locationButton = '';
    controller.latitude = '';

    var expected = controller.checkLocationInfo();
    expect(expected).to.be.eql(false);
  });

  it('checkLocationInfo returns false if longitude is empty', function() {
    controller.locationButton = '';
    controller.latitude = '1';
    controller.longitude = '';

    var expected = controller.checkLocationInfo();
    expect(expected).to.be.eql(false);
  });

  it('checkLocationInfo returns false if altitude is empty', function() {
    controller.locationButton = '';
    controller.latitude = '1';
    controller.longitude = '1';
    controller.altitude = '';

    var expected = controller.checkLocationInfo();
    expect(expected).to.be.eql(false);
  });

  it('addWorkOrder returns false if checkLocationInfo returns false', function() {
    controller.checkLocationInfo = function() { return false; };

    var expected = controller.addWorkOrder();
    expect(expected).to.be.eql(false);
  });

  it('addWorkOrder adds workOrder to workOrders array', function() {
    controller.firstName = 'John';
    controller.lastName = 'Doe';
    controller.date = '01/01/2015';
    controller.workDescription = 'Working...';
    controller.severity = 'Urgent';
    controller.latitude = '45';
    controller.longitude = '90';
    controller.altitude = '50';

    controller.addWorkOrder();
    expect(controller.workOrders.length).to.be.eql(1);
  });

  it('addWorkOrder adds multiple workOrders to workOrders array', function() {
    controller.firstName = 'John';
    controller.lastName = 'Doe';
    controller.date = '01/01/2015';
    controller.workDescription = 'Working...';
    controller.severity = 'Urgent';
    controller.latitude = '45';
    controller.longitude = '90';
    controller.altitude = '50';

    controller.addWorkOrder();
    controller.addWorkOrder();
    controller.addWorkOrder();
    expect(controller.workOrders.length).to.be.eql(3);
  });

  it('addWorkOrder saves workOrders to localStorage', function() {
    localStorage.clear();
    controller.checkLocationInfo = function() { return true; };

    controller.addWorkOrder();
    expect(localStorage.length).to.be.eql(1);
  });

  it('addWorkOrder calls sendWorkOrdersToServer', function() {
    controller.checkLocationInfo = function() { return true; };
    
    var called = false;
    controller.sendWorkOrdersToServer = function() { called = true; };

    controller.addWorkOrder();
    expect(called).to.be.eql(true);
  });

  it('sendWorkOrdersToServer disables submit button on success', function() {
    controller.sendWorkOrdersToServer();
    expect(controller.sendingRequest).to.be.eql(true);
  });

  it('sendWorkOrdersToServer removes localStorage object', function(done) {
    var workOrder = {
      firstName: '',
      lastName: '',
      date: '',
      workDescription: '',
      severity: '',
      latitude: '',
      longitude: '',
      altitude: ''  
    };

    localStorage.setItem('workOrders', workOrder);

    $httpBackend.expectPOST('workOrders/add')
                .respond(200);

    controller.sendWorkOrdersToServer();
    $httpBackend.flush();
    done();

    expect(localStorage.length).to.be.eql(0);
  });

  it('sendWorkOrdersToServer calls postSuccess on success', function(done) {
    $httpBackend.when('POST', 'workOrders/add')
                .respond(200, 'Work order created successfully');

    controller.sendWorkOrdersToServer();

    $httpBackend.flush();
    done();

    expect(controller.resultMessage).to.be.eql('Work order created successfully');
  });

  it('sendWorkOrdersToServer calls postSuccess on success', function(done) {
    var called = false;
    controller.postSuccess = function() { called = true; };

    $httpBackend.expect('POST', 'workOrders/add')
                .respond(200);

    controller.sendWorkOrdersToServer();

    $httpBackend.flush();

    expect(called).to.be.eql(true);
    done();
  });

  it('sendWorkOrdersToServer calls postFailure on success', function() {
    var called = false;
    controller.postFailure = function() { called = true; };

    $httpBackend.expect('POST', 'workOrders/add')
                .respond(400);

    controller.sendWorkOrdersToServer();

    $httpBackend.flush();

    expect(called).to.be.eql(true);
  });

  it('postSuccess clears localStorage object', function() {
    localStorage.clear();
    var workOrder = {
      firstName: '',
      lastName: '',
      date: '',
      workDescription: '',
      severity: '',
      latitude: '',
      longitude: '',
      altitude: ''
    };

    localStorage.setItem('workOrders', workOrder);
    expect(localStorage.length).to.be.eql(1);

    controller.postSuccess();

    expect(localStorage.length).to.be.eql(0);
  });

  it('postSuccess calls reset fields', function() {
    var called = false;
    controller.resetFields = function() { called = true; };

    controller.postSuccess();

    expect(called).to.be.eql(true);
  });

  it('postFailure calls reset fields', function() {
    var called = false;
    controller.resetFields = function() { called = true; };

    controller.postSuccess();

    expect(called).to.be.eql(true);
  });

  it('postFailure displays save to localStorage message', function() {
    controller.postFailure();
    expect(controller.resultMessage).to.be.eql('Could not connect to server. Saving to localStorage.');
  });

  it('displayResultMessage sets displays result message', function() {
    controller.setResultMessage("test message");
    expect(controller.resultMessage).to.be.eql("test message");
  });

  it('displayResultMessage displays result message for 5 seconds', function() {
    controller.setResultMessage("test message");
    timeout.flush();
    expect(controller.resultMessage).to.be.eql('');
  });

  it('sendLocalStorageData does not call sendWorkOrdersToServer if localStorage.length <= 0', function() {
    localStorage.length = 1;
    var called = false;
    controller.sendWorkOrdersToServer = function() { called = true; };

    controller.sendLocalStorageData();
    expect(called).to.be.eql(false);
  });

  it('sendLocalStorageData adds one work order in localStorage to workOrdersArray', function() {
    controller.workOrders = [];
    var workOrder = {
      firstName: '',
      lastName: '',
      date: '',
      workDescription: '',
      severity: '',
      latitude: '',
      longitude: '',
      altitude: ''
    };
    controller.workOrders.push(workOrder);

    localStorage.setItem('workOrders', JSON.stringify(controller.workOrders));
    // controller.workOrders = [];

    controller.sendLocalStorageData();
    localStorage.clear();

    expect(controller.workOrders[0]).to.be.eql(workOrder);
  });

  it('sendLocalStorageData adds multiple work orders in localStorage to workOrdersArray', function() {
    controller.workOrders = [];
    var workOrder = {
      firstName: '',
      lastName: '',
      date: '',
      workDescription: '',
      severity: '',
      latitude: '',
      longitude: '',
      altitude: ''
    };
    controller.workOrders.push(workOrder, workOrder, workOrder);

    localStorage.setItem('workOrders', JSON.stringify(controller.workOrders));
    controller.workOrders = [];

    controller.sendLocalStorageData();

    expect(controller.workOrders.length).to.be.eql(3);
  });


  it('sendLocalStorageData adds multiple work orders in localStorage to workOrdersArray', function() {
    controller.workOrders = [];
    var workOrder = {
      firstName: '',
      lastName: '',
      date: '',
      workDescription: '',
      severity: '',
      latitude: '',
      longitude: '',
      altitude: ''
    };
    controller.workOrders.push(workOrder, workOrder, workOrder);

    localStorage.setItem('workOrders', JSON.stringify(controller.workOrders));
    controller.workOrders = [];

    controller.sendLocalStorageData();

    expect(controller.workOrders[0]).to.be.eql(workOrder);
  });

  it('getWordCount returns correct number of words', function() {
    var expected = controller.getWordCount('this is a test', 300);
    expect(expected).to.be.eql('296 words remaining.');
  });

  it('if words is null, getWordCount count returns max number of words available', function() {
    var expected = controller.getWordCount('', 10);
    expect(expected).to.be.eql('10 words remaining.');
  });

  it('getWordCount calls deleteExtraWords when words remaining < 0', function() {
    var called = false;
    controller.deleteExtraWords = function () { called = true; };

    controller.getWordCount('this is a test', 3);
    expect(called).to.be.eql(true);
  });

  it('getWordCount does not call deleteExtraWords when words remaining > 0', function() {
    var called = false;
    controller.deleteExtraWords = function () { called = true; };

    controller.getWordCount('this is a test', 10);
    expect(called).to.be.eql(false);
  });

  it('deleteExtraWords deletes words over the max', function() {
    var words = ['this', 'is', 'a', 'test'];
    var result = controller.deleteExtraWords(words, 3);
    expect(result).to.be.eql('this is a');
  });

  it('verify resetFields resets fields', function() {
    controller.firstName = 'John';
    controller.lastName = 'Doe';
    controller.date = '';
    controller.workDescription = 'Description';
    controller.workDescriptionPlaceholder = '';
    controller.severity = 'Severe';
    controller.latitude = '45';
    controller.longitude = '45';
    controller.altitude = '0';
    controller.locationButton = '';
    controller.showInput = '';
    controller.sendingRequest = true;

    controller.resetFields();

    expect(controller.firstName).to.be.eql('John');
    expect(controller.lastName).to.be.eql('Doe');
    expect(controller.date).to.be.not.eql('');
    expect(controller.workDescription).to.be.eql('');
    expect(controller.workDescriptionPlaceholder).to.be.eql('Enter work description here... (300 words maximum)');
    expect(controller.severity).to.be.eql('');
    expect(controller.latitude).to.be.eql('');
    expect(controller.longitude).to.be.eql('');
    expect(controller.altitude).to.be.eql('');
    expect(controller.locationButton).to.be.eql('Get location');
    expect(controller.gettingLocation).to.be.eql(false);
    expect(controller.locationError).to.be.eql('');
    expect(controller.showInput).to.be.eql(false);
    expect(controller.sendingRequest).to.be.eql(false);
  });
});