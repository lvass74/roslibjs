/**
 * @fileoverview
 * @author Laszlo Vass - laszlo.vass@ott-one.hu
 */

var EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * A ROS service client.
 *
 * @constructor
 * @params options - possible keys include:
 *   * ros - the ROSLIB.Ros connection handle
 *   * actionName - the action name, like /turtle1/rotate_absolute
 *   * typeClass - the action type, like 'turtlesim/action/RotateAbsolute'
 */
function Action(options) {
  options = options || {};
  this.ros = options.ros;
  this.actionName = options.actionName;
  this.typeClass = options.typeClass;
  this.isAdvertised = false;

  this._serviceCallback = null;
}
Action.prototype.__proto__ = EventEmitter2.prototype;
/**
 * Calls the service. Returns the service response in the
 * callback. Does nothing if this service is currently advertised.
 *
 * @param goal - the goal to send
 * @param callback - function with params:
 *   * response - the response from the service request
 * @param failedCallback - the callback function when the service call failed (optional). Params:
 *   * error - the error message reported by ROS
 */
Action.prototype.sendGoal = function (goal, callback, failedCallback) {
  if (this.isAdvertised) {
    return;
  }

  var actionGoalId = 'send_action_goal:' + this.actionName + ':' + (++this.ros.idCounter);

  if (callback || failedCallback) {
    this.ros.once(actionGoalId, function (message) {
      if (message.result !== undefined && message.result === false) {
        if (typeof failedCallback === 'function') {
          failedCallback(message.values);
        }
      } else if (typeof callback === 'function') {
        callback(message.values);
      }
    });
  }

  var call = {
    op: 'send_action_goal',
    id: actionGoalId,
    actionName: this.actionName,
    type: this.typeClass,
    goal
  };
  this.ros.callOnConnection(call);
};

module.exports = Action;
