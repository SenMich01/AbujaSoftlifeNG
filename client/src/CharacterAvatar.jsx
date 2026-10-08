import React from "react";

const SKIN = {
  deep: "#4A2511",
  dark: "#6B3517",
  brown: "#8D5524",
  warm: "#A86F3D",
  light: "#C58B5B",
  fair: "#E0A778"
};

const HAIR = {
  black: "#171717",
  brown: "#3B2416",
  auburn: "#7A351F",
  blonde: "#D4A017",
  grey: "#9CA3AF"
};

function Hair({ style, color, gender }) {
  const fill = color || HAIR.black;

  if (gender === "Female") {
    if (style === "braids") {
      return (
        <g fill={fill}>
          <path d="M91 93 C70 63 78 25 119 22 C157 20 174 50 159 91 L148 87 C151 55 139 39 118 39 C97 39 90 57 101 88Z" />
          <path d="M87 73 L73 121 L84 128 L99 81Z" />
          <path d="M151 70 L168 119 L157 128 L141 81Z" />
          <path d="M82 93 L68 146 L76 149 L91 99Z" />
          <path d="M159 93 L174 146 L166 149 L151 99Z" />
        </g>
      );
    }

    if (style === "afro") {
      return (
        <path
          d="M72 82
             C52 55 70 19 105 17
             C142 8 174 35 168 72
             C166 88 158 98 149 104
             L139 78
             C139 54 127 43 109 43
             C90 43 80 56 82 79Z"
          fill={fill}
        />
      );
    }

    if (style === "long") {
      return (
        <path
          d="M72 88
             C65 43 83 18 116 18
             C151 18 169 44 162 91
             L151 143
             L139 136
             L141 73
             C141 51 130 40 113 40
             C95 40 85 54 87 77
             L88 140
             L74 145Z"
          fill={fill}
        />
      );
    }

    return (
      <path
        d="M73 82
           C68 43 87 18 116 18
           C146 18 165 40 161 76
           C149 62 135 55 116 56
           C97 56 83 65 73 82Z"
        fill={fill}
      />
    );
  }

  if (style === "afro") {
    return (
      <path
        d="M72 78
           C50 51 67 15 108 13
           C146 11 174 38 163 76
           C153 67 143 62 132 60
           C119 56 101 59 88 68Z"
        fill={fill}
      />
    );
  }

  if (style === "fade") {
    return (
      <path
        d="M77 69
           C77 38 95 22 118 22
           C143 22 158 39 158 68
           C148 59 137 54 118 54
           C99 54 88 60 77 69Z"
        fill={fill}
      />
    );
  }

  return (
    <path
      d="M76 74
         C72 40 92 20 117 20
         C145 20 161 41 157 73
         C144 61 132 57 116 57
         C100 57 88 63 76 74Z"
      fill={fill}
    />
  );
}

function Top({ type }) {
  if (type === "jersey") {
    return (
      <path
        d="M76 154 L99 142 L116 150 L133 142 L157 154
           L170 236 L62 236Z"
        fill="#1769C2"
      />
    );
  }

  if (type === "shirt") {
    return (
      <path
        d="M78 153 L100 143 L116 151 L132 143 L154 153
           L164 231 L66 231Z"
        fill="#F4F4F4"
      />
    );
  }

  if (type === "jacket") {
    return (
      <g>
        <path
          d="M78 153 L100 143 L116 151 L132 143 L154 153
             L166 232 L66 232Z"
          fill="#242A34"
        />
        <path
          d="M116 151 L116 231"
          stroke="#111827"
          strokeWidth="4"
        />
      </g>
    );
  }

  if (type === "crop") {
    return (
      <path
        d="M82 157 L101 148 L116 154 L131 148 L150 157
           L156 207 L76 207Z"
        fill="#E94C91"
      />
    );
  }

  return (
    <path
      d="M76 154 L100 143 L116 151 L132 143 L156 154
         L166 232 L66 232Z"
      fill="#1976D2"
    />
  );
}

function Bottom({ type }) {
  if (type === "jeans") {
    return (
      <g fill="#263B63">
        <path d="M72 226 L114 226 L110 326 L65 326Z" />
        <path d="M118 226 L160 226 L166 326 L121 326Z" />
      </g>
    );
  }

  if (type === "skirt") {
    return (
      <path
        d="M79 225 L153 225 L176 322 L56 322Z"
        fill="#272B35"
      />
    );
  }

  if (type === "cargo") {
    return (
      <g fill="#333944">
        <path d="M69 225 L115 225 L110 326 L61 326Z" />
        <path d="M117 225 L163 225 L169 326 L120 326Z" />
        <rect x="62" y="267" width="25" height="25" rx="4" />
        <rect x="143" y="267" width="25" height="25" rx="4" />
      </g>
    );
  }

  return (
    <g fill="#111827">
      <path d="M72 225 L114 225 L110 318 L67 318Z" />
      <path d="M118 225 L160 225 L164 318 L121 318Z" />
    </g>
  );
}

