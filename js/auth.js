const DERIV_CLIENT_ID = "348JWWfx0KHC8bTc1XuPf";
const REDIRECT_URI = "https://dollarsites.netlify.app/callback.html";

async function startDerivLogin() {
    try {
        // Generate PKCE verifier
        const array = crypto.getRandomValues(new Uint8Array(64));

        const codeVerifier = Array.from(array)
            .map(v =>
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[v % 66]
            )
            .join("");

        // Generate code challenge
        const hash = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(codeVerifier)
        );

        const codeChallenge = btoa(
            String.fromCharCode(...new Uint8Array(hash))
        )
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        // Generate state
        const stateArray = crypto.getRandomValues(
            new Uint8Array(16)
        );

        const state = Array.from(stateArray)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

        /*
         * Store OAuth values in cookies.
         * They are needed after Deriv redirects
         * the browser back to callback.html.
         */
        document.cookie =
            "pkce_code_verifier=" +
            encodeURIComponent(codeVerifier) +
            "; Path=/; Secure; SameSite=Lax; Max-Age=600";

        document.cookie =
            "oauth_state=" +
            encodeURIComponent(state) +
            "; Path=/; Secure; SameSite=Lax; Max-Age=600";

        // Build Deriv OAuth authorization URL
        const params = new URLSearchParams({
            response_type: "code",
            client_id: DERIV_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: "trade",
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256"
        });

        console.log("Starting Deriv authorization...");

        window.location.href =
            "https://auth.deriv.com/oauth2/auth?" +
            params.toString();

    } catch (error) {
        console.error("Deriv login error:", error);
        alert("Unable to start Deriv login. Please try again.");
    }
}


// Login button
document.addEventListener("DOMContentLoaded", () => {

    const loginButton =
        document.getElementById("derivLoginBtn");

    if (loginButton) {
        loginButton.addEventListener(
            "click",
            startDerivLogin
        );
    }

});
