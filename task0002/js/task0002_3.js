
var timer;
var links = document.querySelectorAll('.links .a');
var activeLink = 0;
console.log('reload!');
links[activeLink].classList.add('active');

 $.delegate('.links', 'a', 'click', setClickedItem);

 function setClickedItem(e) {
     console.log('setClickedItem');
     removeActiveLinks();

     var clickedLink = e.target;

     changePosition(clickedLink);
 }

 function removeActiveLinks() {
     console.log('removeActiveLinks');
     for (var i = 0; i < links.length; i++) {
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
