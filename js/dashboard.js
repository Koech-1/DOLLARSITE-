// ==========================================
// DOLLARSITE DASHBOARD
// ==========================================


// GET LOGGED-IN USER
let user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
    window.location.href = "login.html";
}


// USER DATA
let balance = Number(user.balance || 0);
let profit = Number(user.profit || 0);

let trades = JSON.parse(
    localStorage.getItem("dollarSiteTrades")
) || [];


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    setupUser();

    updateUI();

    renderHistory();

    updateRecentActivity();

    generateAnalysis();

});


// ==========================================
// USER INFORMATION
// ==========================================

function setupUser() {

    const name = user.name || "User";

    const username = document.getElementById("username");
    const welcomeName = document.getElementById("welcomeName");
    const avatar = document.getElementById("avatar");

    const settingsUsername =
        document.getElementById("settingsUsername");

    const settingsEmail =
        document.getElementById("settingsEmail");


    if (username) {
        username.innerText = name;
    }

    if (welcomeName) {
        welcomeName.innerText = name;
    }

    if (avatar) {
        avatar.innerText = name.charAt(0).toUpperCase();
    }

    if (settingsUsername) {
        settingsUsername.innerText = name;
    }

    if (settingsEmail) {
        settingsEmail.innerText =
            user.email || "Not available";
    }
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateUI() {

    const balanceElement =
        document.getElementById("balance");

    const profitElement =
        document.getElementById("profit");

    const winrateElement =
        document.getElementById("winrate");

    const activeTradesElement =
        document.getElementById("activeTrades");


    if (balanceElement) {
        balanceElement.innerText =
            "$" + balance.toFixed(2);
    }

    if (profitElement) {

        profitElement.innerText =
            "$" + profit.toFixed(2);

        profitElement.style.color =
            profit >= 0 ? "#00c853" : "#ff4d4d";
    }


    const completedTrades =
        trades.filter(t => t.status === "Won" || t.status === "Lost");

    const wins =
        completedTrades.filter(t => t.status === "Won").length;


    let winRate = 0;

    if (completedTrades.length > 0) {
        winRate =
            (wins / completedTrades.length) * 100;
    }


    if (winrateElement) {
        winrateElement.innerText =
            winRate.toFixed(1) + "%";
    }


    if (activeTradesElement) {
        activeTradesElement.innerText =
            trades.filter(t => t.status === "Active").length;
    }
}


// ==========================================
// SAVE USER
// ==========================================

function saveUser() {

    user.balance = balance;
    user.profit = profit;

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(user)
    );


    let users =
        JSON.parse(localStorage.getItem("users")) || [];


    let index =
        users.findIndex(
            u => u.email === user.email
        );


    if (index !== -1) {

        users[index].balance = balance;
        users[index].profit = profit;

        localStorage.setItem(
            "users",
            JSON.stringify(users)
        );
    }
}


// ==========================================
// DEPOSIT
// ==========================================

function deposit() {

    let amount =
        prompt("Enter deposit amount:");

    amount = parseFloat(amount);


    if (isNaN(amount) || amount <= 0) {

        alert("Invalid amount.");
        return;
    }


    balance += amount;

    saveUser();

    updateUI();

    alert(
        "Deposit recorded successfully: $" +
        amount.toFixed(2)
    );
}


// ==========================================
// WITHDRAW
// ==========================================

function withdraw() {

    let amount =
        prompt("Enter withdrawal amount:");

    amount = parseFloat(amount);


    if (isNaN(amount) || amount <= 0) {

        alert("Invalid amount.");
        return;
    }


    if (amount > balance) {

        alert("Insufficient balance.");
        return;
    }


    balance -= amount;

    saveUser();

    updateUI();

    alert(
        "Withdrawal recorded: $" +
        amount.toFixed(2)
    );
}


// ==========================================
// NAVIGATION
// ==========================================

function showSection(sectionId, button) {

    const sections =
        document.querySelectorAll(".section");


    sections.forEach(section => {
        section.classList.remove("active");
    });


    const target =
        document.getElementById(sectionId);


    if (target) {
        target.classList.add("active");
    }


    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(item => {
        item.classList.remove("active");
    });


    if (button) {
        button.classList.add("active");
    }


    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("overlay");


    sidebar.classList.toggle("open");

    overlay.classList.toggle("show");
}


function closeSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("overlay");


    sidebar.classList.remove("open");

    overlay.classList.remove("show");
}


// ==========================================
// ANALYSIS TABS
// ==========================================

function analysisTab(tabId, button) {

    const panels =
        document.querySelectorAll(".analysis-panel");


    panels.forEach(panel => {
        panel.classList.remove("active");
    });


    const target =
        document.getElementById(tabId);


    if (target) {
        target.classList.add("active");
    }


    const tabs =
        document.querySelectorAll(".analysis-tab");


    tabs.forEach(tab => {
        tab.classList.remove("active");
    });


    button.classList.add("active");
}


// ==========================================
// DIGITS ANALYSIS
// ==========================================

