
## [&lt;paper-peerjs-stream&gt;](http://mccxiv.github.io/paper-peerjs-stream/paper-peerjs-stream/)
A web component for sending, receiving, and playing WebRTC media streams. Built with Polymer.

#### Connecting two elements
```html
<!-- calls.html -->
<paper-peerjs-stream calls="john" key="apikey43" active id="caller"></paper-peerjs-stream>
<script>
	// Caller needs a local stream to send out, e.g. from getUserMedia()
	document.querySelector('#caller').localStream = stream;
</script>

<!-- answers.html -->
<paper-peerjs-stream peerid="john" answers key="apikey43" active></paper-peerjs-stream>
```

### [Full documentation and demos](http://mccxiv.github.io/paper-peerjs-stream/paper-peerjs-stream/)