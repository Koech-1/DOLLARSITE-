const BASE_URL = "https://dollasite-backend--collinskoech287.replit.app/";
async function loadWallet() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/wallet`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    document.getElementById("balance").innerText = data.balance || 0;
}const token = localStorage.getItem("token");

// Load wallet balance
async function loadWallet() {
    const res = await fetch(`${BASE_URL}/api/wallet`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();
    document.getElementById("balance").innerText = data.balance || 0;
}

// Deposit
async function deposit() {
    const amount = document.getElementById("depositAmount").value;

    const res = await fetch(`${BASE_URL}/api/deposit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
    });

    const data = await res.json();
    alert(data.message || "Deposited");
    loadWallet();
}

// Withdraw
async function withdraw() {
    const amount = document.getElementById("withdrawAmount").value;

    const res = await fetch(`${BASE_URL}/api/withdraw`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: Number(amount) })
    });

    const data = await res.json();
    alert(data.message || "Withdrawn");
    loadWallet();
}

loadWallet();