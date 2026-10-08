import React, {
  useEffect,
  useState
} from "react";

import { createRoot } from "react-dom/client";

import {
  BriefcaseBusiness,
  ChevronRight,
  CircleDollarSign,
  Gamepad2,
  Heart,
  LogOut,
  Moon,
  ShoppingBag,
  Sparkles,
  User,
  X
} from "lucide-react";

import {
  createClient
} from "@supabase/supabase-js";

import "./styles.css";

import GameWorld from "./GameWorld";


/* =====================================================
   SUPABASE
===================================================== */

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(
        supabaseUrl,
        supabaseAnonKey
      )
    : null;


/* =====================================================
   DEMO DATA
===================================================== */

const demoPlayer = {
  id: "demo",
  display_name: "Demo Player",
  age: 21,
  gender: "Prefer not to say",
  money: 100000,
  bank_balance: 0,
  health: 100,
  happiness: 70,
  energy: 100,
  reputation: 0,
  district: "gwarinpa",
  job: "Job Seeker",
  job_salary: 0,
  housing: "Shared Apartment",
  housing_cost: 30000
};


const demoCharacter = {
  skin_color: "#8D5524",
  hair_style: "short",
  hair_color: "#171717",
  outfit: "casual",
  shoes: "sneakers"
};


/* =====================================================
   HELPERS
===================================================== */

function formatMoney(value) {
  return `₦${Number(
    value || 0
  ).toLocaleString()}`;
}


/* =====================================================
   APP
===================================================== */

