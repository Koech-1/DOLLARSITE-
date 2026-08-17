
// Get logged in user
let user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
    window.location.href = "login.html";
}

// Display username
document.getElementById("username").innerText = user.name;

// Load balance
let balance = user.balance || 0;
let profit = 0;

function updateUI() {
    document.getElementById("balance").innerText = "$" + balance.toFixed(2);
    document.getElementById("profit").innerText = "$" + profit.toFixed(2);
}

updateUI();


// Deposit function (demo)
function deposit() {
    let amount = prompt("Enter deposit amount:");

    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount");
        return;
    }

    balance += amount;

    saveUser();
    updateUI();

    alert("Deposit successful!");
}


// Withdraw function (demo)
function withdraw() {
    let amount = prompt("Enter withdraw amount:");

    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount");
        return;
    }

    if (amount > balance) {
        alert("Insufficient balance!");
        return;
    }

    balance -= amount;

    saveUser();
    updateUI();

    alert("Withdrawal successful!");
}


// Simulated trading profit
function startTrade() {
    let gain = Math.random() * 50; // fake profit

    profit += gain;
    balance += gain;

    saveUser();
    updateUI();

    alert("Trade completed! Profit: $" + gain.toFixed(2));
}


// Save user back to localStorage
function saveUser() {
    user.balance = balance;

    localStorage.setItem("loggedInUser", JSON.stringify(user));

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let index = users.findIndex(u => u.email === user.email);

    if (index !== -1) {
        users[index].balance = balance;
        localStorage.setItem("users", JSON.stringify(users));
    }
}


// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}