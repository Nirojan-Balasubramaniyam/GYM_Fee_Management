const usersUrl = "http://localhost:3002/Users";
let users = [];

function encryptPassword(password) {
  return btoa(password); 
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const fetchUsers = async () => {
    const response = await fetch(usersUrl);
    users = await response.json();
    console.log(users);

    let usernameOrID = document.getElementById("loginUsername").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value.trim();
    
    console.log(usernameOrID);
    console.log(password);
  
    
    let loggedInUser = users.find((user) => (user.UserName.toLowerCase() === usernameOrID || user.id.toLowerCase()===usernameOrID) && user.Password === password);
    console.log(loggedInUser);
  
    if (loggedInUser) {
      document.getElementById("loginMessage").textContent = "";
      if (loggedInUser.UserRoll === "member") { 
        console.log(loggedInUser.MemberID)
        window.location.href = `../member/index.html?memberId=${loggedInUser.MemberID}`;
      } else {
       
        window.location.href = `../admin/index.html?memberId=${loggedInUser.MemberID}`;
      }
    } else {
      document.getElementById("loginMessage").textContent = "Invalid username or password.";
    }
  };
  
  fetchUsers();
});

document.getElementById('registerBtn').addEventListener("click", function() {
  alert("Now member can't register themselves according to BRD Change");
});
