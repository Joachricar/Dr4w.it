function Room() {
	var self = this;

	self.participants = new Object();

	self.addParticipant = function(participant) {
		self.participants[participant.name] = participant;
	}

	self.removeParticipant = function(participant) {
		self.participants[participant.name] = null;
	}
}
