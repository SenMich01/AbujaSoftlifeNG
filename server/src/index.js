import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");
const clientDist = path.join(projectRoot, "client", "dist");

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

/* ---------------------------------------
   SUPABASE
--------------------------------------- */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/* ---------------------------------------
   GAME DATA
--------------------------------------- */

const districts = [
  {
    id: "gwarinpa",
    name: "Gwarinpa",
    description: "Busy residential life with affordable options.",
    travelCost: 300
  },
  {
    id: "wuse",
    name: "Wuse",
    description: "Commercial Abuja with plenty happening.",
    travelCost: 500
  },
  {
    id: "wuse-2",
    name: "Wuse 2",
    description: "Restaurants, nightlife and social activities.",
    travelCost: 700
  },
  {
    id: "jabi",
    name: "Jabi",
    description: "Shopping, entertainment and relaxed city life.",
    travelCost: 600
  },
  {
    id: "garki",
    name: "Garki",
    description: "Business district with plenty of work opportunities.",
    travelCost: 500
  },
  {
    id: "maitama",
    name: "Maitama",
    description: "Premium Abuja lifestyle.",
    travelCost: 1000
  },
  {
    id: "asokoro",
    name: "Asokoro",
    description: "Exclusive residential district.",
    travelCost: 1000
  },
  {
    id: "central-area",
    name: "Central Area",
    description: "The heart of Abuja's business district.",
    travelCost: 700
  }
];

const jobs = [
  {
    id: "job-seeker",
    name: "Job Seeker",
    salary: 0,
    reputation: 0,
    description: "Currently searching for opportunities."
  },
  {
    id: "sales-assistant",
    name: "Sales Assistant",
    salary: 80000,
    reputation: 0,
    description: "Work in retail and improve your experience."
  },
  {
    id: "customer-support",
    name: "Customer Support Rep",
    salary: 120000,
    reputation: 10,
    description: "Help customers and build professional reputation."
  },
  {
    id: "graphic-designer",
    name: "Graphic Designer",
    salary: 150000,
    reputation: 15,
    description: "Create visual content for Abuja businesses."
  },
  {
    id: "junior-developer",
    name: "Junior Developer",
    salary: 200000,
    reputation: 20,
    description: "Build software and digital products."
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    salary: 250000,
    reputation: 30,
    description: "Turn business data into useful insights."
  },
  {
    id: "banking-analyst",
    name: "Banking Analyst",
    salary: 300000,
    reputation: 40,
    description: "Analyse financial and banking information."
  },
  {
    id: "product-manager",
    name: "Product Manager",
    salary: 400000,
    reputation: 60,
    description: "Lead digital products and teams."
  }
];

const housing = [
  {
    id: "shared",
    name: "Shared Apartment",
    cost: 30000,
    happiness: 5
  },
  {
    id: "standard",
    name: "Standard Apartment",
    cost: 70000,
    happiness: 10
  },
  {
    id: "wuse",
    name: "Wuse Apartment",
    cost: 120000,
    happiness: 18
  },
  {
    id: "maitama",
    name: "Maitama Apartment",
    cost: 250000,
    happiness: 30
  },
  {
    id: "luxury",
    name: "Luxury Residence",
    cost: 500000,
    happiness: 50
  }
];

/* ---------------------------------------
   HELPERS
--------------------------------------- */

function getAuthToken(req) {
  const header = req.headers.authorization;

  if (!header) return null;

  if (!header.startsWith("Bearer ")) return null;

  return header.replace("Bearer ", "");
}

async function getAuthenticatedUser(req) {
  if (!supabase) return null;

  const token = getAuthToken(req);

  if (!token) return null;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  return user;
}

async function requireUser(req, res, next) {
  if (!supabase) {
    return res.status(503).json({
      error: "Supabase is not configured."
    });
  }

  const user = await getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({
      error: "Authentication required."
    });
  }

  req.user = user;

  next();
}

/* ---------------------------------------
   HEALTH CHECK
--------------------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "AbujaSoftlifeNG",
    supabase: Boolean(supabase)
  });
});

/* ---------------------------------------
   GAME DATA
--------------------------------------- */

app.get("/api/game-data", (req, res) => {
  res.json({
    districts,
    jobs,
    housing
  });
});

/* ---------------------------------------
   CURRENT PLAYER
--------------------------------------- */

app.get("/api/me", requireUser, async (req, res) => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json({
    user: req.user,
    player: data
  });
});

/* ---------------------------------------
   CREATE / UPDATE PLAYER
--------------------------------------- */

