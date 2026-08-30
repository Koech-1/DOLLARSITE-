const DERIV_CLIENT_ID =
    "348JWWfx0KHC8bTc1XuPf";

const REDIRECT_URI =
    "https://dollarsites.netlify.app/callback.html";


async function startDerivLogin() {

    try {

        // ==========================================
        // GENERATE PKCE VERIFIER
        // ==========================================

        const array =
            crypto.getRandomValues(
                new Uint8Array(64)
            );

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

        const codeVerifier =
            Array.from(array)
                .map(
                    v =>
                        characters[
                            v % characters.length
                        ]
                )
                .join("");


        // ==========================================
        // GENERATE PKCE CHALLENGE
        // ==========================================

        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(
                    codeVerifier
                )
            );

        const codeChallenge =
            btoa(
                String.fromCharCode(
                    ...new Uint8Array(hash)
                )
            )
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");


        // ==========================================
        // GENERATE STATE
        // ==========================================

        const stateArray =
            crypto.getRandomValues(
                new Uint8Array(16)
            );

        const state =
            Array.from(stateArray)
                .map(
                    b =>
                        b.toString(16)
                            .padStart(2, "0")
                )
                .join("");


        // ==========================================
        // SAVE OAUTH DATA
        // ==========================================

        sessionStorage.setItem(
            "pkce_code_verifier",
            codeVerifier
        );

        sessionStorage.setItem(
            "oauth_state",
            state
        );


        // ==========================================
        // VERIFY STORAGE
        // ==========================================

        const savedVerifier =
            sessionStorage.getItem(
                "pkce_code_verifier"
            );

        const savedState =
            sessionStorage.getItem(
                "oauth_state"
            );


        if (!savedVerifier || !savedState) {

            alert(
                "ERROR: OAuth data could not be saved."
            );

            return;
        }


        // ==========================================
        // SHOW SUCCESS BEFORE REDIRECT
        // ==========================================

        alert(
            "OAuth data saved successfully. Connecting to Deriv..."
        );


        // ==========================================
        // BUILD DERIV URL
        // ==========================================

        const params =
            new URLSearchParams({

                response_type:
                    "code",

                client_id:
                    DERIV_CLIENT_ID,

                redirect_uri:
                    REDIRECT_URI,

                scope:
                    "trade",

                state:
                    state,

                code_challenge:
                    codeChallenge,

                code_challenge_method:
                    "S256"

            });


        // ==========================================
        // REDIRECT TO DERIV
        // ==========================================

        window.location.href =
            "https://auth.deriv.com/oauth2/auth?" +
            params.toString();

    }

    catch (error) {

        console.error(
            "Deriv OAuth error:",
            error
        );

        alert(
            "Unable to start Deriv login: " +
            error.message
        );

    }

}


// ==========================================
// LOGIN BUTTON
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginButton =
            document.getElementById(
                "derivLoginBtn"
            );


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                startDerivLogin
            );

        }

    }
);
