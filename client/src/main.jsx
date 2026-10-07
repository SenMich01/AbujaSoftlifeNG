import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  Car,
  ChevronRight,
  CircleDollarSign,
  Dumbbell,
  Gamepad2,
  Heart,
  Home,
  LogOut,
  Map,
  Menu,
  Moon,
  Smile,
  Sparkles,
  User,
  Wallet,
  X
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const demoKey = "abujasoftlifeng-demo-player";

const defaultDemoPlayer = {
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

function formatMoney(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function App() {
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [gameData, setGameData] = useState({
    districts: [],
    jobs: [],
    housing: []
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadGameData();

    if (!supabase) {
      const saved = localStorage.getItem(demoKey);

      if (saved) {
        setPlayer(JSON.parse(saved));
      } else {
        setPlayer(defaultDemoPlayer);
      }

      setDemoMode(true);
      setLoading(false);

      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);

      if (data.session) {
        await loadPlayer(data.session.access_token);
      }

      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession) {
        await loadPlayer(newSession.access_token);
      } else {
        setPlayer(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadGameData() {
    try {
      const response = await fetch("/api/game-data");

      if (!response.ok) return;

      const data = await response.json();

      setGameData(data);
    } catch {
      console.log("Game data unavailable.");
    }
  }

  async function loadPlayer(accessToken) {
    try {
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (data.player) {
        setPlayer(data.player);
      }
    } catch {
      setMessage("Unable to load your player profile.");
    }
  }

  function saveDemoPlayer(nextPlayer) {
    setPlayer(nextPlayer);

    localStorage.setItem(
      demoKey,
      JSON.stringify(nextPlayer)
    );
  }

  async function performAction(payload) {
    setMessage("");

    if (demoMode) {
      performDemoAction(payload);
      return;
    }

    if (!session) {
      setMessage("Please log in first.");
      return;
    }

    try {
      const response = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setPlayer(data.player);
      setMessage(data.message);
    } catch {
      setMessage("Unable to complete that action.");
    }
  }

  function performDemoAction(payload) {
    if (!player) return;

    let next = { ...player };

    if (payload.action === "rest") {
      next.energy = Math.min(100, next.energy + 30);
      next.health = Math.min(100, next.health + 5);
      next.happiness = Math.min(100, next.happiness + 3);
      setMessage("You rested and recovered some energy.");
    }

    if (payload.action === "eat") {
      if (next.money < 2500) {
        setMessage("Not enough money to eat.");
        return;
      }

      next.money -= 2500;
      next.energy = Math.min(100, next.energy + 10);
      next.health = Math.min(100, next.health + 5);
      next.happiness = Math.min(100, next.happiness + 4);

      setMessage("You bought food and had a decent meal.");
    }

    if (payload.action === "social") {
      if (next.money < 5000) {
        setMessage("Not enough money for a social outing.");
        return;
      }

      next.money -= 5000;
      next.happiness = Math.min(100, next.happiness + 15);
      next.energy = Math.max(0, next.energy - 10);
      next.reputation = Math.min(100, next.reputation + 2);

      setMessage("You went out and met people.");
    }

    if (payload.action === "work") {
      if (next.job_salary <= 0) {
        setMessage("You need a job before you can work.");
        return;
      }

      if (next.energy < 20) {
        setMessage("You are too tired to work.");
        return;
      }

      const earnings = Math.round(next.job_salary / 22);

      next.money += earnings;
      next.energy = Math.max(0, next.energy - 20);
      next.reputation = Math.min(100, next.reputation + 1);

      setMessage(
        `You worked and earned ${formatMoney(earnings)}.`
      );
    }

    if (payload.action === "travel") {
      const district = gameData.districts.find(
        (item) => item.id === payload.district
      );

      if (!district) return;

      if (next.money < district.travelCost) {
        setMessage("Not enough money for transport.");
        return;
      }

      next.money -= district.travelCost;
      next.district = district.id;
      next.energy = Math.max(0, next.energy - 5);

      setMessage(
        `You travelled to ${district.name}.`
      );
    }

    if (payload.action === "job") {
      const job = gameData.jobs.find(
        (item) => item.id === payload.jobId
      );

      if (!job) return;

      if (next.reputation < job.reputation) {
        setMessage(
          `You need ${job.reputation} reputation for this job.`
        );
        return;
      }

      next.job = job.name;
      next.job_salary = job.salary;
      next.reputation = Math.min(
        100,
        next.reputation + 5
      );

      setMessage(`You became a ${job.name}.`);
    }

    if (payload.action === "housing") {
      const home = gameData.housing.find(
        (item) => item.id === payload.housingId
      );

      if (!home) return;

      if (next.money < home.cost) {
        setMessage(
          "You don't have enough money for this housing."
        );
        return;
      }

      next.money -= home.cost;
      next.housing = home.name;
      next.housing_cost = home.cost;
      next.happiness = Math.min(
        100,
        next.happiness + home.happiness
      );

      setMessage(
        `You moved into ${home.name}.`
      );
    }

    saveDemoPlayer(next);
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setPlayer(null);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <Gamepad2 size={34} />
        </div>

        <h1>AbujaSoftlifeNG</h1>

        <p>Loading your Abuja life...</p>
      </div>
    );
  }

  if (!player && !demoMode) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        onDemo={() => {
          setDemoMode(true);
          setPlayer(defaultDemoPlayer);
        }}
        setMessage={setMessage}
        message={message}
      />
    );
  }

  return (
    <GameShell
      player={player}
      page={page}
      setPage={setPage}
      gameData={gameData}
      performAction={performAction}
      signOut={signOut}
      message={message}
      demoMode={demoMode}
    />
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  onDemo,
  setMessage,
  message
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (!supabase) return;

    setSubmitting(true);
    setMessage("");

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name
            }
          }
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Account created. Check your email to confirm your account, then log in."
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">
          <Gamepad2 size={28} />
        </div>

        <p className="eyebrow">WELCOME TO ABUJA</p>

        <h1>AbujaSoftlifeNG</h1>

        <p className="auth-subtitle">
          Build your career. Make money. Explore Abuja.
          Live your soft life.
        </p>

        <form onSubmit={submit}>
          {authMode === "signup" && (
            <label>
              Display name
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your player name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              minLength="6"
              required
            />
          </label>

          {message && (
            <div className="notice">
              {message}
            </div>
          )}

          <button
            className="primary-button full"
            disabled={submitting}
          >
            {submitting
              ? "Please wait..."
              : authMode === "signup"
              ? "Create Account"
              : "Log In"}
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
            ? "Create a new account"
            : "Already have an account? Log in"}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          className="secondary-button full"
          onClick={onDemo}
        >
          Play Demo Mode
        </button>
      </div>
    </div>
  );
}

function GameShell({
  player,
  page,
  setPage,
  gameData,
  performAction,
  signOut,
  message,
  demoMode
}) {
  const district = gameData.districts.find(
    (item) => item.id === player.district
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Gamepad2 size={21} />
          </div>

          <div>
            <strong>AbujaSoftlifeNG</strong>
            <span>Live Abuja. Your way.</span>
          </div>
        </div>

        <div className="top-player">
          <div className="avatar">
            {player.display_name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div className="top-player-info">
            <strong>{player.display_name}</strong>
            <span>{district?.name}</span>
          </div>

          {!demoMode && (
            <button
              className="icon-button"
              onClick={signOut}
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        {message && (
          <div className="global-message">
            <Sparkles size={18} />
            {message}
            <button
              onClick={() => window.location.reload()}
            >
              ×
            </button>
          </div>
        )}

        {page === "home" && (
          <HomePage
            player={player}
            district={district}
            performAction={performAction}
          />
        )}

        {page === "map" && (
          <MapPage
            player={player}
            gameData={gameData}
            performAction={performAction}
          />
        )}

        {page === "jobs" && (
          <JobsPage
            player={player}
            jobs={gameData.jobs}
            performAction={performAction}
          />
        )}

        {page === "lifestyle" && (
          <LifestylePage
            player={player}
            housing={gameData.housing}
            performAction={performAction}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <NavButton
          icon={<Home size={21} />}
          label="Home"
          active={page === "home"}
          onClick={() => setPage("home")}
        />

        <NavButton
          icon={<Map size={21} />}
          label="Map"
          active={page === "map"}
          onClick={() => setPage("map")}
        />

        <NavButton
          icon={<BriefcaseBusiness size={21} />}
          label="Jobs"
          active={page === "jobs"}
          onClick={() => setPage("jobs")}
        />

        <NavButton
          icon={<Building2 size={21} />}
          label="Lifestyle"
          active={page === "lifestyle"}
          onClick={() => setPage("lifestyle")}
        />
      </nav>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick
}) {
  return (
    <button
      className={`nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function HomePage({
  player,
  district,
  performAction
}) {
  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">GOOD DAY, PLAYER</p>

          <h1>
            Welcome back,{" "}
            {player.display_name}.
          </h1>

          <p>
            Your Abuja story is just getting started.
            What are you doing today?
          </p>
        </div>

        <div className="hero-location">
          <Map size={18} />
          {district?.name}
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={<CircleDollarSign />}
          label="Cash"
          value={formatMoney(player.money)}
        />

        <StatCard
          icon={<Heart />}
          label="Health"
          value={`${player.health}%`}
        />

        <StatCard
          icon={<Activity />}
          label="Energy"
          value={`${player.energy}%`}
        />

        <StatCard
          icon={<Smile />}
          label="Reputation"
          value={`${player.reputation}`}
        />
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">DAILY LIFE</p>
          <h2>What do you want to do?</h2>
        </div>
      </div>

      <section className="action-grid">
        <ActionCard
          icon={<BriefcaseBusiness />}
          title="Work"
          description="Earn money from your job."
          onClick={() =>
            performAction({ action: "work" })
          }
        />

        <ActionCard
          icon={<Wallet />}
          title="Eat"
          description="Get food and restore energy."
          onClick={() =>
            performAction({ action: "eat" })
          }
        />

        <ActionCard
          icon={<Moon />}
          title="Rest"
          description="Recover health and energy."
          onClick={() =>
            performAction({ action: "rest" })
          }
        />

        <ActionCard
          icon={<Sparkles />}
          title="Socialize"
          description="Go out and build reputation."
          onClick={() =>
            performAction({ action: "social" })
          }
        />
      </section>

      <section className="current-card">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">YOUR CURRENT LIFE</p>
            <h2>Situation</h2>
          </div>
        </div>

        <div className="situation-grid">
          <InfoItem
            label="Job"
            value={player.job}
          />

          <InfoItem
            label="Salary"
            value={formatMoney(player.job_salary)}
          />

          <InfoItem
            label="Home"
            value={player.housing}
          />

          <InfoItem
            label="Location"
            value={district?.name || "Unknown"}
          />

          <InfoItem
            label="Happiness"
            value={`${player.happiness}%`}
          />

          <InfoItem
            label="Bank"
            value={formatMoney(player.bank_balance)}
          />
        </div>
      </section>
    </div>
  );
}

function MapPage({
  player,
  gameData,
  performAction
}) {
  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">EXPLORE ABUJA</p>
        <h1>The City Map</h1>
        <p>
          Travel around Abuja and discover different
          lifestyles, jobs and opportunities.
        </p>
      </section>

      <div className="abuja-map">
        <div className="map-title">
          <Map size={20} />
          Abuja
        </div>

        <div className="district-grid">
          {gameData.districts.map((district) => (
            <button
              key={district.id}
              className={`district ${
                player.district === district.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                performAction({
                  action: "travel",
                  district: district.id
                })
              }
            >
              <span>{district.name}</span>
              <small>
                {formatMoney(district.travelCost)}
              </small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobsPage({
  player,
  jobs,
  performAction
}) {
  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">CAREER</p>
        <h1>Find Your Bag</h1>
        <p>
          Build reputation and unlock better-paying
          opportunities.
        </p>
      </section>

      <div className="job-grid">
        {jobs.map((job) => {
          const locked =
            player.reputation < job.reputation;

          const current =
            player.job === job.name;

          return (
            <article
              className={`job-card ${
                current ? "current" : ""
              }`}
              key={job.id}
            >
              <div className="job-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div className="job-content">
                <div className="job-title-row">
                  <h3>{job.name}</h3>

                  {current && (
                    <span className="badge">
                      Current
                    </span>
                  )}
                </div>

                <p>{job.description}</p>

                <strong>
                  {job.salary
                    ? `${formatMoney(job.salary)} / month`
                    : "No salary"}
                </strong>

                <small>
                  Reputation required:{" "}
                  {job.reputation}
                </small>

                <button
                  className={
                    locked
                      ? "secondary-button"
                      : "primary-button"
                  }
                  disabled={locked || current}
                  onClick={() =>
                    performAction({
                      action: "job",
                      jobId: job.id
                    })
                  }
                >
                  {current
                    ? "Current Job"
                    : locked
                    ? "Locked"
                    : "Take Job"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function LifestylePage({
  player,
  housing,
  performAction
}) {
  return (
    <div className="page">
      <section className="page-heading">
        <p className="eyebrow">SOFT LIFE</p>
        <h1>Upgrade Your Lifestyle</h1>
        <p>
          Better housing can make Abuja life a lot
          sweeter.
        </p>
      </section>

      <div className="happiness-card">
        <div>
          <span>Happiness</span>
          <strong>{player.happiness}%</strong>
        </div>

        <div className="progress">
          <div
            style={{
              width: `${player.happiness}%`
            }}
          />
        </div>
      </div>

      <div className="housing-grid">
        {housing.map((home) => {
          const current =
            player.housing === home.name;

          const affordable =
            player.money >= home.cost;

          return (
            <article
              className={`housing-card ${
                current ? "current" : ""
              }`}
              key={home.id}
            >
              <div className="housing-icon">
                <Building2 size={23} />
              </div>

              <h3>{home.name}</h3>

              <p>
                +{home.happiness} happiness
              </p>

              <strong>
                {formatMoney(home.cost)}
              </strong>

              <button
                className="primary-button"
                disabled={
                  current || !affordable
                }
                onClick={() =>
                  performAction({
                    action: "housing",
                    housingId: home.id
                  })
                }
              >
                {current
                  ? "Current Home"
                  : affordable
                  ? "Move In"
                  : "Not Affordable"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick
}) {
  return (
    <button
      className="action-card"
      onClick={onClick}
    >
      <div className="action-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ChevronRight size={19} />
    </button>
  );
}

function InfoItem({
  label,
  value
}) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