function App() {

  const [session, setSession] =
    useState(null);

  const [player, setPlayer] =
    useState(null);

  const [character, setCharacter] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [screen, setScreen] =
    useState("game");

  const [authMode, setAuthMode] =
    useState("login");

  const [message, setMessage] =
    useState("");

  const [demoMode, setDemoMode] =
    useState(false);

  const [needsCharacter, setNeedsCharacter] =
    useState(false);


  /* ===================================================
     INITIALIZE
  =================================================== */

  useEffect(() => {

    let mounted = true;

    async function start() {

      if (!supabase) {

        if (!mounted) return;

        setDemoMode(true);
        setPlayer(demoPlayer);
        setCharacter(demoCharacter);
        setLoading(false);

        return;
      }


      try {

        const {
          data,
          error
        } =
          await supabase.auth.getSession();


        if (error) {
          console.error(error);
        }


        if (
          data &&
          data.session &&
          mounted
        ) {

          setSession(
            data.session
          );

          await loadPlayer(
            data.session.access_token
          );
        }

      } catch (error) {

        console.error(
          "Initialization error:",
          error
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }
      }
    }


    start();


    if (!supabase) {
      return undefined;
    }


    const {
      data: authListener
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {

          if (!mounted) return;


          setSession(
            newSession
          );


          if (!newSession) {

            setPlayer(null);
            setCharacter(null);
            setNeedsCharacter(false);
            setDemoMode(false);

            return;
          }


          /*
             Do not await async work directly inside
             Supabase's auth callback.

             Schedule it after the callback finishes.
          */

          setTimeout(() => {

            loadPlayer(
              newSession.access_token
            );

          }, 0);
        }
      );


    return () => {

      mounted = false;

      authListener.subscription.unsubscribe();

    };

  }, []);


  /* ===================================================
     LOAD PLAYER
  =================================================== */

  async function loadPlayer(token) {

    if (!token) {
      return;
    }


    try {

      setMessage("");


      const response =
        await fetch(
          "/api/me",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      /*
         API returned an error.
      */

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Unable to load your player."
        );
      }


      /*
         Existing player.
      */

      if (data.player) {

        setPlayer(
          data.player
        );

        setNeedsCharacter(false);


        await loadCharacter(
          data.player.id
        );

        return;
      }


      /*
         No player exists yet.

         This is a NEW authenticated user.
         Show the character creator.
      */

      setPlayer(null);
      setCharacter(null);
      setNeedsCharacter(true);

    } catch (error) {

      console.error(
        "loadPlayer error:",
        error
      );


      setMessage(
        error.message ||
        "Unable to load your player."
      );
    }
  }


  /* ===================================================
     LOAD CHARACTER
  =================================================== */

  async function loadCharacter(
    playerId
  ) {

    if (!supabase || !playerId) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabase
          .from("characters")
          .select("*")
          .eq(
            "player_id",
            playerId
          )
          .maybeSingle();


      if (error) {

        console.error(
          "Character loading error:",
          error
        );

        /*
           If the characters table does not exist,
           don't completely break the game.
        */

        setNeedsCharacter(true);

        return;
      }


      if (data) {

        setCharacter(data);
        setNeedsCharacter(false);

      } else {

        setCharacter(null);
        setNeedsCharacter(true);
      }

    } catch (error) {

      console.error(
        error
      );

      setNeedsCharacter(true);
    }
  }


  /* ===================================================
     CREATE PLAYER + CHARACTER
  =================================================== */

  async function createPlayerAndCharacter({
    displayName,
    age,
    gender,
    characterData
  }) {

    try {

      /*
         Always get the current Supabase session
         directly instead of relying only on React state.
      */

      if (!supabase) {

        throw new Error(
          "Supabase is not configured."
        );
      }


      const {
        data: sessionData,
        error: sessionError
      } =
        await supabase.auth.getSession();


      if (sessionError) {
        throw sessionError;
      }


      const currentSession =
        sessionData.session;


      if (!currentSession) {

        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }


      /*
         Keep React state synchronized.
      */

      setSession(
        currentSession
      );


      setMessage(
        "Creating your Abuja life..."
      );


      /*
         Create the player.
      */

      const response =
        await fetch(
          "/api/player",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${currentSession.access_token}`
            },

            body: JSON.stringify({

              display_name:
                displayName.trim(),

              age:
                Number(age),

              gender

            })
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.error ||
          "Could not create your player."
        );
      }


      if (!result.player) {

        throw new Error(
          "The server did not return your player."
        );
      }


      /*
         Save player in React.
      */

      setPlayer(
        result.player
      );


      /*
         Create the character.

         IMPORTANT:
         player_id must match the authenticated
         user's player ID if your schema uses
         player.id, not auth.uid().
      */

      const playerId =
        result.player.id;


      const {
        data: newCharacter,
        error: characterError
      } =
        await supabase
          .from("characters")
          .upsert(
            {
              player_id:
                playerId,

              skin_color:
                characterData.skin_color,

              hair_style:
                characterData.hair_style,

              hair_color:
                characterData.hair_color,

              outfit:
                characterData.outfit,

              shoes:
                characterData.shoes
            },
            {
              onConflict:
                "player_id"
            }
          )
          .select()
          .single();


      if (characterError) {

        console.error(
          "Character creation error:",
          characterError
        );

        throw new Error(
          `Character could not be saved: ${characterError.message}`
        );
      }


      /*
         Save character.
      */

      setCharacter(
        newCharacter
      );


      setNeedsCharacter(
        false
      );


      /*
         Open the actual game.
      */

      setScreen(
        "game"
      );


      setMessage(
        `Welcome to Abuja, ${displayName}!`
      );

    } catch (error) {

      console.error(
        "createPlayerAndCharacter error:",
        error
      );


      setMessage(
        error.message ||
        "Something went wrong while creating your character."
      );
    }
  }


  /* ===================================================
     SAVE CHARACTER
  =================================================== */

  async function saveCharacter(
    updates
  ) {

    if (!character) {
      return;
    }


    /*
       Demo mode.
    */

    if (demoMode) {

      setCharacter({
        ...character,
        ...updates
      });

      return;
    }


    if (!supabase || !session) {

      setMessage(
        "You are not logged in."
      );

      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabase
          .from("characters")
          .update(updates)
          .eq(
            "player_id",
            player.id
          )
          .select()
          .single();


      if (error) {

        setMessage(
          error.message
        );

        return;
      }


      setCharacter(
        data
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to save character."
      );
    }
  }


  /* ===================================================
     GAME ACTION
  =================================================== */

  async function performAction(
    payload
  ) {

    if (!player) {
      return;
    }


    /*
       Demo mode.
    */

    if (demoMode) {

      demoAction(
        payload
      );

      return;
    }


    if (!session) {

      setMessage(
        "Please log in again."
      );

      return;
    }


    try {

      const response =
        await fetch(
          "/api/action",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`
            },

            body:
              JSON.stringify(
                payload
              )
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setMessage(
          data.error ||
          "Action failed."
        );

        return;
      }


      setPlayer(
        data.player
      );


      setMessage(
        data.message
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to complete action."
      );
    }
  }


  /* ===================================================
     DEMO ACTIONS
  =================================================== */

  function demoAction(
    payload
  ) {

    if (!player) {
      return;
    }


    let next = {
      ...player
    };


    if (
      payload.action ===
      "rest"
    ) {

      next.energy =
        Math.min(
          100,
          next.energy + 30
        );

      next.health =
        Math.min(
          100,
          next.health + 5
        );

      next.happiness =
        Math.min(
          100,
          next.happiness + 3
        );

      setMessage(
        "You rested."
      );
    }


    if (
      payload.action ===
      "eat"
    ) {

      if (
        next.money <
        2500
      ) {

        setMessage(
          "Not enough money."
        );

        return;
      }


      next.money -=
        2500;


      next.energy =
        Math.min(
          100,
          next.energy + 10
        );


      next.happiness =
        Math.min(
          100,
          next.happiness + 4
        );


      setMessage(
        "You had a meal."
      );
    }


    if (
      payload.action ===
      "social"
    ) {

      if (
        next.money <
        5000
      ) {

        setMessage(
          "Not enough money."
        );

        return;
      }


      next.money -=
        5000;


      next.happiness =
        Math.min(
          100,
          next.happiness + 15
        );


      next.reputation =
        Math.min(
          100,
          next.reputation + 2
        );


      setMessage(
        "You went out."
      );
    }


    if (
      payload.action ===
      "work"
    ) {

      if (
        !next.job_salary
      ) {

        setMessage(
          "Get a job first."
        );

        return;
      }


      const earnings =
        Math.round(
          next.job_salary /
          22
        );


      next.money +=
        earnings;


      next.energy =
        Math.max(
          0,
          next.energy - 20
        );


      next.reputation =
        Math.min(
          100,
          next.reputation + 1
        );


      setMessage(
        `You earned ${formatMoney(
          earnings
        )}.`
      );
    }


    setPlayer(
      next
    );
  }


  /* ===================================================
     LOGOUT
  =================================================== */

  async function logout() {

    try {

      if (supabase) {
        await supabase.auth.signOut();
      }

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );
    }


    setSession(null);
    setPlayer(null);
    setCharacter(null);
    setNeedsCharacter(false);
    setDemoMode(false);
    setScreen("game");
    setMessage("");
  }


  /* ===================================================
     LOADING SCREEN
  =================================================== */

  if (loading) {

    return (
      <div className="loading">

        <Gamepad2
          size={42}
        />

        <h1>
          AbujaSoftlifeNG
        </h1>

        <p>
          Building your Abuja...
        </p>

      </div>
    );
  }


  /* ===================================================
     AUTH SCREEN

     IMPORTANT FIX:
     A logged-in user who has no player must NOT
     be sent back to login.
  =================================================== */

  if (
    !session &&
    !player &&
    !demoMode
  ) {

    return (
      <AuthScreen

        authMode={
          authMode
        }

        setAuthMode={
          setAuthMode
        }

        message={
          message
        }

        setMessage={
          setMessage
        }

        onLoginSuccess={
          async (
            newSession
          ) => {

            setSession(
              newSession
            );

            await loadPlayer(
              newSession.access_token
            );
          }
        }

        onDemo={() => {

          setDemoMode(
            true
          );

          setPlayer(
            demoPlayer
          );

          setCharacter(
            demoCharacter
          );

          setNeedsCharacter(
            false
          );

          setScreen(
            "game"
          );
        }}
      />
    );
  }


  /* ===================================================
     CHARACTER CREATOR

     IMPORTANT FIX:
     We check session, NOT player.

     A new user is authenticated but doesn't have
     a player yet.
  =================================================== */

  if (
    session &&
    needsCharacter &&
    !demoMode
  ) {

    return (
      <CharacterCreator

        message={
          message
        }

        onCreate={
          createPlayerAndCharacter
        }
      />
    );
  }


  /* ===================================================
     SAFETY FALLBACK
  =================================================== */

  if (!player) {

    return (
      <div className="loading">

        <Gamepad2
          size={42}
        />

        <h1>
          AbujaSoftlifeNG
        </h1>

        <p>
          Preparing your game...
        </p>

      </div>
    );
  }


  /* ===================================================
     GAME
  =================================================== */

  return (
    <div className="game-app">

      <GameWorld

        player={
          player
        }

        character={
          character ||
          demoCharacter
        }

        onAction={
          performAction
        }

        onSaveCharacter={
          saveCharacter
        }

        onMessage={
          setMessage
        }
      />


      <GameHUD

        player={
          player
        }

        character={
          character ||
          demoCharacter
        }

        screen={
          screen
        }

        setScreen={
          setScreen
        }

        onAction={
          performAction
        }

        logout={
          logout
        }

        message={
          message
        }

        setMessage={
          setMessage
        }
      />


      {screen === "character" && (

        <CharacterPanel

          character={
            character ||
            demoCharacter
          }

          onSave={
            saveCharacter
          }

          onClose={() =>
            setScreen(
              "game"
            )
          }
        />
      )}


      {screen === "actions" && (

        <ActionPanel

          player={
            player
          }

          onAction={
            performAction
          }

          onClose={() =>
            setScreen(
              "game"
            )
          }
        />
      )}


      {screen === "profile" && (

        <ProfilePanel

          player={
            player
          }

          onClose={() =>
            setScreen(
              "game"
            )
          }
        />
      )}

    </div>
  );
}


