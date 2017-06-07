
var timer;
var links = document.querySelectorAll('.links .a');
var activeLink = 0;
console.log('reload!');
links[activeLink].classList.add('active');

 $.delegate('.links', 'a', 'click', setClickedItem);

 function setClickedItem(e) {
     console.log('setClickedItem');
     removeActiveLinks();
     resetTimer();

     var clickedLink = e.target;

     changePosition(clickedLink);
 }

 function removeActiveLinks() {
     console.log('removeActiveLinks');
     for (var i = 0; i < links.length; i++) {
         links[i].itemID = i;
         links[i].classList.remove('active');
     }
 }

 function changePosition(link) {
     var position = link.getAttribute('data-pos');
     console.log(position);
     var changedValue = 'translate3d('+ position +', 0 , 0)';
     $('.wrapper').style.transform = changedValue;
    //  link.classList.add('active');
 }

//slide automatically
 function startTimer() {
     timer = window.setInterval(goNext, 1500);
 }

startTimer();

 function resetTimer() {
     window.clearInterval(timer);
     startTimer();
 }

 function goNext() {
     removeActiveLinks();

     activeLink = (activeLink < links.length - 1) ? activeLink + 1 : 0;

     var newLink = links[activeLink];
     changePosition(newLink);
 }
