import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const fallbackStyles = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Clean lines, bright neutral palette, and functional pieces with hidden storage.",
    keywords: ["modern", "minimal", "minimalist", "sleek", "clean", "contemporary"],
    palette: ["#1F4E5F", "#287D7D", "#A6B7B9", "#F2E8CF"],
    furniture: [
      "Low-profile modular sofa",
      "Matte black arc floor lamp",
      "Slim-profile storage credenza"
    ],
    decorTips: [
      "Keep accessories grouped in odd numbers for balance.",
      "Use oversized wall art to anchor open sight lines."
    ]
  },
  {
    id: "scandinavian-cozy",
    name: "Scandinavian Cozy",
    description: "Soft textures, warm woods, and airy lighting inspired by Nordic interiors.",
    keywords: ["scandi", "scandinavian", "cozy", "hygge", "nordic", "light wood"],
    palette: ["#F4F1DE", "#E07A5F", "#3D405B", "#81B29A"],
    furniture: [
      "Light oak open shelving system",
      "Boucle lounge chair",
      "Textured wool area rug"
    ],
    decorTips: [
      "Layer tonal textiles - linen, wool, and cotton - to soften corners.",
      "Introduce greenery in sculptural ceramic planters."
    ]
  },
  {
    id: "industrial-loft",
    name: "Industrial Loft",
    description: "Exposed finishes, matte metals, and bold geometric accents for dramatic contrast.",
    keywords: ["industrial", "loft", "metal", "brick", "warehouse"],
    palette: ["#2E2E2E", "#595959", "#B36A5E", "#F2E8CF"],
    furniture: [
      "Reclaimed wood dining table",
      "Metal pipe shelving",
      "Concrete statement planter"
    ],
    decorTips: [
      "Balance raw finishes with soft lighting and warm leather accents.",
      "Layer area rugs to define seating zones within open plans."
    ]
  },
  {
    id: "coastal-calm",
    name: "Coastal Calm",
    description: "Sun-washed neutrals paired with sea-glass blues and organic woven details.",
    keywords: ["coastal", "beach", "ocean", "navy", "seaside", "hampton"],
    palette: ["#12343B", "#1D7874", "#7CC6C3", "#F4F9E9"],
    furniture: [
      "Rattan hanging pendant",
      "Slipcovered sectional",
      "Weathered driftwood coffee table"
    ],
    decorTips: [
      "Incorporate striped textiles to echo seaside cabanas.",
      "Style open shelving with coral, glass, and woven baskets."
    ]
  },
  {
    id: "boho-eclectic",
    name: "Boho Eclectic",
    description: "Collected layers of pattern, plants, and artisanal textures for a relaxed feel.",
    keywords: ["boho", "bohemian", "eclectic", "patterned", "colorful", "vintage"],
    palette: ["#8C4A3F", "#D9A441", "#5C946E", "#F4E4C1"],
    furniture: [
      "Low slung tufted sofa",
      "Hand-carved credenza with cane doors",
      "Cluster of ceramic side tables"
    ],
    decorTips: [
      "Mix global textiles like kilims and mud cloths for depth.",
      "Layer potted plants at different heights to enliven corners."
    ]
  },
  {
    id: "futuristic-gamer",
    name: "Futuristic Gamer",
    description: "Neon-lit tech lounge with ergonomic gear, layered LEDs, and acoustically tuned panels.",
    keywords: ["gaming", "gamer", "rgb", "pc setup", "desk setup", "streaming", "led", "monitor"],
    palette: ["#141B2D", "#3F2B96", "#A876F5", "#24E8FF"],
    furniture: [
      "Adjustable sit/stand gaming desk",
      "Ergonomic mesh-back gaming chair",
      "Dual-arm monitor mount with cable management"
    ],
    decorTips: [
      "Layer addressable LED strips along shelving and behind displays for immersive glow.",
      "Treat walls with acoustic foam or fabric panels to dampen echo around the battlestation."
    ]
  }
];
const roomMatchers = [
  { room: "Living Room", keywords: ["living", "lounge", "family"] },
  { room: "Primary Bedroom", keywords: ["bedroom", "primary", "master", "sleep"] },
  { room: "Dining Room", keywords: ["dining"] },
  { room: "Kitchen", keywords: ["kitchen", "cook", "island", "pantry"] },
  { room: "Home Office", keywords: ["office", "desk", "study", "workspace"] },
  { room: "Gaming Studio", keywords: ["gaming", "rgb", "pc setup", "battle station", "battlestation", "streaming", "monitor"] },
  { room: "Bathroom", keywords: ["bath", "spa", "vanity"] },
  { room: "Outdoor Patio", keywords: ["patio", "outdoor", "balcony", "terrace"] }
];

const ROOM_PRIORITY_ORDER = [
  "Living Room",
  "Primary Bedroom",
  "Kitchen",
  "Dining Room",
  "Home Office",
  "Bathroom",
  "Gaming Studio",
  "Flexible Space"
];

const ROOM_KNOWLEDGE_BASE = {
  "Living Room": {
    palette: ["#F1EDE5", "#2E3A45", "#B08E6E", "#6B9080"],
    layoutIdeas: [
      {
        room: "Living Room",
        summary: "Float the sofa and accent chairs around a central coffee table to encourage conversation while keeping a clear perimeter path."
      },
      {
        room: "Living Room",
        summary: "Anchor a media wall with a low console and flank it with closed storage or bookcases to balance open shelving."
      }
    ],
    decorTips: [
      "Layer a natural fiber rug beneath the seating zone to visually ground the arrangement.",
      "Mix two to three accent metals across lighting and hardware for depth without overwhelming the palette.",
      "Introduce oversized art or a statement mirror on the focal wall to amplify scale.",
      "Style the coffee table with stacked books and a sculptural bowl for lived-in polish."
    ],
    furniture: [
      "Structured three-seat sofa with performance fabric",
      "Pair of swivel accent chairs",
      "Oversized coffee table with rounded edges",
      "Media console with concealed storage"
    ],
    lighting: "Blend a ceiling fixture with staggered floor and table lamps to control evening ambience.",
    windowTreatments: "Frame the window with lined linen drapery layered over solar shades to manage glare."
  },
  "Primary Bedroom": {
    palette: ["#F7F4EF", "#C9ADA7", "#9A8C98", "#4A5568"],
    layoutIdeas: [
      {
        room: "Primary Bedroom",
        summary: "Center the bed on the longest wall and float matching nightstands to establish symmetry and clear bedside access."
      },
      {
        room: "Primary Bedroom",
        summary: "Create a reading corner near the window with a lounge chair, floor lamp, and small side table."
      }
    ],
    decorTips: [
      "Upgrade to layered bedding - crisp sheets, a quilt, and a textured duvet - for boutique comfort.",
      "Use sconce lighting or swing-arm lamps to free up nightstand surface area.",
      "Ground the bed with an area rug that extends at least 24 inches beyond the frame.",
      "Style dressers with a balanced trio of art, greenery, and personal objects."
    ],
    furniture: [
      "Upholstered queen or king bed with tall headboard",
      "Pair of closed-storage nightstands",
      "Low-profile dresser or chest of drawers",
      "Accent chair with ottoman"
    ],
    lighting: "Add dimmable bedside lighting and a diffused overhead fixture for layered control.",
    windowTreatments: "Opt for blackout drapery layered with sheer panels for both softness and light control."
  },
  Kitchen: {
    palette: ["#F4F1E8", "#D4B483", "#5E503F", "#3F612D"],
    layoutIdeas: [
      {
        room: "Kitchen",
        summary: "Keep tall cabinetry consolidated on one wall and reserve the opposite run for prep space with uninterrupted countertops."
      },
      {
        room: "Kitchen",
        summary: "Define casual dining or coffee bar seating with slim counter stools and a pair of pendant lights."
      }
    ],
    decorTips: [
      "Introduce a statement runner to soften hard surfaces and add colour.",
      "Swap builder-grade hardware for matte or brushed pulls to elevate cabinetry.",
      "Style open shelves with a balance of cookbooks, ceramics, and greenery.",
      "Install under-cabinet lighting to brighten work zones and highlight backsplash texture."
    ],
    furniture: [
      "Counter-height stools with wipeable seats",
      "Slim rolling island or butcher block cart",
      "Glass or wood canister set for open shelving",
      "Pot rack or magnetic knife strip to free counter space"
    ],
    lighting: "Layer task lighting at the counters with pendants or a flush mount for overall illumination.",
    windowTreatments: "Use moisture-resistant woven shades or cafe curtains to soften the window without blocking daylight."
  },
  "Dining Room": {
    palette: ["#F5EFE6", "#B08968", "#223843", "#6E7E85"],
    layoutIdeas: [
      {
        room: "Dining Room",
        summary: "Center a statement dining table beneath a chandelier and allow at least 36 inches of clearance around the perimeter."
      },
      {
        room: "Dining Room",
        summary: "Add a sideboard along one wall for serving space and concealed storage, styling the surface with layered art."
      }
    ],
    decorTips: [
      "Incorporate upholstered host chairs at the table ends for comfort.",
      "Ground the table with a durable rug sized to keep chairs fully on the pile when pulled out.",
      "Use a trio of candlesticks or a low arrangement as a flexible centerpiece.",
      "Introduce a large mirror or artwork to amplify depth and distribute light."
    ],
    furniture: [
      "Extendable dining table in warm wood",
      "Mix of upholstered and wood dining chairs",
      "Credenza or buffet with integrated storage",
      "Bar cabinet or shelving for glassware"
    ],
    lighting: "Hang a dimmable chandelier or linear pendant 30-34 inches above the tabletop for even coverage.",
    windowTreatments: "Panel drapery on rings adds softness and helps absorb sound in dining zones."
  },
  "Home Office": {
    palette: ["#F2F0EB", "#91A6A6", "#4A6670", "#1B1B1E"],
    layoutIdeas: [
      {
        room: "Home Office",
        summary: "Place the desk perpendicular to the window to avoid monitor glare while enjoying natural light."
      },
      {
        room: "Home Office",
        summary: "Establish a background shelving wall for storage, display, and video-call polish."
      }
    ],
    decorTips: [
      "Add a pinboard or magnetic rail system above the desk for active projects.",
      "Incorporate a rug to dampen sound and define the workspace within open plans.",
      "Use cord management trays or grommets to keep cables streamlined.",
      "Bring in biophilic touches - plants or water elements - to reduce visual fatigue."
    ],
    furniture: [
      "Height-adjustable desk or spacious workstation",
      "Ergonomic task chair with lumbar support",
      "Modular shelving or filing credenza",
      "Task lamp with adjustable arm"
    ],
    lighting: "Pair task lighting at the desk with diffused ambient lighting to prevent harsh contrasts.",
    windowTreatments: "Install adjustable shades to cut midday glare while maintaining view lines."
  },
  Bathroom: {
    palette: ["#EEF2F5", "#BCCCDC", "#8AA6C1", "#2E4057"],
    layoutIdeas: [
      {
        room: "Bathroom",
        summary: "Use wall-mounted storage or recessed niches to keep daily items organized without crowding the vanity."
      },
      {
        room: "Bathroom",
        summary: "Add a small stool or plant stand near the tub or shower to introduce warmth and function."
      }
    ],
    decorTips: [
      "Upgrade hardware and fixtures to a cohesive metal finish for an instant refresh.",
      "Layer plush towels and a textured bathmat for spa-level comfort.",
      "Introduce moisture-loving plants to soften hard surfaces.",
      "Swap dated mirror frames for clean-lined options or install backlit mirrors."
    ],
    furniture: [
      "Freestanding storage ladder or shelving tower",
      "Vanity tray assortment for countertop essentials",
      "Framed mirror or medicine cabinet",
      "Water-resistant accent stool"
    ],
    lighting: "Combine sconces at eye level with overhead lighting for flattering illumination.",
    windowTreatments: "Use privacy glass film or vinyl shades that withstand humidity while diffusing light."
  },
  "Gaming Studio": {
    palette: ["#11121A", "#2F2D4A", "#5F5AA2", "#24E8FF"],
    layoutIdeas: [
      {
        room: "Gaming Studio",
        summary: "Float the desk to allow clean cable routing behind the setup and position monitors at eye height."
      },
      {
        room: "Gaming Studio",
        summary: "Create an auxiliary lounge zone with a small sofa or beanbag seating for breaks and spectators."
      }
    ],
    decorTips: [
      "Layer addressable LED strips along shelving and behind monitors for ambient lighting.",
      "Add acoustic panels or foam tiles to reduce echo during streaming.",
      "Display collectibles on floating shelves with backlighting for dimension.",
      "Use a matte wall finish to minimize glare on screens."
    ],
    furniture: [
      "Sit/stand gaming desk with cable trough",
      "Ergonomic gaming chair with lumbar support",
      "Dual monitor arms with integrated cable clips",
      "Media cabinet for console storage"
    ],
    lighting: "Combine RGB accent lighting with neutral task lighting to reduce eye strain.",
    windowTreatments: "Install blackout roller shades to control natural light during daytime sessions."
  }
};

