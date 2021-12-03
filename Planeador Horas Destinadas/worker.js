onmessage = function(event) {
  console.log('Worker Recived Message');
  postMessage('Worker Message');
  //onCancel(); // causes "onCancel is not defined" error
}


/*self.onmessage = function(e) {
    console.log(e.data);
    self.postMessage('Worker is sending this message');
};

console.log('Starting Worker');

var timeStart = new Date();
setTimeout(function(){
    console.log('Worker: ' + Date.now() - timeStart)
}, 60000);*/
