"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParticipatorRole = exports.EventParticipatorStatus = void 0;
// Enums
var EventParticipatorStatus;
(function (EventParticipatorStatus) {
    EventParticipatorStatus["registered"] = "registered";
    EventParticipatorStatus["confirmed"] = "confirmed";
    EventParticipatorStatus["cancelled"] = "cancelled";
    EventParticipatorStatus["attended"] = "attended";
})(EventParticipatorStatus || (exports.EventParticipatorStatus = EventParticipatorStatus = {}));
var EventParticipatorRole;
(function (EventParticipatorRole) {
    EventParticipatorRole["attendee"] = "attendee";
    EventParticipatorRole["organizer"] = "organizer";
    EventParticipatorRole["speaker"] = "speaker";
})(EventParticipatorRole || (exports.EventParticipatorRole = EventParticipatorRole = {}));
