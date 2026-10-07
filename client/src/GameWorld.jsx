import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Canvas,
  useFrame
} from "@react-three/fiber";

import {
  OrbitControls,
  Text
} from "@react-three/drei";

import * as THREE from "three";


const WORLD_SIZE = 70;


const districts = [
  {
    name: "Gwarinpa",
    x: -22,
    z: -18,
    color: "#a7f3d0"
  },

  {
    name: "Wuse",
    x: 0,
    z: -18,
    color: "#bfdbfe"
  },

  {
    name: "Wuse 2",
    x: 22,
    z: -18,
    color: "#bae6fd"
  },

  {
    name: "Jabi",
    x: -22,
    z: 5,
    color: "#bbf7d0"
  },

  {
    name: "Garki",
    x: 0,
    z: 5,
    color: "#dbeafe"
  },

  {
    name: "Maitama",
    x: 22,
    z: 5,
    color: "#dcfce7"
  },

  {
    name: "Asokoro",
    x: -22,
    z: 27,
    color: "#d1fae5"
  },

  {
    name: "Central Area",
    x: 22,
    z: 27,
    color: "#bfdbfe"
  }
];


function getDistrictPosition(
  district
) {
  const found =
    districts.find(
      (item) =>
        item.name
          .toLowerCase()
          .replaceAll(" ", "-") ===
        district
    );

  return found || districts[0];
}


function PlayerCharacter({
  character,
  position,
  onMove
}) {
  const group =
    useRef();

  const keys =
    useRef({});

  const lastUpdate =
    useRef(0);


  useEffect(() => {
    function down(e) {
      keys.current[
        e.key.toLowerCase()
      ] = true;
    }


    function up(e) {
      keys.current[
        e.key.toLowerCase()
      ] = false;
    }


    window.addEventListener(
      "keydown",
      down
    );

    window.addEventListener(
      "keyup",
      up
    );


    return () => {
      window.removeEventListener(
        "keydown",
        down
      );

      window.removeEventListener(
        "keyup",
        up
      );
    };
  }, []);


  useFrame(
    (_state, delta) => {
      if (!group.current)
        return;


      const speed =
        9 * delta;


      let x = 0;
      let z = 0;


      if (
        keys.current["w"] ||
        keys.current["arrowup"]
      ) {
        z -= 1;
      }


      if (
        keys.current["s"] ||
        keys.current["arrowdown"]
      ) {
        z += 1;
      }


      if (
        keys.current["a"] ||
        keys.current["arrowleft"]
      ) {
        x -= 1;
      }


      if (
        keys.current["d"] ||
        keys.current["arrowright"]
      ) {
        x += 1;
      }


      if (x || z) {
        const length =
          Math.sqrt(
            x * x +
            z * z
          );


        x /= length;
        z /= length;


        group.current.position.x +=
          x * speed;

        group.current.position.z +=
          z * speed;


        group.current.position.x =
          THREE.MathUtils.clamp(
            group.current.position.x,
            -WORLD_SIZE / 2,
            WORLD_SIZE / 2
          );


        group.current.position.z =
          THREE.MathUtils.clamp(
            group.current.position.z,
            -WORLD_SIZE / 2,
            WORLD_SIZE / 2
          );


        group.current.rotation.y =
          Math.atan2(x, z);


        const now =
          performance.now();


        if (
          now -
            lastUpdate.current >
          100
        ) {
          lastUpdate.current =
            now;

          onMove({
            x:
              group.current
                .position.x,

            z:
              group.current
                .position.z
          });
        }
      }
    }
  );


  const skin =
    character?.skin_color ||
    "#8D5524";

  const hair =
    character?.hair_color ||
    "#171717";


  const outfit =
    character?.outfit ||
    "casual";


  const outfitColor =
    outfit === "corporate"
      ? "#111827"
      : outfit === "street"
      ? "#2563eb"
      : "#16a34a";


  return (
    <group
      ref={group}
      position={position}
    >

      {/* shadow */}
      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0
        ]}
        position={[
          0,
          0.02,
          0
        ]}
      >
        <circleGeometry
          args={[0.55, 24]}
        />

        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
        />
      </mesh>


      {/* legs */}

      <mesh
        position={[
          -0.16,
          0.65,
          0
        ]}
      >
        <boxGeometry
          args={[
            0.18,
            0.8,
            0.18
          ]}
        />

        <meshStandardMaterial
          color="#172033"
        />
      </mesh>


      <mesh
        position={[
          0.16,
          0.65,
          0
        ]}
      >
        <boxGeometry
          args={[
            0.18,
            0.8,
            0.18
          ]}
        />

        <meshStandardMaterial
          color="#172033"
        />
      </mesh>


      {/* body */}

      <mesh
        position={[
          0,
          1.25,
          0
        ]}
      >
        <boxGeometry
          args={[
            0.65,
            0.75,
            0.38
          ]}
        />

        <meshStandardMaterial
          color={outfitColor}
        />
      </mesh>


      {/* head */}

      <mesh
        position={[
          0,
          1.95,
          0
        ]}
      >
        <sphereGeometry
          args={[
            0.35,
            16,
            16
          ]}
        />

        <meshStandardMaterial
          color={skin}
        />
      </mesh>


      {/* hair */}

      <mesh
        position={[
          0,
          2.22,
          0
        ]}
      >
        <sphereGeometry
          args={[
            character?.hair_style ===
            "afro"
              ? 0.42
              : 0.34,
            12,
            12
          ]}
        />

        <meshStandardMaterial
          color={hair}
        />
      </mesh>


      {/* name */}

      <Text
        position={[
          0,
          2.75,
          0
        ]}
        fontSize={0.25}
        color="#0b1220"
        anchorX="center"
      >
        YOU
      </Text>

    </group>
  );
}


