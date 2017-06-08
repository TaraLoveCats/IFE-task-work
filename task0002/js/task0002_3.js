
var timer;
var links = document.querySelectorAll('.links a');
var activeLink = 0;
// console.log('reload!');

links[activeLink].classList.add('active');

// 'click' has very odd behavior that I can not understand
 $.delegate('.links', 'a', 'mouseover', setClickedItem);

 function setClickedItem(e) {
     removeActiveLinks();
     resetTimer();

     var clickedLink = e.target;
     //activeLink must change if user clicks
     activeLink = clickedLink.itemID;

     changePosition(clickedLink);

 }

 function removeActiveLinks() {
     for (var i = 0; i < links.length; i++) {
         links[i].itemID = i;
         links[i].classList.remove('active');
     }
 }

 function changePosition(link) {
     var position = link.getAttribute('data-pos');
    //  console.log(position);
     var changedValue = 'translate3d('+ position +', 0 , 0)';
     $('.wrapper').style.transform = changedValue;

     link.classList.add('active');
 }

//slide automatically
 function startTimer() {
     timer = window.setTimeout(goNext, 2000);
 }

startTimer();

 function resetTimer() {
     window.clearTimeout(timer);
     startTimer();
 }

 function goNext() {
     removeActiveLinks();

     activeLink = (activeLink < links.length - 1) ? activeLink + 1 : 0;

     var newLink = links[activeLink];
     changePosition(newLink);

     //loop or not
     var loop = true;
     if (loop) {
         startTimer();
     }
     else if (activeLink !== 3) {
             startTimer();
     }

 }

//由于从最后一张图片切到第一张图片目前为止只能后退，所以暂时不写倒序了