app.post("/api/player", requireUser, async (req, res) => {
  const {
    display_name,
    age = 18,
    gender = "Prefer not to say"
  } = req.body;

  if (!display_name || display_name.trim().length < 2) {
    return res.status(400).json({
      error: "Display name must contain at least 2 characters."
    });
  }

  const player = {
    id: req.user.id,
    display_name: display_name.trim(),
    age: Number(age),
    gender,
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

  const { data, error } = await supabase
    .from("players")
    .upsert(player, {
      onConflict: "id"
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json({
    player: data
  });
});

/* ---------------------------------------
   GAME ACTIONS
--------------------------------------- */

app.post("/api/action", requireUser, async (req, res) => {
  const { action, district, jobId, housingId } = req.body;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", req.user.id)
    .single();

  if (playerError || !player) {
    return res.status(404).json({
      error: "Player profile not found."
    });
  }

  let update = {};
  let amount = 0;
  let details = "";

  if (action === "rest") {
    update = {
      energy: Math.min(100, player.energy + 30),
      health: Math.min(100, player.health + 5),
      happiness: Math.min(100, player.happiness + 3)
    };

    details = "You rested and recovered some energy.";
  }

  else if (action === "eat") {
    const cost = 2500;

    if (player.money < cost) {
      return res.status(400).json({
        error: "Not enough money to eat."
      });
    }

    amount = -cost;

    update = {
      money: player.money - cost,
      energy: Math.min(100, player.energy + 10),
      health: Math.min(100, player.health + 5),
      happiness: Math.min(100, player.happiness + 4)
    };

    details = "You bought food and had a decent meal.";
  }

  else if (action === "social") {
    const cost = 5000;

    if (player.money < cost) {
      return res.status(400).json({
        error: "Not enough money for a social outing."
      });
    }

    amount = -cost;

    update = {
      money: player.money - cost,
      happiness: Math.min(100, player.happiness + 15),
      energy: Math.max(0, player.energy - 10),
      reputation: Math.min(100, player.reputation + 2)
    };

    details = "You went out and met people.";
  }

  else if (action === "work") {
    if (player.job === "Job Seeker" || player.job_salary <= 0) {
      return res.status(400).json({
        error: "You need a job before you can work."
      });
    }

    if (player.energy < 20) {
      return res.status(400).json({
        error: "You are too tired to work."
      });
    }

    const earnings = Math.round(player.job_salary / 22);

    amount = earnings;

    update = {
      money: player.money + earnings,
      energy: Math.max(0, player.energy - 20),
      reputation: Math.min(100, player.reputation + 1),
      happiness: Math.max(0, player.happiness - 2)
    };

    details = `You worked and earned ₦${earnings.toLocaleString()}.`;
  }

  else if (action === "travel") {
    const selectedDistrict = districts.find(
      (item) => item.id === district
    );

    if (!selectedDistrict) {
      return res.status(400).json({
        error: "Invalid district."
      });
    }

    const cost = selectedDistrict.travelCost;

    if (player.money < cost) {
      return res.status(400).json({
        error: "Not enough money for transport."
      });
    }

    amount = -cost;

    update = {
      money: player.money - cost,
      district: selectedDistrict.id,
      energy: Math.max(0, player.energy - 5)
    };

    details = `You travelled to ${selectedDistrict.name}.`;
  }

  else if (action === "job") {
    const selectedJob = jobs.find(
      (item) => item.id === jobId
    );

    if (!selectedJob) {
      return res.status(400).json({
        error: "Invalid job."
      });
    }

    if (player.reputation < selectedJob.reputation) {
      return res.status(400).json({
        error: `You need ${selectedJob.reputation} reputation for this job.`
      });
    }

    update = {
      job: selectedJob.name,
      job_salary: selectedJob.salary,
      reputation: Math.min(100, player.reputation + 5)
    };

    details = `You became a ${selectedJob.name}.`;
  }

  else if (action === "housing") {
    const selectedHousing = housing.find(
      (item) => item.id === housingId
    );

    if (!selectedHousing) {
      return res.status(400).json({
        error: "Invalid housing option."
      });
    }

    if (player.money < selectedHousing.cost) {
      return res.status(400).json({
        error: "You don't have enough money for this housing."
      });
    }

    amount = -selectedHousing.cost;

    update = {
      money: player.money - selectedHousing.cost,
      housing: selectedHousing.name,
      housing_cost: selectedHousing.cost,
      happiness: Math.min(
        100,
        player.happiness + selectedHousing.happiness
      )
    };

    details = `You moved into ${selectedHousing.name}.`;
  }

  else {
    return res.status(400).json({
      error: "Unknown action."
    });
  }

  const { data: updatedPlayer, error: updateError } =
    await supabase
      .from("players")
      .update(update)
      .eq("id", req.user.id)
      .select()
      .single();

  if (updateError) {
    return res.status(500).json({
      error: updateError.message
    });
  }

  await supabase.from("activity_log").insert({
    player_id: req.user.id,
    action,
    amount,
    details
  });

  res.json({
    player: updatedPlayer,
    message: details
  });
});

/* ---------------------------------------
   ACTIVITY
--------------------------------------- */

app.get("/api/activity", requireUser, async (req, res) => {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("player_id", req.user.id)
    .order("created_at", {
      ascending: false
    })
    .limit(20);

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json({
    activity: data
  });
});

/* ---------------------------------------
   SERVE REACT FRONTEND
--------------------------------------- */

app.use(express.static(clientDist));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

/* ---------------------------------------
   START SERVER
--------------------------------------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `AbujaSoftlifeNG server running on port ${PORT}`
  );
});