const ROOM_SYNONYM_MAP = {
  "living room": "Living Room",
  livingroom: "Living Room",
  "family room": "Living Room",
  lounge: "Living Room",
  "primary bedroom": "Primary Bedroom",
  bedroom: "Primary Bedroom",
  "master bedroom": "Primary Bedroom",
  "guest bedroom": "Primary Bedroom",
  kitchen: "Kitchen",
  "dining room": "Dining Room",
  dining: "Dining Room",
  "home office": "Home Office",
  office: "Home Office",
  study: "Home Office",
  workspace: "Home Office",
  bathroom: "Bathroom",
  bath: "Bathroom",
  ensuite: "Bathroom",
  "gaming studio": "Gaming Studio",
  "gaming room": "Gaming Studio",
  gaming: "Gaming Studio"
};


const COLOR_KEYWORDS = [
  { name: "navy", hex: "#1F3A60", keywords: ["navy", "deep blue"] },
  { name: "sage", hex: "#9CAF88", keywords: ["sage", "sage green"] },
  { name: "emerald", hex: "#2F6B4F", keywords: ["emerald", "forest green", "deep green"] },
  { name: "terracotta", hex: "#C86A3C", keywords: ["terracotta", "terra cotta", "rust"] },
  { name: "blush", hex: "#F2C6C2", keywords: ["blush", "dusty pink", "rose"] },
  { name: "charcoal", hex: "#42464D", keywords: ["charcoal", "graphite", "dark gray"] },
  { name: "mustard", hex: "#D9A441", keywords: ["mustard", "ochre", "amber"] },
  { name: "teal", hex: "#2A8C82", keywords: ["teal", "aqua"] },
  { name: "gold", hex: "#D4AF37", keywords: ["gold", "brass", "champagne"] },
  { name: "white", hex: "#F7F5F0", keywords: ["white", "off white", "cream", "ivory"] },
  { name: "black", hex: "#1B1B1B", keywords: ["black", "ebony"] },
  { name: "beige", hex: "#D8C7A5", keywords: ["beige", "sand", "tan"] },
  { name: "lavender", hex: "#C4B5E7", keywords: ["lavender", "lilac", "soft purple"] },
  { name: "pewter", hex: "#7E848C", keywords: ["pewter", "steel", "gunmetal"] },
  { name: "copper", hex: "#B8692E", keywords: ["copper", "burnt orange"] }
];

function normalizeRoomLabel(value) {
  if (!value) {
    return null;
  }
  const raw = value.toString().toLowerCase().trim();
  if (!raw) {
    return null;
  }
  const collapsed = raw.replace(/\s+/g, " ");
  const slug = collapsed.replace(/\s+/g, "");
  const mapped = ROOM_SYNONYM_MAP[collapsed] || ROOM_SYNONYM_MAP[slug];
  if (mapped) {
    return mapped;
  }
  return toTitleCase(collapsed);
}

function isRemoteImageUri(uri) {
  return typeof uri === "string" && /^https?:\/\//i.test(uri.trim());
}

function determinePrimaryRoom(roomAnalysis, scene) {
  const analysisRoom = normalizeRoomLabel(roomAnalysis?.roomType);
  if (analysisRoom) {
    return analysisRoom;
  }

  const sceneRooms = Array.isArray(scene?.rooms) ? scene.rooms : [];
  const normalizedRooms = sceneRooms
    .map((room) => normalizeRoomLabel(room?.name || room))
    .filter(Boolean);

  for (const candidate of ROOM_PRIORITY_ORDER) {
    if (normalizedRooms.includes(candidate)) {
      return candidate;
    }
  }

  return normalizedRooms[0] || null;
}

function mergeSceneWithRoomAnalysis(scene, roomAnalysis) {
  if (!roomAnalysis) {
    return scene;
  }

  const merged = {
    ...scene,
    rooms: Array.isArray(scene?.rooms) ? [...scene.rooms] : [],
    observations: [...(scene?.observations ?? [])],
    furniture: [...(scene?.furniture ?? [])],
    lighting: [...(scene?.lighting ?? [])],
    colors: Array.isArray(scene?.colors) ? [...scene.colors] : []
  };

  const normalizedRoom = normalizeRoomLabel(roomAnalysis.roomType);
  if (normalizedRoom) {
    const existingIndex = merged.rooms.findIndex(
      (room) => normalizeRoomLabel(room?.name) === normalizedRoom
    );
    if (existingIndex >= 0) {
      const existing = merged.rooms.splice(existingIndex, 1)[0];
      merged.rooms.unshift({ ...existing, source: existing?.source || "azure" });
    } else {
      merged.rooms.unshift({ name: normalizedRoom, source: "azure" });
    }
    merged.observations = dedupe([
      `Azure Vision identified this as a ${normalizedRoom.toLowerCase()}.`,
      ...merged.observations
    ]);
  }

  if (roomAnalysis.hasWindow) {
    merged.observations = dedupe([
      "Detected a window; layer treatments to manage natural light and privacy.",
      ...merged.observations
    ]);
    merged.lighting = dedupe(["Natural light", ...merged.lighting]);
  }

  merged.roomAnalysis = {
    ...roomAnalysis,
    roomType: normalizedRoom || roomAnalysis.roomType || null
  };

  return merged;
}

function mergeCuratedIdeas(curated, existing) {
  const curatedIdeas = Array.isArray(curated)
    ? curated
        .map((idea) => ({
          room: toTitleCase(idea?.room || idea?.name || "Flexible Space"),
          summary: (idea?.summary || idea?.description || "").trim()
        }))
        .filter((idea) => idea.summary.length)
    : [];

  const combined = [...curatedIdeas, ...(Array.isArray(existing) ? existing : [])];
  const seen = new Set();
  const merged = [];

  combined.forEach((idea) => {
    if (!idea) {
      return;
    }
    const room = toTitleCase(idea.room || "Flexible Space");
    const summary = (idea.summary || "").trim();
    if (!summary) {
      return;
    }
    const key = `${room}|${summary}`;
    if (!seen.has(key)) {
      merged.push({ room, summary });
      seen.add(key);
    }
  });

  const desiredLength = Math.max(
    Array.isArray(existing) ? existing.length : 0,
    curatedIdeas.length || 0,
    3
  );

  return merged.slice(0, desiredLength);
}

