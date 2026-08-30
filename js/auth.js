// ==========================================
// DOLLARSITE AUTHENTICATION
// SUPABASE + DERIV
// ==========================================


// ==========================================
// SUPABASE CONFIG
// ==========================================

const SUPABASE_URL =
    "https://pzrqrdqhnjpjzpwxjysf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NHhv5GJI9b6rZWDeFxbmrw_RFatrFGj";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// DOLLARSITE URL
// ==========================================

const DOLLARSITE_URL =
    "https://dollarsites.netlify.app";


// ==========================================
// DERIV CONFIG
// ==========================================

const DERIV_CLIENT_ID =
    ""34g6Lzv4vWOGql5b20gly ";

const REDIRECT_URI =
    "https://dollarsites.netlify.app/callback.html";


// ==========================================
// MESSAGE FUNCTION
// ==========================================

function showMessage(message, type = "error") {

    const box =
        document.getElementById("authMessage");

    if (!box) return;

    box.innerText = message;

    box.className =
        "auth-message " + type;
}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

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


            // ------------------------------
            // Validate passwords
            // ------------------------------

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

                // ------------------------------
                // Create Supabase account
                // ------------------------------

                const {
                    data,
                    error
                } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        // IMPORTANT:
                        // Where Supabase sends the
                        // user after email confirmation.

                        emailRedirectTo:
                            DOLLARSITE_URL +
                            "/dashboard.html",

                        data: {

                            full_name:
                                fullName,

                            phone:
                                phone

                        }

                    }

                });


                if (error) {
                    throw error;
                }


                // ------------------------------
                // Email confirmation required
                // ------------------------------

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


                // ------------------------------
                // Session already created
                // ------------------------------

                await createLocalUser(
                    data.user
                );


                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

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


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

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

                // ------------------------------
                // Supabase login
                // ------------------------------

                const {
                    data,
                    error
                } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


                if (error) {
                    throw error;
                }


                if (!data.user) {

                    throw new Error(
                        "Login failed. User session was not created."
                    );

                }


                // ------------------------------
                // Load profile
                // ------------------------------

                await createLocalUser(
                    data.user
                );


                // ------------------------------
                // Open dashboard
                // ------------------------------

                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );

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


// ==========================================
// CREATE LOCAL DASHBOARD USER
// ==========================================

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


    // ------------------------------
    // Build local user object
    // ------------------------------

    const localUser = {

        id:
            authUser.id,

        name:
            profile?.full_name ||
            authUser.user_metadata?.full_name ||
            "User",

        email:
            authUser.email ||
            "",

        phone:
            profile?.phone ||
            authUser.user_metadata?.phone ||
            "",

        balance:
            Number(
                profile?.balance || 0
            )

    };


    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(localUser)
    );
}


// ==========================================
// DERIV PKCE LOGIN
// ==========================================

async function startDerivLogin() {

    try {

        // ------------------------------
        // Generate code verifier
        // ------------------------------

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
                            value %
                            characters.length
                        ]
                )
                .join("");


        // ------------------------------
        // Generate code challenge
        // ------------------------------

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


        // ------------------------------
        // Generate state
        // ------------------------------

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


        // ------------------------------
        // Save OAuth information
        // ------------------------------

        sessionStorage.setItem(
            "pkce_code_verifier",
            codeVerifier
        );

        sessionStorage.setItem(
            "oauth_state",
            state
        );


        // ------------------------------
        // Build Deriv URL
        // ------------------------------

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


        // ------------------------------
        // Redirect to Deriv
        // ------------------------------

        window.location.href =
            "https://auth.deriv.com/oauth2/auth?" +
            params.toString();

    }

    catch (error) {

        console.error(
            "Deriv login error:",
            error
        );

        showMessage(
            "Unable to start Deriv login."
        );

    }
}


// ==========================================
// DERIV LOGIN BUTTON
// ==========================================

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


// ==========================================
// LOGOUT
// ==========================================

async function logout() {

    try {

        await supabaseClient.auth.signOut();

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    localStorage.removeItem(
        "loggedInUser"
    );


    sessionStorage.removeItem(
        "pkce_code_verifier"
    );

    sessionStorage.removeItem(
        "oauth_state"
    );


    window.location.href =
        "login.html";
        }
