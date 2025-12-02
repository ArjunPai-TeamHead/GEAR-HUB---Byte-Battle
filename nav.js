/* Populate header avatar + username across pages */
(function(){
  const nameEl = document.getElementById("navName");
  const avatarEl = document.getElementById("navAvatar");
  try{
    const user = JSON.parse(localStorage.getItem("user")||"{}");
    if(nameEl) nameEl.textContent = user.username || "Guest";
  }catch(e){}
  const storedAvatar = localStorage.getItem("gearhub_avatar_v1");
  if (avatarEl){
    if (storedAvatar) avatarEl.src = storedAvatar;
    else avatarEl.src = "assets/pfp.png";
  }
})();
