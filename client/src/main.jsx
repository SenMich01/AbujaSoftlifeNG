```jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import GameWorld from "./GameWorld";
import "./styles.css";

/* =========================================================
   AUTH SCREEN
========================================================= */

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          throw result.error;
        }

        if (result.data && result.data.session) {
          onAuthenticated(result.data.session);
        }
      } else {
        const result = await supabase.auth.signUp({
          email,
          password,
        });

        if (result.error) {
          throw result.error;
        }

        if (result.data && result.data.session) {
          onAuthenticated(result.data.session);
        } else {
          setError(
            "Account created. Please check your email to confirm your account."
          );
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">ABUJA</div>

        <h1>Abuja Life</h1>

        <p className="auth-subtitle">
          Build your life. Make your money. Make your choices.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Enter Abuja"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER CREATOR
========================================================= */

function CharacterCreator({ onComplete }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(21);
  const [skinTone, setSkinTone] = useState("brown");
  const [hair, setHair] = useState("short");
  const [outfit, setOutfit] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const skinColors = {
    light: "#d49a6a",
    brown: "#9b623c",
    dark: "#5c351f",
    deep: "#351c12",
  };

  async function createCharacter(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter your character's name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionResult = await supabase.auth.getSession();

      if (sessionResult.error) {
        throw sessionResult.error;
      }

      const session = sessionResult.data.session;

      if (!session || !session.access_token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch("/api/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({
          name: name.trim(),
          gender,
          age: Number(age),
          skinTone,
          hair,
          outfit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not create your character."
        );
      }

      onComplete(data.player || data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="creator-screen">
      <div className="creator-card">
        <div className="creator-header">
          <span>ABUJA LIFE</span>
          <h1>Create Your Character</h1>
          <p>This is your life. Start it your way.</p>
        </div>

        <div className="creator-content">
          <div className="character-preview">
            <div
              className="character-head"
              style={{
                backgroundColor: skinColors[skinTone],
              }}
            >
              <div className={"character-hair " + hair}></div>

              <div className="character-eyes">
                <span></span>
                <span></span>
              </div>
            </div>

            <div
              className={"character-body " + outfit}
              style={{
                backgroundColor:
                  outfit === "formal"
                    ? "#172033"
                    : outfit === "street"
                    ? "#242424"
                    : "#2563eb",
              }}
            ></div>

            <div className="preview-name">
              {name || "Your Character"}
            </div>
          </div>

          <form className="creator-form" onSubmit={createCharacter}>
            <label>
              Character Name

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={30}
              />
            </label>

            <label>
              Age

              <input
                type="number"
                min="16"
                max="70"
                value={age}
                onChange={(event) => setAge(event.target.value)}
              />
            </label>

            <div className="creator-section">
              <span>Gender</span>

              <div className="choice-row">
                {["male", "female"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={gender === item ? "selected" : ""}
                    onClick={() => setGender(item)}
                  >
                    {item === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>

            <div className="creator-section">
              <span>Skin Tone</span>

              <div className="choice-row">
                {Object.keys(skinColors).map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      "skin-choice " +
                      (skinTone === item ? "selected" : "")
                    }
                    style={{
                      backgroundColor: skinColors[item],
                    }}
                    onClick={() => setSkinTone(item)}
                    aria-label={item}
                  ></button>
                ))}
              </div>
            </div>

            <div className="creator-section">
              <span>Hair</span>

              <div className="choice-row">
                {["short", "fade", "afro", "long"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={hair === item ? "selected" : ""}
                    onClick={() => setHair(item)}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="creator-section">
              <span>Outfit</span>

              <div className="choice-row">
                {["casual", "formal", "street"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={outfit === item ? "selected" : ""}
                    onClick={() => setOutfit(item)}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="primary-button creator-submit"
              disabled={loading}
            >
              {loading ? "Creating Character..." : "Start My Life"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HUD
========================================================= */

function HUD({ player, onProfile, onLogout }) {
  if (!player) {
    return null;
  }

  return (
    <div className="game-hud">
      <div className="hud-player">
        <div className="hud-avatar">
          {player.name
            ? player.name.charAt(0).toUpperCase()
            : "P"}
        </div>

        <div>
          <strong>{player.name}</strong>
          <small>Abuja</small>
        </div>
      </div>

      <div className="hud-stats">
        <div>
          <span>💰</span>
          ₦{Number(player.money || 0).toLocaleString()}
        </div>

        <div>
          <span>❤️</span>
          {player.health == null ? 100 : player.health}
        </div>

        <div>
          <span>⚡</span>
          {player.energy == null ? 100 : player.energy}
        </div>
      </div>

      <div className="hud-actions">
        <button type="button" onClick={onProfile}>
          Profile
        </button>

        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE PANEL
========================================================= */

function ProfilePanel({ player, onClose }) {
  if (!player) {
    return null;
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div
        className="profile-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>{player.name}</h2>

        <p>Your Abuja Life profile</p>

        <div className="profile-grid">
          <div>
            <small>Age</small>
            <strong>{player.age || "—"}</strong>
          </div>

          <div>
            <small>Gender</small>
            <strong>{player.gender || "—"}</strong>
          </div>

          <div>
            <small>Money</small>
            <strong>
              ₦{Number(player.money || 0).toLocaleString()}
            </strong>
          </div>

          <div>
            <small>Health</small>
            <strong>
              {player.health == null ? 100 : player.health}
            </strong>
          </div>

          <div>
            <small>Energy</small>
            <strong>
              {player.energy == null ? 100 : player.energy}
            </strong>
          </div>

          <div>
            <small>Job</small>
            <strong>{player.job || "Unemployed"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState("");

  async function loadPlayer(currentSession) {
    if (!currentSession || !currentSession.access_token) {
      setPlayer(null);
      return;
    }

    try {
      const response = await fetch("/api/me", {
        method: "GET",
        headers: {
          Authorization:
            "Bearer " + currentSession.access_token,
        },
      });

      if (response.status === 404) {
        setPlayer(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not load your player."
        );
      }

      setPlayer(data.player || data);
    } catch (err) {
      console.error("Player loading error:", err);
      setError(err.message || "Could not load your game.");
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const result = await supabase.auth.getSession();

        if (result.error) {
          throw result.error;
        }

        const currentSession = result.data.session;

        if (!mounted) {
          return;
        }

        setSession(currentSession);

        if (currentSession) {
          await loadPlayer(currentSession);
        }
      } catch (err) {
        console.error("Initialization error:", err);

        if (mounted) {
          setError(
            err.message || "Could not initialize Abuja Life."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const authListener = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) {
          return;
        }

        setSession(newSession);

        if (newSession) {
          await loadPlayer(newSession);
        } else {
          setPlayer(null);
        }
      }
    );

    return () => {
      mounted = false;

      if (
        authListener &&
        authListener.data &&
        authListener.data.subscription
      ) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();

      setSession(null);
      setPlayer(null);
      setShowProfile(false);
    } catch (err) {
      setError(err.message || "Could not log out.");
    }
  }

  async function handleAction(action) {
    if (!session || !session.access_token) {
      return;
    }

    try {
      const response = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.access_token,
        },
        body: JSON.stringify({
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The action could not be completed."
        );
      }

      if (data.player) {
        setPlayer(data.player);
      }
    } catch (err) {
      console.error("Action error:", err);

      setError(err.message || "Action failed.");
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">ABUJA LIFE</div>

        <p>Loading Abuja...</p>
      </div>
    );
  }

  /* =======================================================
     NOT LOGGED IN
  ======================================================= */

  if (!session) {
    return (
      <AuthScreen
        onAuthenticated={(newSession) => {
          setSession(newSession);
        }}
      />
    );
  }

  /* =======================================================
     LOGGED IN BUT NO CHARACTER
  ======================================================= */

  if (!player) {
    return (
      <CharacterCreator
        onComplete={(createdPlayer) => {
          setPlayer(createdPlayer);
        }}
      />
    );
  }

  /* =======================================================
     GAME
  ======================================================= */

  return (
    <div className="game-container">
      <HUD
        player={player}
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
      />

      {error && (
        <div className="game-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <GameWorld
        player={player}
        onAction={handleAction}
      />

      {showProfile && (
        <ProfilePanel
          player={player}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default App;
```
