
   const share = e => {
    // const mediaQuery = window.matchMedia('(min-width: 768px)');
   if (navigator.share) {
     navigator
       .share({
         title: "Share my product",
         url: "window.location.href"
       })
       .then(() => console.log("thanks for share"))
       .catch(error => console.log("error", error));
   }
 };
 if(!navigator.share) {
   document.getElementById('tip').className = 'show'
 }
 document.getElementById("share").addEventListener("click", share);
