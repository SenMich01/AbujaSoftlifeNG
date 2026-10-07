import React, {
  useEffect,
  useState
} from "react";

import { createRoot } from "react-dom/client";

import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Car,
  ChevronRight,
  CircleDollarSign,
  Gamepad2,
  Heart,
  Home,
  LogOut,
  Map,
  Menu,
  Moon,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  User,
  Wallet,
  X
} from "lucide-react";

import {
  createClient
} from "@supabase/supabase-js";

import "./styles.css";

import GameWorld from "./GameWorld";


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


const districts = [
  {
    id: "gwarinpa",
    name: "Gwarinpa"
  },
  {
    id: "wuse",
    name: "Wuse"
  },
  {
    id: "wuse-2",
    name: "Wuse 2"
  },
  {
    id: "jabi",
    name: "Jabi"
  },
  {
    id: "garki",
    name: "Garki"
  },
  {
    id: "maitama",
    name: "Maitama"
  },
  {
    id: "asokoro",
    name: "Asokoro"
  },
  {
    id: "central-area",
    name: "Central Area"
  }
];


function formatMoney(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}


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


  useEffect(() => {
    initialize();
  }, []);


  async function initialize() {
    if (!supabase) {
      setDemoMode(true);
      setPlayer(demoPlayer);
      setCharacter(demoCharacter);
      setLoading(false);
      return;
    }


    const {
      data
    } = await supabase.auth.getSession();


    if (data.session) {
      setSession(data.session);

      await loadPlayer(
        data.session.access_token
      );
    }


    setLoading(false);


    const {
      data: authListener
    } =
      supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          setSession(newSession);

          if (newSession) {
            await loadPlayer(
              newSession.access_token
            );
          } else {
            setPlayer(null);
            setCharacter(null);
          }
        }
      );


    return () => {
      authListener.subscription.unsubscribe();
    };
  }


  async function loadPlayer(token) {
    try {
      const response =
        await fetch("/api/me", {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        });


      const data =
        await response.json();


      if (data.player) {
        setPlayer(data.player);

        await loadCharacter(
          data.player.id
        );
      } else {
        setNeedsCharacter(true);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to load your player."
      );
    }
  }


  async function loadCharacter(playerId) {
    if (!supabase) return;

    const {
      data,
      error
    } = await supabase
      .from("characters")
      .select("*")
      .eq("player_id", playerId)
      .maybeSingle();


    if (error) {
      console.error(error);
      return;
    }


    if (data) {
      setCharacter(data);
      setNeedsCharacter(false);
    } else {
      setNeedsCharacter(true);
    }
  }


  async function createPlayerAndCharacter({
    displayName,
    age,
    gender,
    characterData
  }) {
    if (!session) return;


    try {
      const response =
        await fetch("/api/player", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`
          },

          body: JSON.stringify({
            display_name:
              displayName,

            age: Number(age),

            gender
          })
        });


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.error ||
          "Could not create player."
        );
      }


      setPlayer(result.player);


      const {
        data,
        error
      } = await supabase
        .from("characters")
        .upsert(
          {
            player_id:
              session.user.id,

            ...characterData
          },
          {
            onConflict:
              "player_id"
          }
        )
        .select()
        .single();


      if (error) {
        throw error;
      }


      setCharacter(data);
      setNeedsCharacter(false);

      setMessage(
        "Welcome to AbujaSoftlifeNG."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message
      );
    }
  }


  async function saveCharacter(
    updates
  ) {
    if (demoMode) {
      setCharacter({
        ...character,
        ...updates
      });

      return;
    }


    const {
      data,
      error
    } = await supabase
      .from("characters")
      .update(updates)
      .eq(
        "player_id",
        session.user.id
      )
      .select()
      .single();


    if (error) {
      setMessage(error.message);
      return;
    }


    setCharacter(data);
  }


  async function performAction(
    payload
  ) {
    if (demoMode) {
      demoAction(payload);
      return;
    }


    if (!session) return;


    try {
      const response =
        await fetch("/api/action", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${session.access_token}`
          },

          body: JSON.stringify(payload)
        });


      const data =
        await response.json();


      if (!response.ok) {
        setMessage(
          data.error ||
          "Action failed."
        );

        return;
      }


      setPlayer(data.player);

      setMessage(
        data.message
      );
    } catch {
      setMessage(
        "Unable to complete action."
      );
    }
  }


  function demoAction(payload) {
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
      if (next.money < 2500) {
        setMessage(
          "Not enough money."
        );

        return;
      }


      next.money -= 2500;

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
      if (next.money < 5000) {
        setMessage(
          "Not enough money."
        );

        return;
      }


      next.money -= 5000;

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
      if (!next.job_salary) {
        setMessage(
          "Get a job first."
        );

        return;
      }


      const earnings =
        Math.round(
          next.job_salary / 22
        );


      next.money += earnings;

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


    setPlayer(next);
  }


  async function logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setPlayer(null);
    setCharacter(null);
  }


  if (loading) {
    return (
      <div className="loading">
        <Gamepad2 size={42} />

        <h1>
          AbujaSoftlifeNG
        </h1>

        <p>
          Building your Abuja...
        </p>
      </div>
    );
  }


  if (
    !player &&
    !demoMode
  ) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={
          setAuthMode
        }
        message={message}
        setMessage={
          setMessage
        }

        onDemo={() => {
          setDemoMode(true);
          setPlayer(
            demoPlayer
          );
          setCharacter(
            demoCharacter
          );
        }}
      />
    );
  }


  if (
    player &&
    needsCharacter &&
    !demoMode
  ) {
    return (
      <CharacterCreator
        message={message}
        onCreate={
          createPlayerAndCharacter
        }
      />
    );
  }


  return (
    <div className="game-app">

      <GameWorld
        player={player}
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
        player={player}
        character={
          character ||
          demoCharacter
        }

        screen={screen}
        setScreen={setScreen}

        onAction={
          performAction
        }

        logout={logout}

        message={message}
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
            setScreen("game")
          }
        />
      )}


      {screen === "actions" && (
        <ActionPanel
          player={player}
          onAction={
            performAction
          }

          onClose={() =>
            setScreen("game")
          }
        />
      )}


      {screen === "profile" && (
        <ProfilePanel
          player={player}
          character={
            character ||
            demoCharacter
          }

          onClose={() =>
            setScreen("game")
          }
        />
      )}

    </div>
  );
}