function applyRoomKnowledge(result, { roomAnalysis, scene }) {
  const primaryRoom = determinePrimaryRoom(roomAnalysis, scene);
  const baseAnalysis = result.analysis || {};
  const next = {
    ...result,
    palette: Array.isArray(result.palette) ? [...result.palette] : [],
    layoutIdeas: Array.isArray(result.layoutIdeas) ? [...result.layoutIdeas] : [],
    decorTips: Array.isArray(result.decorTips) ? [...result.decorTips] : [],
    furnitureMatches: Array.isArray(result.furnitureMatches)
      ? [...result.furnitureMatches]
      : [],
    photoInsights: { ...(result.photoInsights || {}) },
    analysis: {
      rooms: Array.isArray(baseAnalysis.rooms) ? [...baseAnalysis.rooms] : [],
      furniture: Array.isArray(baseAnalysis.furniture) ? [...baseAnalysis.furniture] : [],
      lighting: Array.isArray(baseAnalysis.lighting) ? [...baseAnalysis.lighting] : [],
      colors: Array.isArray(baseAnalysis.colors) ? [...baseAnalysis.colors] : [],
      roomAnalysis: baseAnalysis.roomAnalysis || result.photoInsights?.roomAnalysis || null
    }
  };

  if (roomAnalysis) {
    next.photoInsights.roomAnalysis = roomAnalysis;
    next.analysis.roomAnalysis = roomAnalysis;
  }

  if (primaryRoom) {
    next.analysis.rooms = dedupe([primaryRoom, ...next.analysis.rooms]);
    next.photoInsights.detectedRooms = dedupe([
      primaryRoom,
      ...(next.photoInsights.detectedRooms || [])
    ]);

    const knowledge = ROOM_KNOWLEDGE_BASE[primaryRoom];
    if (knowledge) {
      next.palette = dedupe([...(knowledge.palette || []), ...next.palette]).slice(0, 6);
      next.layoutIdeas = mergeCuratedIdeas(knowledge.layoutIdeas, next.layoutIdeas);
      next.decorTips = dedupe([...(knowledge.decorTips || []), ...next.decorTips]).slice(0, 6);
      next.furnitureMatches = dedupe([
        ...(knowledge.furniture || []),
        ...next.furnitureMatches
      ]).slice(0, 6);

      if (knowledge.lighting) {
        next.photoInsights.recommendedLighting =
          next.photoInsights.recommendedLighting || knowledge.lighting;
        next.analysis.lighting = dedupe([knowledge.lighting, ...next.analysis.lighting]);
      }

      let observations = dedupe([
        ...(knowledge.observations || []),
        ...(next.photoInsights.observations || [])
      ]);

      if (roomAnalysis?.hasWindow && knowledge.windowTreatments) {
        observations = dedupe([knowledge.windowTreatments, ...observations]);
      }
      if (roomAnalysis?.hasWindow) {
        observations = dedupe([
          "Detected window - plan includes layered treatments and seating recommendations to leverage daylight.",
          ...observations
        ]);
        if (roomAnalysis.windowConfidence) {
          observations = dedupe([
            `Window detection confidence ${roomAnalysis.windowConfidence.toFixed(
              2
            )}; incorporate glare control and privacy options.`,
            ...observations
          ]);
        }
      }
      if (roomAnalysis?.roomConfidence) {
        observations = dedupe([
          `Computer vision confidence ${roomAnalysis.roomConfidence.toFixed(
            2
          )} for ${primaryRoom.toLowerCase()}.`,
          ...observations
        ]);
      }

      next.photoInsights.observations = observations;
    } else if (roomAnalysis?.roomType) {
      next.photoInsights.observations = dedupe([
        `Room analysis suggests this is a ${primaryRoom.toLowerCase()}.`,
        ...(next.photoInsights.observations || [])
      ]);
    }
    if (roomAnalysis) {
      next.analysis.roomAnalysis = roomAnalysis;
    }
  } else if (roomAnalysis?.roomType) {
    const normalized = normalizeRoomLabel(roomAnalysis.roomType);
    if (normalized) {
      next.photoInsights.detectedRooms = dedupe([
        normalized,
        ...(next.photoInsights.detectedRooms || [])
      ]);
      next.analysis.rooms = dedupe([normalized, ...next.analysis.rooms]);
    }
    next.photoInsights.observations = dedupe([
      `Room analysis suggests this is a ${(
        normalized || roomAnalysis.roomType
      ).toLowerCase()}.`,
      ...(next.photoInsights.observations || [])
    ]);
    next.analysis.roomAnalysis = roomAnalysis;
  }

  if (roomAnalysis?.hasWindow) {
    next.analysis.lighting = dedupe(["Natural light", ...next.analysis.lighting]);
    next.analysis.roomAnalysis = roomAnalysis;
  }

  return next;
}

const INTENT_FEATURES = [
  {
    id: "storage",
    keywords: ["storage", "built-in", "built in", "cabinet", "closet", "wardrobe", "organize", "organise", "shelving", "clutter"],
    layout: "Integrate floor-to-ceiling storage with concealed hardware to keep clutter in check.",
    decorTip: "Balance closed cabinetry with a few open niches to display curated pieces.",
    furniture: "Modular storage console",
    observation: "Brief prioritises additional storage solutions."
  },
  {
    id: "workspace",
    keywords: ["workspace", "desk", "office", "workstation", "study", "work from home", "wfh"],
    layout: "Carve an ergonomic workstation near natural light and keep cables routed cleanly.",
    decorTip: "Float a compact desk with task lighting and slim shelving for vertical storage.",
    furniture: "Height-adjustable desk",
    observation: "Client needs a dedicated workspace inside the room."
  },
  {
    id: "lighting",
    keywords: ["lighting", "lights", "lamp", "illuminate", "brighten", "pendant", "chandelier", "sconce"],
    layout: "Layer ambient, task, and accent lighting to even out brightness across the zone.",
    decorTip: "Upgrade to dimmable LED fixtures and add sculptural lamps for mood control.",
    furniture: "Arc floor lamp",
    observation: "Prompt calls for enhanced lighting strategies."
  },
  {
    id: "cozy",
    keywords: ["cozy", "cosy", "warm", "inviting", "snug", "comfortable"],
    layout: "Pull seating closer together with plush textiles to make the space feel inviting.",
    decorTip: "Layer chunky throws, textured pillows, and a high-pile rug.",
    furniture: "Deep-seat sectional sofa",
    observation: "User emphasises a cozy atmosphere."
  },
  {
    id: "minimal",
    keywords: ["minimal", "streamlined", "clean lines", "clutter-free", "minimalist", "pared back"],
    layout: "Maintain clear sight lines with low-profile silhouettes and hidden storage.",
    decorTip: "Keep surfaces edited and repeat a tight neutral palette.",
    furniture: "Slimline media console",
    observation: "Design brief favours a minimalist expression."
  },
  {
    id: "plants",
    keywords: ["plant", "plants", "greenery", "biophilic", "botanical", "foliage"],
    layout: "Cluster greenery near windows and shelves to reinforce biophilic cues.",
    decorTip: "Mix planter heights and textures for layered foliage moments.",
    furniture: "Statement indoor planter",
    observation: "Prompt highlights integrating greenery."
  },
  {
    id: "color-pop",
    keywords: ["pop of color", "colour pop", "color pop", "bold color", "bright color", "accent color", "statement color"],
    layout: "Introduce a focal accent through art, upholstery, or a feature wall in the requested hues.",
    decorTip: "Balance saturated tones with grounding neutrals so the palette feels intentional.",
    furniture: "Accent chair in highlight colour",
    observation: "Client wants stronger color statements."
  },
  {
    id: "kids",
    keywords: ["kid", "kids", "child", "children", "play", "playroom", "nursery"],
    layout: "Zone a kid-friendly corner with soft flooring and reachable storage.",
    decorTip: "Choose wipeable finishes and rounded edges for safety.",
    furniture: "Toy storage bench",
    observation: "Brief mentions kid-friendly requirements."
  },
  {
    id: "pets",
    keywords: ["pet", "dog", "cat", "pets"],
    layout: "Incorporate durable, pet-friendly fabrics and carve out a pet retreat.",
    decorTip: "Opt for washable slipcovers and layered mats for pet areas.",
    furniture: "Pet-friendly performance rug",
    observation: "Prompt includes pet-focused needs."
  },
  {
    id: "entertaining",
    keywords: ["entertain", "entertaining", "hosting", "dinner party", "gathering"],
    layout: "Plan generous circulation around seating and dining zones for guests.",
    decorTip: "Stage a beverage console and layered mood lighting for hosting.",
    furniture: "Expandable dining table",
    observation: "User wants the space ready for entertaining."
  }
];

const ROOM_SCENE_HINTS = [
  { name: "Living Room", keywords: ["living room", "living", "sofa", "couch", "sectional", "fireplace", "lounge"] },
  { name: "Primary Bedroom", keywords: ["bedroom", "bed", "headboard", "nightstand", "duvet", "pillow"] },
  { name: "Dining Room", keywords: ["dining room", "dining", "banquette", "dining table", "buffet"] },
  { name: "Kitchen", keywords: ["kitchen", "cooktop", "range", "cabinetry", "backsplash", "island", "pantry"] },
  { name: "Home Office", keywords: ["office", "workspace", "desk", "monitor", "keyboard"] },
  { name: "Bathroom", keywords: ["bathroom", "vanity", "bathtub", "shower", "sink", "powder room"] },
  { name: "Outdoor Patio", keywords: ["outdoor", "patio", "balcony", "terrace", "deck", "garden seating"] },
  { name: "Gaming Studio", keywords: ["gaming", "gaming setup", "pc setup", "rgb lighting", "battle station", "dual monitor", "monitor setup", "streaming desk", "controller"] },
  { name: "Entryway", keywords: ["entryway", "foyer", "hallway", "mudroom"] },
  { name: "Window Nook", keywords: ["window seat", "window nook", "window", "bay window", "picture window", "curtain", "drapery", "drapes"] }
];

const INTERIOR_CUES = ["room", "interior", "sofa", "bed", "kitchen", "bath", "desk", "workspace", "living"];
const EXTERIOR_CUES = ["outside", "exterior", "street", "tree", "sky", "landscape", "mountain", "garden"];

const ROOM_LABEL_KEYWORDS = {
  "Living Room": ["living room", "living space", "lounge", "family room"],
  "Primary Bedroom": ["primary bedroom", "master bedroom"],
  Bedroom: ["bedroom", "sleeping area", "guest room"],
  "Dining Room": ["dining room", "dining area"],
  Kitchen: ["kitchen", "kitchenette", "culinary space"],
  Bathroom: ["bathroom", "restroom", "washroom"],
  "Home Office": ["home office", "workspace", "office"],
  "Gaming Studio": ["gaming room", "game room", "setup", "battlestation"],
  "Laundry Room": ["laundry room", "utility room"]
};

const OBJECT_ROOM_HINTS = {
  Bed: "Bedroom",
  Nightstand: "Bedroom",
  Dresser: "Bedroom",
  Crib: "Bedroom",
  Sofa: "Living Room",
  Couch: "Living Room",
  "Coffee table": "Living Room",
  Television: "Living Room",
  "Media console": "Living Room",
  "Dining table": "Dining Room",
  "Dining chair": "Dining Room",
  Refrigerator: "Kitchen",
  Stove: "Kitchen",
  Oven: "Kitchen",
  Sink: "Kitchen",
  "Kitchen appliance": "Kitchen",
  Island: "Kitchen",
  Toilet: "Bathroom",
  Bathtub: "Bathroom",
  Shower: "Bathroom",
  Vanity: "Bathroom",
  Desk: "Home Office",
  "Office chair": "Home Office",
  Chair: "Home Office",
  Laptop: "Home Office",
  "Computer monitor": "Gaming Studio",
  "Desktop computer": "Gaming Studio",
  Keyboard: "Gaming Studio",
  Mouse: "Gaming Studio",
  "Gaming chair": "Gaming Studio"
};

