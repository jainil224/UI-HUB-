import * as React from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import * as THREE from "three";
import { animate } from "motion";
import "./SpiderCrawler.css";

export interface SpiderCrawlerProps {
  /** Optional class applied to the root container. */
  className?: string;
  /** Optional inline styles for the root container. */
  style?: React.CSSProperties;
  /** When true (library preview), uses compact sizing. */
  compact?: boolean;
  /** Show the Live Demo pill linking to /demo/spider-crawler. */
  showDemoButton?: boolean;
}

export const SpiderCrawler: React.FC<SpiderCrawlerProps> = ({
  className = "",
  style = {},
  compact = false,
  showDemoButton = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const view = viewRef.current;
    const pageEl = pageRef.current;
    const fx = fxRef.current;
    const glCanvas = glRef.current;
    const cursorEl = cursorRef.current;
    if (!root || !stage || !view || !pageEl || !fx || !glCanvas || !cursorEl) return;

    /* =========================================================
       CONFIG — every measured value lives here
       (reference: 720x1280, 30 fps, 500 frames, 16.667 s loop)
       ========================================================= */
    const CFG = {
      W: 720,
      H: 1280,
      VIEW_H: 1280,
      VIEW_TOP: 0,
      DURATION: 500 / 30,
      nodes: 24,
      spawnRate: 8.5,
      phases: [
        [3.6, "#7fd6f0", "#ff4d7a"],
        [8.2, "#ff5577", "#4fe0ff"],
        [12.6, "#5b6cff", "#b2b8ff"],
        [99, "#46a8ff", "#47ff9a"],
      ] as [number, string, string][],
      glitch: [
        "#35d6ff",
        "#3d7bff",
        "#ff3fd2",
        "#ff8a3d",
        "#47ff9a",
        "#b36bff",
        "#ffd23d",
        "#ff4d7a",
      ],
      seed: 20240611,
    };
    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- seeded RNG (determinism) ---------- */
    function mulberry32(a: number) {
      return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
    const hex = (h: string) => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ];

    /* =========================================================
       PAGE CONTENT (Wikipedia-style reference list, dark theme)
       ========================================================= */
    const REFS: [string, string, string][] = [
      [
        "Vetter RS, Barger DK (2002). ",
        '"An infestation of 2,055 brown recluse spiders (Araneae: Sicariidae) and no envenomations in a Kansas home: implications for the bite diagnoses in nonendemic areas"',
        ". <i>Journal of Medical Entomology</i>. <b2>39</b2> (6): 948–51. doi:10.1603/0022-2585-39.6.948 · PMID 12495200",
      ],
      [
        "Hannum, C. & Miller, D.M. ",
        '"Widow Spiders"',
        ". Department of Entomology, Virginia Tech. Archived from the original on 18 October 2008. Retrieved 11 October 2008.",
      ],
      [
        "",
        '"Funnel web spiders"',
        ". Australian Venom Research Unit. Retrieved 11 October 2008.",
      ],
      [
        "",
        '"Pub chef bitten by deadly spider"',
        ". BBC. 27 April 2005. Retrieved 11 October 2008.",
      ],
      [
        "Diaz, J.H. (1 August 2004). ",
        '"The Global Epidemiology, Syndromic Classification, Management, and Prevention of Spider Bites"',
        ". <i>American Journal of Tropical Medicine and Hygiene</i>. 71 (2): 239–50. doi:10.4269/ajtmh.2004.71.2.0700239 · PMID 15306478",
      ],
      [
        "Williamson, J.A.; Fenner, P.J.; Burnett, J.W.; Rifkin, J. (1996). ",
        "<i>Venomous and Poisonous Marine Animals: A Medical and Biological Handbook</i>",
        ". UNSW Press. pp. 65–68. ISBN 978-0-86840-279-6.",
      ],
      [
        "Nishioka, S. de A. (2001). ",
        '"Misdiagnosis of brown recluse spider bite"',
        ". <i>Western Journal of Medicine</i>. 174 (4): 240. doi:10.1136/ewjm.174.4.240 · PMC 1071344 · PMID 11290675",
      ],
      [
        "Isbister, G.K. (2001). ",
        '"Spider mythology across the world"',
        ". <i>Western Journal of Medicine</i>. 175 (2): 86–87. doi:10.1136/ewjm.175.2.86",
      ],
      [
        "Stuber, Marielle & Nentwig, Wolfgang (2016). ",
        '"How informative are case studies of spider bites in the medical literature?"',
        ". <i>Toxicon</i>. 114: 40–44. doi:10.1016/j.toxicon.2016.02.023 · PMID 26923161",
      ],
      [
        "Hinman, M.B.; Jones J.A.; Lewis, R.V.; ",
        '"Synthetic spider silk: a modular fiber"',
        ". <i>Trends in Biotechnology</i>. 18 (9): 374–79. doi:10.1016/S0167-7799(00)01481-5 · PMID 10942961 · Archived from the original (PDF) on 16 December 2008. Retrieved 19 October 2008.",
      ],
      [
        "Menassa, R.; Zhu, H.; Karatzas, C.N.; Lazaris, A.; Richman, A.; Brandle, J. (2004). ",
        '"Spider dragline silk proteins in transgenic tobacco leaves: accumulation and field production"',
        ". <i>Plant Biotechnology Journal</i>. 2 (5): 431–38. Bibcode:2004PBioJ...2..431M · doi:10.1111/j.1467-7652.2004.00087.x · PMID 17168889",
      ],
      [
        "",
        '"A Common Phobia"',
        '. phobias-help.com. Archived from the original on 25 June 2009. Retrieved 2 August 2009. "There are many common phobias, but surprisingly, the most common phobia is arachnophobia."',
      ],
      [
        "Fritscher, Lisa (3 June 2009). ",
        '"Spider Fears or Arachnophobia"',
        '. <i>Phobias</i>. About.com. Archived from the original on 19 June 2009. Retrieved 2 August 2009. "Arachnophobia, or fear of spiders, is one of the most common specific phobias."',
      ],
      [
        "",
        '"The 10 Most Common Phobias – Did You Know?"',
        '. Archived from the original on 3 September 2009. Retrieved 2 August 2009. "Probably the most recognized of the 10 most common phobias, arachnophobia is the fear of spiders. The statistics clearly show that more than 50% of women and 10% of men show signs of this leader on the 10 most common phobias list."',
      ],
      [
        "Friedenberg, J. & Silverman, G. ",
        "<i>Cognitive Science: An Introduction to the Study of Mind</i>",
        ". Sage. pp. 244–46. ISBN 978-1-4129-2568-6.",
      ],
      [
        "Davey, G.C.L. (1994). ",
        '"The "Disgusting" Spider: The Role of Disease and Illness in the Perpetuation of Fear of Spiders"',
        ". <i>Society and Animals</i>. 2 (1): 17–25.",
      ],
      [
        "Costa-Neto, E.M.; Grabowski, N.T. (27 November 2020). ",
        '"Edible arachnids and myriapods worldwide – updated list, nutritive profile and food hygiene implications"',
        ". <i>Journal of Insects as Food and Feed</i>. 7 (3): 2–. doi:10.3920/JIFF2020.0046",
      ],
      [
        "",
        "<i>Cambodia</i>",
        ". Lonely Planet Publications. p. 308. ISBN 978-1-74059-111-9.",
      ],
      [
        "",
        "<i>Fierce Food</i>",
        ". Plume. 2004. ISBN 978-0-452-28541-0.",
      ],
      [
        "De Lacroix, Libraries Unlimited. p. 186. ",
        "ISBN 978-1-56308-190-3.",
        "",
      ],
      [
        "Black, Jeremy; Green, Anthony (1992). ",
        "<i>Gods, Demons and Symbols of Ancient Mesopotamia: An Illustrated Dictionary</i>",
        ". London, England: The British Museum Press. p. 182. ISBN 978-0-7141-1705-8.",
      ],
      [
        "Jacobsen, Thorkild (1987). ",
        "<i>The Harps that Once: Sumerian Poetry in Translation</i>",
        ". New Haven: Yale University Press. p. 56.",
      ],
      [
        "Wright, M. Rosemary. ",
        '"A Dictionary of Classical Mythology: Summary of Transformations"',
        ". mythandreligion.upatras.gr. University of Patras. Retrieved 3 January 2023.",
      ],
      [
        "Haase, Donald (2008). ",
        "<i>The Greenwood Encyclopedia of Folktales and Fairy Tales</i>",
        ". Santa Barbara, California: Greenwood Publishing Group. p. 31. ISBN 978-0-313-33441-2.",
      ],
      [
        "Garai, Jana (1973). ",
        "<i>The Book of Symbols</i>",
        ". New York: Simon & Schuster. ISBN 978-0-671-21773-0.",
      ],
      [
        "De Laguna, Frederica (2002). ",
        "<i>American Anthropology: Papers from the American Anthropologist</i>",
        ". University of Nebraska Press. p. 455. ISBN 978-0-8032-8280-3.",
      ],
      [
        "Selden, P.A. (1996). ",
        '"Fossil mesothele spiders"',
        ". <i>Nature</i>. 379 (6565): 498–99. Bibcode:1996Natur.379..498S · doi:10.1038/379498b0 · S2CID 26323977",
      ],
      [
        "Selden, P.A.; ChungKun Shih; Dong Ren (2011). ",
        '"A golden orb-weaver spider (Araneae: Nephilidae: Nephila) from the Middle Jurassic of China"',
        ". <i>Biology Letters</i>. 7 (5): 775–78. Bibcode:2011BiLet...7..775S · doi:10.1098/rsbl.2011.0228 · PMC 3169061 · PMID 21508021",
      ],
      [
        "Selden, Paul A.; Shih, ChungKun; Ren, Dong (2013). ",
        '"A giant spider from the Jurassic of China reveals greater diversity of the orbicularian stem group"',
        ". <i>Die Naturwissenschaften</i>. 100 (12): 1171–81. Bibcode:2013NW....100.1171S · doi:10.1007/s00114-013-1121-7 · PMC 3889289 · PMID 24317464",
      ],
      [
        "Lozano-Fernandez, Jesus; Tanner, Alastair R.; Puttick, Mark N.; Vinther, Jakob; Edgecombe, Gregory D.; Pisani, Davide (11 March 2020). ",
        '"A Cambrian–Ordovician Terrestrialization of Arachnids"',
        ". <i>Frontiers in Genetics</i>. 11: 182. doi:10.3389/fgene.2020.00182 · PMC 7078165",
      ],
      [
        "Shultz, J.W. (2007). ",
        '"A phylogenetic analysis of the arachnid orders based on morphological characters"',
        ". <i>Zoological Journal of the Linnean Society</i>. 150 (2): 221–65. doi:10.1111/j.1096-3642.2007.00284.x",
      ],
      [
        "Howard, Richard J.; Edgecombe, Gregory D.; Legg, David A.; Pisani, Davide; Lozano-Fernandez, Jesus (2019). ",
        '"Exploring the evolution and terrestrialisation of scorpions (Arachnida: Scorpiones) with rocks and clocks"',
        ". <i>Organisms Diversity & Evolution</i>. 19 (1): 71–86. Bibcode:2019ODivE..19...71H · doi:10.1007/s13127-019-00390-7",
      ],
      [
        "Scholtz, Gerhard; Kamenz, Carsten (2006). ",
        '"The book lungs of Scorpionidea and Tetrapulmonata (Chelicerata, Arachnida): evidence for homology and a single terrestrialisation event of a common arachnid ancestor"',
        ". <i>Zoology</i>. 109 (1): 2–13. doi:10.1016/j.zool.2005.06.003 · PMID 16386884",
      ],
      [
        "Gould, S.J. (1990). ",
        "<i>Wonderful Life: The Burgess Shale and the Nature of History</i>",
        ". Hutchinson Radius. pp. 102–06. ISBN 978-0-09-174271-3.",
      ],
      [
        "Coddington, J.A. (2005). ",
        '"Phylogeny and Classification of Spiders"',
        ". In Ubick, D.; Paquin, P.; Cushing, P.E.; Roth, V. (eds.). <i>Spiders of North America: an identification manual</i>. American Arachnological Society. pp. 18–24.",
      ],
      [
        "Coddington, Jonathan A.; Levi, Herbert W. (1991). ",
        '"Systematics and Evolution of Spiders (Araneae)"',
        ". <i>Annual Review of Ecology and Systematics</i>. 22: 565–92. doi:10.1146/annurev.es.22.110191.003025 · ISSN 0066-4162 · JSTOR 2097274",
      ],
      [
        "Lewis, Charlton T.; Short, Charles (1879). ",
        '"ārāněa"',
        ". <i>A Latin Dictionary</i>. Perseus Digital Library.",
      ],
      [
        "Liddell, Henry George; Scott, Robert (1940). ",
        '"ἀράχνη"',
        ". <i>A Greek-English Lexicon</i>. Perseus Digital Library.",
      ],
      [
        "Leroy, J & Leroy, A. (2003). ",
        '"How spiders function"',
        ". <i>Spiders of Southern Africa</i>. Struik. pp. 15–21. ISBN 978-1-86872-944-9.",
      ],
      [
        "Ono, H. (2002). ",
        '"New and Remarkable Spiders of the Families Liphistiidae, Argyronetidae, Pisauridae, Theridiidae and Araneidae (Arachnida) from Japan"',
        ". <i>Bulletin of the National Science Museum (Tokyo)</i>, Series A. 28 (1): 51–60.",
      ],
      [
        "Benson, Elizabeth. ",
        "<i>The Mochica: A Culture of Peru</i>",
        ". New York: Praeger Press. 1972.",
      ],
      [
        "Berrin, Katherine & Larco Museum. ",
        "<i>The Spirit of Ancient Peru: Treasures from the Museo Arqueológico Rafael Larco Herrera</i>",
        ". New York: Thames and Hudson. 1997.",
      ],
      [
        "Penney, D. & Selden, P.A. (2002). ",
        '"The oldest linyphiid spiders, and the dating of fossil spiders"',
        ". <i>Geology Today</i>. 23 (6): 231–37. Bibcode:2007GeolT..23..231P · doi:10.1111/j.1365-2451.2007.00641.x · S2CID 130307127",
      ],
      [
        "Vollrath, F. & Selden, P. (2007). ",
        '"The Role of Behavior in the Evolution of Spiders, Silks, and Webs"',
        ". <i>Annual Review of Ecology, Evolution, and Systematics</i>. 38 (1): 819–46. doi:10.1146/annurev.ecolsys.37.091305.110221",
      ],
      [
        "Krantz, G. & Walter, D. (2009). ",
        "<i>A Manual of Acarology</i>",
        ". Texas Tech University Press. ISBN 978-0-89672-620-8.",
      ],
    ];

    const NUM: Record<number, number> = {
      122: 0, 123: 1, 124: 2, 125: 3, 126: 4, 127: 5, 128: 6, 129: 7, 130: 8, 131: 9, 132: 10, 133: 11,
      134: 12, 135: 13, 136: 14, 137: 15, 138: 16, 139: 17, 140: 18, 141: 19, 142: 20, 143: 21,
      147: 22, 148: 23, 149: 24, 150: 25, 100: 26, 98: 27, 99: 28, 101: 29, 102: 30, 103: 31, 104: 32,
      105: 33, 106: 34, 107: 35, 108: 36, 109: 37, 110: 38, 111: 39, 151: 40, 152: 41, 93: 42, 97: 43, 95: 44,
    };

    function refItem(num: number) {
      const r = REFS[NUM[num] !== undefined ? NUM[num] : (num * 7 + 3) % REFS.length];
      const title = r[1].startsWith("<i>")
        ? r[1].replace("<i>", '<i class="a">')
        : r[1]
        ? `<span class="a">${r[1]}</span>`
        : "";
      const tail = r[2]
        .replace(
          /(ISBN|PMID|PMC|S2CID|Bibcode|doi|ISSN|JSTOR|OCLC)(:|\s)?\s?([^\s·.]+[^\s·]*)/g,
          (_m, k, sep, v) => `<span class="k">${k}</span>${sep || " "}<span class="a k">${v}</span>`
        )
        .replace(/<b2>|<\/b2>/g, "");
      return `<li class="${num % 8 === 0 ? "l3" : ""}"><b>${num}.</b>^ ${r[0]}${title}${tail}</li>`;
    }

    const LINES = 50;
    function buildPage() {
      let lis = "";
      for (let n = 1; n <= LINES; n++) lis += refItem(n);
      const block = `<section class="blk"><h2>References</h2><div style="height:8px"></div><ol>${lis}</ol><div style="height:14px"></div></section>`;
      return block + block + block;
    }

    pageEl.innerHTML = buildPage();

    function splitWords(rootNode: HTMLElement) {
      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT);
      const textNodes: Node[] = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((n) => {
        if (!n.nodeValue || !n.nodeValue.trim()) return;
        const f = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) {
            f.appendChild(document.createTextNode(p));
          } else {
            const sp = document.createElement("span");
            sp.className = "w";
            sp.textContent = p;
            f.appendChild(sp);
          }
        });
        if (n.parentNode) n.parentNode.replaceChild(f, n);
      });
    }

    splitWords(pageEl);

    const fxc = fx.getContext("2d")!;
    let tokens: Array<{ x: number; y: number; w: number; h: number; txt: string; k: boolean }> = [];
    interface WordToken {
      el: HTMLElement;
      x: number;
      y: number;
      w: number;
      h: number;
      cx: number;
      cy: number;
      txt: string;
      g: number;
      flash: number;
    }
    let words: WordToken[] = [];
    let loopP = 1;
    let wrapLo = 0;
    let startScroll = 0;

    function nearestWord(
      px: number,
      py: number,
      rad: number,
      avoid?: (w: WordToken) => boolean
    ): WordToken | null {
      if (!words.length) return null;
      let lo = 0,
        hi = words.length;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (words[m].cy < py - rad) lo = m + 1;
        else hi = m;
      }
      let best: WordToken | null = null,
        bd = rad * rad;
      for (let i = lo; i < words.length && words[i].cy <= py + rad; i++) {
        const k = words[i];
        if (avoid && avoid(k)) continue;
        const dx = Math.max(Math.abs(px - k.cx) - k.w / 2, 0);
        const dy = py - k.cy;
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
      return best;
    }

    let stageScale = 1;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let renderScale = 1;

    function measure() {
      pageEl.style.transform = "none";
      const base = pageEl.getBoundingClientRect();
      const sc = stageScale || 1;
      tokens = ([...pageEl.querySelectorAll(".a, .k")] as HTMLElement[])
        .map((el) => {
          const r = el.getBoundingClientRect();
          const li = el.closest("li");
          const lr = li && li.getBoundingClientRect();
          if (lr && r.top > lr.bottom - 6) return null;
          return {
            x: (r.left - base.left) / sc,
            y: (r.top - base.top) / sc,
            w: r.width / sc,
            h: r.height / sc,
            txt: (el.textContent || "").trim(),
            k: el.classList.contains("k"),
          };
        })
        .filter(
          (t): t is { x: number; y: number; w: number; h: number; txt: string; k: boolean } =>
            Boolean(t && t.w > 12 && t.h > 8 && t.h < 30 && t.txt.length > 1 && t.txt.length < 46)
        );

      words = ([...pageEl.querySelectorAll(".w")] as HTMLElement[])
        .map((el) => {
          const r = el.getBoundingClientRect();
          const li = el.closest("li");
          const lr = li && li.getBoundingClientRect();
          if (lr && r.top > lr.bottom - 6) return null;
          const w = r.width / sc,
            h = r.height / sc;
          if (w < 8 || h < 8 || h > 30) return null;
          const tokenData = (el as any)._tok || ((el as any)._tok = { g: 0, flash: 0 });
          return Object.assign(tokenData, {
            el,
            x: (r.left - base.left) / sc,
            y: (r.top - base.top) / sc,
            w,
            h,
            cx: (r.left - base.left) / sc + w / 2,
            cy: (r.top - base.top) / sc + h / 2,
            txt: el.textContent || "",
          });
        })
        .filter(Boolean) as WordToken[];

      words.sort((a, b) => a.cy - b.cy);
      const blks = [...pageEl.querySelectorAll(".blk")] as HTMLElement[];
      if (blks.length >= 3) {
        const bt = blks.map((b) => (b.getBoundingClientRect().top - base.top) / sc);
        loopP = (bt[2] - bt[0]) / 2;
        wrapLo = bt[1];
        const ol = blks[1].querySelector("ol");
        if (ol) {
          startScroll = (ol.getBoundingClientRect().top - base.top) / sc - CFG.H * 0.3;
        }
      }
    }

    /* ---------- Three.js: crawler graph ---------- */
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(0, CFG.W, 0, CFG.VIEW_H, -10, 10);
    const renderer = new THREE.WebGLRenderer({
      canvas: glCanvas,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0, 0);

    const N_LEG = 8;
    const LEN1 = 44,
      LEN2 = 54,
      BODY_MAX = 440,
      STEP_THR = 28;
    const HIP_Y = [-17, -6, 5, 16];
    const HOME_X = [60, 74, 72, 56];
    const HOME_Y = [-58, -20, 18, 54];

    const linePos = new Float32Array(N_LEG * 2 * 3 * 2 * 3);
    const lineCol = new Float32Array(N_LEG * 2 * 3 * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

    const dotGeo = new THREE.CircleGeometry(3.7, 14);
    const ringGeo = new THREE.CircleGeometry(5.3, 14);
    const dots = [...Array(N_LEG)].map(() => {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0x7a1f4a, side: THREE.DoubleSide })
      );
      const fill = new THREE.Mesh(
        dotGeo,
        new THREE.MeshBasicMaterial({ color: 0xff4d7a, side: THREE.DoubleSide })
      );
      fill.position.z = 0.1;
      g.add(ring, fill);
      g.position.z = 1;
      scene.add(g);
      return g;
    });

    const HEAD = { w: 15, h: 44, dotY: -14.3 };
    const head = new THREE.Group();
    const headFill = new THREE.Mesh(
      new THREE.PlaneGeometry(HEAD.w, HEAD.h),
      new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
    );
    const headEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(HEAD.w, HEAD.h)),
      new THREE.LineBasicMaterial({ color: 0x8fdcff })
    );
    const headDot = new THREE.Mesh(
      new THREE.CircleGeometry(3.8, 16),
      new THREE.MeshBasicMaterial({ color: 0x5fe8f0, side: THREE.DoubleSide })
    );
    headEdge.position.z = 0.1;
    headDot.position.set(0, HEAD.dotY, 0.2);
    head.add(headFill, headEdge, headDot);
    head.position.z = 5;
    scene.add(head);

    interface BodyState {
      x: number;
      y: number;
      vx: number;
      vy: number;
      ang: number;
      target: { x: number; y: number } | null;
    }
    const body: BodyState = {
      x: 360,
      y: 160,
      vx: 0,
      vy: 0,
      ang: 0,
      target: null,
    };

    interface LegState {
      i: number;
      side: number;
      row: number;
      group: number;
      hx: number;
      hy: number;
      ox: number;
      oy: number;
      fx: number;
      fy: number;
      base: number;
      tok: WordToken | null;
      step: boolean;
      u: number;
      dur: number;
      from: [number, number];
      to: [number, number];
      lift: number;
      jit: number;
      hmx: number;
      hmy: number;
    }

    const legs: LegState[] = [...Array(N_LEG)].map((_, i) => {
      const side = i < 4 ? -1 : 1,
        row = i % 4;
      return {
        i,
        side,
        row,
        group: (row + (side > 0 ? 1 : 0)) % 2,
        hx: side * 7.5,
        hy: HIP_Y[row],
        ox: side * HOME_X[row],
        oy: HOME_Y[row],
        fx: 0,
        fy: 0,
        base: 0,
        tok: null,
        step: false,
        u: 0,
        dur: 0.2,
        from: [0, 0],
        to: [0, 0],
        lift: 0,
        jit: ((row * 37 + i * 13) % 7) / 7 - 0.5,
        hmx: 0,
        hmy: 0,
      };
    });

    let gait = 0;
    const bodyR = (x: number, y: number): [number, number] => {
      const c = Math.cos(body.ang),
        s = Math.sin(body.ang);
      return [body.x + x * c - y * s, body.y + x * s + y * c];
    };

    let scrollY = 0;
    let prevScroll: number | null = null;
    let sv = 0;

    function replant(currentScrollY: number) {
      legs.forEach((l) => {
        l.tok = null;
      });
      legs.forEach((l) => {
        const [hx, hy] = bodyR(l.ox, l.oy);
        const k = nearestWord(hx, hy + currentScrollY, 120, (w) =>
          legs.some((o) => o !== l && o.tok === w)
        );
        l.step = false;
        l.lift = 0;
        l.tok = k;
        if (k) {
          l.fx = k.cx + l.jit * k.w * 0.5;
          l.fy = k.cy;
        } else {
          l.fx = hx;
          l.fy = hy + currentScrollY;
        }
        l.base = Math.hypot(l.fx - hx, l.fy - currentScrollY - hy);
      });
    }

    function mapTok(t: WordToken, shift: number) {
      return nearestWord(t.cx, t.cy + shift, 8);
    }

    const glowing = new Set<WordToken>();
    let glowRGB = [127, 214, 240];

    interface GlitchItem {
      kind: string;
      tok: WordToken | { x: number; y: number; w: number; h: number; txt: string };
      col: string;
      t0: number;
      life: number;
      font: string;
      scale: number;
      ang: number;
      len: number;
      th: number;
      rv: number;
      x0: number;
      y0: number;
    }
    const glitches: GlitchItem[] = [];

    function wrapScroll() {
      let shift = 0;
      while (scrollY < wrapLo) {
        scrollY += loopP;
        shift += loopP;
      }
      while (scrollY >= wrapLo + loopP) {
        scrollY -= loopP;
        shift -= loopP;
      }
      if (!shift) return;
      if (prevScroll !== null) prevScroll += shift;
      legs.forEach((l) => {
        l.fy += shift;
        l.from[1] += shift;
        l.to[1] += shift;
        if (l.tok) l.tok = mapTok(l.tok, shift);
      });
      for (const k of [...glowing]) {
        const nk = mapTok(k, shift);
        if (nk) {
          nk.g = Math.max(nk.g, k.g);
          nk.flash = Math.max(nk.flash, k.flash);
          glowing.add(nk);
        }
        k.g = 0;
      }
      for (let i = glitches.length - 1; i >= 0; i--) {
        const g = glitches[i];
        if ("cx" in g.tok) {
          const nk = mapTok(g.tok as WordToken, shift);
          if (nk) {
            g.tok = nk;
            g.y0 += shift;
          } else {
            glitches.splice(i, 1);
          }
        }
      }
    }

    function startStep(l: LegState, curScroll: number, slideVel: number, speed: number) {
      const fast = speed + Math.abs(slideVel);
      const lead = 0.1 + clamp(fast, 0, 900) * 0.0001;
      const px = l.hmx + clamp(body.vx * lead, -60, 60);
      const py =
        l.hmy +
        clamp(body.vy * lead, -60, 60) +
        curScroll -
        clamp(slideVel * lead, -90, 90);
      const av = (w: WordToken) => legs.some((o) => o !== l && o.tok === w);
      const k = nearestWord(px, py, 34, av) || nearestWord(px, py, 90, av);
      l.from = [l.fx, l.fy];
      l.to = k ? [k.cx + l.jit * k.w * 0.5, k.cy] : [px, py];
      l.tok = k || null;
      l.step = true;
      l.u = 0;
      l.dur = clamp(0.17 - fast * 0.0002, 0.06, 0.17);
    }

    function updateBody(dt: number) {
      const T = body.target;
      if (T) {
        const dx = T.x - body.x,
          dy = T.y - body.y,
          d = Math.hypot(dx, dy);
        if (d < 1.2) {
          const k = Math.exp(-dt * 16);
          body.vx *= k;
          body.vy *= k;
        } else {
          const sp = Math.min(BODY_MAX, d * 3.5);
          const k = Math.min(1, dt * 14);
          body.vx += ((dx / d) * sp - body.vx) * k;
          body.vy += ((dy / d) * sp - body.vy) * k;
        }
      }
      if (!body.target) {
        const k = Math.exp(-dt * 9);
        body.vx *= k;
        body.vy *= k;
      }
      body.x = clamp(body.x + body.vx * dt, 0, CFG.W);
      body.y = clamp(body.y + body.vy * dt, 0, CFG.VIEW_H);
      if (Math.hypot(body.vx, body.vy) > 40) {
        let da = Math.atan2(body.vx, -body.vy) - body.ang;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        body.ang += da * Math.min(1, dt * 7);
      }
    }

    let rt = 0;
    function updateLegs(dt: number, curScroll: number, slideVel: number) {
      const speed = Math.hypot(body.vx, body.vy);
      legs.forEach((l) => {
        [l.hmx, l.hmy] = bodyR(l.ox, l.oy);
      });
      for (const l of legs) {
        if (!l.step) continue;
        l.u += dt / l.dur;
        if (l.u >= 1) {
          l.u = 1;
          l.step = false;
          l.fx = l.to[0];
          l.fy = l.to[1];
          l.lift = 0;
          l.base = Math.hypot(l.fx - l.hmx, l.fy - curScroll - l.hmy);
          if (l.tok) {
            l.tok.flash = 1;
            if (Math.random() < 0.3) spawnOn(l.tok, rt);
          }
        } else {
          const e = l.u * l.u * (3 - 2 * l.u);
          l.fx = lerp(l.from[0], l.to[0], e);
          l.fy = lerp(l.from[1], l.to[1], e);
          l.lift = Math.sin(Math.PI * l.u);
        }
      }
      legs.forEach((l) => {
        [l.hmx, l.hmy] = bodyR(l.ox, l.oy);
      });
      const str = (l: LegState) => Math.hypot(l.fx - l.hmx, l.fy - curScroll - l.hmy);
      legs.forEach((l) => {
        if (!l.step && str(l) > 96 && str(l) > l.base + 20) {
          startStep(l, curScroll, slideVel, speed);
        }
      });
      if (legs.some((l) => l.step)) return;
      const thr = (l: LegState) => Math.min(Math.max(STEP_THR, l.base + 16), 92);
      const need = (g: number) => legs.some((l) => l.group === g && str(l) > thr(l));
      let g = gait;
      if (!need(g) && need(1 - g)) g = 1 - g;
      if (need(g)) {
        legs.forEach((l) => {
          if (l.group === g && str(l) > thr(l) * 0.35) {
            startStep(l, curScroll, slideVel, speed);
          }
        });
        gait = 1 - g;
      }
    }

    function legKnee(
      hx: number,
      hy: number,
      fx: number,
      fy: number,
      side: number
    ): [number, number] {
      let dx = fx - hx,
        dy = fy - hy,
        d = Math.hypot(dx, dy) || 1e-3;
      const maxD = LEN1 + LEN2 - 0.5;
      if (d > maxD) {
        dx *= maxD / d;
        dy *= maxD / d;
        d = maxD;
      }
      const a = (d * d + LEN1 * LEN1 - LEN2 * LEN2) / (2 * d);
      const h = Math.sqrt(Math.max(LEN1 * LEN1 - a * a, 0));
      const ux = dx / d,
        uy = dy / d;
      const k1: [number, number] = [hx + ux * a - uy * h, hy + uy * a + ux * h];
      const k2: [number, number] = [hx + ux * a + uy * h, hy + uy * a - ux * h];
      const c = Math.cos(body.ang),
        sn = Math.sin(body.ang);
      const out = (k: [number, number]) =>
        side * ((k[0] - body.x) * c + (k[1] - body.y) * sn);
      return out(k1) > out(k2) ? k1 : k2;
    }

    function phaseColors(t: number) {
      let pi = 0;
      while (pi < CFG.phases.length - 1 && t > CFG.phases[pi][0]) pi++;
      const prev = CFG.phases[Math.max(pi - 1, 0)],
        cur = CFG.phases[pi];
      const edge = prev[1],
        e2 = cur[1],
        node = prev[2],
        n2 = cur[2];
      const k = pi === 0 ? 0 : clamp((t - (CFG.phases[pi - 1][0] - 0.35)) / 0.7, 0, 1);
      const mix = (a: string, b: string) => hex(a).map((v, i) => lerp(v, hex(b)[i], k));
      return {
        edge: mix(edge, e2).map((v) => v / 255),
        node: mix(node, n2).map((v) => v / 255),
      };
    }

    /* ---------- glitch overlays & glow ---------- */
    let gEvt = 0;
    function spawnOn(tok: WordToken, t0: number) {
      const rnd = mulberry32(CFG.seed + gEvt++ * 7919);
      const kr = rnd();
      glitches.push({
        kind: kr < 0.45 ? "box" : kr < 0.65 ? "fill" : kr < 0.85 ? "big" : "strip",
        tok,
        col: CFG.glitch[Math.floor(rnd() * CFG.glitch.length)],
        t0,
        life: 0.35 + rnd() * 0.8,
        font: ["mono", "serif", "bold"][Math.floor(rnd() * 3)],
        scale: 1.1 + rnd() * 0.9,
        ang: 0,
        len: 0,
        th: 0,
        rv: rnd(),
        x0: 0,
        y0: 0,
      });
    }

    function burst() {
      legs.forEach((l) => {
        if (l.tok) spawnOn(l.tok, rt);
      });
    }

    function updateGlow(dt: number) {
      const c = new Map<WordToken, number>();
      legs.forEach((l) => {
        if (!l.tok) return;
        const v = !l.step ? 1 : l.u > 0.6 ? ((l.u - 0.6) / 0.4) * 0.85 : 0;
        if (v > 0) c.set(l.tok, Math.max(c.get(l.tok) || 0, v));
      });
      c.forEach((v, k) => {
        k.g = Math.max(k.g, v);
        glowing.add(k);
      });
      for (const k of glowing) {
        if (!c.has(k)) k.g -= dt * 1.1;
        k.flash = Math.max(0, k.flash - dt * 2.8);
        if (k.g <= 0.01) {
          k.g = 0;
          k.el.style.color = "";
          glowing.delete(k);
          continue;
        }
        // Ultra-low latency: color switch only, offloading heavy blur shadows to GPU 2D canvas
        const q = k.g;
        const w = Math.round(lerp(185, 255, q));
        k.el.style.color = `rgb(${w},${w},255)`;
      }
    }

    function drawGlows(ctx: CanvasRenderingContext2D, curScroll: number) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const k of glowing) {
        const y = k.y - curScroll;
        if (y < -20 || y > CFG.VIEW_H + 10) continue;
        ctx.shadowColor = `rgba(${glowRGB},${0.9 * k.g})`;
        ctx.shadowBlur = 10 + 16 * k.g + 10 * k.flash;
        ctx.fillStyle = `rgba(${glowRGB},${0.1 * k.g + 0.22 * k.flash})`;
        ctx.fillRect(k.x - 2, y + 1, k.w + 4, k.h - 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(${glowRGB},${0.9 * k.g})`;
        ctx.fillRect(k.x, y + k.h - 2, k.w, 1.5);
      }
      ctx.restore();
    }

    function drawGlitches(t: number, curScroll: number) {
      const c = fxc;
      c.setTransform(renderScale, 0, 0, renderScale, 0, 0);
      c.clearRect(0, 0, CFG.W, CFG.VIEW_H);
      c.textBaseline = "middle";
      drawGlows(c, curScroll);
      for (let i = glitches.length - 1; i >= 0; i--) {
        const g = glitches[i];
        const u = (t - g.t0) / g.life;
        if (u >= 1 || u < 0) {
          if (u >= 1) glitches.splice(i, 1);
          continue;
        }
        const k = g.tok;
        const x = k.x,
          y = k.y - curScroll,
          w = k.w,
          h = k.h,
          cx = x + w / 2,
          cy = y + h / 2;
        const env = u < 0.12 ? u / 0.12 : u > 0.8 ? (1 - u) / 0.2 : 1;
        const flick = REDUCED ? 1 : Math.sin(u * 70 + g.rv * 9) > -0.65 ? 1 : 0.35;
        c.globalAlpha = clamp(env, 0, 1) * flick;
        if (g.kind === "box") {
          c.strokeStyle = g.col;
          c.lineWidth = 1.3;
          c.strokeRect(x - 2.5, y - 1, w + 5, h + 2);
        } else if (g.kind === "fill") {
          const s = 1 + (g.scale - 1) * Math.min(1, u * 5);
          c.fillStyle = g.col;
          const bw = (w + 6) * s,
            bh = (h + 4) * s;
          c.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
          c.fillStyle = "#0a0a1a";
          c.font = `${g.font === "mono" ? "" : "700 "}${Math.round(14 * s)}px ${
            g.font === "serif" ? "Georgia,serif" : "'JetBrains Mono',monospace"
          }`;
          c.textAlign = "center";
          c.fillText(k.txt.slice(0, 18), cx, cy + 1);
        } else if (g.kind === "big") {
          const s = 1 + (g.scale - 1) * 0.9;
          c.fillStyle = "#000";
          c.fillRect(x - 2, y, w + 4, h);
          c.fillStyle = g.col;
          c.textAlign = "center";
          c.font =
            g.font === "serif"
              ? `italic ${Math.round(15 * s)}px Georgia,serif`
              : g.font === "bold"
              ? `700 ${Math.round(15 * s)}px Helvetica,Arial,sans-serif`
              : `${Math.round(14 * s)}px 'JetBrains Mono',monospace`;
          c.fillText(k.txt.slice(0, 22), cx + (g.rv - 0.5) * 30, cy);
        } else if (g.kind === "ribbon") {
          const p = Math.min(1, u * 2.2),
            L = g.len * p,
            ox = g.x0,
            oy = g.y0 - curScroll;
          c.save();
          c.translate(ox, oy);
          c.rotate(g.ang - 0.6);
          c.fillStyle = g.col;
          c.fillRect(0, -g.th / 2, L, g.th);
          c.fillStyle = "rgba(0,0,0,.7)";
          c.font = "7px 'JetBrains Mono',monospace";
          c.textAlign = "left";
          c.fillText(k.txt.slice(0, 40), 6, 0);
          c.restore();
        } else {
          c.fillStyle = g.col;
          c.fillRect(x - 4, y + 2, Math.max(w + 90, 160) * Math.min(1, u * 4), h - 4);
          c.fillStyle = "rgba(0,0,0,.65)";
          c.font = "9px 'JetBrains Mono',monospace";
          c.textAlign = "left";
          c.fillText(k.txt.slice(0, 34), x, cy + 1);
        }
        c.globalAlpha = 1;
      }
    }

    /* ---------- Input & Pointer tracking ---------- */
    const ptr = {
      x: CFG.W / 2,
      y: 220,
      seen: true, // true by default so cursor and crawler are immediately visible in preview
      in: false,
    };
    let wheelImp = 0;
    let edgeV = 0;
    let rootRect = root.getBoundingClientRect();

    const updateRect = () => {
      rootRect = root.getBoundingClientRect();
    };

    const toView = (clientX: number, clientY: number) => {
      return {
        x: (clientX - rootRect.left) / stageScale,
        y: (clientY - rootRect.top) / stageScale,
      };
    };

    function aim(p: { x: number; y: number }, updateCursorNow = false) {
      ptr.x = clamp(p.x, 0, CFG.W);
      ptr.y = clamp(p.y, 0, CFG.H);
      ptr.seen = true;
      ptr.in = true;
      body.target = { x: ptr.x, y: ptr.y };
      if (updateCursorNow) {
        cursorEl.style.display = "block";
        cursorEl.style.transform = `translate3d(${ptr.x - 3}px, ${ptr.y - 2}px, 0)`;
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const p = toView(e.clientX, e.clientY);
      aim(p, true);
    };

    const onPointerEnter = (e: PointerEvent) => {
      updateRect();
      const p = toView(e.clientX, e.clientY);
      aim(p, true);
    };

    const onPointerLeave = () => {
      ptr.in = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      updateRect();
      aim(toView(e.clientX, e.clientY), true);
      burst();
    };

    const onWheel = (e: WheelEvent) => {
      wheelImp += e.deltaY / stageScale;
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = {
        ArrowUp: -120,
        ArrowDown: 120,
        PageUp: -CFG.H * 0.8,
        PageDown: CFG.H * 0.8,
      }[e.key];
      if (k) {
        wheelImp += k;
        e.preventDefault();
      }
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerenter", onPointerEnter, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave, { passive: true });
    root.addEventListener("pointerdown", onPointerDown, { passive: true });
    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    /* ---------- Resize / Fit ---------- */
    function fit() {
      updateRect();
      const vw = root.clientWidth || 720;
      const vh = root.clientHeight || 520;
      stageScale = clamp(vw / 720, 0.5, 1.4);
      CFG.W = Math.ceil(vw / stageScale);
      CFG.H = Math.ceil(vh / stageScale);
      CFG.VIEW_H = CFG.H;
      CFG.VIEW_TOP = 0;

      const px = (n: number) => n + "px";
      stage.style.width = px(CFG.W);
      stage.style.height = px(CFG.H);
      stage.style.transform = `scale(${stageScale})`;

      view.style.width = px(CFG.W);
      view.style.height = px(CFG.H);
      pageEl.style.width = px(CFG.W);

      fx.style.width = px(CFG.W);
      fx.style.height = px(CFG.H);
      glCanvas.style.width = px(CFG.W);
      glCanvas.style.height = px(CFG.H);

      renderScale = stageScale * DPR;
      fx.width = Math.round(CFG.W * renderScale);
      fx.height = Math.round(CFG.H * renderScale);

      renderer.setPixelRatio(renderScale);
      renderer.setSize(CFG.W, CFG.H, false);
      cam.left = 0;
      cam.right = CFG.W;
      cam.top = 0;
      cam.bottom = CFG.H;
      cam.updateProjectionMatrix();
    }

    const ro = new ResizeObserver(() => {
      fit();
      measure();
      scrollY = wrapLo + ((((scrollY - wrapLo) % loopP) + loopP) % loopP);
      replant(scrollY);
    });
    ro.observe(root);

    /* ---------- Main animation loop ---------- */
    let last = performance.now();
    let animFrameId = 0;
    const EDGE_MAX = 850;

    function frame(now: number) {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      rt += dt;

      // scroll calculation
      let move = 0;
      if (wheelImp) {
        const m = wheelImp * Math.min(1, dt * 9);
        wheelImp -= m;
        if (Math.abs(wheelImp) < 0.5) wheelImp = 0;
        move += m;
      }
      let ev = 0;
      if (ptr.in) {
        const zone = clamp(CFG.H * 0.24, 70, 230);
        if (body.y < zone) {
          ev = -Math.pow(1 - body.y / zone, 1.4) * EDGE_MAX;
        } else if (body.y > CFG.H - zone) {
          ev = Math.pow(1 - (CFG.H - body.y) / zone, 1.4) * EDGE_MAX;
        }
      }
      edgeV += (ev - edgeV) * Math.min(1, dt * 10);
      move += edgeV * dt;
      scrollY += move;
      wrapScroll();
      pageEl.style.transform = `translate3d(0,${-scrollY}px,0)`;

      if (prevScroll !== null) {
        const ds = scrollY - prevScroll;
        if (Math.abs(ds) > 500) {
          glitches.length = 0;
          replant(scrollY);
          sv = 0;
        } else {
          if (!ptr.in) body.y = clamp(body.y - ds, 30, CFG.H - 30);
          sv += (-ds / dt - sv) * 0.3;
        }
      }
      prevScroll = scrollY;

      updateBody(dt);
      updateLegs(dt, scrollY, sv);

      const col = phaseColors(rt % CFG.DURATION);
      glowRGB = col.edge.map((v) => Math.round(v * 255));
      updateGlow(dt);

      let vi = 0;
      const put = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        r: number,
        g: number,
        b: number
      ) => {
        for (let d = 0; d < 3; d++) {
          const o = (d - 1) * 0.75;
          linePos.set([ax, ay + o, 0, bx, by + o, 0], vi * 6);
          lineCol.set([r, g, b, r, g, b], vi * 6);
          vi++;
        }
      };

      legs.forEach((l, i) => {
        const [hx, hy] = bodyR(l.hx, l.hy),
          fxPos = l.fx,
          fyPos = l.fy - scrollY,
          k = legKnee(hx, hy, fxPos, fyPos, l.side);
        const kx = k[0] + (k[0] - body.x) * 0.08 * l.lift,
          ky = k[1] + (k[1] - body.y) * 0.08 * l.lift;
        const m = l.lift * 0.75,
          r = lerp(col.edge[0], 1, m),
          g = lerp(col.edge[1], 1, m),
          b = lerp(col.edge[2], 1, m);
        put(hx, hy, kx, ky, r, g, b);
        put(kx, ky, fxPos, fyPos, r, g, b);
        const dot = dots[i];
        dot.position.set(fxPos, fyPos, 1);
        dot.scale.setScalar(1 + 0.8 * l.lift);
        (dot.children[1] as THREE.Mesh<any, THREE.MeshBasicMaterial>).material.color.setRGB(
          lerp(col.node[0], 1, l.lift * 0.6),
          lerp(col.node[1], 1, l.lift * 0.6),
          lerp(col.node[2], 1, l.lift * 0.6)
        );
      });

      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;
      head.position.set(body.x, body.y, 5);
      head.rotation.z = body.ang;

      drawGlitches(rt, scrollY);

      if (ptr.seen && !ptr.in) {
        cursorEl.style.display = "block";
        cursorEl.style.transform = `translate3d(${ptr.x - 3}px, ${ptr.y - 2}px, 0)`;
      }

      renderer.render(scene, cam);
      animFrameId = requestAnimationFrame(frame);
    }

    /* ---------- Boot ---------- */
    fit();
    body.x = CFG.W / 2;
    body.y = Math.min(CFG.H * 0.35, 260);
    body.target = { x: ptr.x, y: ptr.y };
    measure();
    scrollY = startScroll;
    replant(scrollY);

    cursorEl.style.display = "block";
    cursorEl.style.transform = `translate(${ptr.x - 3}px, ${ptr.y - 2}px)`;

    try {
      if (animate && !REDUCED) {
        animate(view, { opacity: [0, 1] }, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
      }
    } catch {
      view.style.opacity = "1";
    }

    last = performance.now();
    animFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animFrameId);
      ro.disconnect();
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);

      lineGeo.dispose();
      dotGeo.dispose();
      ringGeo.dispose();
      headFill.geometry.dispose();
      headEdge.geometry.dispose();
      headDot.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`sc-root ${compact ? "sc-compact" : ""} ${className}`}
      style={{ cursor: "none", ...style }}
      data-preview-wheel-lock
    >
      <div ref={stageRef} className="sc-stage">
        <div ref={viewRef} className="sc-view">
          <div ref={pageRef} className="sc-page" />
          <canvas ref={fxRef} className="sc-fx" />
          <canvas ref={glRef} className="sc-gl" />
          <svg
            ref={cursorRef}
            id="cursor"
            className="sc-cursor"
            viewBox="0 0 22 22"
          >
            <path
              d="M3 2 L3 17 L7 13.2 L9.8 19.5 L12.2 18.4 L9.6 12.2 L15 12.2 Z"
              fill="#fff"
              stroke="#111"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {showDemoButton && (
        <div className="sc-demo-pill">
          <Link
            to="/demo/spider-crawler"
            className="sc-demo-pill-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Live Demo</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SpiderCrawler;
