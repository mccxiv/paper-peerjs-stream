var expect = chai.expect;
var apiKey = 'y6ws1u4by75mte29';

function makePps(id) {
	var el = document.createElement('paper-peerjs-stream');
	el.setAttribute('key', apiKey);
	if (id) el.setAttribute('peerid', id);
	return el;
}

function makeActivePps(id) {
	var pps = makePps(id);
	pps.setAttribute('active', '');
	return pps;
}

function killPps(el) {
	el.removeAttribute('active');
}

describe('paper-peerjs-stream', function() {
	describe('Server connection and setup (testing with "key" and "answers" attributes)', function() {
		this.timeout(40000);
		var answerer;
		
		beforeEach(function() {
			answerer = makePps();
			answerer.setAttribute('answers', '');
		});
		
		afterEach(function () {
			killPps(answerer);
			answerer = null;
		});

		it('should not create a peer if no active attribute', function() {
			expect(answerer.peer).not.to.be.ok;
		});

		it('should create a peer when having the active attribute', function() {
			answerer.setAttribute('active', '');
			expect(answerer.peer).to.be.ok;
		});

		it('should destroy peer when active attribute is removed', function(done) {
			answerer.setAttribute('active', '');
			setTimeout(function() {
				var peer = answerer.peer;
				console.log('ppp', peer);
				expect(peer.destroyed).not.to.be.ok;
				answerer.removeAttribute('active');
				expect(peer.destroyed).to.be.ok;
				setTimeout(function() {
					expect(peer.open).not.to.be.ok;
					done();
				}, 500);
			}, 1000);
		});
		
		it('should connect to the server (emits the server-connection event)', function(done) {
			answerer.setAttribute('active', '');
			answerer.addEventListener('server-connection', function() {done()});			
		});

		it('should obtain an id from the server (emits new-id and it\'s valid)', function(done) {
			answerer.setAttribute('active', '');
			answerer.addEventListener('new-id', function() {
				expect(answerer.peerid).to.be.a('string');
				expect(answerer.peerid).not.to.be.empty;
				done();
			});
		});
	});
	
	describe('calls & answers', function() {
		this.timeout(40000);
		var caller;
		var answerer;

		beforeEach(function() {
			caller = makeActivePps();
			answerer = makeActivePps();
			answerer.setAttribute('answers', '');
		});

		afterEach(function () {
			killPps(caller);
			killPps(answerer);
			caller = null;
			answerer = null;
		});
		
		it('should emit peer-unavailable when calling a non existent peer', function(done) {
			caller.localStream = webcamStream;
			caller.setAttribute('calls', Math.random().toString(36).slice(5));
			caller.addEventListener('peer-unavailable', function() {
				done();
			});
		});
		
		it('should establish a call when it is a caller (emits in-call)', function(done) {
			caller.localStream = webcamStream;
			answerer.addEventListener('new-id', function() {
				caller.setAttribute('calls', answerer.peerid);
			});
			caller.addEventListener('in-call', function() {
				done();
			});
		});

		it('should answer incoming call when it is an answerer (emits in-call)', function(done) {
			caller.localStream = webcamStream;
			answerer.addEventListener('new-id', function() {
				caller.setAttribute('calls', answerer.peerid);				
			});
			answerer.addEventListener('in-call', function() {
				done();
			});
		});
		
		it('should receive a stream when answering a call (emits remote-stream)', function(done) {
			caller.localStream = webcamStream;
			answerer.addEventListener('new-id', function() {
				caller.setAttribute('calls', answerer.peerid);
			});
			answerer.addEventListener('remote-stream', function() {
				done();
			});
		});		
	});

	describe('spectates & broadcasts', function() {
		this.timeout(40000);
		var spectator;
		var broadcaster;

		beforeEach(function() {
			spectator = makeActivePps();
			broadcaster = makeActivePps();
			broadcaster.setAttribute('broadcasts', '');
		});

		afterEach(function () {
			killPps(spectator);
			killPps(broadcaster);
			spectator = null;
			broadcaster = null;
		});

		it('should emit peer-unavailable when spectating a non existent broadcaster', function(done) {
			spectator.setAttribute('spectates', Math.random().toString(36).slice(5));
			spectator.addEventListener('peer-unavailable', function() {
				done();
			});
		});
		
		it('should establish a call when spectating a broadcaster', function(done) {
			broadcaster.localStream = webcamStream;
			broadcaster.addEventListener('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			spectator.addEventListener('in-call', function() {
				done();
			});
		});

		it('should establish a call when broadcasting to a spectator', function(done) {
			broadcaster.localStream = webcamStream;
			broadcaster.addEventListener('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			broadcaster.addEventListener('in-call', function() {
				done();
			});
		});

		it('should receive a stream when spectating (emits remote-stream)', function(done) {
			broadcaster.localStream = webcamStream;
			broadcaster.addEventListener('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			spectator.addEventListener('remote-stream', function() {
				done();
			});
		});
	});
	
	describe('Connection drops and reconnection', function() {
		this.timeout(40000);
		var spectator;
		var broadcaster;

		beforeEach(function() {
			spectator = makeActivePps();
			broadcaster = makeActivePps();
			broadcaster.setAttribute('broadcasts', '');
		});

		afterEach(function () {
			killPps(spectator);
			killPps(broadcaster);
			spectator = null;
			broadcaster = null;
		});

		it('spectator should emit not-in-call after broadcaster goes inactive', function(done) {
			broadcaster.localStream = webcamStream;
			broadcaster.addEventListener('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			spectator.addEventListener('in-call', function() {
				broadcaster.removeAttribute('active');
				spectator.addEventListener('not-in-call', function() {
					done();
				});
			});
		});
		
		it('spectator should emit no-remote-stream after broadcaster goes inactive', function(done) {
			broadcaster.localStream = webcamStream;
			broadcaster.addEventListener('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			spectator.addEventListener('remote-stream', function() {
				broadcaster.removeAttribute('active');
				spectator.addEventListener('no-remote-stream', function() {
					done();
				});
			});
		});

		it('spectator should emit in-call followed by not-in-call followed by in-call after broadcaster goes inactive and active again', function(done) {			
			broadcaster.localStream = webcamStream;
			$(broadcaster).one('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			$(spectator).one('in-call', function() {
				broadcaster.removeAttribute('active');
				$(spectator).one('not-in-call', function() {
					broadcaster.setAttribute('active', '');
					$(spectator).one('in-call', function() {
						done();
					})
				});
			});
		});

		it('spectator should emit remote-stream followed by no-remote-stream followed by remote-stream after broadcaster goes inactive and active again', function(done) {
			broadcaster.localStream = webcamStream;
			$(broadcaster).one('new-id', function() {
				spectator.setAttribute('spectates', broadcaster.peerid);
			});
			$(spectator).one('remote-stream', function() {
				broadcaster.removeAttribute('active');
				$(spectator).one('no-remote-stream', function() {
					broadcaster.setAttribute('active', '');
					$(spectator).one('remote-stream', function() {
						done();
					})
				});
			});
		});
	})
});