const LIGHTING_LABEL_HINTS = {
  "Ceiling light": "Ceiling fixture",
  "Light fixture": "Ceiling fixture",
  Chandelier: "Ceiling fixture",
  Lamp: "Lamp lighting",
  Lighting: "Mixed lighting",
  "Neon sign": "RGB/Accent lighting",
  Neon: "RGB/Accent lighting",
  Window: "Natural light"
};

const VISION_FURNITURE_NORMALIZER = {
  Sofa: "Sofa",
  Couch: "Sofa",
  "Coffee table": "Coffee Table",
  Chair: "Chair",
  "Office chair": "Desk Chair",
  Desk: "Desk",
  Table: "Table",
  "Dining table": "Dining Table",
  "Dining chair": "Dining Chair",
  Bed: "Bed",
  Nightstand: "Nightstand",
  Dresser: "Dresser",
  Crib: "Crib",
  Television: "Television",
  "Computer monitor": "Monitor",
  Laptop: "Laptop",
  Keyboard: "Keyboard",
  Mouse: "Mouse",
  "Desktop computer": "PC Tower",
  Refrigerator: "Refrigerator",
  Oven: "Oven",
  Stove: "Stove",
  Sink: "Sink",
  Island: "Kitchen Island",
  Toilet: "Toilet",
  Bathtub: "Bathtub",
  Shower: "Shower",
  Vanity: "Vanity"
};
const ROOM_TEMPLATES = {
  "Living Room": {
    templateName: "Modern Minimalist Living Room",
    styleName: "Modern Minimalist",
    styleSummary: "Streamlined seating, airy volumes, and restrained accents keep the living room calm yet functional.",
    colorPalette: ["#ECECEC", "#1F4E5F", "#A6B7B9", "#2B2B2B"],
    layoutIdeas: [
      { room: "Living Room", summary: "Position a low-profile sectional around a slim media console to frame the focal wall while leaving circulation paths open." },
      { room: "Living Room", summary: "Float a nesting coffee table set to create flexible surfaces without crowding the seating zone." },
      { room: "Living Room", summary: "Define a reading corner with a lounge chair, arc lamp, and slim side table tucked near the window." }
    ],
    decorTips: [
      "Layer neutral textured throws and cushions to soften the minimalist palette.",
      "Anchor the seating area with a tonal area rug sized to fit front furniture legs.",
      "Use oversized framed art or a sculptural mirror to lift the vertical sightline."
    ],
    furnitureSuggestions: ["Modular sectional sofa", "Nesting coffee tables", "Slim media console", "Accent lounge chair"],
    recommendedLighting: "Layered warm LED",
    observations: ["Template emphasises open sightlines and concealed storage."]
  },
  "Primary Bedroom": {
    templateName: "Serene Bedroom Retreat",
    styleName: "Scandinavian Cozy",
    styleSummary: "Soft textiles, warm wood accents, and diffused lighting create a calm sleep sanctuary.",
    colorPalette: ["#F5F5F5", "#D9CFC0", "#B4A284", "#2F4858"],
    layoutIdeas: [
      { room: "Primary Bedroom", summary: "Frame the bed with floating nightstands and warm bedside pendants to keep the floor visually clear." },
      { room: "Primary Bedroom", summary: "Layer a bench at the foot of the bed for seating and to ground the bedding ensemble." },
      { room: "Primary Bedroom", summary: "Float a reading nook with a boucle chair and slim floor lamp near the window for a cozy retreat." }
    ],
    decorTips: [
      "Mix crisp cotton bedding with a textured throw to add dimension.",
      "Keep the palette restrained to three neutrals plus one accent for calm cohesion.",
      "Use woven baskets or lidded boxes inside the closet for concealed storage."
    ],
    furnitureSuggestions: ["Upholstered platform bed", "Floating nightstands", "Storage bench", "Lounge chair"],
    recommendedLighting: "Warm bedside pendants",
    observations: ["Template enhances symmetry around the headboard wall."]
  },
  "Home Office": {
    templateName: "Contemporary Workspace",
    styleName: "Modern Workspace",
    styleSummary: "Ergonomic zoning and cable management keep the workstation tidy and productive.",
    colorPalette: ["#F2F2F2", "#1A1A1A", "#4C6EF5", "#9CA3AF"],
    layoutIdeas: [
      { room: "Home Office", summary: "Float an adjustable desk facing natural light while keeping monitors perpendicular to windows to control glare." },
      { room: "Home Office", summary: "Add a wall-mounted shelving rail or pegboard to stage peripherals and paperwork vertically." },
      { room: "Home Office", summary: "Tuck a compact filing cabinet or credenza under the window line for hidden storage." }
    ],
    decorTips: [
      "Route cables through under-desk trays or grommets to keep the floor clear.",
      "Use a task light with adjustable arms to supplement overhead lighting.",
      "Incorporate acoustic panels or curtains if the room doubles as a meeting space."
    ],
    furnitureSuggestions: ["Sit-stand desk", "Ergonomic desk chair", "Cable management tray", "Wall-mounted shelving"],
    recommendedLighting: "Task lighting plus ambient LED",
    observations: ["Template prioritises productivity and comfort."]
  },
  "Gaming Studio": {
    templateName: "Futuristic Gaming Hub",
    styleName: "Futuristic Gamer",
    styleSummary: "Layered RGB accents and performance furniture frame the battlestation.",
    colorPalette: ["#141B2D", "#3F2B96", "#A876F5", "#24E8FF"],
    layoutIdeas: [
      { room: "Gaming Studio", summary: "Anchor the desk against a solid wall with monitor arms to maximise viewing angles and keep the surface clear." },
      { room: "Gaming Studio", summary: "Add floating shelves or display cases for collectibles, lit with LED strips for ambient glow." },
      { room: "Gaming Studio", summary: "Position an ergonomic lounge chair or bean bag in a secondary corner for console or VR sessions." }
    ],
    decorTips: [
      "Use bias lighting behind monitors to reduce eye strain during long sessions.",
      "Integrate acoustic foam tiles or fabric panels to soften sound reflections.",
      "Organise controllers and accessories with wall-mounted racks or drawer inserts."
    ],
    furnitureSuggestions: ["Height-adjustable gaming desk", "Ergonomic gaming chair", "Dual monitor arms", "LED strip lighting kit"],
    recommendedLighting: "RGB accent lighting",
    observations: ["Template keeps cable runs hidden and highlights RGB layering."]
  },
  Kitchen: {
    templateName: "Streamlined Kitchen",
    styleName: "Contemporary Kitchen",
    styleSummary: "Clean cabinetry, layered lighting, and pragmatic storage define the culinary zone.",
    colorPalette: ["#FFFFFF", "#F1F5F9", "#4B5563", "#F97316"],
    layoutIdeas: [
      { room: "Kitchen", summary: "Zone prep, cook, and clean stations along the work triangle to preserve efficient movement." },
      { room: "Kitchen", summary: "Introduce a mobile island or cart for extra prep surface and tucked-away storage." },
      { room: "Kitchen", summary: "Incorporate a breakfast ledge or banquette for casual dining adjacent to the main work area." }
    ],
    decorTips: [
      "Swap builder-grade hardware for matte metal pulls to modernise cabinetry.",
      "Use under-cabinet lighting to brighten countertops without glare.",
      "Style open shelves with a restrained mix of cookware and greenery."
    ],
    furnitureSuggestions: ["Mobile kitchen island", "Counter stools", "Matte metal hardware set", "Under-cabinet lighting kit"],
    recommendedLighting: "Task lighting with warm ambient pendants",
    observations: ["Template reinforces the work triangle and layered lighting."]
  },
  Bathroom: {
    templateName: "Spa Bathroom Refresh",
    styleName: "Spa Retreat",
    styleSummary: "Natural textures and warm illumination transform the bath into a calm retreat.",
    colorPalette: ["#F8FAFC", "#CBD5F5", "#94A3B8", "#0F172A"],
    layoutIdeas: [
      { room: "Bathroom", summary: "Frame the vanity with mirrors and layered sconces to balance grooming light." },
      { room: "Bathroom", summary: "Add a slim ladder shelf or recessed niche for towels and spa accessories." },
      { room: "Bathroom", summary: "Introduce a teak bench or stool near the shower for seating and styling." }
    ],
    decorTips: [
      "Use matching dispensers and trays to declutter the vanity surface.",
      "Incorporate eucalyptus or other aromatics for a spa-like atmosphere.",
      "Layer plush towels and a textured bath mat for warmth underfoot."
    ],
    furnitureSuggestions: ["Floating vanity", "LED vanity sconces", "Ladder shelf", "Teak shower bench"],
    recommendedLighting: "Soft white vanity sconces",
    observations: ["Template balances storage and spa cues."]
  },
  Default: {
    templateName: "Versatile Interior Refresh",
    styleName: "Contemporary Neutral",
    styleSummary: "Balanced modern styling with adaptable furniture pieces fits unspecified rooms.",
    colorPalette: ["#F5F5F5", "#1F2937", "#9CA3AF", "#F59E0B"],
    layoutIdeas: [
      { room: "Flexible Space", summary: "Define the main zone with a statement rug and anchor furniture along the longest wall to keep circulation open." },
      { room: "Flexible Space", summary: "Layer storage with a combination of closed cabinets and open display shelves." },
      { room: "Flexible Space", summary: "Introduce a multi-purpose table or bench that can adapt for work, dining, or hobbies." }
    ],
    decorTips: [
      "Stick to a 60/30/10 colour distribution to keep accents cohesive.",
      "Use mirrors or glossy finishes to bounce available light.",
      "Ground the palette with natural textures like wood, leather, or boucle."
    ],
    furnitureSuggestions: ["Modular shelving system", "Multi-purpose table", "Accent rug", "Statement lighting fixture"],
    recommendedLighting: "Layered ambient and task lighting",
    observations: ["Template adapts to ambiguous spaces when vision data is limited."]
  }
};
const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const huggingface = extra?.huggingface ?? {};
const googleVision = extra?.googleVision ?? {};

const apiBaseUrlRaw =
  extra?.apiBaseUrl ||
  process.env?.EXPO_PUBLIC_API_BASE_URL ||
  process.env?.EXPO_PUBLIC_API_URL ||
  "";
const analyzeRoomEndpoint = apiBaseUrlRaw
  ? `${apiBaseUrlRaw.replace(/\/$/, "")}/api/analyze-room`
  : null;