/* ----------------------------------------
   HOUSE
---------------------------------------- */

function House({
  x,
  z,
  type,
  onClick
}) {
  const settings =
    {
      "Shared Apartment": {
        width: 3,
        depth: 3,
        height: 2.3,
        color: "#cbd5e1"
      },

      "Standard Apartment": {
        width: 4,
        depth: 3.5,
        height: 2.7,
        color: "#bfdbfe"
      },

      "Wuse Apartment": {
        width: 4.5,
        depth: 4,
        height: 3,
        color: "#93c5fd"
      },

      "Maitama Apartment": {
        width: 5,
        depth: 4.5,
        height: 3.5,
        color: "#bbf7d0"
      },

      "Luxury Residence": {
        width: 6,
        depth: 5,
        height: 4,
        color: "#f1f5f9"
      }
    }[
      type
    ] ||
    {
      width: 3,
      depth: 3,
      height: 2.3,
      color: "#cbd5e1"
    };


  return (
    <group
      position={[
        x,
        0,
        z
      ]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >

      {/* building */}

      <mesh
        position={[
          0,
          settings.height / 2,
          0
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            settings.width,
            settings.height,
            settings.depth
          ]}
        />

        <meshStandardMaterial
          color={settings.color}
        />
      </mesh>


      {/* roof */}

      <mesh
        position={[
          0,
          settings.height + 0.5,
          0
        ]}
        rotation={[
          0,
          Math.PI / 4,
          0
        ]}
      >
        <coneGeometry
          args={[
            Math.max(
              settings.width,
              settings.depth
            ) * 0.72,
            1,
            4
          ]}
        />

        <meshStandardMaterial
          color="#0b1220"
        />
      </mesh>


      {/* door */}

      <mesh
        position={[
          0,
          0.65,
          settings.depth / 2 +
            0.03
        ]}
      >
        <boxGeometry
          args={[
            0.55,
            1.3,
            0.08
          ]}
        />

        <meshStandardMaterial
          color="#6b4423"
        />
      </mesh>


      {/* windows */}

      {[
        -1,
        1
      ].map((offset) => (
        <mesh
          key={offset}
          position={[
            offset *
              settings.width *
              0.25,

            settings.height *
              0.55,

            settings.depth / 2 +
              0.04
          ]}
        >
          <boxGeometry
            args={[
              0.6,
              0.5,
              0.08
            ]}
          />

          <meshStandardMaterial
            color="#60a5fa"
          />
        </mesh>
      ))}


      <Text
        position={[
          0,
          settings.height +
            1.2,
          0
        ]}
        fontSize={0.32}
        color="#0b1220"
        anchorX="center"
      >
        {type}
      </Text>

    </group>
  );
}


/* ----------------------------------------
   BUILDING
---------------------------------------- */

function Building({
  x,
  z,
  type,
  color,
  label,
  height = 3
}) {
  return (
    <group
      position={[
        x,
        0,
        z
      ]}
    >

      <mesh
        position={[
          0,
          height / 2,
          0
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            3,
            height,
            3
          ]}
        />

        <meshStandardMaterial
          color={color}
        />
      </mesh>


      <mesh
        position={[
          0,
          height + 0.2,
          0
        ]}
      >
        <boxGeometry
          args={[
            3.15,
            0.35,
            3.15
          ]}
        />

        <meshStandardMaterial
          color="#0b1220"
        />
      </mesh>


      <Text
        position={[
          0,
          height + 0.7,
          0
        ]}
        fontSize={0.3}
        color="#0b1220"
        anchorX="center"
      >
        {label}
      </Text>

    </group>
  );
}


/* ----------------------------------------
   TREE
---------------------------------------- */

function Tree({
  x,
  z
}) {
  return (
    <group
      position={[
        x,
        0,
        z
      ]}
    >

      <mesh
        position={[
          0,
          0.8,
          0
        ]}
      >
        <cylinderGeometry
          args={[
            0.12,
            0.17,
            1.5,
            8
          ]}
        />

        <meshStandardMaterial
          color="#7c4a2d"
        />
      </mesh>


      <mesh
        position={[
          0,
          1.8,
          0
        ]}
      >
        <sphereGeometry
          args={[
            0.75,
            8,
            8
          ]}
        />

        <meshStandardMaterial
          color="#22c55e"
        />
      </mesh>

    </group>
  );
}


/* ----------------------------------------
   ROAD
---------------------------------------- */

function Road({
  x,
  z,
  width,
  depth
}) {
  return (
    <mesh
      position={[
        x,
        0.04,
        z
      ]}
      rotation={[
        -Math.PI / 2,
        0,
        0
      ]}
    >
      <planeGeometry
        args={[
          width,
          depth
        ]}
      />

      <meshStandardMaterial
        color="#475569"
      />
    </mesh>
  );
}


/* ----------------------------------------
   DISTRICT
---------------------------------------- */

function DistrictLabel({
  district
}) {
  return (
    <group
      position={[
        district.x,
        0.15,
        district.z
      ]}
    >

      <Text
        rotation={[
          -Math.PI / 2,
          0,
          0
        ]}
        fontSize={1}
        color="#0b1220"
        anchorX="center"
      >
        {district.name}
      </Text>

    </group>
  );
}


/* ----------------------------------------
   CITY
---------------------------------------- */

function City({
  player,
  character,
  onMessage
}) {
  const home =
    player.housing ||
    "Shared Apartment";


  const startingDistrict =
    getDistrictPosition(
      player.district
    );


  const [playerPosition, setPlayerPosition] =
    useState([
      startingDistrict.x,
      0,
      startingDistrict.z
    ]);


  const homePosition =
    useMemo(
      () => [
        startingDistrict.x +
          4,

        0,

        startingDistrict.z +
          2
      ],
      [
        startingDistrict.x,
        startingDistrict.z
      ]
    );


  const treePositions = [
    [-30, -30],
    [-25, -28],
    [-15, -28],
    [-5, -29],
    [5, -29],
    [15, -29],
    [28, -29],
    [-32, 0],
    [-30, 15],
    [-32, 30],
    [30, 0],
    [30, 14],
    [30, 30],
    [-10, 30],
    [0, 30],
    [10, 30]
  ];


  return (
    <>
      {/* world floor */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            WORLD_SIZE,
            WORLD_SIZE
          ]}
        />

        <meshStandardMaterial
          color="#a7f3d0"
        />
      </mesh>


      {/* roads */}

      <Road
        x={0}
        z={0}
        width={70}
        depth={4}
      />

      <Road
        x={0}
        z={-12}
        width={70}
        depth={2.5}
      />

      <Road
        x={0}
        z={12}
        width={70}
        depth={2.5}
      />

      <Road
        x={-12}
        z={0}
        width={2.5}
        depth={70}
      />

      <Road
        x={12}
        z={0}
        width={2.5}
        depth={70}
      />


      {/* districts */}

      {districts.map(
        (district) => (
          <DistrictLabel
            key={district.name}
            district={
              district
            }
          />
        )
      )}


      {/* player house */}

      <House
        x={homePosition[0]}
        z={homePosition[2]}
        type={home}
        onClick={() =>
          onMessage(
            "This is your home. Your house changes as you upgrade your lifestyle."
          )
        }
      />


      {/* city buildings */}

      <Building
        x={-6}
        z={-5}
        label="BANK"
        type="bank"
        color="#bfdbfe"
        height={4}
      />

      <Building
        x={18}
        z={-5}
        label="MALL"
        type="mall"
        color="#ddd6fe"
        height={5}
      />

      <Building
        x={-18}
        z={6}
        label="RESTAURANT"
        type="restaurant"
        color="#fed7aa"
        height={2.8}
      />

      <Building
        x={5}
        z={7}
        label="OFFICE"
        type="office"
        color="#cbd5e1"
        height={5}
      />

      <Building
        x={18}
        z={18}
        label="HOSPITAL"
        type="hospital"
        color="#fecaca"
        height={4}
      />

      <Building
        x={-17}
        z={24}
        label="GYM"
        type="gym"
        color="#bbf7d0"
        height={2.5}
      />


      {/* trees */}

      {treePositions.map(
        ([x, z], index) => (
          <Tree
            key={index}
            x={x}
            z={z}
          />
        )
      )}


      {/* player */}

      <PlayerCharacter
        character={character}
        position={playerPosition}
        onMove={(pos) =>
          setPlayerPosition([
            pos.x,
            0,
            pos.z
          ])
        }
      />

    </>
  );
}


/* ----------------------------------------
   GAME WORLD
---------------------------------------- */

export default function GameWorld({
  player,
  character,
  onMessage
}) {
  return (
    <div className="world">

      <Canvas
        shadows
        camera={{
          position: [
            0,
            38,
            38
          ],

          zoom: 1.7
        }}

        orthographic
      >

        <color
          attach="background"
          args={[
            "#56a8c8"
          ]}
        />


        <ambientLight
          intensity={1.5}
        />


        <directionalLight
          position={[
            20,
            35,
            15
          ]}
          intensity={2}
          castShadow
        />


        <City
          player={player}
          character={character}
          onMessage={onMessage}
        />


        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={false}
          target={[
            0,
            0,
            0
          ]}
        />

      </Canvas>


      <div className="movement-help">
        <strong>
          MOVE
        </strong>

        <span>
          WASD / Arrow Keys
        </span>
      </div>


      <div className="world-title">
        <span>
          📍
        </span>

        <strong>
          Abuja City
        </strong>

        <small>
          Explore your world
        </small>
      </div>

    </div>
  );
}