/* =====================================================
   AUTH SCREEN
===================================================== */

function AuthScreen({
  authMode,
  setAuthMode,
  message,
  setMessage,
  onDemo,
  onLoginSuccess
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function submit(e) {

    e.preventDefault();

    setLoading(true);
    setMessage("");


    try {

      if (!supabase) {

        throw new Error(
          "Supabase is not configured."
        );
      }


      /* ===============================================
         LOGIN
      =============================================== */

      if (
        authMode ===
        "login"
      ) {

        const {
          data,
          error
        } =
          await supabase.auth
            .signInWithPassword({

              email:
                email.trim(),

              password

            });


        if (error) {
          throw error;
        }


        if (
          !data ||
          !data.session
        ) {

          throw new Error(
            "Login succeeded, but no session was created."
          );
        }


        setMessage(
          "Login successful. Entering Abuja..."
        );


        /*
           Immediately load the player's account.

           This is what fixes the old problem where
           pressing Enter Abuja appeared to do nothing.
        */

        await onLoginSuccess(
          data.session
        );

      }


      /* ===============================================
         SIGN UP
      =============================================== */

      else {

        const {
          data,
          error
        } =
          await supabase.auth
            .signUp({

              email:
                email.trim(),

              password,

              options: {

                emailRedirectTo:
                  window.location.origin

              }

            });


        if (error) {
          throw error;
        }


        /*
           If email confirmation is disabled,
           Supabase gives us a session immediately.
        */

        if (
          data &&
          data.session
        ) {

          await onLoginSuccess(
            data.session
          );

        } else {

          /*
             Email confirmation is enabled.
          */

          setMessage(
            "Account created! Check your email and click Confirm Email before logging in."
          );
        }
      }

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );


      setMessage(
        error.message ||
        "Authentication failed."
      );

    } finally {

      setLoading(false);
    }
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">

          <Gamepad2
            size={32}
          />

        </div>


        <p className="eyebrow">
          ABUJA IS YOURS
        </p>


        <h1>
          AbujaSoftlifeNG
        </h1>


        <p className="auth-description">
          Work. Make money. Build your
          lifestyle. Explore Abuja.
        </p>


        <form
          onSubmit={
            submit
          }
        >

          <label>

            Email

            <input
              type="email"
              placeholder="you@example.com"
              value={
                email
              }
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

          </label>


          <label>

            Password

            <input
              type="password"
              placeholder="••••••••"
              value={
                password
              }
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              minLength={6}
              required
            />

          </label>


          {message && (

            <div className="notice">
              {message}
            </div>

          )}


          <button
            type="submit"
            className="primary-button"
            disabled={
              loading
            }
          >

            {loading
              ? "Please wait..."
              : authMode ===
                "login"
              ? "Enter Abuja"
              : "Create Account"}

          </button>

        </form>


        <button
          type="button"
          className="text-button"
          onClick={() =>
            setAuthMode(
              authMode ===
                "login"
                ? "signup"
                : "login"
            )
          }
        >

          {authMode ===
          "login"
            ? "Create an account"
            : "Already have an account? Log in"}

        </button>


        <div className="divider">
          OR
        </div>


        <button
          type="button"
          className="secondary-button"
          onClick={
            onDemo
          }
        >
          Play Demo
        </button>

      </div>

    </div>
  );
}