const hfToken = huggingface.token && huggingface.token !== "undefined" ? huggingface.token : null;
const hfImageModel =
  huggingface.imageModel && huggingface.imageModel !== "undefined"
    ? huggingface.imageModel
    : "Salesforce/blip-image-captioning-base";
const hfTextModel =
  huggingface.textModel && huggingface.textModel !== "undefined"
    ? huggingface.textModel
    : "HuggingFaceH4/zephyr-7b-beta";
const visionApiKey =
  googleVision.apiKey && googleVision.apiKey !== "undefined" ? googleVision.apiKey : null;

function dedupe(list) {
  return Array.from(
    new Set((list || []).filter(Boolean).map((item) => (typeof item === "string" ? item.trim() : item)))
  );
}

function selectStyle(sourceText) {
  const normalized = (sourceText || "").toLowerCase();
  return (
    fallbackStyles.find((style) =>
      style.keywords.some((keyword) => normalized.includes(keyword))
    ) ?? fallbackStyles[0]
  );
}

function detectRooms(prompt) {
  const normalized = (prompt || "").toLowerCase();
  const rooms = roomMatchers
    .filter((matcher) => matcher.keywords.some((keyword) => normalized.includes(keyword)))
    .map((matcher) => matcher.room);

  const gamingHits = ["gaming", "rgb", "battle station", "battlestation", "pc setup", "streaming", "dual monitor"];
  if (gamingHits.some((keyword) => normalized.includes(keyword))) {
    rooms.push("Gaming Studio", "Home Office");
  } else if (normalized.includes("desk") || normalized.includes("monitor")) {
    rooms.push("Home Office");
  }

  if (!rooms.length) {
    return ["Living Room", "Primary Bedroom"];
  }
  if (rooms.length === 1) {
    rooms.push(rooms[0] === "Living Room" ? "Home Office" : "Living Room");
  }
  return dedupe(rooms).slice(0, 3);
}


function formatList(items) {
  if (!Array.isArray(items) || !items.length) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  return items.slice(0, -1).join(", ") + " and " + items.slice(-1);
}

function extractDesignIntent(text) {
  const normalized = (text || "").toLowerCase();
  if (!normalized) {
    return { features: [], colors: [], materials: [], keywords: [] };
  }

  const matchedFeatures = INTENT_FEATURES.filter((feature) =>
    feature.keywords.some((keyword) => normalized.includes(keyword))
  );

  const matchedColors = COLOR_KEYWORDS.filter((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  ).map((entry) => ({ name: entry.name, hex: entry.hex }));

  const materials = [];
  if (normalized.includes("wood") || normalized.includes("timber") || normalized.includes("oak")) {
    materials.push("warm wood");
  }
  if (normalized.includes("marble") || normalized.includes("stone")) {
    materials.push("stone surfaces");
  }
  if (normalized.includes("metal") || normalized.includes("brass") || normalized.includes("gold")) {
    materials.push("metallic accents");
  }
  if (normalized.includes("concrete")) {
    materials.push("concrete texture");
  }
  if (normalized.includes("velvet")) {
    materials.push("velvet upholstery");
  }
  if (normalized.includes("linen")) {
    materials.push("natural linen");
  }

  const keywords = [];
  if (normalized.includes("small") || normalized.includes("compact") || normalized.includes("studio")) {
    keywords.push("space-efficient solutions");
  }
  if (
    normalized.includes("open concept") ||
    normalized.includes("open-plan") ||
    normalized.includes("open plan")
  ) {
    keywords.push("open flow between zones");
  }
  if (normalized.includes("sustainable") || normalized.includes("eco")) {
    keywords.push("sustainable finishes");
  }

  return {
    text: normalized,
    features: matchedFeatures,
    colors: matchedColors,
    materials: dedupe(materials),
    keywords: dedupe(keywords)
  };
}

function derivePaletteFromIntent(intent, basePalette) {
  if (!intent?.colors?.length) {
    return basePalette;
  }
  const intentHexes = dedupe((intent.colors || []).map((entry) => entry.hex).filter(Boolean));
  const combined = dedupe([...(intentHexes || []), ...((basePalette || []))]);
  const desiredLength = Math.max(basePalette?.length || 0, intentHexes.length || 0) || 3;
  return combined.slice(0, desiredLength);
}

function buildIntentDrivenLayoutIdeas(rooms, { prompt, styleName, intent }) {
  if (!Array.isArray(rooms) || !rooms.length) {
    return [];
  }
  const baseList = rooms.map((room) => ({
    room,
    summary: composeLayoutSummary(room, prompt, styleName)
  }));

  if (!intent?.features?.length && !intent?.colors?.length && !intent?.materials?.length && !intent?.keywords?.length) {
    return baseList;
  }

  return baseList.map(({ room, summary }) => {
    const roomLower = room.toLowerCase();
    const featureSnippets = (intent.features || [])
      .filter((feature) => !feature.rooms || feature.rooms.includes(roomLower))
      .map((feature) => feature.layout)
      .filter(Boolean);
    const colorNames = (intent.colors || []).map((entry) => entry.name);
    const colorSnippet = colorNames.length ? "Layer accents in " + formatList(colorNames) + "." : null;
    const materialSnippet = intent.materials?.length
      ? "Highlight " + formatList(intent.materials) + " throughout the finishes."
      : null;
    const keywordSnippets = (intent.keywords || []).map((item) => "Keep " + item + ".");
    const combinedSnippets = dedupe([
      ...featureSnippets,
      colorSnippet,
      materialSnippet,
      ...keywordSnippets
    ]).filter(Boolean);

    if (!combinedSnippets.length) {
      return { room, summary };
    }

    const detailed = combinedSnippets.slice(0, 3).join(" ");
    const styleNote = "Maintain " + (styleName ? styleName + " cohesion." : "a cohesive flow.");
    const finalSummary = (detailed + " " + styleNote).trim();
    return { room, summary: finalSummary };
  });
}

function composeLayoutSummary(room, prompt, styleName) {
  const request = (prompt || "refresh the layout").toLowerCase();
  return `Rework the ${room.toLowerCase()} to ${request} while reinforcing ${styleName.toLowerCase()} lines, zoning, and lighting.`;
}


function buildObservations(prompt, style, intent) {
  const normalized = (prompt || "").toLowerCase();
  const notes = [];
  if (normalized.includes("light") || normalized.includes("bright")) {
    notes.push("Boost natural light with reflective finishes and layered lighting levels.");
  }
  if (normalized.includes("storage") || normalized.includes("clutter")) {
    notes.push("Integrate concealed storage to keep the footprint streamlined.");
  }
  if (normalized.includes("cozy") || normalized.includes("cosy") || normalized.includes("warm")) {
    notes.push("Use textured textiles and warm accents to soften the envelope.");
  }
  if (normalized.includes("work") || normalized.includes("office") || normalized.includes("desk")) {
    notes.push("Dedicate a focused workstation with ergonomic lighting and cable management.");
  }
  if (normalized.includes("gaming") || normalized.includes("rgb") || normalized.includes("monitor")) {
    notes.push("Organize the gaming rig with cable trays and add bias lighting behind displays to reduce eye strain.");
  }
  if (intent?.features?.length) {
    intent.features.forEach((feature) => {
      if (feature.observation) {
        notes.push(feature.observation);
      }
    });
  }
  if (intent?.colors?.length) {
    const names = dedupe(intent.colors.map((entry) => entry.name));
    if (names.length) {
      notes.push("Incorporate requested hues: " + formatList(names) + ".");
    }
  }
  if (intent?.materials?.length) {
    notes.push("Feature materials such as " + formatList(intent.materials) + ".");
  }
  if (intent?.keywords?.includes("sustainable finishes")) {
    notes.push("Select low-VOC paints and eco-conscious materials.");
  }
  if (!notes.length) {
    const styleLabel = style?.name ? style.name.toLowerCase() : "the selected";
    notes.push("Layer " + styleLabel + " accents to anchor the room identity.");
  }
  return dedupe(notes).slice(0, 5);
}

function sanitizePalette(palette, fallbackPalette) {
  if (!Array.isArray(palette)) {
    return fallbackPalette;
  }
  const cleaned = palette
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => HEX_COLOR.test(value))
    .slice(0, 5);
  return cleaned.length >= 3 ? cleaned : fallbackPalette;
}

function sanitizeStrings(list, fallback, limit = 5) {
  if (!Array.isArray(list)) {
    return fallback.slice(0, limit);
  }
  const cleaned = dedupe(
    list.map((value) => {
      if (typeof value === "string") {
        return value;
      }
      if (value?.text) {
        return value.text;
      }
      if (value?.summary) {
        return value.summary;
      }
      return "";
    })
  );
  return cleaned.length ? cleaned.slice(0, limit) : fallback.slice(0, limit);
}