function generateAnalysis() {

    const digits = [];


    for (let i = 0; i < 10; i++) {

        digits.push(
            Math.floor(Math.random() * 10)
        );
    }


    const display =
        document.getElementById("digitDisplay");


    if (!display) return;


    display.innerHTML = "";


    digits.forEach(digit => {

        const element =
            document.createElement("div");

        element.className =
            "digit-circle";

        element.innerText =
            digit;

        display.appendChild(element);

    });


    const counts = {};

    digits.forEach(digit => {

        counts[digit] =
            (counts[digit] || 0) + 1;

    });


    let most =
        digits[0];

    let least =
        digits[0];


    Object.keys(counts).forEach(digit => {

        if (
            counts[digit] >
            (counts[most] || 0)
        ) {
            most = digit;
        }

    });


    const sorted =
        Object.keys(counts)
            .sort(
                (a,b) =>
                counts[a] - counts[b]
            );


    if (sorted.length) {
        least = sorted[0];
    }


    const even =
        digits.filter(
            digit => digit % 2 === 0
        ).length;


    const odd =
        digits.length - even;


    document.getElementById(
        "mostFrequent"
    ).innerText = most;


    document.getElementById(
        "leastFrequent"
    ).innerText = least;


    document.getElementById(
        "evenCount"
    ).innerText = even;


    document.getElementById(
        "oddCount"
    ).innerText = odd;


    // Simple UI indicator only.
    // This is NOT a guaranteed prediction.
    const rise =
        Math.floor(
            40 + Math.random() * 21
        );

    const fall =
        100 - rise;


    document.getElementById(
        "riseProbability"
    ).innerText =
        rise + "%";


    document.getElementById(
        "fallProbability"
    ).innerText =
        fall + "%";
}


// ==========================================
// BOT CONTROL
// ==========================================

function toggleBot(button) {

    const card =
        button.closest(".bot-card");


    const badge =
        card.querySelector(".status-badge");


    if (
        button.innerText
            .toLowerCase()
            .includes("start")
    ) {

        button.innerText =
            "Stop Bot";

        badge.innerText =
            "Active";

        badge.classList.remove(
            "inactive"
        );

        badge.classList.add(
            "active-status"
        );

        alert(
            "Bot interface activated.\n\n" +
            "Connect your real trading API before allowing live trades."
        );

    } else {

        button.innerText =
            "Start Bot";

        badge.innerText =
            "Inactive";

        badge.classList.remove(
            "active-status"
        );

        badge.classList.add(
            "inactive"
        );
    }
}


// ==========================================
// CREATE BOT
// ==========================================

function createBot() {

    alert(
        "Bot builder is ready for configuration.\n\n" +
        "The next step is connecting strategy settings to your backend."
    );
}


// ==========================================
// COPY TRADING
// ==========================================

function copyStrategy() {

    alert(
        "Copy Trading interface selected.\n\n" +
        "Real strategy providers must be connected through your backend/API."
    );
}


// ==========================================
// TRADE HISTORY
// ==========================================

function addTrade(type, market, result, amount, status) {

    const trade = {

        id: Date.now(),

        type: type,

        market: market,

        result: result,

        amount: Number(amount),

        status: status,

        date: new Date().toLocaleString()

    };


    trades.unshift(trade);


    localStorage.setItem(
        "dollarSiteTrades",
        JSON.stringify(trades)
    );


    renderHistory();

    updateRecentActivity();

    updateUI();
}


function renderHistory() {

    const container =
        document.getElementById("historyBody");


    if (!container) return;


    if (trades.length === 0) {

        container.innerHTML =
            '<div class="empty-state">No trades recorded.</div>';

        return;
    }


    container.innerHTML = "";


    trades.slice(0, 20).forEach(trade => {

        const row =
            document.createElement("div");

        row.className =
            "history-head";

        row.style.marginTop = "6px";


        row.innerHTML = `

            <span>${escapeHTML(trade.type)}</span>

            <span>${escapeHTML(trade.market)}</span>

            <span>${escapeHTML(trade.result)}</span>

            <span>$${Number(trade.amount).toFixed(2)}</span>

            <span>${escapeHTML(trade.status)}</span>

        `;


        container.appendChild(row);

    });
}


// ==========================================
// RECENT ACTIVITY
// ==========================================

function updateRecentActivity() {

    const container =
        document.getElementById(
            "recentActivity"
        );


    if (!container) return;


    const recent =
        trades.slice(0, 4);


    if (recent.length === 0) {

        container.innerHTML =
            '<div class="empty-state">No trading activity yet.</div>';

        return;
    }


    container.innerHTML = "";


    recent.forEach(trade => {

        const item =
            document.createElement("div");


        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.padding = "10px 0";
        item.style.borderBottom =
            "1px solid rgba(255,255,255,.05)";


        item.innerHTML = `

            <div>
                <strong>${escapeHTML(trade.type)}</strong>
                <small style="display:block;color:#8995a5">
                    ${escapeHTML(trade.market)}
                </small>
            </div>

            <strong>
                $${Number(trade.amount).toFixed(2)}
            </strong>

        `;


        container.appendChild(item);

    });
}


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );

    window.location.href =
        "login.html";
}