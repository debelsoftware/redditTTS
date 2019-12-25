var voices = speechSynthesis.getVoices();
let redditData;
let images = [];
document.getElementById('start').addEventListener('click', init)
function init(){
  if ('speechSynthesis' in window) {
    let subreddit = document.getElementById('subreddit').value;
    if (subreddit == null){
      document.getElementById('redditText').textContent = `Thats not right`;
      document.getElementById('redditUser').textContent = `You have to type something into that box`;
      let speech = new SpeechSynthesisUtterance("You didn't type anything in that box");
      window.speechSynthesis.speak(speech);
    }
    else {
      getReddit(subreddit)
    }
  }
  else {
    console.log("Not supported on your device");
  }

}
function getReddit(subreddit){
  fetch(`https://www.reddit.com/r/${subreddit}/top.json`)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +response.status);
        document.getElementById('error').style.display = "block"
        document.getElementById('error').textContent = `Error with the requested page, you requested r/${subreddit}`;
        document.getElementById('subreddit').value = ""
        let speech = new SpeechSynthesisUtterance("oops, there was an error with that sub reddit");
        window.speechSynthesis.speak(speech);
        return;
      }
      response.json().then(function(data) {
        console.log(data);
        redditData = data.data.children
        if (containsImages()){
          preloadImages();
          let audio = new Audio('background.mp3'); // INSERT MUSIC HERE
          audio.volume = 0.3
          let playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(_ => {
            })
            .catch(error => {
            });
          }
          document.getElementById('menu').style.display = "none"
          document.getElementById('redditcontent').style.display = "block"
          document.getElementById('redditText').textContent = `r/${subreddit}`;
          document.getElementById('redditUser').textContent = "For people too lazy to just use reddit";
          setTimeout(function(){speak(0)}, 4000);
        }
        else {
          document.getElementById('error').style.display = "block"
          document.getElementById('error').textContent = `No images in this subreddit`;
          document.getElementById('subreddit').value = ""
          let speech = new SpeechSynthesisUtterance("I didn't find any images in the sub reddit");
          window.speechSynthesis.speak(speech);
        }
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error:', err);
    document.getElementById('error').style.display = "block"
    document.getElementById('error').textContent = `Error with the requested page, you requested r/${subreddit}`;
    document.getElementById('subreddit').value = ""
    let speech = new SpeechSynthesisUtterance("oops, there was an error with that sub reddit");
    window.speechSynthesis.speak(speech);
  });
}

function speak(index){
  if (index < redditData.length){
    if (redditData[index].data.is_video) {
      speak(index+1)
    }
    else if (redditData[index].data.url.startsWith("https://i.redd.it")){
      let speech = new SpeechSynthesisUtterance(redditData[index].data.title);
      window.speechSynthesis.speak(speech);
      showPost(redditData[index].data.title,images[index],redditData[index].data.author)
      speech.onend = function() {setTimeout(function(){speak(index+1)}, 3000);};
    }
    else {
      speak(index+1);
    }
  }
  else {
    document.getElementById('redditText').textContent = "The end...";
    document.getElementById('redditUser').textContent = "Please just use reddit.com";
    document.getElementById('imgCont').innerHTML = "";
    let end = new SpeechSynthesisUtterance("Thanks for watching, how about you just read reddit next time?");
    window.speechSynthesis.speak(end);
  }
}

function preloadImages(){
  for (post of redditData){
    preloaded = new Image()
    preloaded.src = post.data.url
    preloaded.id = "redditImg"
    images.push(preloaded)
  }
}

function showPost(title,image=null,user){
  document.getElementById('redditcontent').style.display = "block"
  document.getElementById('redditText').textContent = title;
  document.getElementById('redditUser').textContent = user;
  document.getElementById('imgCont').innerHTML = "";
  document.getElementById('imgCont').appendChild(image);
}

function containsImages(){
  let containsImage = false;
  for (post of redditData){
    if (post.data.url.startsWith("https://i.redd.it")){
      containsImage = true;
    }
  }
  return containsImage;
}
