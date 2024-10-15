"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.EventStatus = void 0;
// Enums
var EventStatus;
(function (EventStatus) {
    EventStatus["draft"] = "draft";
    EventStatus["published"] = "published";
    EventStatus["cancelled"] = "cancelled";
    EventStatus["completed"] = "completed";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var EventType;
(function (EventType) {
    EventType["internship"] = "internship";
    EventType["job_fair"] = "job_fair";
    EventType["workshop"] = "workshop";
    EventType["seminar"] = "seminar";
})(EventType || (exports.EventType = EventType = {}));