/* =====================================================
   CHARACTER CREATOR
===================================================== */

function CharacterCreator({
  onCreate,
  message
}) {

  const [name, setName] =
    useState("");

  const [age, setAge] =
    useState(21);

  const [gender, setGender] =
    useState(
      "Prefer not to say"
    );

  const [skin, setSkin] =
    useState("#8D5524");

  const [hair, setHair] =
    useState("short");

  const [hairColor, setHairColor] =
    useState("#171717");

  const [outfit, setOutfit] =
    useState("casual");

  const [shoes, setShoes] =
    useState("sneakers");


  function handleCreate() {

    if (
      name.trim().length <
      2
    ) {
      return;
    }


    onCreate({

      displayName:
        name.trim(),

      age:
        Number(age),

      gender,

      characterData: {

        skin_color:
          skin,

        hair_style:
          hair,

        hair_color:
          hairColor,

        outfit,

        shoes

      }

    });
  }


  return (
    <div className="creator-page">

      <div className="creator-card">


        {/* ===========================================
            CHARACTER PREVIEW
        =========================================== */}

        <div className="creator-preview">

          <div className="preview-floor" />


          <div
            className="preview-person"
            style={{
              "--skin":
                skin,

              "--hair":
                hairColor
            }}
          >

            <div className="preview-head">

              <div className="preview-hair" />

            </div>


            <div
              className={`preview-body ${outfit}`}
            />


            <div className="preview-legs">

              <span />

              <span />

            </div>

          </div>

        </div>


        {/* ===========================================
            CHARACTER CONTROLS
        =========================================== */}

        <div className="creator-controls">

          <p className="eyebrow">
            YOUR ABUJA LIFE
          </p>


          <h1>
            Create Your Character
          </h1>


          <p className="muted">
            This character will represent you
            throughout AbujaSoftlifeNG.
          </p>


          <label>

            Character name

            <input
              value={
                name
              }

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }

              placeholder="e.g. Senayon"

              maxLength={30}
            />

          </label>


          <div className="two-columns">

            <label>

              Age

              <input
                type="number"
                min="13"
                max="100"
                value={
                  age
                }

                onChange={(e) =>
                  setAge(
                    e.target.value
                  )
                }
              />

            </label>


            <label>

              Gender

              <select
                value={
                  gender
                }

                onChange={(e) =>
                  setGender(
                    e.target.value
                  )
                }
              >

                <option>
                  Prefer not to say
                </option>

                <option>
                  Male
                </option>

                <option>
                  Female
                </option>

              </select>

            </label>

          </div>


          <Customizer

            label="Skin"

            values={[
              "#4A2511",
              "#6B3517",
              "#8D5524",
              "#A86F3D",
              "#C58B5B",
              "#E0A778"
            ]}

            selected={
              skin
            }

            onChange={
              setSkin
            }
          />


          <Customizer

            label="Hair colour"

            values={[
              "#171717",
              "#3B2416",
              "#5B3925",
              "#D4A017",
              "#9CA3AF"
            ]}

            selected={
              hairColor
            }

            onChange={
              setHairColor
            }
          />


          <div className="choice-section">

            <span>
              Hair style
            </span>


            <div className="choice-row">

              {[
                "short",
                "fade",
                "afro",
                "long"
              ].map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item
                    }

                    className={
                      hair ===
                      item
                        ? "choice active"
                        : "choice"
                    }

                    onClick={() =>
                      setHair(
                        item
                      )
                    }
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>


          <div className="choice-section">

            <span>
              Outfit
            </span>


            <div className="choice-row">

              {[
                "casual",
                "corporate",
                "street"
              ].map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item
                    }

                    className={
                      outfit ===
                      item
                        ? "choice active"
                        : "choice"
                    }

                    onClick={() =>
                      setOutfit(
                        item
                      )
                    }
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>


          <div className="choice-section">

            <span>
              Shoes
            </span>


            <div className="choice-row">

              {[
                "sneakers",
                "slides",
                "loafers"
              ].map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item
                    }

                    className={
                      shoes ===
                      item
                        ? "choice active"
                        : "choice"
                    }

                    onClick={() =>
                      setShoes(
                        item
                      )
                    }
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>


          {message && (

            <div className="notice">
              {message}
            </div>

          )}


          <button
            type="button"
            className="primary-button"
            disabled={
              name.trim().length <
              2
            }

            onClick={
              handleCreate
            }
          >

            Enter Abuja

            <ChevronRight
              size={18}
            />

          </button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   COLOR CUSTOMIZER
===================================================== */

function Customizer({
  label,
  values,
  selected,
  onChange
}) {

  return (
    <div className="choice-section">

      <span>
        {label}
      </span>


      <div className="color-row">

        {values.map(
          (color) => (

            <button
              type="button"
              key={
                color
              }

              aria-label={
                `${label} ${color}`
              }

              className={
                selected ===
                color
                  ? "color-choice selected"
                  : "color-choice"
              }

              style={{
                background:
                  color
              }}

              onClick={() =>
                onChange(
                  color
                )
              }
            />

          )
        )}

      </div>

    </div>
  );
}


/* =====================================================
   GAME HUD
===================================================== */

function GameHUD({
  player,
  character,
  screen,
  setScreen,
  onAction,
  logout,
  message,
  setMessage
}) {

  return (
    <>

      <div className="game-top">

        <div className="game-brand">

          <div className="brand-mini">

            <Gamepad2
              size={18}
            />

          </div>


          <div>

            <strong>
              AbujaSoftlifeNG
            </strong>

            <span>
              {player.district}
            </span>

          </div>

        </div>


        <div className="game-stats">

          <div>

            <CircleDollarSign
              size={15}
            />

            {formatMoney(
              player.money
            )}

          </div>


          <div>

            <Heart
              size={15}
            />

            {player.health}

          </div>


          <div>

            <Sparkles
              size={15}
            />

            {player.reputation}

          </div>

        </div>

      </div>


      {message && (

        <div className="game-message">

          <Sparkles
            size={15}
          />

          {message}


          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>

      )}


      <div className="game-bottom">

        <button
          type="button"
          onClick={() =>
            setScreen(
              "profile"
            )
          }
        >

          <User
            size={20}
          />

          <span>
            Profile
          </span>

        </button>


        <button
          type="button"
          onClick={() =>
            setScreen(
              "actions"
            )
          }
        >

          <Sparkles
            size={20}
          />

          <span>
            Life
          </span>

        </button>


        <button
          type="button"
          className="character-button"
          onClick={() =>
            setScreen(
              "character"
            )
          }
        >

          <div
            className="mini-avatar"
            style={{
              "--skin":
                character.skin_color
            }}
          >

            <div />

          </div>


          <span>
            Character
          </span>

        </button>


        <button
          type="button"
          onClick={() =>
            onAction({
              action:
                "rest"
            })
          }
        >

          <Moon
            size={20}
          />

          <span>
            Rest
          </span>

        </button>


        <button
          type="button"
          onClick={
            logout
          }
        >

          <LogOut
            size={20}
          />

          <span>
            Exit
          </span>

        </button>

      </div>

    </>
  );
}


/* =====================================================
   CHARACTER PANEL
===================================================== */

function CharacterPanel({
  character,
  onSave,
  onClose
}) {

  return (
    <div className="overlay">

      <div className="panel">

        <button
          type="button"
          className="close-button"
          onClick={
            onClose
          }
        >

          <X />

        </button>


        <p className="eyebrow">
          YOUR CHARACTER
        </p>


        <h2>
          Customize
        </h2>


        <Customizer

          label="Skin"

          values={[
            "#4A2511",
            "#6B3517",
            "#8D5524",
            "#A86F3D",
            "#C58B5B",
            "#E0A778"
          ]}

          selected={
            character.skin_color
          }

          onChange={(value) =>
            onSave({
              skin_color:
                value
            })
          }
        />


        <Customizer

          label="Hair colour"

          values={[
            "#171717",
            "#3B2416",
            "#5B3925",
            "#D4A017",
            "#9CA3AF"
          ]}

          selected={
            character.hair_color
          }

          onChange={(value) =>
            onSave({
              hair_color:
                value
            })
          }
        />


        <div className="choice-section">

          <span>
            Hair
          </span>


          <div className="choice-row">

            {[
              "short",
              "fade",
              "afro",
              "long"
            ].map(
              (value) => (

                <button
                  type="button"
                  key={
                    value
                  }

                  className={
                    character.hair_style ===
                    value
                      ? "choice active"
                      : "choice"
                  }

                  onClick={() =>
                    onSave({
                      hair_style:
                        value
                    })
                  }
                >
                  {value}
                </button>

              )
            )}

          </div>

        </div>


        <div className="choice-section">

          <span>
            Outfit
          </span>


          <div className="choice-row">

            {[
              "casual",
              "corporate",
              "street"
            ].map(
              (value) => (

                <button
                  type="button"
                  key={
                    value
                  }

                  className={
                    character.outfit ===
                    value
                      ? "choice active"
                      : "choice"
                  }

                  onClick={() =>
                    onSave({
                      outfit:
                        value
                    })
                  }
                >
                  {value}
                </button>

              )
            )}

          </div>

        </div>


        <button
          type="button"
          className="primary-button"
          onClick={
            onClose
          }
        >
          Done
        </button>

      </div>

    </div>
  );
}


/* =====================================================
   ACTION PANEL
===================================================== */

function ActionPanel({
  player,
  onAction,
  onClose
}) {

  return (
    <div className="overlay">

      <div className="panel">

        <button
          type="button"
          className="close-button"
          onClick={
            onClose
          }
        >
          <X />
        </button>


        <p className="eyebrow">
          DAILY LIFE
        </p>


        <h2>
          What are you doing?
        </h2>


        <ActionButton

          icon={
            <BriefcaseBusiness />
          }

          title="Go to Work"

          text={
            player.job ===
            "Job Seeker"
              ? "You need a job."
              : "Earn your daily income."
          }

          onClick={() =>
            onAction({
              action:
                "work"
            })
          }
        />


        <ActionButton

          icon={
            <ShoppingBag />
          }

          title="Eat"

          text="Spend ₦2,500 on food."

          onClick={() =>
            onAction({
              action:
                "eat"
            })
          }
        />


        <ActionButton

          icon={
            <Sparkles />
          }

          title="Socialize"

          text="Go out and meet people."

          onClick={() =>
            onAction({
              action:
                "social"
            })
          }
        />


        <ActionButton

          icon={
            <Moon />
          }

          title="Rest"

          text="Recover energy."

          onClick={() =>
            onAction({
              action:
                "rest"
            })
          }
        />

      </div>

    </div>
  );
}


/* =====================================================
   ACTION BUTTON
===================================================== */

function ActionButton({
  icon,
  title,
  text,
  onClick
}) {

  return (
    <button
      type="button"
      className="panel-action"
      onClick={
        onClick
      }
    >

      <div>
        {icon}
      </div>


      <span>

        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>

      </span>


      <ChevronRight />

    </button>
  );
}


/* =====================================================
   PROFILE PANEL
===================================================== */

function ProfilePanel({
  player,
  onClose
}) {

  return (
    <div className="overlay">

      <div className="panel">

        <button
          type="button"
          className="close-button"
          onClick={
            onClose
          }
        >
          <X />
        </button>


        <p className="eyebrow">
          PLAYER
        </p>


        <h2>
          {player.display_name}
        </h2>


        <div className="profile-grid">

          <Info
            label="Cash"
            value={
              formatMoney(
                player.money
              )
            }
          />


          <Info
            label="Health"
            value={
              `${player.health}%`
            }
          />


          <Info
            label="Energy"
            value={
              `${player.energy}%`
            }
          />


          <Info
            label="Happiness"
            value={
              `${player.happiness}%`
            }
          />


          <Info
            label="Reputation"
            value={
              player.reputation
            }
          />


          <Info
            label="Job"
            value={
              player.job
            }
          />


          <Info
            label="Home"
            value={
              player.housing
            }
          />


          <Info
            label="District"
            value={
              player.district
            }
          />

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   INFO
===================================================== */

function Info({
  label,
  value
}) {

  return (
    <div className="profile-info">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =====================================================
   MOUNT APP
===================================================== */

createRoot(
  document.getElementById(
    "root"
  )
).render(

  <React.StrictMode>

    <App />

  </React.StrictMode>
);