function Shoes({ type }) {
  if (type === "slides") {
    return (
      <g fill="#111827">
        <path d="M60 312 Q87 306 111 319 L110 337 L57 337Z" />
        <path d="M119 319 Q143 306 170 312 L173 337 L120 337Z" />
      </g>
    );
  }

  if (type === "loafers") {
    return (
      <g fill="#55351F">
        <path d="M62 309 Q88 303 111 316 L111 337 L59 337Z" />
        <path d="M119 316 Q142 303 168 309 L173 337 L120 337Z" />
      </g>
    );
  }

  return (
    <g>
      <path d="M60 309 Q88 301 112 315 L112 338 L57 338Z" fill="#F5F5F5" />
      <path d="M119 315 Q143 301 169 309 L174 338 L120 338Z" fill="#F5F5F5" />
      <path d="M60 330 L111 330" stroke="#D1D5DB" strokeWidth="5" />
      <path d="M121 330 L171 330" stroke="#D1D5DB" strokeWidth="5" />
    </g>
  );
}

function Accessory({ type }) {
  if (type === "glasses") {
    return (
      <g stroke="#111827" strokeWidth="4" fill="none">
        <rect x="88" y="92" width="22" height="14" rx="4" />
        <rect x="122" y="92" width="22" height="14" rx="4" />
        <path d="M110 98 L122 98" />
      </g>
    );
  }

  if (type === "earrings") {
    return (
      <g
        fill="none"
        stroke="#F2C94C"
        strokeWidth="3"
      >
        <circle cx="78" cy="111" r="7" />
        <circle cx="155" cy="111" r="7" />
      </g>
    );
  }

  if (type === "chain") {
    return (
      <path
        d="M96 151 Q116 173 136 151"
        fill="none"
        stroke="#F2C94C"
        strokeWidth="4"
      />
    );
  }

  return null;
}

export default function CharacterAvatar({
  gender = "Male",
  skin = SKIN.brown,
  hairStyle = "short",
  hairColor = HAIR.black,
  top = "hoodie",
  bottom = "shorts",
  shoes = "sneakers",
  accessory = "none",
  scale = 1
}) {
  return (
    <div
      className="character-avatar"
      style={{
        transform: `scale(${scale})`
      }}
    >
      <svg
        viewBox="0 0 230 350"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="115"
          cy="339"
          rx="72"
          ry="9"
          fill="rgba(0,0,0,.18)"
        />

        {/* legs */}
        <path
          d="M92 309 L91 324"
          stroke={skin}
          strokeWidth="15"
          strokeLinecap="round"
        />

        <path
          d="M138 309 L139 324"
          stroke={skin}
          strokeWidth="15"
          strokeLinecap="round"
        />

        <Shoes type={shoes} />

        {/* body */}
        <Top type={top} />

        {/* arms */}
        <path
          d="M78 159 L65 221"
          stroke={skin}
          strokeWidth="17"
          strokeLinecap="round"
        />

        <path
          d="M153 159 L166 221"
          stroke={skin}
          strokeWidth="17"
          strokeLinecap="round"
        />

        {/* neck */}
        <rect
          x="105"
          y="128"
          width="22"
          height="28"
          rx="8"
          fill={skin}
        />

        {/* head */}
        <path
          d="M83 65
             Q83 38 116 38
             Q149 38 149 65
             L145 112
             Q140 138 116 141
             Q92 138 87 112Z"
          fill={skin}
        />

        {/* ears */}
        <circle cx="84" cy="99" r="9" fill={skin} />
        <circle cx="148" cy="99" r="9" fill={skin} />

        {/* eyes */}
        <ellipse cx="102" cy="95" rx="4" ry="5" fill="#171717" />
        <ellipse cx="130" cy="95" rx="4" ry="5" fill="#171717" />

        {/* nose */}
        <path
          d="M116 96 L112 111 L120 111"
          fill="none"
          stroke="#6B3517"
          strokeWidth="2"
        />

        {/* mouth */}
        <path
          d="M107 120 Q116 125 125 120"
          fill="none"
          stroke="#7A3030"
          strokeWidth="2"
        />

        <Hair
          style={hairStyle}
          color={hairColor}
          gender={gender}
        />

        <Accessory type={accessory} />
      </svg>
    </div>
  );
}
