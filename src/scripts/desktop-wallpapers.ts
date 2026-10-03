/** Local, procedural backdrops: no image downloads, tracking, or video decoding. */
export const wallpapers: [string, string, string, string?][] = [
  ["original", "Theme wallpaper", "var(--desk-wallpaper)"],
  ["midnight", "Midnight", "linear-gradient(#080f20,#18243b)"],
  ["charcoal", "Charcoal", "linear-gradient(135deg,#17191b,#343a40)"],
  ["porcelain", "Porcelain", "linear-gradient(135deg,#d9e6e9,#f8f4ec)"],
  [
    "forest",
    "Forest floor",
    "radial-gradient(ellipse at 15% 85%,#436445,transparent 65%),linear-gradient(145deg,#091c1a,#163e34)",
  ],
  [
    "ocean",
    "Deep ocean",
    "radial-gradient(ellipse at 80% 10%,#23849a,transparent 65%),linear-gradient(150deg,#08192b,#153b57)",
  ],
  ["clay", "Terracotta", "linear-gradient(125deg,#512c31,#b76b4c 55%,#ddb48b)"],
  [
    "lavender",
    "Lavender field",
    "linear-gradient(160deg,#393750,#786890 60%,#c2b5c9)",
  ],
  [
    "sunrise",
    "First light",
    "radial-gradient(circle at 70% 75%,#ffdb92 0 8%,transparent 9%),linear-gradient(#382f68,#b5687e 65%,#e9aa81)",
  ],
  ["dusk", "Blue hour", "linear-gradient(#10152e 15%,#354775 60%,#c48291)"],
  [
    "lagoon",
    "Lagoon",
    "radial-gradient(ellipse at 20% 10%,#a1dcc5,transparent 60%),linear-gradient(135deg,#075967,#073348)",
  ],
  [
    "desert",
    "Dunes",
    "radial-gradient(ellipse at 20% 160%,#745442 55%,transparent 55.2%),radial-gradient(ellipse at 100% 140%,#c08d66 60%,transparent 60.2%),linear-gradient(#bbd0d1,#edd5af)",
  ],
  [
    "alpine",
    "Alpine",
    "conic-gradient(from 140deg at 35% 30%,#526f70 0 85deg,transparent 85deg),conic-gradient(from 140deg at 75% 20%,#244b51 0 85deg,transparent 85deg),linear-gradient(#acc9ce,#e7e9dc)",
  ],
  [
    "rose",
    "Rose quartz",
    "radial-gradient(ellipse at 80% 80%,#c391a1,transparent 70%),linear-gradient(130deg,#463b58,#8e687d)",
  ],
  [
    "ink",
    "Ink wash",
    "radial-gradient(ellipse at 0 100%,#677d85,transparent 55%),radial-gradient(ellipse at 90% 0,#4d626c,transparent 60%),linear-gradient(#19272f,#10151a)",
  ],
  [
    "citrus",
    "Citrus grove",
    "radial-gradient(circle at 80% 20%,#dcbd59,transparent 40%),linear-gradient(125deg,#183b38,#557756)",
  ],
  [
    "blueprint",
    "Blueprint",
    "repeating-linear-gradient(0deg,#a1d8ff22 0 1px,transparent 1px 32px),repeating-linear-gradient(90deg,#a1d8ff22 0 1px,transparent 1px 32px),linear-gradient(#103b5a,#092943)",
  ],
  [
    "dots",
    "Dot matrix",
    "radial-gradient(#8aa2b666 1px,transparent 1.5px) 0 0/22px 22px,#172732",
  ],
  [
    "checker",
    "Checkerboard",
    "repeating-conic-gradient(#293e40 0 25%,#203337 0 50%) 0 0/100px 100px",
  ],
  [
    "stripes",
    "Diagonal",
    "repeating-linear-gradient(135deg,#24313f 0 35px,#2d3e4c 35px 70px)",
  ],
  [
    "contours",
    "Contours",
    "repeating-radial-gradient(ellipse at 10% 120%,#172e30 0 28px,#486461 29px 30px,#172e30 31px 58px)",
  ],
  [
    "stars",
    "Constellation",
    "radial-gradient(1px 1px at 20px 30px,#bfcfff 95%,transparent) 0 0/89px 113px,radial-gradient(1px 1px at 60px 80px,#eee 95%,transparent) 0 0/137px 157px,linear-gradient(#090e21,#1e2b47)",
  ],
  [
    "aurora",
    "Aurora",
    "radial-gradient(ellipse at 20% 20%,#278c7977,transparent 55%),radial-gradient(ellipse at 80% 80%,#5778b999,transparent 60%),linear-gradient(130deg,#071d27,#164349)",
    "flow",
  ],
  [
    "tides",
    "Tidal pools",
    "repeating-radial-gradient(ellipse at 20% 100%,#0d2c45 0 70px,#28616b 90px,#153e59 140px)",
    "pan",
  ],
  [
    "embers",
    "Embers",
    "radial-gradient(ellipse at 80% 90%,#ba623977,transparent 55%),radial-gradient(ellipse at 20% 20%,#84333a,transparent 55%),linear-gradient(#251d2a,#4d2928)",
    "flow",
  ],
  [
    "clouds",
    "Cloud study",
    "radial-gradient(ellipse at 20% 30%,#e4ebdf88,transparent 50%),radial-gradient(ellipse at 80% 70%,#b9d5d8aa,transparent 50%),linear-gradient(#49697c,#8eacb8)",
    "pan",
  ],
  [
    "prism",
    "Prism",
    "conic-gradient(from 45deg at 30% 50%,#324c65,#548d83,#ad8e65,#77537d,#324c65)",
    "flow",
  ],
  [
    "orbit",
    "Orbit",
    "radial-gradient(circle at 65% 50%,transparent 0 100px,#a5d5ce55 101px 103px,transparent 104px 180px,#7babb944 181px 183px,transparent 184px),linear-gradient(120deg,#101d2d,#1d3f46)",
    "pan",
  ],
  [
    "rain",
    "Rain glass",
    "repeating-linear-gradient(110deg,transparent 0 35px,#93b9c322 36px 37px,transparent 38px 70px),linear-gradient(#122433,#365365)",
    "rain",
  ],
  [
    "bloom",
    "Slow bloom",
    "radial-gradient(ellipse at 30% 30%,#986079,transparent 60%),radial-gradient(ellipse at 80% 80%,#ba986c,transparent 60%),linear-gradient(#31334b,#39494b)",
    "flow",
  ],
];