function toHexColor(color) {
  const { red = 0, green = 0, blue = 0 } = color || {};
  const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`.toUpperCase();
}

function toTitleCase(value) {
  if (!value) return "";
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rotateList(list, offset = 0) {
  if (!Array.isArray(list) || !list.length) {
    return [];
  }
  const shiftRaw = Number.isFinite(offset) ? offset : Number(offset);
  const normalized = Number.isFinite(shiftRaw) ? Math.abs(Math.floor(shiftRaw)) : 0;
  const shift = normalized % list.length;
  if (!shift) {
    return [...list];
  }
  return [...list.slice(shift), ...list.slice(0, shift)];
}
function normalizeVisionFurniture(items = []) {
  return dedupe(
    items
      .map((item) => VISION_FURNITURE_NORMALIZER[item.name] || item.name)
      .filter(Boolean)
  );
}

function interpretVisionResponse(response, { mimeType }) {
  if (!response) {
    return null;
  }

  const labels = response.labelAnnotations || [];
  const objects = response.localizedObjectAnnotations || [];
  const dominantColors = response.imagePropertiesAnnotation?.dominantColors?.colors || [];

  const roomScores = new Map();
  const furnitureScores = new Map();
  const lightingSet = new Set();
  const observations = [];

  const pushRoomScore = (room, score, source) => {
    if (!room) return;
    const current = roomScores.get(room) || { score: 0, sources: new Set() };
    current.score += score;
    current.sources.add(source);
    roomScores.set(room, current);
  };

  labels.forEach((label) => {
    const description = label.description?.toLowerCase() || "";
    Object.entries(ROOM_LABEL_KEYWORDS).forEach(([room, keywords]) => {
      if (keywords.some((keyword) => description.includes(keyword))) {
        pushRoomScore(room, label.score || 0.2, "label");
      }
    });
    Object.entries(LIGHTING_LABEL_HINTS).forEach(([key, mapped]) => {
      if (description.includes(key.toLowerCase())) {
        lightingSet.add(mapped);
      }
    });
  });

  objects.forEach((object) => {
    const normalized = VISION_FURNITURE_NORMALIZER[object.name] || object.name;
    if (normalized) {
      const current = furnitureScores.get(normalized) || 0;
      furnitureScores.set(normalized, current + (object.score || 0.25));
    }
    const room = OBJECT_ROOM_HINTS[object.name];
    if (room) {
      pushRoomScore(room, object.score || 0.25, "object");
    }
  });

  const sortedRooms = Array.from(roomScores.entries())
    .map(([name, info]) => ({ name, score: info.score, sources: Array.from(info.sources) }))
    .sort((a, b) => b.score - a.score);

  if (!sortedRooms.length) {
    observations.push("Vision analysis could not confirm a clear room type; relying on your prompt.");
  }

  const furniture = Array.from(furnitureScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  dominantColors.forEach((entry) => {
    if (entry?.color) {
      entry.hex = toHexColor(entry.color);
    }
  });

  const isInterior =
    sortedRooms.some((room) => room.name !== "General Interior" && room.score > 0.6) ||
    labels.some((label) => /interior|room|indoors/i.test(label.description)) ||
    objects.some((object) => OBJECT_ROOM_HINTS[object.name]);

  return {
    labels,
    objects,
    rooms: sortedRooms.filter((room) => room.name !== "General Interior"),
    furniture,
    lighting: Array.from(lightingSet),
    colors: dominantColors,
    isInterior,
    observations,
    description: labels
      .slice(0, 5)
      .map((label) => label.description)
      .join(", "),
    mimeType: mimeType || null
  };
}

async function analyzeRoomWithService({ imageUri, imageBase64, mimeType }) {
  if (!analyzeRoomEndpoint) {
    return null;
  }

  const payload = {};
  const hasRemoteUrl = isRemoteImageUri(imageUri);
  if (hasRemoteUrl) {
    payload.url = imageUri;
  }

  if (imageBase64) {
    payload.base64 = imageBase64;
    if (mimeType) {
      payload.mimeType = mimeType;
    }
  }

  if (!payload.url && !payload.base64) {
    return null;
  }

  try {
    const response = await fetch(analyzeRoomEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Room analysis failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data?.error) {
      throw new Error(data.error);
    }

    return {
      roomType: normalizeRoomLabel(data?.roomType) || data?.roomType || null,
      rawRoomType: data?.roomType || null,
      roomConfidence: Number(data?.roomConfidence) || 0,
      hasWindow: Boolean(data?.hasWindow),
      windowConfidence: Number(data?.windowConfidence) || 0,
      windowBoxes: Array.isArray(data?.windowBoxes) ? data.windowBoxes : []
    };
  } catch (error) {
    console.warn("[ai] External room analysis failed:", error?.message || error);
    return null;
  }
}

async function annotateWithGoogleVision({ base64, mimeType }) {
  if (!visionApiKey) {
    return null;
  }
  try {
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: "LABEL_DETECTION", maxResults: 30 },
              { type: "OBJECT_LOCALIZATION", maxResults: 30 },
              { type: "IMAGE_PROPERTIES", maxResults: 1 }
            ]
          }
        ]
      })
    });
    const payload = await response.json();
    if (!response.ok || payload.error) {
      const message = payload.error?.message || `Vision API error (${response.status})`;
      throw new Error(message);
    }
    return interpretVisionResponse(payload.responses?.[0], { mimeType });
  } catch (error) {
    console.warn("[ai] Google Vision analysis failed:", error?.message || error);
    return null;
  }
}

function inferRoomsFromText(text) {
  if (!text) {
    return [];
  }
  const lowered = text.toLowerCase();
  const matches = [];
  ROOM_SCENE_HINTS.forEach((hint) => {
    if (hint.keywords.some((keyword) => lowered.includes(keyword))) {
      if (!matches.some((entry) => entry.name === hint.name)) {
        matches.push({ name: hint.name, source: "text" });
      }
    }
  });
  return matches;
}

function analyzeScene({ caption, prompt, vision }) {
  const captionText = String(caption || "").trim();
  const promptText = String(prompt || "").trim();
  const visionSummary = vision?.description ? String(vision.description).trim() : "";
  const combined = [visionSummary, captionText, promptText].filter(Boolean).join(" ");
  if (!combined) {
    return {
      combinedText: "",
      rooms: [],
      style: selectStyle(""),
      isInterior: false,
      observations: [],
      furniture: [],
      lighting: [],
      colors: vision?.colors || []
    };
  }

  const lowered = combined.toLowerCase();
  const inferredRooms = inferRoomsFromText(lowered);
  const visionRoomNames = (vision?.rooms || []).map((room) => room.name);
  visionRoomNames.forEach((roomName) => {
    if (!inferredRooms.some((room) => room.name === roomName)) {
      inferredRooms.push({ name: roomName, source: "vision" });
    }
  });

  const hasInteriorCue =
    INTERIOR_CUES.some((cue) => lowered.includes(cue)) || vision?.isInterior === true;
  const hasExteriorCue = EXTERIOR_CUES.some((cue) => lowered.includes(cue));
  const referencesWindow = lowered.includes("window");
  const referencesGaming =
    lowered.includes("gaming") ||
    lowered.includes("rgb") ||
    lowered.includes("monitor") ||
    lowered.includes("setup") ||
    lowered.includes("station");

  if (referencesWindow && !inferredRooms.some((room) => room.name === "Window Nook")) {
    inferredRooms.push({ name: "Window Nook", source: "text" });
  }
  if (referencesGaming && !inferredRooms.some((room) => room.name === "Gaming Studio")) {
    inferredRooms.push({ name: "Gaming Studio", source: "text" });
  }

  const observations = [...(vision?.observations ?? [])];
  if (referencesWindow) {
    observations.push("Image emphasises a window; including treatment and seating recommendations around it.");
  }
  if (referencesGaming) {
    observations.push("Scene highlights a gaming workstation; recommendations focus on ergonomics, lighting, and tech-friendly storage.");
  }
  if (!hasInteriorCue) {
    observations.push("Photo might not clearly show an interior space, so suggestions lean on your prompt.");
  }
  if (hasExteriorCue && !hasInteriorCue) {
    observations.push("Scene appears exterior-focused; provide a wider interior view for more precise recommendations.");
  }

  const rooms = dedupe(inferredRooms.map((room) => room.name)).map((name) => ({
    name,
    source:
      inferredRooms.find((room) => room.name === name)?.source ||
      (visionRoomNames.includes(name) ? "vision" : "text")
  }));

  const furniture = dedupe([
    ...(vision?.furniture ?? []),
    ...(rooms.some((room) => room.name === "Gaming Studio") && referencesGaming ? ["Desk", "Monitor"] : [])
  ]);

  const lighting = dedupe([...(vision?.lighting ?? []), referencesWindow ? "Natural light" : null].filter(Boolean));

  return {
    combinedText: combined,
    rooms,
    style: selectStyle(combined),
    isInterior: hasInteriorCue,
    observations,
    furniture,
    lighting,
    colors: vision?.colors || []
  };
}
function normalizeIdeas(ideas, { prompt, styleName, fallbackIdeas }) {
  const source = Array.isArray(ideas) ? ideas : [];
  const normalized = [];

  source.forEach((entry, index) => {
    if (!entry) {
      return;
    }

    let room;
    let summary;

    if (typeof entry === "string") {
      summary = entry.trim();
    } else {
      room = entry.room || entry.space || entry.zone || entry.area || entry.name || entry.title || null;
      summary =
        entry.summary ||
        entry.description ||
        entry.text ||
        (Array.isArray(entry.steps) ? entry.steps.join(" ") : null) ||
        entry.plan ||
        null;
    }

    if (!room) {
      room = fallbackIdeas?.[index]?.room || fallbackIdeas?.[0]?.room || "Flexible Space";
    }

    room = toTitleCase(room);

    if (!summary || !summary.trim()) {
      summary = composeLayoutSummary(room, prompt, styleName || "Interior");
    }

    const key = `${room}|${summary}`;
    if (summary && !normalized.some((idea) => `${idea.room}|${idea.summary}` === key)) {
      normalized.push({ room, summary: summary.trim() });
    }
  });

  if (!normalized.length) {
    return fallbackIdeas || [];
  }

  return normalized.slice(0, 3);
}

function mergeLayoutIdeas(layoutIdeas, rooms, { prompt, styleName, fallbackIdeas }) {
  if (!rooms?.length) {
    return layoutIdeas;
  }

  const normalizedRooms = dedupe(
    rooms.map((room) => (typeof room === "string" ? room.trim() : "")).filter(Boolean)
  ).map((room) => toTitleCase(room));

  const existing = Array.isArray(layoutIdeas) ? [...layoutIdeas] : [];
  const ideasByRoom = new Map();
  existing.forEach((idea) => {
    const key = idea?.room ? idea.room.toLowerCase() : null;
    if (key && !ideasByRoom.has(key)) {
      ideasByRoom.set(key, idea);
    }
  });

  const merged = [...existing];
  normalizedRooms.forEach((room) => {
    const key = room.toLowerCase();
    if (!ideasByRoom.has(key)) {
      merged.push({
        room,
        summary: composeLayoutSummary(room, prompt, styleName)
      });
    }
  });

  if (!merged.length) {
    return fallbackIdeas;
  }

  return merged.slice(0, 3);
}

function validatePlanAgainstAnalysis(plan, analysis) {
  const issues = [];
  if (!plan) {
    return { valid: false, issues: ["No design plan returned from the AI model."] };
  }

  const normalize = (value) =>
    (value || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const detectedRooms = (analysis?.rooms || []).map((room) => normalize(room?.name || room));
  const detectedFurniture = (analysis?.furniture || []).map(normalize);
  const planRooms = (plan?.layoutIdeas || []).map((idea) => normalize(idea?.room));
  const planFurniture = (plan?.furnitureSuggestions || plan?.furnitureMatches || []).map(normalize);

  const matchedRooms = new Set();
  detectedRooms.forEach((det) => {
    if (!det) return;
    const match = planRooms.find((room) => room && (room.includes(det) || det.includes(room)));
    if (match) {
      matchedRooms.add(det);
    }
  });

  const matchedFurniture = new Set();
  detectedFurniture.forEach((det) => {
    if (!det) return;
    const match = planFurniture.find((item) => item && (item.includes(det) || det.includes(item)));
    if (match) {
      matchedFurniture.add(det);
    }
  });

  const requiredRoomMatches = detectedRooms.length ? Math.min(2, detectedRooms.length) : 0;
  const requiredFurnitureMatches = detectedFurniture.length ? Math.min(2, detectedFurniture.length) : 0;

  if (requiredRoomMatches && matchedRooms.size < requiredRoomMatches) {
    issues.push(
      `Plan only referenced ${matchedRooms.size || 0} of ${requiredRoomMatches} detected room cues (${detectedRooms.join(', ') || 'none'}).`
    );
  }

  if (requiredFurnitureMatches && matchedFurniture.size < requiredFurnitureMatches) {
    issues.push(
      `Plan referenced ${matchedFurniture.size || 0} of ${requiredFurnitureMatches} key furniture items (${detectedFurniture.join(', ') || 'none'}).`
    );
  }

  return {
    valid: issues.length === 0,
    issues,
    matchedRooms: matchedRooms.size,
    matchedFurniture: matchedFurniture.size,
    requiredRoomMatches,
    requiredFurnitureMatches
  };
}

function buildTemplatePlan({ scene, fallback, prompt, validationIssues, seed }) {
  const candidateRooms = [
    ...(scene?.rooms?.map((room) => room.name) || []),
    ...((fallback?.analysis?.rooms || []))
  ].filter(Boolean);
  const primaryRoom = candidateRooms[0] || "Default";
  const template = ROOM_TEMPLATES[primaryRoom] || ROOM_TEMPLATES.Default;
  const intent = (prompt || "refresh the space").toLowerCase();
  const variationSeed = typeof seed === "number" ? seed : Date.now();

  const layoutSource = rotateList(template.layoutIdeas, variationSeed);
  const decorSource = rotateList(template.decorTips, variationSeed + 1);
  const furnitureSource = rotateList(template.furnitureSuggestions, variationSeed + 2);

  const layoutIdeas = layoutSource.slice(0, 3).map((idea) => {
    const room = idea.room || primaryRoom;
    const summaryTemplate = idea.summary || composeLayoutSummary(room, intent, template.styleName);
    const summary = summaryTemplate.replace(/\{intent\}/gi, intent);
    return {
      room,
      summary
    };
  });

  const plan = {
    styleName: template.styleName,
    styleSummary: template.styleSummary,
    colorPalette: template.colorPalette,
    layoutIdeas,
    decorTips: decorSource.slice(0, template.decorTips.length),
    furnitureSuggestions: furnitureSource.slice(0, template.furnitureSuggestions.length),
    photoInsights: {
      observations: [...(template.observations || [])],
      recommendedLighting: template.recommendedLighting || null,
      validationNotes: validationIssues || []
    }
  };

  return {
    plan,
    templateInfo: {
      templateName: template.templateName || primaryRoom,
      primaryRoom,
      issues: validationIssues || []
    }
  };
}


function buildFallbackSuggestion({ prompt, imageUri, scene, caption, vision, seed }) {
  const contextText = [prompt, scene?.combinedText, vision?.description, caption]
    .filter((value) => typeof value === "string" && value.trim().length)
    .join(" ");

  const intent = extractDesignIntent(contextText);
  const chosenStyle = scene?.style ?? selectStyle(contextText);
  const style = {
    name: chosenStyle.name,
    description: chosenStyle.description
  };

  const hintedRooms = scene?.rooms?.length ? scene.rooms.map((room) => room.name) : [];
  const fallbackRooms = hintedRooms.length ? hintedRooms : detectRooms(prompt);
  const rooms = fallbackRooms.length ? fallbackRooms : ["Flexible Space"];
  const layoutIdeas = buildIntentDrivenLayoutIdeas(rooms, {
    prompt,
    styleName: style.name,
    intent
  });

  const observations = dedupe([
    ...(scene?.observations ?? []),
    ...buildObservations(prompt, chosenStyle, intent)
  ]);

  const palette = derivePaletteFromIntent(intent, chosenStyle.palette);

  const sceneColorHex = (scene?.colors ?? [])
    .map((entry) => (typeof entry === "string" ? entry : entry?.hex))
    .filter(Boolean);
  const intentColorHex = (intent.colors || []).map((color) => color.hex).filter(Boolean);
  const detectedColors = dedupe([...sceneColorHex, ...intentColorHex]);

  const decorTips = dedupe([
    ...(chosenStyle.decorTips || []),
    ...(intent.features || []).map((feature) => feature.decorTip),
    intent.materials?.length ? "Play up " + formatList(intent.materials) + " for added texture." : null,
    intent.colors?.length
      ? "Thread " + formatList(intent.colors.map((color) => color.name)) + " through textiles and accessories."
      : null
  ]).slice(0, 6);

  const furnitureMatches = dedupe([
    ...(chosenStyle.furniture || []),
    ...(scene?.furniture ?? []),
    ...(intent.features || []).map((feature) => feature.furniture)
  ]);

  const photoInsights = {
    caption: caption || scene?.combinedText || vision?.description || null,
    observations,
    detectedRooms: rooms,
    detectedFurniture: scene?.furniture ?? [],
    detectedLighting: scene?.lighting ?? [],
    detectedColors,
    roomAnalysis: scene?.roomAnalysis || null
  };

  const suggestion = {
    generatedAt: new Date().toISOString(),
    prompt,
    sourceImage: imageUri,
    style,
    palette,
    layoutIdeas,
    decorTips,
    furnitureMatches,
    photoInsights,
    analysis: {
      rooms,
      furniture: scene?.furniture ?? [],
      lighting: scene?.lighting ?? [],
      colors: detectedColors,
      roomAnalysis: scene?.roomAnalysis || null
    }
  };

  const templateFallback = buildTemplatePlan({
    scene,
    fallback: suggestion,
    prompt,
    validationIssues: [],
    seed
  });

  if (templateFallback?.plan) {
    const templatePlan = templateFallback.plan;
    suggestion.style = {
      name: templatePlan.styleName || suggestion.style?.name,
      description: templatePlan.styleSummary || suggestion.style?.description
    };
    if (Array.isArray(templatePlan.colorPalette) && templatePlan.colorPalette.length) {
      suggestion.palette = templatePlan.colorPalette;
    }
    if (Array.isArray(templatePlan.layoutIdeas) && templatePlan.layoutIdeas.length) {
      suggestion.layoutIdeas = templatePlan.layoutIdeas;
    }
    if (Array.isArray(templatePlan.decorTips) && templatePlan.decorTips.length) {
      suggestion.decorTips = templatePlan.decorTips;
    }

    const templateFurniture = templatePlan.furnitureSuggestions || [];
    suggestion.furnitureMatches = dedupe([
      ...templateFurniture,
      ...(suggestion.furnitureMatches || [])
    ]);

    const templatePhotoInsights = templatePlan.photoInsights || {};
    suggestion.photoInsights = {
      ...suggestion.photoInsights,
      observations: dedupe([
        ...(templatePhotoInsights.observations || []),
        ...(suggestion.photoInsights?.observations || [])
      ]),
      recommendedLighting:
        templatePhotoInsights.recommendedLighting ||
        suggestion.photoInsights?.recommendedLighting ||
        null,
      validationNotes: templatePhotoInsights.validationNotes || []
    };

    suggestion.templateInfo = templateFallback.templateInfo;
  }

  return suggestion;
}

function parseJsonFromText(text) {
  if (!text) return null;
  try {
    const trimmed = text.trim();
    const codeMatch = trimmed.match(/```json([\s\S]*?)```/i);
    if (codeMatch) {
      return JSON.parse(codeMatch[1]);
    }
    const startIndex = trimmed.indexOf("{");
    const endIndex = trimmed.lastIndexOf("}");
    if (startIndex >= 0 && endIndex > startIndex) {
      const candidate = trimmed.slice(startIndex, endIndex + 1);
      return JSON.parse(candidate);
    }
  } catch (error) {
    console.warn("[ai] Failed to parse JSON from model output", error);
  }
  return null;
}

function buildLLMPrompt({ caption, prompt, styleHint, analysis }) {
  const promptSections = [
    "You are an interior designer AI that returns strict JSON. The JSON schema is:",
    '{ "styleName": string, "styleSummary": string, "colorPalette": string[3-6],',
    '  "layoutIdeas": [{"room": string, "summary": string}],',
    '  "decorTips": string[3-6],',
    '  "furnitureSuggestions": string[3-6],',
    '  "photoInsights": { "observations": string[0-6], "recommendedLighting": string | null } }',
    "",
    "Rules:",
    "- Use double quotes for all JSON keys and string values.",
    "- No comments or trailing commas.",
    "- Ground recommendations in the detected rooms and furniture outlined below.",
    "",
    `Photo caption: ${caption || 'Not available'}`,
    `User prompt: ${prompt || 'Not provided'}`,
    `Style hint: ${styleHint || 'Use best judgement'}`
  ];

  if (analysis?.rooms?.length) {
    promptSections.push(`Detected rooms: ${analysis.rooms.map((room) => room.name || room).join(', ')}`);
  }
  if (analysis?.furniture?.length) {
    promptSections.push(`Detected furniture: ${analysis.furniture.join(', ')}`);
  }

  promptSections.push("Return only JSON.");

  return promptSections.join("\n");
}

async function invokeModel(model, payload, attempt = 0) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if ((response.status === 503 || response.status === 429) && attempt < 3) {
    await wait(800 * (attempt + 1));
    return invokeModel(model, payload, attempt + 1);
  }

  if (!response.ok) {
    let detail;
    try {
      detail = await response.json();
    } catch (error) {
      detail = await response.text();
    }
    const message =
      typeof detail === "string"
        ? detail
        : detail?.error || detail?.message || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

async function captionImage({ base64, mimeType }) {
  if (!hfToken) {
    return null;
  }
  const payload = {
    inputs: `data:${mimeType || 'image/jpeg'};base64,${base64}`,
    options: { wait_for_model: true }
  };
  const result = await invokeModel(hfImageModel, payload);
  const output = Array.isArray(result) ? result[0] : result;
  return (
    output?.generated_text ||
    output?.caption ||
    output?.text ||
    null
  );
}

async function readImageAsBase64(uri) {
  if (!uri) return null;
  if (uri.startsWith('data:')) {
    return uri.split(',')[1];
  }
  try {
    if (uri.startsWith('http')) {
      const target = `${FileSystem.cacheDirectory}ai-${Date.now()}.img`;
      const download = await FileSystem.downloadAsync(uri, target);
      const contents = await FileSystem.readAsStringAsync(download.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      await FileSystem.deleteAsync(download.uri, { idempotent: true });
      return contents;
    }
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });
  } catch (error) {
    console.warn('[ai] Failed to read image as base64', error);
    return null;
  }
}

async function requestDesignPlan({ caption, prompt, styleHint, analysis, requestId }) {
  const payload = {
    inputs: buildLLMPrompt({ caption, prompt, styleHint, analysis, requestId }),
    parameters: {
      temperature: 0.45,
      top_p: 0.92,
      max_new_tokens: 420,
      return_full_text: false,
      repetition_penalty: 1.05
    },
    options: { wait_for_model: true }
  };
  const result = await invokeModel(hfTextModel, payload);
  let text;
  if (Array.isArray(result)) {
    text = result[0]?.generated_text ?? result[0]?.text;
  } else if (typeof result === 'string') {
    text = result;
  } else {
    text =
      result?.generated_text ??
      result?.text ??
      result?.choices?.[0]?.text ??
      result?.data?.[0]?.generated_text;
  }
  if (!text) {
    throw new Error('Layout model returned no text.');
  }
  const parsed = parseJsonFromText(text);
  if (!parsed) {
    throw new Error('Unable to parse design JSON from model output.');
  }
  return parsed;
}
function finalizePlan(plan, { fallback, prompt, imageUri, caption, scene, templateInfo, roomAnalysis }) {
  const sceneStyle = scene?.style;
  const styleName =
    sceneStyle?.name || plan.styleName || plan.style?.name || fallback.style.name;
  const styleSummary =
    sceneStyle?.description ||
    plan.styleSummary ||
    plan.style?.description ||
    fallback.style.description;

  let layoutIdeas = normalizeIdeas(plan.layoutIdeas, {
    prompt,
    styleName,
    fallbackIdeas: fallback.layoutIdeas
  });
  layoutIdeas = mergeLayoutIdeas(layoutIdeas, scene?.rooms?.map((room) => room.name), {
    prompt,
    styleName,
    fallbackIdeas: fallback.layoutIdeas
  });

  const decorTips = sanitizeStrings(plan.decorTips, fallback.decorTips, 6);
  const furnitureMatches = sanitizeStrings(
    plan.furnitureSuggestions || plan.furnitureMatches,
    fallback.furnitureMatches,
    6
  );

  let observations = dedupe([
    ...(Array.isArray(plan.photoInsights?.observations)
      ? plan.photoInsights.observations
      : Array.isArray(plan.photoInsights)
      ? plan.photoInsights
      : []),
    ...(scene?.observations ?? []),
    caption ? `Vision model summary: ${caption}` : null
  ]).filter(Boolean);

  if (templateInfo?.templateName) {
    const fallbackReason =
      templateInfo?.reason === 'error-fallback'
        ? 'the AI response was unavailable'
        : templateInfo?.reason === 'validation-fallback'
        ? 'the AI plan did not align with detected room or furniture cues'
        : templateInfo?.reason === 'model-unavailable'
        ? 'the AI service is currently unavailable'
        : `the scene is a [${templateInfo?.primaryRoom || templateInfo.templateName}]`;
    const templateNote = `Plan generated from curated template (${templateInfo.templateName}) because ${fallbackReason}.`;
    observations = dedupe([templateNote, ...observations]);
  }

  const fallbackInsights = fallback.photoInsights || {};
  const detectedRooms = scene?.rooms?.map((room) => room.name) || fallbackInsights.detectedRooms || [];
  const detectedFurniture = dedupe([
    ...(scene?.furniture ?? []),
    ...(fallbackInsights.detectedFurniture ?? [])
  ]);
  const detectedLighting = dedupe([
    ...(scene?.lighting ?? []),
    ...(fallbackInsights.detectedLighting ?? [])
  ]);
  const combinedRoomAnalysis =
    roomAnalysis ||
    scene?.roomAnalysis ||
    fallbackInsights.roomAnalysis ||
    fallback.analysis?.roomAnalysis ||
    null;
  if (
    combinedRoomAnalysis?.roomType &&
    !detectedRooms.some((room) => normalizeRoomLabel(room) === normalizeRoomLabel(combinedRoomAnalysis.roomType))
  ) {
    detectedRooms.unshift(normalizeRoomLabel(combinedRoomAnalysis.roomType));
  }
  const detectedColors = dedupe(
    (scene?.colors?.length ? scene.colors : fallbackInsights.detectedColors || []).map((entry) =>
      typeof entry === 'string' ? entry : entry?.hex
    ).filter(Boolean)
  );

  const recommendedLighting =
    plan.photoInsights?.recommendedLighting ||
    (detectedLighting.length ? detectedLighting[0] : null);

  const result = {
    generatedAt: new Date().toISOString(),
    prompt,
    sourceImage: imageUri,
    style: { name: styleName, description: styleSummary },
    palette: sanitizePalette(plan.colorPalette, fallback.palette),
    layoutIdeas,
    decorTips,
    furnitureMatches,
    photoInsights: {
      caption: caption || fallbackInsights.caption || null,
      observations: observations.length ? observations : fallbackInsights.observations || [],
      detectedRooms,
      detectedFurniture,
      detectedLighting,
      detectedColors,
      recommendedLighting,
      roomAnalysis: combinedRoomAnalysis || null
    },
    analysis: {
      rooms: detectedRooms,
      furniture: detectedFurniture,
      lighting: detectedLighting,
      colors: detectedColors,
      roomAnalysis: combinedRoomAnalysis || null
    }
  };

  return applyRoomKnowledge(result, {
    roomAnalysis: combinedRoomAnalysis,
    scene
  });
}

export async function generateLayoutSuggestions({ imageUri, prompt, imageBase64, metadata, requestId }) {
  const normalizedPrompt = (prompt || '').trim();
  const runId = typeof requestId === 'number' ? requestId : Date.now();
  const huggingfaceAvailable = Boolean(hfToken);

  let scene = analyzeScene({ caption: null, prompt: normalizedPrompt, vision: null });
  let fallback = buildFallbackSuggestion({
    prompt: normalizedPrompt,
    imageUri,
    scene,
    caption: null,
    vision: null,
    seed: runId
  });

  let roomAnalysis = null;
  let caption = null;
  let visionDetails = null;

  try {
    const base64 = imageBase64 ?? (await readImageAsBase64(imageUri));
    if (!base64) {
      const missing = new Error('Missing image data for analysis.');
      missing.code = 'NO_IMAGE_DATA';
      throw missing;
    }

    const [analysisResult, visionResult] = await Promise.all([
      analyzeRoomWithService({
        imageUri,
        imageBase64: base64,
        mimeType: metadata?.mimeType
      }),
      annotateWithGoogleVision({ base64, mimeType: metadata?.mimeType })
    ]);

    roomAnalysis = analysisResult || null;
    visionDetails = visionResult;

    scene = analyzeScene({ caption: null, prompt: normalizedPrompt, vision: visionDetails });
    if (roomAnalysis) {
      scene = mergeSceneWithRoomAnalysis(scene, roomAnalysis);
    }

    fallback = buildFallbackSuggestion({
      prompt: normalizedPrompt,
      imageUri,
      scene,
      caption: null,
      vision: visionDetails,
      seed: runId
    });

    if (huggingfaceAvailable) {
      caption = await captionImage({
        base64,
        mimeType: metadata?.mimeType
      });

      scene = analyzeScene({ caption, prompt: normalizedPrompt, vision: visionDetails });
      if (roomAnalysis) {
        scene = mergeSceneWithRoomAnalysis(scene, roomAnalysis);
      }

      fallback = buildFallbackSuggestion({
        prompt: normalizedPrompt,
        imageUri,
        scene,
        caption,
        vision: visionDetails,
        seed: runId
      });
    } else {
      caption = null;
    }

    if (!huggingfaceAvailable) {
      const templateInfo = fallback.templateInfo
        ? { ...fallback.templateInfo, reason: 'model-unavailable' }
        : undefined;

      return finalizePlan(fallback, {
        fallback,
        prompt: normalizedPrompt,
        imageUri,
        caption,
        scene,
        roomAnalysis,
        templateInfo
      });
    }

    const plan = await requestDesignPlan({
      caption,
      prompt: normalizedPrompt,
      styleHint: scene?.style?.name || fallback.style.name,
      analysis: scene,
      requestId: runId
    });

    const analysisForValidation = {
      rooms: scene?.rooms?.length ? scene.rooms : fallback.analysis?.rooms || [],
      furniture: scene?.furniture?.length ? scene.furniture : fallback.analysis?.furniture || []
    };

    const validation = validatePlanAgainstAnalysis(plan, analysisForValidation);

    if (!validation.valid) {
      console.warn('[ai] Model plan flagged as low confidence:', validation.issues);
      const { plan: templatePlan, templateInfo } = buildTemplatePlan({
        scene,
        fallback,
        prompt: normalizedPrompt,
        validationIssues: validation.issues,
        seed: runId + 1
      });

      return finalizePlan(templatePlan, {
        fallback,
        prompt: normalizedPrompt,
        imageUri,
        caption,
        scene,
        roomAnalysis,
        templateInfo: {
          ...templateInfo,
          reason: 'validation-fallback'
        }
      });
    }

    return finalizePlan(plan, {
      fallback,
      prompt: normalizedPrompt,
      imageUri,
      caption,
      scene,
      roomAnalysis
    });
  } catch (error) {
    if (error?.code === 'NO_IMAGE_DATA') {
      throw new Error('We could not prepare the photo for analysis. Please choose a different image.');
    }
    console.warn('[ai] Falling back to curated template suggestions:', error?.message || error);

    const { plan: templatePlan, templateInfo } = buildTemplatePlan({
      scene,
      fallback,
      prompt: normalizedPrompt,
      validationIssues: error?.message ? [error.message] : [],
      seed: runId + 2
    });

    return finalizePlan(templatePlan, {
      fallback,
      prompt: normalizedPrompt,
      imageUri,
      caption,
      scene,
      roomAnalysis,
      templateInfo: {
        ...templateInfo,
        reason: 'error-fallback'
      }
    });
  }
}
