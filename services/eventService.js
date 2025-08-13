const EventEmitter = require('events');

class AlertEventEmitter extends EventEmitter {}

// Create a singleton instance
const alertEmitter = new AlertEventEmitter();

// Define event types
const EVENT_TYPES = {
    NEW_JOB: 'new_job',
    STATUS_CHANGE: 'status_change'
};

module.exports = {
    alertEmitter,
    EVENT_TYPES
};
