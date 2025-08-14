function shuffleCards() {
    var container = document.querySelector('.container');
    for (var i = container.children.length; i >= 0; i--) {
      container.appendChild(container.children[Math.random() * i | 0]);
    }
  }
  
  document.getElementById('shuffleButton').addEventListener('click', shuffleCards);
  // Code adapted from:
// https://stackoverflow.com/questions/71617327/shuffle-a-containers-dom-elements-but-not-all-in-javascript




function flipCard(button) {
  const card = button.parentNode.parentNode;
  card.classList.toggle("flipped");
}
