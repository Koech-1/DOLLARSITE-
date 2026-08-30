const DERIV_CLIENT_ID =
    "348JWWfx0KHC8bTc1XuPf";

const REDIRECT_URI =
    "https://dollarsites.netlify.app/callback.html";


function startDerivLogin() {

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


    // Save state for callback verification
    sessionStorage.setItem(
        "oauth_state",
        state
    );


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
                state

        });


    console.log(
        "Starting Deriv OAuth..."
    );


    window.location.href =
        "https://auth.deriv.com/oauth2/auth?" +
        params.toString();
}


// Login button
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
