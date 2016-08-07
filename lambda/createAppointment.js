'use strict';
console.log('Loading function');

let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

var Patient = function(patientId) {
    this.TableName = "Patient";
    this.Key = {};
    this.Key.patientId = patientId;
};

var Doctor = function(doctorId) {
    this.TableName = "Doctor";
    this.Key = {};
    this.Key.doctorId = doctorId;
};

var AppointmentConflict = function(appointmentDateTime, doctorId) {
    this.TableName = "Appointment";
    this.Key = {};
    this.Key.appointmentDate = Date.parse(appointmentDateTime);
    this.Key.doctorId = doctorId;
};

var Appointment = function(event){
    var ItemDef = function(event) {
        this.patientId = event.patientId;
        this.doctorId = event.doctorId;
        this.appointmentDate = Date.parse(event.appointmentDateTime);
        this.appointmentSubject = event.appointmentSubject;
        this.appointmentDescription = event.appointmentDescription;
    };
    
    this.TableName = "Appointment";
    this.Item = new ItemDef(event);
};

/**
 * Event contains the object for appointment 
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    dynamo.getItem(new Patient(event.patientId), function(err,patient){
        if (err) {
            return callback("Patient not found");
        } else {
            if(Object.getOwnPropertyNames(patient).length === 0) {
                return callback("Patient not found");
            }
            
            dynamo.getItem(new Doctor(event.doctorId), function(err,doctor){
            if(err) {
                return callback("Doctor not found");
            } else {
                if(Object.getOwnPropertyNames(doctor).length === 0) {
                    return callback("Doctor not found");
                }
                dynamo.getItem(new AppointmentConflict(event.appointmentDateTime, event.doctorId), function(noConflict, appointmentConflict) {
                    if (noConflict || Object.getOwnPropertyNames(appointmentConflict).length === 0) {
                        console.log('Received event:', JSON.stringify(noConflict, null, 2));
                        dynamo.putItem(new Appointment(event), callback);
                    } else {
                        console.log('Received event:', JSON.stringify(appointmentConflict, null, 2));
                        return callback("Conflict found");
                    }
                });
            }
            });
        }
    });
}
