/** @typedef {{ type: string, size: [number, number], speed: [number, number], count: number, school?: boolean, rare?: boolean }} FishSpec */
/** @typedef {{ kind: string, count?: number, variant?: string }} PropSpec */
/** @typedef {{ id: string, name: string, region: string, waterTint: { top: string, mid: string, deep: string, tint: string, caustic?: number, ray?: number }, fish: FishSpec[], props: PropSpec[] }} LocationConfig */

/** @type {LocationConfig[]} */
window.DEPTHS_LOCATIONS = [
  {
    id: "gbr",
    name: "Great Barrier Reef",
    region: "Australia",
    waterTint: { top: "#2a9bb5", mid: "#0e5a72", deep: "#052433", tint: "rgba(40,180,200,0.28)", caustic: 0.3, ray: 0.22 },
    fish: [
      { type: "clownfish", size: [14, 22], speed: [28, 48], count: 8 },
      { type: "angelfish", size: [18, 28], speed: [22, 40], count: 6 },
      { type: "reef_shark", size: [70, 110], speed: [35, 55], count: 1, rare: true },
      { type: "school_small", size: [8, 12], speed: [40, 70], count: 24, school: true }
    ],
    props: [
      { kind: "coral", count: 7, variant: "branch" },
      { kind: "coral", count: 5, variant: "brain" },
      { kind: "rock", count: 4 },
      { kind: "bubbles", count: 18 }
    ]
  },
  {
    id: "monterey",
    name: "Monterey Bay",
    region: "California, USA",
    waterTint: { top: "#3a7a68", mid: "#1a453c", deep: "#071814", tint: "rgba(60,140,110,0.32)", caustic: 0.16, ray: 0.12 },
    fish: [
      { type: "rockfish", size: [20, 34], speed: [18, 32], count: 10 },
      { type: "school_small", size: [7, 11], speed: [30, 55], count: 18, school: true },
      { type: "otter", size: [36, 48], speed: [25, 40], count: 1, rare: true }
    ],
    props: [
      { kind: "kelp", count: 9 },
      { kind: "anemone", count: 6 },
      { kind: "rock", count: 5 },
      { kind: "bubbles", count: 12 }
    ]
  },
  {
    id: "bluehole",
    name: "Caribbean Blue Hole",
    region: "Bahamas shelf",
    waterTint: { top: "#4ec4e8", mid: "#1a78b0", deep: "#06304a", tint: "rgba(80,200,255,0.22)", caustic: 0.34, ray: 0.28 },
    fish: [
      { type: "parrotfish", size: [22, 36], speed: [24, 42], count: 7 },
      { type: "barracuda", size: [50, 80], speed: [50, 85], count: 2 },
      { type: "school_small", size: [8, 12], speed: [45, 75], count: 20, school: true }
    ],
    props: [
      { kind: "coral", count: 6, variant: "head" },
      { kind: "rock", count: 3 },
      { kind: "bubbles", count: 22 }
    ]
  },
  {
    id: "superior",
    name: "Lake Superior",
    region: "Cold freshwater",
    waterTint: { top: "#4a6a78", mid: "#243848", deep: "#0a1218", tint: "rgba(90,120,140,0.25)", caustic: 0.1, ray: 0.08 },
    fish: [
      { type: "trout", size: [24, 40], speed: [22, 38], count: 8 },
      { type: "perch", size: [14, 22], speed: [18, 30], count: 10 }
    ],
    props: [
      { kind: "rock", count: 8 },
      { kind: "plant", count: 4, variant: "sparse" },
      { kind: "bubbles", count: 6 }
    ]
  },
  {
    id: "amazon",
    name: "Amazon Floodplain",
    region: "Blackwater",
    waterTint: { top: "#6a4a28", mid: "#3a2818", deep: "#140c08", tint: "rgba(120,70,30,0.4)", caustic: 0.06, ray: 0.05 },
    fish: [
      { type: "discus", size: [20, 32], speed: [14, 26], count: 7 },
      { type: "angelfish", size: [16, 26], speed: [16, 28], count: 8 },
      { type: "school_small", size: [6, 10], speed: [22, 40], count: 16, school: true }
    ],
    props: [
      { kind: "roots", count: 6 },
      { kind: "plant", count: 5, variant: "leafy" },
      { kind: "bubbles", count: 10 }
    ]
  },
  {
    id: "med_wreck",
    name: "Mediterranean Wreck",
    region: "Seagrass slope",
    waterTint: { top: "#3a8a9a", mid: "#1c4e5c", deep: "#0a1c24", tint: "rgba(70,150,160,0.28)", caustic: 0.2, ray: 0.16 },
    fish: [
      { type: "grouper", size: [40, 70], speed: [12, 24], count: 3 },
      { type: "school_small", size: [8, 12], speed: [28, 50], count: 14, school: true },
      { type: "angelfish", size: [16, 24], speed: [20, 34], count: 5 }
    ],
    props: [
      { kind: "wreck", count: 1 },
      { kind: "seagrass", count: 10 },
      { kind: "rock", count: 4 },
      { kind: "bubbles", count: 14 }
    ]
  },
  {
    id: "galapagos",
    name: "Galápagos",
    region: "Volcanic reef",
    waterTint: { top: "#2a8aaa", mid: "#145068", deep: "#061820", tint: "rgba(50,150,180,0.3)", caustic: 0.26, ray: 0.2 },
    fish: [
      { type: "tropical", size: [14, 24], speed: [26, 48], count: 12 },
      { type: "school_small", size: [7, 11], speed: [40, 70], count: 22, school: true },
      { type: "sea_lion", size: [55, 85], speed: [40, 65], count: 1, rare: true }
    ],
    props: [
      { kind: "volcanic", count: 6 },
      { kind: "coral", count: 4, variant: "soft" },
      { kind: "bubbles", count: 16 }
    ]
  },
  {
    id: "fjord",
    name: "Norwegian Fjord",
    region: "Cold green walls",
    waterTint: { top: "#3a6a58", mid: "#1a3a34", deep: "#061410", tint: "rgba(50,110,90,0.35)", caustic: 0.12, ray: 0.1 },
    fish: [
      { type: "cod", size: [30, 55], speed: [16, 28], count: 6 },
      { type: "school_small", size: [7, 11], speed: [24, 42], count: 12, school: true }
    ],
    props: [
      { kind: "wall_rock", count: 5 },
      { kind: "coral", count: 5, variant: "soft" },
      { kind: "plant", count: 4, variant: "sparse" },
      { kind: "bubbles", count: 8 }
    ]
  },
  {
    id: "redsea",
    name: "Red Sea",
    region: "Vivid reef",
    waterTint: { top: "#1a90b8", mid: "#0c4a68", deep: "#041828", tint: "rgba(30,160,200,0.3)", caustic: 0.32, ray: 0.24 },
    fish: [
      { type: "lionfish", size: [24, 38], speed: [12, 22], count: 4 },
      { type: "tropical", size: [12, 22], speed: [28, 50], count: 14 },
      { type: "school_small", size: [7, 11], speed: [42, 72], count: 20, school: true }
    ],
    props: [
      { kind: "coral", count: 8, variant: "soft" },
      { kind: "coral", count: 4, variant: "branch" },
      { kind: "rock", count: 3 },
      { kind: "bubbles", count: 20 }
    ]
  },
  {
    id: "pnw",
    name: "Pacific Northwest Inlet",
    region: "Murky green",
    waterTint: { top: "#3a5a48", mid: "#1c3028", deep: "#08100c", tint: "rgba(70,100,70,0.4)", caustic: 0.08, ray: 0.06 },
    fish: [
      { type: "salmon", size: [28, 48], speed: [32, 58], count: 7 },
      { type: "school_small", size: [8, 12], speed: [26, 44], count: 10, school: true }
    ],
    props: [
      { kind: "eelgrass", count: 9 },
      { kind: "log", count: 1 },
      { kind: "boat", count: 1 },
      { kind: "rock", count: 4 },
      { kind: "bubbles", count: 10 }
    ]
  }
];
