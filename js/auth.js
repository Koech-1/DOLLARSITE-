// ==========================================
// DOLLARSITE AUTHENTICATION
// SUPABASE + DERIV
// ==========================================


// ------------------------------------------
// SUPABASE CONFIG
// ------------------------------------------

const SUPABASE_URL =
    "https://pzrqrdqhnjpjzpwxjysf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NHhv5GJI9b6rZWDeFxbmrw_RFatrFGj";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ------------------------------------------
// DERIV CONFIG
// ------------------------------------------

const DERIV_CLIENT_ID =
    "348JWWfx0KHC8bTc1XuPf";

const REDIRECT_URI =
    "https://dollarsites.netlify.app/callback.html";


// ------------------------------------------
// MESSAGE
// ------------------------------------------

function showMessage(message, type = "error") {

    const box =
        document.getElementById("authMessage");

    if (!box) return;

    box.innerText = message;

    box.className =
        "auth-message " + type;
}


// ------------------------------------------
// REGISTER
// ------------------------------------------

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const fullName =
                document.getElementById("fullName")
                .value
                .trim();

            const email =
                document.getElementById("email")
                .value
                .trim();

            const phone =
                document.getElementById("phone")
                .value
                .trim();

            const password =
                document.getElementById("password")
                .value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                .value;


            // Password check
            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            const button =
                document.getElementById("registerBtn");


            button.disabled = true;

            button.innerText =
                "Creating Account...";


            try {

                const {
                    data,
                    error
                } = await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {

                            full_name: fullName,

                            phone: phone

                        }

                    }

                });


                if (error) {
                    throw error;
                }


                /*
                 * If email confirmation is enabled,
                 * Supabase will not immediately create
                 * a browser session.
                 */

                if (!data.session) {

                    showMessage(
                        "Account created! Check your email to verify your account, then login.",
                        "success"
                    );

                    button.disabled = false;

                    button.innerText =
                        "Create Account";

                    return;
                }


                // Create local session information
                await createLocalUser(data.user);


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(error);

                showMessage(
                    error.message ||
                    "Registration failed."
                );

                button.disabled = false;

                button.innerText =
                    "Create Account";
            }

        }
    );
}


// ------------------------------------------
// LOGIN
// ------------------------------------------

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById("loginEmail")
                .value
                .trim();

            const password =
                document.getElementById("loginPassword")
                .value;


            const button =
                document.getElementById("loginBtn");


            button.disabled = true;

            button.innerText =
                "Logging in...";


            try {

                const {
                    data,
                    error
                } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });


                if (error) {
                    throw error;
                }


                if (!data.user) {

                    throw new Error(
                        "Login failed. User session was not created."
                    );

                }


                await createLocalUser(
                    data.user
                );


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(error);

                showMessage(
                    error.message ||
                    "Login failed."
                );

                button.disabled = false;

                button.innerText =
                    "Login";
            }

        }
    );
}


// ------------------------------------------
// CREATE LOCAL DASHBOARD USER
// ------------------------------------------

async function createLocalUser(authUser) {

    let profile = null;


    try {

        const {
            data,
            error
        } =
        await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();


        if (!error) {
            profile = data;
        }

    }

    catch (error) {

        console.warn(
            "Profile could not be loaded:",
            error
        );

    }


    const localUser = {

        id: authUser.id,

        name:
            profile?.full_name ||
            authUser.user_metadata?.full_name ||
            "User",

        email:
            authUser.email || "",

        phone:
            profile?.phone ||
            authUser.user_metadata?.phone ||
            "",

        balance:
            Number(profile?.balance || 0)

    };


    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(localUser)
    );
}


// ------------------------------------------
// DERIV PKCE LOGIN
// ------------------------------------------

async function startDerivLogin() {

    try {

        const array =
            crypto.getRandomValues(
                new Uint8Array(64)
            );


        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";


        const codeVerifier =
            Array.from(array)
            .map(
                value =>
                    characters[
                        value % characters.length
                    ]
            )
            .join("");


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


        /*
         * IMPORTANT:
         * Use sessionStorage consistently.
         */

        sessionStorage.setItem(
            "pkce_code_verifier",
            codeVerifier
        );

        sessionStorage.setItem(
            "oauth_state",
            state
        );


        const params =
            new URLSearchParams({

                response_type: "code",

                client_id:
                    DERIV_CLIENT_ID,

                redirect_uri:
                    REDIRECT_URI,

                scope: "trade",

                state: state,

                code_challenge:
                    codeChallenge,

                code_challenge_method:
                    "S256"

            });


        window.location.href =
            "https://auth.deriv.com/oauth2/auth?" +
            params.toString();

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Unable to start Deriv login."
        );

    }
}


// ------------------------------------------
// DERIV BUTTON
// ------------------------------------------

const derivLoginButton =
    document.getElementById(
        "derivLoginBtn"
    );


if (derivLoginButton) {

    derivLoginButton.addEventListener(
        "click",
        startDerivLogin
    );

}


// ------------------------------------------
// LOGOUT
// ------------------------------------------

async function logout() {

    await supabaseClient.auth.signOut();

    localStorage.removeItem(
        "loggedInUser"
    );

    window.location.href =
        "login.html";
        }