/* ----------------------------------------
   AUTH
---------------------------------------- */

function AuthScreen({
  authMode,
  setAuthMode,
  message,
  setMessage,
  onDemo
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
      if (authMode === "login") {
        const {
          error
        } =
          await supabase.auth
            .signInWithPassword({
              email,
              password
            });


        if (error) throw error;
      } else {
        const {
          data,
          error
        } =
          await supabase.auth
            .signUp({
              email,
              password
            });


        if (error) throw error;


        if (!data.session) {
          setMessage(
            "Account created. Check your email to verify your account."
          );
        }
      }
    } catch (error) {
      setMessage(
        error.message
      );
    }


    setLoading(false);
  }


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <Gamepad2 size={32} />
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


        <form onSubmit={submit}>

          <label>
            Email

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
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
              value={password}
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
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
              ? "Enter Abuja"
              : "Create Account"}
          </button>

        </form>


        <button
          className="text-button"
          onClick={() =>
            setAuthMode(
              authMode === "login"
                ? "signup"
                : "login"
            )
          }
        >
          {authMode === "login"
            ? "Create an account"
            : "Already have an account? Log in"}
        </button>


        <div className="divider">
          OR
        </div>


        <button
          className="secondary-button"
          onClick={onDemo}
        >
          Play Demo
        </button>

      </div>

    </div>
  );
}


/* ----------------------------------------
   CHARACTER CREATOR
---------------------------------------- */

