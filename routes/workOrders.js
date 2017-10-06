/**
 * @author Jay Gruber
 * @author Adam Gomes
 */
var express = require('express');
var router = express.Router();

var workOrders = [];

var convertStringToWorkOrder = function(workOrder) {
  return {
    firstName: workOrder.firstName,
    lastName: workOrder.lastName,
    date: workOrder.date,
    workDescription: workOrder.workDescription,
    severity: workOrder.severity,
    latitude: workOrder.latitude,
    longitude: workOrder.longitude,
    altitude: workOrder.altitude
  };
};

router.post('/add', function(req, res, next) {
  var count = 1;
  req.body.forEach(function(workOrder) {
    workOrders.push(workOrder);
    console.log("Adding Work Order " + count++ + ": ");
    console.log(workOrder);
    console.log();
  });

  count = count - 1;
  res.send(count + " Work Order(s) Created Successfully!" );
});

module.exports = router;