function CharacterCreator({
  onCreate,
  message
}) {
  const [name, setName] =
    useState("");

  const [age, setAge] =
    useState(21);

  const [gender, setGender] =
    useState("Prefer not to say");

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


  return (
    <div className="creator-page">

      <div className="creator-card">

        <div className="creator-preview">

          <div className="preview-floor" />

          <div
            className="preview-person"
            style={{
              "--skin": skin,
              "--hair": hairColor
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
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }

              placeholder="e.g. Senayon"
            />
          </label>


          <div className="two-columns">

            <label>
              Age

              <input
                type="number"
                min="13"
                max="100"
                value={age}
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
                value={gender}
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
            selected={skin}
            onChange={setSkin}
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
            selected={hairColor}
            onChange={setHairColor}
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
              ].map((item) => (
                <button
                  key={item}
                  className={
                    hair === item
                      ? "choice active"
                      : "choice"
                  }

                  onClick={() =>
                    setHair(item)
                  }
                >
                  {item}
                </button>
              ))}

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
              ].map((item) => (
                <button
                  key={item}
                  className={
                    outfit === item
                      ? "choice active"
                      : "choice"
                  }

                  onClick={() =>
                    setOutfit(item)
                  }
                >
                  {item}
                </button>
              ))}

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
              ].map((item) => (
                <button
                  key={item}
                  className={
                    shoes === item
                      ? "choice active"
                      : "choice"
                  }

                  onClick={() =>
                    setShoes(item)
                  }
                >
                  {item}
                </button>
              ))}

            </div>

          </div>


          {message && (
            <div className="notice">
              {message}
            </div>
          )}


          <button
            className="primary-button"
            disabled={
              name.trim().length < 2
            }

            onClick={() =>
              onCreate({
                displayName:
                  name.trim(),

                age,

                gender,

                characterData: {
                  skin_color: skin,
                  hair_style: hair,
                  hair_color:
                    hairColor,
                  outfit,
                  shoes
                }
              })
            }
          >
            Enter Abuja
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}


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

        {values.map((color) => (
          <button
            key={color}
            className={
              selected === color
                ? "color-choice selected"
                : "color-choice"
            }

            style={{
              background: color
            }}

            onClick={() =>
              onChange(color)
            }
          />
        ))}

      </div>

    </div>
  );
}


/* ----------------------------------------
   HUD
---------------------------------------- */

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
            <Gamepad2 size={18} />
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
            <CircleDollarSign size={15} />
            {formatMoney(player.money)}
          </div>

          <div>
            <Heart size={15} />
            {player.health}
          </div>

          <div>
            <Sparkles size={15} />
            {player.reputation}
          </div>

        </div>

      </div>


      {message && (
        <div className="game-message">

          <Sparkles size={15} />

          {message}

          <button
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
          onClick={() =>
            setScreen("profile")
          }
        >
          <User size={20} />
          <span>
            Profile
          </span>
        </button>


        <button
          onClick={() =>
            setScreen("actions")
          }
        >
          <Sparkles size={20} />
          <span>
            Life
          </span>
        </button>


        <button
          className="character-button"
          onClick={() =>
            setScreen("character")
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
          onClick={() =>
            onAction({
              action: "rest"
            })
          }
        >
          <Moon size={20} />
          <span>
            Rest
          </span>
        </button>


        <button
          onClick={logout}
        >
          <LogOut size={20} />
          <span>
            Exit
          </span>
        </button>

      </div>
    </>
  );
}


/* ----------------------------------------
   PANELS
---------------------------------------- */

function CharacterPanel({
  character,
  onSave,
  onClose
}) {
  return (
    <div className="overlay">

      <div className="panel">

        <button
          className="close-button"
          onClick={onClose}
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
              skin_color: value
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
            ].map((value) => (
              <button
                key={value}
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
            ))}

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
            ].map((value) => (
              <button
                key={value}
                className={
                  character.outfit ===
                  value
                    ? "choice active"
                    : "choice"
                }

                onClick={() =>
                  onSave({
                    outfit: value
                  })
                }
              >
                {value}
              </button>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}


function ActionPanel({
  player,
  onAction,
  onClose
}) {
  return (
    <div className="overlay">

      <div className="panel">

        <button
          className="close-button"
          onClick={onClose}
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
          icon={<BriefcaseBusiness />}
          title="Go to Work"
          text={
            player.job ===
            "Job Seeker"
              ? "You need a job."
              : "Earn your daily income."
          }

          onClick={() =>
            onAction({
              action: "work"
            })
          }
        />


        <ActionButton
          icon={<ShoppingBag />}
          title="Eat"
          text="Spend ₦2,500 on food."
          onClick={() =>
            onAction({
              action: "eat"
            })
          }
        />


        <ActionButton
          icon={<Sparkles />}
          title="Socialize"
          text="Go out and meet people."
          onClick={() =>
            onAction({
              action: "social"
            })
          }
        />


        <ActionButton
          icon={<Moon />}
          title="Rest"
          text="Recover energy."
          onClick={() =>
            onAction({
              action: "rest"
            })
          }
        />

      </div>

    </div>
  );
}


function ActionButton({
  icon,
  title,
  text,
  onClick
}) {
  return (
    <button
      className="panel-action"
      onClick={onClick}
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


function ProfilePanel({
  player,
  onClose
}) {
  return (
    <div className="overlay">

      <div className="panel">

        <button
          className="close-button"
          onClick={onClose}
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


createRoot(
  document.getElementById(
    "root"
  )
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
