import { useState, useEffect } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'
import { getEff } from './data'
import { useTeam } from './TeamContext'

const TYPE_COLORS = {
  normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
  grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
  ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
  rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
  steel:'#B8B8D0', fairy:'#EE99AC',
}
const TIER_COLORS = { S:'#ff2244', A:'#ff8844', B:'#ddbb00', C:'#33aaff', D:'#888888' }
const ROLE_COLORS = { Attacker:'#ff4422', Support:'#33aa33', Tank:'#aa88ff', Setter:'#4488ff' }
const ALL_TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']
const STAT_META = [
  { key:'hp',              label:'HP',    color:'#ff6666' },
  { key:'attack',         label:'ATK',   color:'#ff9944' },
  { key:'defense',        label:'DEF',   color:'#ffdd44' },
  { key:'special-attack', label:'SpATK', color:'#44aaff' },
  { key:'special-defense',label:'SpDEF', color:'#44ddaa' },
  { key:'speed',          label:'SPD',   color:'#ff66cc' },
]

function getArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

// ─── 208 POKÉMON ELEGIBLES REG M-A (fuente: ChampionsLab + Bulbapedia) ───────
const ALL_POKEMON = [
  // ── GEN 1 ──
  { name:'Venusaur',           id:3,     apiName:'venusaur',          gen:1, types:['grass','poison'],    canMega:true  },
  { name:'Charizard',          id:6,     apiName:'charizard',         gen:1, types:['fire','flying'],     canMega:true  },
  { name:'Blastoise',          id:9,     apiName:'blastoise',         gen:1, types:['water'],             canMega:true  },
  { name:'Beedrill',           id:15,    apiName:'beedrill',          gen:1, types:['bug','poison'],      canMega:true  },
  { name:'Pidgeot',            id:18,    apiName:'pidgeot',           gen:1, types:['normal','flying'],   canMega:true  },
  { name:'Arbok',              id:24,    apiName:'arbok',             gen:1, types:['poison'],            canMega:false },
  { name:'Pikachu',            id:25,    apiName:'pikachu',           gen:1, types:['electric'],          canMega:false },
  { name:'Raichu',             id:26,    apiName:'raichu',            gen:1, types:['electric'],          canMega:false },
  { name:'Alolan Raichu',      id:10100, apiName:'raichu-alola',      gen:1, types:['electric','psychic'],canMega:false },
  { name:'Clefable',           id:36,    apiName:'clefable',          gen:1, types:['fairy'],             canMega:true  },
  { name:'Ninetales',          id:38,    apiName:'ninetales',         gen:1, types:['fire'],              canMega:false },
  { name:'Alolan Ninetales',   id:10104, apiName:'ninetales-alola',   gen:1, types:['ice','fairy'],       canMega:false },
  { name:'Arcanine',           id:59,    apiName:'arcanine',          gen:1, types:['fire'],              canMega:false },
  { name:'Hisuian Arcanine',   id:10230, apiName:'arcanine-hisui',    gen:1, types:['fire','rock'],       canMega:false },
  { name:'Alakazam',           id:65,    apiName:'alakazam',          gen:1, types:['psychic'],           canMega:true  },
  { name:'Machamp',            id:68,    apiName:'machamp',           gen:1, types:['fighting'],          canMega:false },
  { name:'Victreebel',         id:71,    apiName:'victreebel',        gen:1, types:['grass','poison'],    canMega:true  },
  { name:'Slowbro',            id:80,    apiName:'slowbro',           gen:1, types:['water','psychic'],   canMega:true  },
  { name:'Galarian Slowbro',   id:10165, apiName:'slowbro-galar',     gen:1, types:['poison','psychic'],  canMega:false },
  { name:'Gengar',             id:94,    apiName:'gengar',            gen:1, types:['ghost','poison'],    canMega:true  },
  { name:'Kangaskhan',         id:115,   apiName:'kangaskhan',        gen:1, types:['normal'],            canMega:true  },
  { name:'Starmie',            id:121,   apiName:'starmie',           gen:1, types:['water','psychic'],   canMega:true  },
  { name:'Pinsir',             id:127,   apiName:'pinsir',            gen:1, types:['bug'],               canMega:true  },
  { name:'Tauros',             id:128,   apiName:'tauros',            gen:1, types:['normal'],            canMega:false },
  { name:'Tauros-Paldea',      id:10250, apiName:'tauros-paldea-combat',gen:1,types:['fighting'],         canMega:false },
  { name:'Tauros-Blaze',       id:10251, apiName:'tauros-paldea-blaze',gen:1,types:['fighting','fire'],   canMega:false },
  { name:'Tauros-Aqua',        id:10252, apiName:'tauros-paldea-aqua', gen:1,types:['fighting','water'],  canMega:false },
  { name:'Gyarados',           id:130,   apiName:'gyarados',          gen:1, types:['water','flying'],    canMega:true  },
  { name:'Ditto',              id:132,   apiName:'ditto',             gen:1, types:['normal'],            canMega:false },
  { name:'Vaporeon',           id:134,   apiName:'vaporeon',          gen:1, types:['water'],             canMega:false },
  { name:'Jolteon',            id:135,   apiName:'jolteon',           gen:1, types:['electric'],          canMega:false },
  { name:'Flareon',            id:136,   apiName:'flareon',           gen:1, types:['fire'],              canMega:false },
  { name:'Aerodactyl',         id:142,   apiName:'aerodactyl',        gen:1, types:['rock','flying'],     canMega:true  },
  { name:'Snorlax',            id:143,   apiName:'snorlax',           gen:1, types:['normal'],            canMega:false },
  { name:'Dragonite',          id:149,   apiName:'dragonite',         gen:1, types:['dragon','flying'],   canMega:true  },

  // ── GEN 2 ──
  { name:'Meganium',           id:154,   apiName:'meganium',          gen:2, types:['grass'],             canMega:true  },
  { name:'Typhlosion',         id:157,   apiName:'typhlosion',        gen:2, types:['fire'],              canMega:false },
  { name:'Hisuian Typhlosion', id:10233, apiName:'typhlosion-hisui',  gen:2, types:['fire','ghost'],      canMega:false },
  { name:'Feraligatr',         id:160,   apiName:'feraligatr',        gen:2, types:['water'],             canMega:true  },
  { name:'Ariados',            id:168,   apiName:'ariados',           gen:2, types:['bug','poison'],      canMega:false },
  { name:'Ampharos',           id:181,   apiName:'ampharos',          gen:2, types:['electric'],          canMega:true  },
  { name:'Azumarill',          id:184,   apiName:'azumarill',         gen:2, types:['water','fairy'],     canMega:false },
  { name:'Politoed',           id:186,   apiName:'politoed',          gen:2, types:['water'],             canMega:false },
  { name:'Espeon',             id:196,   apiName:'espeon',            gen:2, types:['psychic'],           canMega:false },
  { name:'Umbreon',            id:197,   apiName:'umbreon',           gen:2, types:['dark'],              canMega:false },
  { name:'Slowking',           id:199,   apiName:'slowking',          gen:2, types:['water','psychic'],   canMega:false },
  { name:'Galarian Slowking',  id:10172, apiName:'slowking-galar',    gen:2, types:['poison','psychic'],  canMega:false },
  { name:'Forretress',         id:205,   apiName:'forretress',        gen:2, types:['bug','steel'],       canMega:false },
  { name:'Steelix',            id:208,   apiName:'steelix',           gen:2, types:['steel','ground'],    canMega:true  },
  { name:'Scizor',             id:212,   apiName:'scizor',            gen:2, types:['bug','steel'],       canMega:true  },
  { name:'Heracross',          id:214,   apiName:'heracross',         gen:2, types:['bug','fighting'],    canMega:true  },
  { name:'Skarmory',           id:227,   apiName:'skarmory',          gen:2, types:['steel','flying'],    canMega:true  },
  { name:'Houndoom',           id:229,   apiName:'houndoom',          gen:2, types:['dark','fire'],       canMega:true  },
  { name:'Tyranitar',          id:248,   apiName:'tyranitar',         gen:2, types:['rock','dark'],       canMega:true  },

  // ── GEN 3 ──
  { name:'Pelipper',           id:279,   apiName:'pelipper',          gen:3, types:['water','flying'],    canMega:false },
  { name:'Gardevoir',          id:282,   apiName:'gardevoir',         gen:3, types:['psychic','fairy'],   canMega:true  },
  { name:'Sableye',            id:302,   apiName:'sableye',           gen:3, types:['dark','ghost'],      canMega:true  },
  { name:'Aggron',             id:306,   apiName:'aggron',            gen:3, types:['steel','rock'],      canMega:true  },
  { name:'Medicham',           id:308,   apiName:'medicham',          gen:3, types:['fighting','psychic'],canMega:true  },
  { name:'Manectric',          id:310,   apiName:'manectric',         gen:3, types:['electric'],          canMega:true  },
  { name:'Sharpedo',           id:319,   apiName:'sharpedo',          gen:3, types:['water','dark'],      canMega:true  },
  { name:'Camerupt',           id:323,   apiName:'camerupt',          gen:3, types:['fire','ground'],     canMega:true  },
  { name:'Torkoal',            id:324,   apiName:'torkoal',           gen:3, types:['fire'],              canMega:false },
  { name:'Altaria',            id:334,   apiName:'altaria',           gen:3, types:['dragon','flying'],   canMega:true  },
  { name:'Milotic',            id:350,   apiName:'milotic',           gen:3, types:['water'],             canMega:false },
  { name:'Castform',           id:351,   apiName:'castform',          gen:3, types:['normal'],            canMega:false },
  { name:'Banette',            id:354,   apiName:'banette',           gen:3, types:['ghost'],             canMega:true  },
  { name:'Chimecho',           id:358,   apiName:'chimecho',          gen:3, types:['psychic'],           canMega:true  },
  { name:'Absol',              id:359,   apiName:'absol',             gen:3, types:['dark'],              canMega:true  },
  { name:'Glalie',             id:362,   apiName:'glalie',            gen:3, types:['ice'],               canMega:true  },
  { name:'Salamence',          id:373,   apiName:'salamence',         gen:3, types:['dragon','flying'],   canMega:true  },

  // ── GEN 4 ──
  { name:'Torterra',           id:389,   apiName:'torterra',          gen:4, types:['grass','ground'],    canMega:false },
  { name:'Infernape',          id:392,   apiName:'infernape',         gen:4, types:['fire','fighting'],   canMega:false },
  { name:'Empoleon',           id:395,   apiName:'empoleon',          gen:4, types:['water','steel'],     canMega:false },
  { name:'Luxray',             id:405,   apiName:'luxray',            gen:4, types:['electric'],          canMega:false },
  { name:'Roserade',           id:407,   apiName:'roserade',          gen:4, types:['grass','poison'],    canMega:false },
  { name:'Rampardos',          id:409,   apiName:'rampardos',         gen:4, types:['rock'],              canMega:false },
  { name:'Bastiodon',          id:411,   apiName:'bastiodon',         gen:4, types:['rock','steel'],      canMega:false },
  { name:'Lopunny',            id:428,   apiName:'lopunny',           gen:4, types:['normal'],            canMega:true  },
  { name:'Spiritomb',          id:442,   apiName:'spiritomb',         gen:4, types:['ghost','dark'],      canMega:false },
  { name:'Garchomp',           id:445,   apiName:'garchomp',          gen:4, types:['dragon','ground'],   canMega:true  },
  { name:'Lucario',            id:448,   apiName:'lucario',           gen:4, types:['fighting','steel'],  canMega:true  },
  { name:'Hippowdon',          id:450,   apiName:'hippowdon',         gen:4, types:['ground'],            canMega:false },
  { name:'Toxicroak',          id:454,   apiName:'toxicroak',         gen:4, types:['poison','fighting'], canMega:false },
  { name:'Abomasnow',          id:460,   apiName:'abomasnow',         gen:4, types:['grass','ice'],       canMega:true  },
  { name:'Weavile',            id:461,   apiName:'weavile',           gen:4, types:['dark','ice'],        canMega:false },
  { name:'Rhyperior',          id:464,   apiName:'rhyperior',         gen:4, types:['ground','rock'],     canMega:false },
  { name:'Leafeon',            id:470,   apiName:'leafeon',           gen:4, types:['grass'],             canMega:false },
  { name:'Glaceon',            id:471,   apiName:'glaceon',           gen:4, types:['ice'],               canMega:false },
  { name:'Gliscor',            id:472,   apiName:'gliscor',           gen:4, types:['ground','flying'],   canMega:false },
  { name:'Mamoswine',          id:473,   apiName:'mamoswine',         gen:4, types:['ice','ground'],      canMega:false },
  { name:'Gallade',            id:475,   apiName:'gallade',           gen:4, types:['psychic','fighting'],canMega:true  },
  { name:'Froslass',           id:478,   apiName:'froslass',          gen:4, types:['ice','ghost'],       canMega:true  },
  { name:'Rotom',              id:479,   apiName:'rotom',             gen:4, types:['electric','ghost'],  canMega:false },
  { name:'Heat Rotom',         id:10008, apiName:'rotom-heat',        gen:4, types:['electric','fire'],   canMega:false },
  { name:'Wash Rotom',         id:10009, apiName:'rotom-wash',        gen:4, types:['electric','water'],  canMega:false },
  { name:'Frost Rotom',        id:10010, apiName:'rotom-frost',       gen:4, types:['electric','ice'],    canMega:false },
  { name:'Fan Rotom',          id:10011, apiName:'rotom-fan',         gen:4, types:['electric','flying'], canMega:false },
  { name:'Mow Rotom',          id:10012, apiName:'rotom-mow',         gen:4, types:['electric','grass'],  canMega:false },

  // ── GEN 5 ──
  { name:'Serperior',          id:497,   apiName:'serperior',         gen:5, types:['grass'],             canMega:false },
  { name:'Emboar',             id:500,   apiName:'emboar',            gen:5, types:['fire','fighting'],   canMega:true  },
  { name:'Samurott',           id:503,   apiName:'samurott',          gen:5, types:['water'],             canMega:false },
  { name:'Hisuian Samurott',   id:10236, apiName:'samurott-hisui',    gen:5, types:['water','dark'],      canMega:false },
  { name:'Watchog',            id:505,   apiName:'watchog',           gen:5, types:['normal'],            canMega:false },
  { name:'Liepard',            id:510,   apiName:'liepard',           gen:5, types:['dark'],              canMega:false },
  { name:'Simisage',           id:512,   apiName:'simisage',          gen:5, types:['grass'],             canMega:false },
  { name:'Simisear',           id:514,   apiName:'simisear',          gen:5, types:['fire'],              canMega:false },
  { name:'Simipour',           id:516,   apiName:'simipour',          gen:5, types:['water'],             canMega:false },
  { name:'Excadrill',          id:530,   apiName:'excadrill',         gen:5, types:['ground','steel'],    canMega:true  },
  { name:'Audino',             id:531,   apiName:'audino',            gen:5, types:['normal'],            canMega:true  },
  { name:'Conkeldurr',         id:534,   apiName:'conkeldurr',        gen:5, types:['fighting'],          canMega:false },
  { name:'Whimsicott',         id:547,   apiName:'whimsicott',        gen:5, types:['grass','fairy'],     canMega:false },
  { name:'Krookodile',         id:553,   apiName:'krookodile',        gen:5, types:['ground','dark'],     canMega:false },
  { name:'Cofagrigus',         id:563,   apiName:'cofagrigus',        gen:5, types:['ghost'],             canMega:false },
  { name:'Garbodor',           id:569,   apiName:'garbodor',          gen:5, types:['poison'],            canMega:false },
  { name:'Zoroark',            id:571,   apiName:'zoroark',           gen:5, types:['dark'],              canMega:false },
  { name:'Hisuian Zoroark',    id:10239, apiName:'zoroark-hisui',     gen:5, types:['normal','ghost'],    canMega:false },
  { name:'Reuniclus',          id:579,   apiName:'reuniclus',         gen:5, types:['psychic'],           canMega:false },
  { name:'Vanilluxe',          id:584,   apiName:'vanilluxe',         gen:5, types:['ice'],               canMega:false },
  { name:'Emolga',             id:587,   apiName:'emolga',            gen:5, types:['electric','flying'], canMega:false },
  { name:'Chandelure',         id:609,   apiName:'chandelure',        gen:5, types:['ghost','fire'],      canMega:true  },
  { name:'Beartic',            id:614,   apiName:'beartic',           gen:5, types:['ice'],               canMega:false },
  { name:'Stunfisk',           id:618,   apiName:'stunfisk',          gen:5, types:['ground','electric'], canMega:false },
  { name:'Galarian Stunfisk',  id:10180, apiName:'stunfisk-galar',    gen:5, types:['ground','steel'],    canMega:false },
  { name:'Golurk',             id:623,   apiName:'golurk',            gen:5, types:['ground','ghost'],    canMega:true  },
  { name:'Hydreigon',          id:635,   apiName:'hydreigon',         gen:5, types:['dark','dragon'],     canMega:false },
  { name:'Volcarona',          id:637,   apiName:'volcarona',         gen:5, types:['bug','fire'],        canMega:false },

  // ── GEN 6 ──
  { name:'Chesnaught',         id:652,   apiName:'chesnaught',        gen:6, types:['grass','fighting'],  canMega:true  },
  { name:'Delphox',            id:655,   apiName:'delphox',           gen:6, types:['fire','psychic'],    canMega:true  },
  { name:'Greninja',           id:658,   apiName:'greninja',          gen:6, types:['water','dark'],      canMega:true  },
  { name:'Diggersby',          id:660,   apiName:'diggersby',         gen:6, types:['normal','ground'],   canMega:false },
  { name:'Talonflame',         id:663,   apiName:'talonflame',        gen:6, types:['fire','flying'],     canMega:false },
  { name:'Vivillon',           id:666,   apiName:'vivillon',          gen:6, types:['bug','flying'],      canMega:false },
  { name:'Floette-Eternal',    id:670,   apiName:'floette',           gen:6, types:['fairy'],             canMega:false },
  { name:'Florges',            id:671,   apiName:'florges',           gen:6, types:['fairy'],             canMega:false },
  { name:'Pangoro',            id:675,   apiName:'pangoro',           gen:6, types:['fighting','dark'],   canMega:false },
  { name:'Furfrou',            id:676,   apiName:'furfrou',           gen:6, types:['normal'],            canMega:false },
  { name:'Meowstic-M',         id:678,   apiName:'meowstic',          gen:6, types:['psychic'],           canMega:true  },
  { name:'Meowstic-F',         id:10678, apiName:'meowstic-f',        gen:6, types:['psychic'],           canMega:true  },
  { name:'Aegislash',          id:681,   apiName:'aegislash',         gen:6, types:['steel','ghost'],     canMega:false },
  { name:'Aromatisse',         id:683,   apiName:'aromatisse',        gen:6, types:['fairy'],             canMega:false },
  { name:'Slurpuff',           id:685,   apiName:'slurpuff',          gen:6, types:['fairy'],             canMega:false },
  { name:'Clawitzer',          id:693,   apiName:'clawitzer',         gen:6, types:['water'],             canMega:false },
  { name:'Sylveon',            id:700,   apiName:'sylveon',           gen:6, types:['fairy'],             canMega:false },
  { name:'Trevenant',          id:709,   apiName:'trevenant',         gen:6, types:['ghost','grass'],     canMega:false },
  { name:'Noivern',            id:715,   apiName:'noivern',           gen:6, types:['flying','dragon'],   canMega:false },

  // ── GEN 7 ──
  { name:'Decidueye',          id:724,   apiName:'decidueye',         gen:7, types:['grass','ghost'],     canMega:false },
  { name:'Incineroar',         id:727,   apiName:'incineroar',        gen:7, types:['fire','dark'],       canMega:false },
  { name:'Primarina',          id:730,   apiName:'primarina',         gen:7, types:['water','fairy'],     canMega:false },
  { name:'Ribombee',           id:743,   apiName:'ribombee',          gen:7, types:['bug','fairy'],       canMega:false },
  { name:'Toxapex',            id:748,   apiName:'toxapex',           gen:7, types:['poison','water'],    canMega:false },
  { name:'Araquanid',          id:752,   apiName:'araquanid',         gen:7, types:['water','bug'],       canMega:false },
  { name:'Lurantis',           id:754,   apiName:'lurantis',          gen:7, types:['grass'],             canMega:false },
  { name:'Salazzle',           id:758,   apiName:'salazzle',          gen:7, types:['poison','fire'],     canMega:false },
  { name:'Bewear',             id:760,   apiName:'bewear',            gen:7, types:['normal','fighting'], canMega:false },
  { name:'Tsareena',           id:763,   apiName:'tsareena',          gen:7, types:['grass'],             canMega:false },
  { name:'Crabominable',       id:740,   apiName:'crabominable',      gen:7, types:['fighting','ice'],    canMega:false },
  { name:'Mimikyu',            id:778,   apiName:'mimikyu',           gen:7, types:['ghost','fairy'],     canMega:false },
  { name:'Kommo-o',            id:784,   apiName:'kommo-o',           gen:7, types:['dragon','fighting'], canMega:false },

  // ── GEN 8 ──
  { name:'Rillaboom',          id:812,   apiName:'rillaboom',         gen:8, types:['grass'],             canMega:false },
  { name:'Cinderace',          id:815,   apiName:'cinderace',         gen:8, types:['fire'],              canMega:false },
  { name:'Inteleon',           id:818,   apiName:'inteleon',          gen:8, types:['water'],             canMega:false },
  { name:'Polteageist',        id:855,   apiName:'polteageist',       gen:8, types:['ghost'],             canMega:false },
  { name:'Hatterene',          id:858,   apiName:'hatterene',         gen:8, types:['psychic','fairy'],   canMega:false },
  { name:'Grimmsnarl',         id:861,   apiName:'grimmsnarl',        gen:8, types:['dark','fairy'],      canMega:false },
  { name:'Obstagoon',          id:862,   apiName:'obstagoon',         gen:8, types:['dark','normal'],     canMega:false },
  { name:'Falinks',            id:870,   apiName:'falinks',           gen:8, types:['fighting'],          canMega:false },
  { name:'Eiscue',             id:873,   apiName:'eiscue',            gen:8, types:['ice'],               canMega:false },
  { name:'Indeedee',           id:876,   apiName:'indeedee',          gen:8, types:['psychic','normal'],  canMega:false },
  { name:'Corviknight',        id:879,   apiName:'corviknight',       gen:8, types:['flying','steel'],    canMega:false },
  { name:'Dracozolt',          id:880,   apiName:'dracozolt',         gen:8, types:['electric','dragon'], canMega:false },
  { name:'Arctozolt',          id:881,   apiName:'arctozolt',         gen:8, types:['electric','ice'],    canMega:false },
  { name:'Dragapult',          id:887,   apiName:'dragapult',         gen:8, types:['dragon','ghost'],    canMega:false },
  { name:'Urshifu',            id:892,   apiName:'urshifu',           gen:8, types:['fighting','dark'],   canMega:false },
  { name:'Basculegion',        id:902,   apiName:'basculegion',       gen:8, types:['water','ghost'],     canMega:false },
  { name:'Sneasler',           id:903,   apiName:'sneasler',          gen:8, types:['fighting','poison'], canMega:false },
  { name:'Overqwil',           id:904,   apiName:'overqwil',          gen:8, types:['dark','poison'],     canMega:false },

  // ── GEN 9 ──
  { name:'Meowscarada',        id:908,   apiName:'meowscarada',       gen:9, types:['grass','dark'],      canMega:false },
  { name:'Skeledirge',         id:911,   apiName:'skeledirge',        gen:9, types:['fire','ghost'],      canMega:false },
  { name:'Quaquaval',          id:914,   apiName:'quaquaval',         gen:9, types:['water','fighting'],  canMega:false },
  { name:'Maushold',           id:925,   apiName:'maushold',          gen:9, types:['normal'],            canMega:false },
  { name:'Bellibolt',          id:939,   apiName:'bellibolt',         gen:9, types:['electric'],          canMega:false },
  { name:'Armarouge',          id:936,   apiName:'armarouge',         gen:9, types:['fire','psychic'],    canMega:false },
  { name:'Ceruledge',          id:937,   apiName:'ceruledge',         gen:9, types:['fire','ghost'],      canMega:false },
  { name:'Grafaiai',           id:942,   apiName:'grafaiai',          gen:9, types:['poison','normal'],   canMega:false },
  { name:'Sinistcha',          id:948,   apiName:'sinistcha',         gen:9, types:['grass','ghost'],     canMega:false },
  { name:'Scovillain',         id:952,   apiName:'scovillain',        gen:9, types:['grass','fire'],      canMega:false },
  { name:'Espathra',           id:956,   apiName:'espathra',          gen:9, types:['psychic'],           canMega:false },
  { name:'Tinkaton',           id:959,   apiName:'tinkaton',          gen:9, types:['fairy','steel'],     canMega:false },
  { name:'Garganacl',          id:962,   apiName:'garganacl',         gen:9, types:['rock'],              canMega:false },
  { name:'Glimmora',           id:970,   apiName:'glimmora',          gen:9, types:['rock','poison'],     canMega:false },
  { name:'Cetitan',            id:975,   apiName:'cetitan',           gen:9, types:['ice'],               canMega:false },
  { name:'Dondozo',            id:977,   apiName:'dondozo',           gen:9, types:['water'],             canMega:false },
  { name:'Tatsugiri',          id:978,   apiName:'tatsugiri',         gen:9, types:['dragon','water'],    canMega:false },
  { name:'Annihilape',         id:979,   apiName:'annihilape',        gen:9, types:['fighting','ghost'],  canMega:false },
  { name:'Clodsire',           id:980,   apiName:'clodsire',          gen:9, types:['poison','ground'],   canMega:false },
  { name:'Farigiraf',          id:981,   apiName:'farigiraf',         gen:9, types:['normal','psychic'],  canMega:false },
  { name:'Kingambit',          id:983,   apiName:'kingambit',         gen:9, types:['dark','steel'],      canMega:false },
  { name:'Archaludon',         id:1018,  apiName:'archaludon',        gen:9, types:['dragon','steel'],    canMega:false },
]

// ─── DATOS COMPETITIVOS ───────────────────────────────────────────────────────
const COMPETITIVE_DATA = {
  'Sneasler':       { tier:'A', role:'Attacker',item:'White Herb / Focus Sash',ability:'Unburden / Pressure',moves:['Dire Claw','Close Combat','Fake Out','Protect'],noteES:'#1 del meta Dobles (41.77% uso). Unburden tras White Herb = el más rápido del formato. Dire Claw con probabilidad de parálisis es devastador.',noteEN:'#1 in Doubles meta (41.77% usage). Unburden after White Herb = fastest in format. Dire Claw with paralysis chance is devastating.' },
  'Garchomp':       { tier:'A', role:'Attacker',item:'Life Orb / Garchompite',ability:'Rough Skin',moves:['Earthquake','Dragon Claw','Rock Slide','Protect'],noteES:'#2 en uso (34.50%). Core ofensivo estándar. Earthquake spread + Dragon Claw cubre casi todo el meta. Tier S en Singles BSS.',noteEN:'#2 in usage (34.50%). Standard offensive core. Spread EQ + Dragon Claw covers most of meta. Tier S in Singles BSS.' },
  'Kingambit':      { tier:'A', role:'Attacker',item:'Sitrus Berry / Leftovers',ability:'Supreme Overlord',moves:['Iron Head','Kowtow Cleave','Sucker Punch','Protect'],noteES:'Supreme Overlord gana potencia con cada caída. 52.48% win rate — mejor del Tier A Dobles. Limpiador de late game imparable.',noteEN:'Supreme Overlord gains power with each KO. 52.48% win rate — best in Tier A Doubles. Unstoppable late-game cleaner.' },
  'Basculegion':    { tier:'A', role:'Attacker',item:'Life Orb / Choice Specs',ability:'Adaptability',moves:['Wave Crash','Shadow Ball','Aqua Jet','Protect'],noteES:'⬆️ Subió a Tier A. Adaptabilidad + Wave Crash en lluvia es devastador. 52.46% win rate. La amenaza emergente del meta.',noteEN:'⬆️ Moved to Tier A. Adaptability + Wave Crash in Rain is devastating. 52.46% win rate. The emerging meta threat.' },
  'Incineroar':     { tier:'B', role:'Support',item:'Sitrus Berry / Rocky Helmet',ability:'Intimidate',moves:['Fake Out','Parting Shot','Flare Blitz','Darkest Lariat'],noteES:'Mayor uso del formato Dobles (41.63%) pero win rate bajo el 50%. Imprescindible por Fake Out + Intimidate + Parting Shot.',noteEN:'Highest Doubles usage (41.63%) but below 50% win rate. Essential for Fake Out + Intimidate + Parting Shot.' },
  'Sinistcha':      { tier:'B', role:'Support',item:'Sitrus Berry / Leftovers',ability:'Hospitality',moves:['Matcha Gotcha','Rage Powder','Trick Room','Life Dew'],noteES:'Hospitality cura al compañero al entrar. Rage Powder redirige ataques. Setter de Trick Room en Dobles.',noteEN:'Hospitality heals partner on switch-in. Rage Powder redirects. Trick Room setter in Doubles.' },
  'Floette-Eternal':{ tier:'B', role:'Attacker',item:'Sitrus Berry / Life Orb',ability:'Flower Veil',moves:['Moonblast','Dazzling Gleam','Protect','Helping Hand'],noteES:'⭐ 53.56% win rate en Dobles — mejor del Tier B. SpAtk masivo con bulk sorprendente. La Floette de AZ.',noteEN:'⭐ 53.56% win rate in Doubles — best in Tier B. Massive SpAtk with surprising bulk. AZ\'s Floette.' },
  'Aerodactyl':     { tier:'C', role:'Support',item:'Focus Sash',ability:'Rock Head',moves:['Rock Slide','Tailwind','Taunt','Protect'],noteES:'Setter de Tailwind más rápido del formato (130 Speed). Rock Slide con flinch chance. Bajó de Tier B al meta adaptarse.',noteEN:'Fastest Tailwind setter (130 Speed). Rock Slide with flinch chance. Dropped from Tier B as meta adapted.' },
  'Wash Rotom':     { tier:'C', role:'Support',item:'Sitrus Berry / Leftovers',ability:'Levitate',moves:['Hydro Pump','Thunderbolt','Will-O-Wisp','Protect'],noteES:'Pivot eléctrico con Levitate — inmune a Tierra. Will-O-Wisp corta daño físico. Bajó de Tier B. Tier A- en Singles.',noteEN:'Electric pivot with Levitate — immune to Ground. Will-O-Wisp cuts physical damage. Dropped from Tier B. Tier A- in Singles.' },
  'Farigiraf':      { tier:'C', role:'Support',item:'Throat Spray / Mental Herb',ability:'Cud Chew / Armor Tail',moves:['Trick Room','Hyper Voice','Protect','Helping Hand'],noteES:'Armor Tail bloquea Fake Out — counter directo al lead Incineroar. Setter de Trick Room.',noteEN:'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Trick Room setter.' },
  'Pelipper':       { tier:'C', role:'Setter',item:'Damp Rock',ability:'Drizzle',moves:['Hurricane','Scald','Tailwind','Protect'],noteES:'Core de equipos de Lluvia con Basculegion. Hurricane 100% precisión bajo lluvia.',noteEN:'Rain team core with Basculegion. Hurricane 100% accurate in Rain.' },
  'Whimsicott':     { tier:'C', role:'Support',item:'Focus Sash / Mental Herb',ability:'Prankster',moves:['Tailwind','Moonblast','Encore','Protect'],noteES:'Win rate negativo (49.09%). Sneasler lo contrarresta duramente. Alto uso pero rendimiento decepcionante.',noteEN:'Negative win rate (49.09%). Sneasler hard counters it. High usage but disappointing performance.' },
  'Charizard':      { tier:'C', role:'Attacker',item:'Charizardite Y / Charizardite X',ability:'Drought',moves:['Heat Wave','Solar Beam','Weather Ball','Protect'],noteES:'Mega Charizard Y bajo Sol. Heat Wave spread devastador. Tier A+ en Singles BSS.',noteEN:'Mega Charizard Y under Sun. Devastating spread Heat Wave. Tier A+ in Singles BSS.' },
  'Tyranitar':      { tier:'C', role:'Setter',item:'Smooth Rock',ability:'Sand Stream',moves:['Rock Slide','Crunch','Ice Punch','Protect'],noteES:'Sand Stream invoca Arena. 600 BST. Core de Arena con Excadrill. Tier A- en Singles BSS.',noteEN:'Sand Stream summons Sandstorm. 600 BST. Sand core with Excadrill. Tier A- in Singles BSS.' },
  'Archaludon':     { tier:'C', role:'Attacker',item:'Power Herb / Assault Vest',ability:'Stamina',moves:['Electro Shot','Body Press','Flash Cannon','Protect'],noteES:'Electro Shot con Power Herb = nuke de un turno. Body Press aprovecha 130 Def. Tier A+ en Singles.',noteEN:'Electro Shot + Power Herb = one-turn nuke. Body Press leverages 130 Def. Tier A+ in Singles.' },
  'Milotic':        { tier:'C', role:'Tank',item:'Leftovers',ability:'Competitive',moves:['Scald','Ice Beam','Recover','Protect'],noteES:'Competitive convierte Intimidate en +2 SpAtk. Recover da longevidad enorme. Muro especial.',noteEN:'Competitive turns Intimidate into +2 SpAtk. Recover gives massive longevity. Special wall.' },
  'Froslass':       { tier:'C', role:'Setter',item:'Focus Sash / Icy Rock',ability:'Snow Warning',moves:['Blizzard','Shadow Ball','Tailwind','Protect'],noteES:'Snow Warning invoca Nieve. Blizzard 100% precisión bajo Nieve. El meta de Nieve se adaptó.',noteEN:'Snow Warning summons Snow. Blizzard 100% in Snow. The Snow meta has adapted.' },
  'Corviknight':    { tier:'C', role:'Tank',item:'Rocky Helmet / Leftovers',ability:'Mirror Armor',moves:['Brave Bird','Iron Head','Roost','Body Press'],noteES:'Mirror Armor rebota bajadas de stats. Tier S en Singles BSS — el mejor muro físico del formato.',noteEN:'Mirror Armor bounces stat drops. Tier S in Singles BSS — best physical wall in the format.' },
  'Talonflame':     { tier:'C', role:'Support',item:'Focus Sash',ability:'Gale Wings',moves:['Tailwind','Brave Bird','Flare Blitz','Protect'],noteES:'Gale Wings da prioridad a Tailwind. Setter sacrificio rápido y fiable.',noteEN:'Gale Wings gives Tailwind priority. Fast and reliable sacrifice setter.' },
  'Delphox':        { tier:'C', role:'Attacker',item:'Life Orb / Choice Specs',ability:'Magician',moves:['Psychic','Fire Blast','Shadow Ball','Protect'],noteES:'⭐ GEM — 6.94% uso para 52.25% win rate. Magician roba objetos al atacar.',noteEN:'⭐ GEM — 6.94% usage for 52.25% win rate. Magician steals items on attack.' },
  'Excadrill':      { tier:'C', role:'Attacker',item:'Life Orb / Choice Scarf',ability:'Sand Rush / Mold Breaker',moves:['Earthquake','Iron Head','Rock Slide','Protect'],noteES:'Sand Rush dobla Speed bajo Arena. Mold Breaker ignora Levitate. Tier B+ en Singles.',noteEN:'Sand Rush doubles Speed under Sand. Mold Breaker ignores Levitate. Tier B+ in Singles.' },
  'Gardevoir':      { tier:'C', role:'Support',item:'Sitrus Berry',ability:'Trace',moves:['Moonblast','Psyshock','Trick Room','Protect'],noteES:'Trace copia habilidades del rival. Setter de Trick Room. Mega Gardevoir Tier B- en Singles.',noteEN:'Trace copies rival abilities. Trick Room setter. Mega Gardevoir Tier B- in Singles.' },
  'Primarina':      { tier:'C', role:'Attacker',item:'Choice Specs',ability:'Liquid Voice',moves:['Hyper Voice','Moonblast','Ice Beam','Calm Mind'],noteES:'Liquid Voice convierte Hyper Voice en Agua. Tier S en Singles BSS.',noteEN:'Liquid Voice turns Hyper Voice into Water. Tier S in Singles BSS.' },
  'Azumarill':      { tier:'C', role:'Attacker',item:'Sitrus Berry',ability:'Huge Power',moves:['Aqua Jet','Play Rough','Belly Drum','Protect'],noteES:'⭐ GEM — 54.45% win rate con 1% uso. Huge Power dobla el Ataque efectivo. Aqua Jet prioridad.',noteEN:'⭐ GEM — 54.45% win rate with 1% usage. Huge Power doubles effective Attack. Aqua Jet priority.' },
  'Venusaur':       { tier:'D', role:'Tank',item:'Venusaurite',ability:'Chlorophyll / Thick Fat',moves:['Sludge Bomb','Energy Ball','Sleep Powder','Protect'],noteES:'Mega Venusaur con Thick Fat en Dobles. Sleep Powder permite KOs gratuitos. Tier A+ en Singles.',noteEN:'Mega Venusaur with Thick Fat in Doubles. Sleep Powder enables free KOs. Tier A+ in Singles.' },
  'Dragonite':      { tier:'D', role:'Attacker',item:'Dragoninite / Lum Berry',ability:'Multiscale',moves:['Extreme Speed','Dragon Claw','Thunder Wave','Fire Punch'],noteES:'Multiscale aguanta el primer golpe. Extreme Speed +2 prioridad. Tier A- en Singles BSS.',noteEN:'Multiscale tanks the first hit. Extreme Speed +2 priority. Tier A- in Singles BSS.' },
  'Gengar':         { tier:'D', role:'Attacker',item:'Gengarite / Life Orb',ability:'Cursed Body / Shadow Tag',moves:['Shadow Ball','Sludge Bomb','Dazzling Gleam','Taunt'],noteES:'Mega Gengar Shadow Tag Tier A+ en Singles. Sin Mega, Cursed Body en Dobles.',noteEN:'Mega Gengar Shadow Tag is Tier A+ in Singles. Without Mega, Cursed Body in Doubles.' },
  'Meganium':       { tier:'D', role:'Support',item:'Meganiumite',ability:'Mega Sol',moves:['Giga Drain','Aromatherapy','Helping Hand','Protect'],noteES:'🆕 Mega Meganium con Mega Sol da ventajas del Sol sin cambiar el clima. Mecánica única de Champions.',noteEN:'🆕 Mega Meganium with Mega Sol gives Sun perks without changing weather. Unique Champions mechanic.' },
  'Aegislash':      { tier:'D', role:'Attacker',item:'Weakness Policy',ability:'Stance Change',moves:['Shadow Ball','Iron Head','King\'s Shield','Wide Guard'],noteES:'Stance Change: 150 Atk/SpAtk o 150 Def/SpDef. Wide Guard bloquea spread. Tier A en Singles.',noteEN:'Stance Change: 150 Atk/SpAtk or 150 Def/SpDef. Wide Guard blocks spread. Tier A in Singles.' },
  'Maushold':       { tier:'D', role:'Attacker',item:'Focus Sash',ability:'Technician / Tidy Up',moves:['Population Bomb','Tidy Up','Follow Me','Protect'],noteES:'🆕 Tidy Up limpia hazards y sube stats. Population Bomb puede golpear 2-10 veces.',noteEN:'🆕 Tidy Up clears hazards and boosts stats. Population Bomb can hit 2-10 times.' },
  'Torkoal':        { tier:'D', role:'Setter',item:'Heat Rock',ability:'Drought',moves:['Heat Wave','Earth Power','Yawn','Protect'],noteES:'Drought invoca Sol. Core con Charizard Y. 20 base Speed es un lastre fuera de Trick Room.',noteEN:'Drought summons Sun. Core with Charizard Y. 20 base Speed is a liability outside Trick Room.' },
  'Scizor':         { tier:'D', role:'Attacker',item:'Scizorite',ability:'Technician',moves:['Bullet Punch','U-turn','Knock Off','Swords Dance'],noteES:'Mega Scizor con Technician potencia Bullet Punch STAB. Tier A en Singles BSS.',noteEN:'Mega Scizor with Technician boosts STAB Bullet Punch. Tier A in Singles BSS.' },
  'Blastoise':      { tier:'D', role:'Tank',item:'Blastoisinite',ability:'Mega Launcher',moves:['Water Pulse','Dark Pulse','Aura Sphere','Protect'],noteES:'🆕 Mega Launcher potencia moves de pulso +50%. 51.89% win rate prometedor.',noteEN:'🆕 Mega Launcher boosts pulse moves +50%. Promising 51.89% win rate.' },
  'Kangaskhan':     { tier:'D', role:'Attacker',item:'Kangaskhanite',ability:'Parental Bond',moves:['Return','Earthquake','Sucker Punch','Power-Up Punch'],noteES:'Parental Bond golpea dos veces. Legendaria en VGC Gen6. Tier B en Singles BSS.',noteEN:'Parental Bond hits twice. Legendary in Gen6 VGC. Tier B in Singles BSS.' },
  'Hippowdon':      { tier:'A', role:'Tank',item:'Leftovers',ability:'Sand Stream',moves:['Earthquake','Slack Off','Stealth Rock','Stone Edge'],noteES:'Tier A en Singles BSS. Muro físico top con Slack Off. Sand Stream invoca Arena pasiva.',noteEN:'Tier A in Singles BSS. Top physical wall with Slack Off. Sand Stream summons passive Sand.' },
  'Meowscarada':    { tier:'A', role:'Attacker',item:'Choice Scarf / Focus Sash',ability:'Overgrow / Protean',moves:['Flower Trick','Knock Off','Play Rough','U-turn'],noteES:'Tier A+ en Singles BSS. Flower Trick siempre critica. Protean cambia tipo. 123 base Speed.',noteEN:'Tier A+ in Singles BSS. Flower Trick always crits. Protean changes type. 123 base Speed.' },
  'Lopunny':        { tier:'A', role:'Attacker',item:'Lopunnite',ability:'Scrappy',moves:['Return','High Jump Kick','Ice Punch','Fake Out'],noteES:'Tier A+ en Singles BSS. Scrappy golpea Fantasma con Normal. Mega: 136 Atk / 135 Speed.',noteEN:'Tier A+ in Singles BSS. Scrappy hits Ghosts with Normal. Mega: 136 Atk / 135 Speed.' },
  'Victreebel':     { tier:'A', role:'Attacker',item:'Victreebellite',ability:'Chlorophyll',moves:['Power Whip','Sludge Bomb','Sleep Powder','Sucker Punch'],noteES:'Tier A en Singles BSS. Chlorophyll dobla Speed bajo Sol. Sleep Powder KOs gratuitos.',noteEN:'Tier A in Singles BSS. Chlorophyll doubles Speed under Sun. Sleep Powder free KOs.' },
  'Hydreigon':      { tier:'B', role:'Attacker',item:'Choice Scarf / Choice Specs',ability:'Levitate',moves:['Draco Meteor','Dark Pulse','Fire Blast','U-turn'],noteES:'Tier A- en Singles BSS. Levitate inmune a Tierra. Draco Meteor con Specs devastador.',noteEN:'Tier A- in Singles BSS. Levitate immune to Ground. Draco Meteor with Specs devastating.' },
  'Mimikyu':        { tier:'B', role:'Attacker',item:'Life Orb',ability:'Disguise',moves:['Play Rough','Shadow Sneak','Swords Dance','Shadow Claw'],noteES:'Tier A- en Singles BSS. Disguise garantiza turno gratuito de setup. Swords Dance + Disguise devastador.',noteEN:'Tier A- in Singles BSS. Disguise guarantees free setup turn. Swords Dance + Disguise devastating.' },
  'Sylveon':        { tier:'B', role:'Tank',item:'Sitrus Berry / Leftovers',ability:'Pixilate',moves:['Hyper Voice','Moonblast','Calm Mind','Wish'],noteES:'Tier A- en Singles BSS. Pixilate convierte Hyper Voice en Hada potenciada. Muro especial.',noteEN:'Tier A- in Singles BSS. Pixilate turns Hyper Voice into boosted Fairy. Special wall.' },
  'Umbreon':        { tier:'B', role:'Tank',item:'Leftovers',ability:'Synchronize',moves:['Foul Play','Moonlight','Wish','Toxic'],noteES:'Tier A- en Singles BSS. Synchronize propaga status. Foul Play usa el Atk rival en su contra.',noteEN:'Tier A- in Singles BSS. Synchronize spreads status. Foul Play uses rival\'s Attack against them.' },
  'Glimmora':       { tier:'B', role:'Attacker',item:'Power Herb / Focus Sash',ability:'Toxic Debris',moves:['Sludge Bomb','Power Gem','Earth Power','Spikes'],noteES:'Tier B+ en Singles BSS. Toxic Debris pone Púas Tóxicas cuando lo golpean con físicos.',noteEN:'Tier B+ in Singles BSS. Toxic Debris sets Toxic Spikes when hit with physical moves.' },
  'Volcarona':      { tier:'B', role:'Attacker',item:'Sitrus Berry / Lum Berry',ability:'Flame Body',moves:['Quiver Dance','Fire Blast','Bug Buzz','Giga Drain'],noteES:'Tier B en Singles BSS. Quiver Dance eleva SpAtk, SpDef y Speed simultáneamente.',noteEN:'Tier B in Singles BSS. Quiver Dance raises SpAtk, SpDef and Speed simultaneously.' },
  'Snorlax':        { tier:'B', role:'Tank',item:'Leftovers',ability:'Thick Fat',moves:['Body Slam','Earthquake','Rest','Sleep Talk'],noteES:'Tier B en Singles BSS. 160 base HP — el mayor del formato. Thick Fat reduce Fuego e Hielo.',noteEN:'Tier B in Singles BSS. 160 base HP — highest in format. Thick Fat reduces Fire and Ice.' },
  'Espathra':       { tier:'B', role:'Attacker',item:'Sitrus Berry / Lum Berry',ability:'Speed Boost',moves:['Lumina Crash','Dazzling Gleam','Calm Mind','Protect'],noteES:'Tier B- en Singles BSS. Speed Boost aumenta Speed cada turno. Lumina Crash baja SpDef 2 niveles.',noteEN:'Tier B- in Singles BSS. Speed Boost increases Speed every turn. Lumina Crash lowers SpDef 2 stages.' },
}

// ─── COMPONENTE CARD ──────────────────────────────────────────────────────────
function PokemonCard({ pokemon, isSelected, onClick }) {
  const compData = COMPETITIVE_DATA[pokemon.name]
  const primaryColor = TYPE_COLORS[pokemon.types[0]] || '#888'
  const tierColor = compData ? TIER_COLORS[compData.tier] : null

  return (
    <button onClick={onClick}
      className="relative rounded-xl border overflow-hidden transition-all duration-200 text-left group"
      style={{
        borderColor: isSelected ? primaryColor : 'rgba(255,255,255,0.05)',
        background: isSelected ? `linear-gradient(135deg, ${primaryColor}15 0%, #0c1015 100%)` : '#0c1015',
        boxShadow: isSelected ? `0 0 20px ${primaryColor}35` : 'none',
        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
      }}>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${primaryColor}18 0%, transparent 70%)` }} />

      {tierColor && (
        <div className="absolute top-1.5 right-1.5 z-10 font-orbitron font-black flex items-center justify-center rounded"
          style={{ color: tierColor, background: `${tierColor}22`, border: `1px solid ${tierColor}44`, fontSize: '8px', width: '16px', height: '16px' }}>
          {compData.tier}
        </div>
      )}
      {pokemon.canMega && (
        <div className="absolute top-1.5 left-1.5 z-10 font-orbitron font-black rounded px-1"
          style={{ background: 'rgba(240,192,64,0.15)', color: '#f0c040', border: '1px solid rgba(240,192,64,0.3)', fontSize: '6px', lineHeight: '12px' }}>
          M
        </div>
      )}

      <div className="pt-2 pb-0.5 px-1.5 flex justify-center relative">
        <div className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(ellipse at 50% 80%, ${primaryColor}50 0%, transparent 65%)` }} />
        <img src={getArtworkUrl(pokemon.id)} alt={pokemon.name}
          className="w-14 h-14 object-contain relative z-10 transition-transform duration-200 group-hover:scale-110 drop-shadow-md"
          onError={e => { e.target.style.display = 'none' }} />
      </div>

      <div className="px-1.5 pb-2">
        <p className="font-orbitron text-white truncate mb-0.5 leading-tight" style={{ fontSize: '9px', fontWeight: 700 }}>{pokemon.name}</p>
        <div className="flex gap-0.5 flex-wrap">
          {pokemon.types.map(type => {
            const color = TYPE_COLORS[type]
            return (
              <span key={type} className="font-mono-tech rounded capitalize"
                style={{ background: `${color}25`, color, border: `1px solid ${color}40`, fontSize: '7px', padding: '1px 3px' }}>
                {type}
              </span>
            )
          })}
        </div>
      </div>
    </button>
  )
}

// ─── BARRA DE STAT ────────────────────────────────────────────────────────────
function StatBar({ label, value, color, animate }) {
  const pct = Math.min(100, (value / 180) * 100)
  const valColor = value >= 120 ? '#44ff88' : value >= 90 ? '#ffdd44' : value >= 60 ? '#ffffff' : '#ff6666'
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono-tech text-xs text-[#4a6070] w-12 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#111820] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: animate ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <span className="font-orbitron text-xs font-bold w-8 flex-shrink-0" style={{ color: valColor }}>{value}</span>
    </div>
  )
}

// ─── PANEL DETALLE ────────────────────────────────────────────────────────────
function PokemonDetail({ pokemon, compData, stats, loadingStats, lang, onClose, onAddToTeam }) {
  const [animated, setAnimated] = useState(false)
  const primaryColor = TYPE_COLORS[pokemon.types[0]] || '#888'
  const tierColor = compData ? TIER_COLORS[compData.tier] : null

  useEffect(() => {
    setAnimated(false)
    if (stats) setTimeout(() => setAnimated(true), 100)
  }, [pokemon.name, stats])

  const bst = stats ? Object.values(stats).reduce((a, b) => a + b, 0) : null
  const weakTo  = ALL_TYPES.filter(t => getEff(t, pokemon.types) >= 2).map(t => ({ type: t, mult: getEff(t, pokemon.types) }))
  const resistTo = ALL_TYPES.filter(t => { const e = getEff(t, pokemon.types); return e > 0 && e < 1 })
  const immuneTo = ALL_TYPES.filter(t => getEff(t, pokemon.types) === 0)

  return (
    <div className="bg-[#0c1015] border rounded-2xl overflow-hidden"
      style={{ borderColor: `${primaryColor}30`, boxShadow: `0 0 40px ${primaryColor}12` }}>

      <div className="relative overflow-hidden px-5 pt-5 pb-4 border-b"
        style={{ borderColor: `${primaryColor}20`, background: `linear-gradient(135deg, ${primaryColor}12 0%, #0c1015 100%)` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 75% 50%, ${primaryColor}18 0%, transparent 60%)` }} />
        <div className="flex items-start gap-4 relative z-10">
          <img src={getArtworkUrl(pokemon.id)} alt={pokemon.name}
            className="w-24 h-24 object-contain drop-shadow-2xl flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-orbitron text-xl font-black text-white">{pokemon.name}</span>
              {compData && (
                <span className="font-orbitron text-xs font-black px-2 py-0.5 rounded-lg"
                  style={{ color: tierColor, background: `${tierColor}20`, border: `1px solid ${tierColor}40` }}>
                  Tier {compData.tier}
                </span>
              )}
              {!compData && <span className="font-mono-tech text-xs px-2 py-0.5 rounded-lg text-[#4a6070] bg-[#111820] border border-[#1c2830]">{lang === 'es' ? 'Sin datos meta' : 'No meta data'}</span>}
            </div>
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {pokemon.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {compData && <span className="font-mono-tech text-xs px-2 py-0.5 rounded" style={{ color: ROLE_COLORS[compData.role], background: `${ROLE_COLORS[compData.role]}22` }}>{compData.role}</span>}
              {pokemon.canMega && <span className="font-mono-tech text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">Mega ✓</span>}
              <span className="font-mono-tech text-xs text-[#4a6070]">Gen {pokemon.gen}</span>
              {bst && <span className="font-mono-tech text-xs text-[#4a6070]">BST {bst}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-[#4a6070] hover:text-white transition-colors text-xl flex-shrink-0">×</button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {/* Stats */}
        <div>
          <p className="font-orbitron text-xs font-bold text-[#4a6070] tracking-widest mb-3">BASE STATS</p>
          {loadingStats ? (
            <div className="flex items-center gap-2 py-4 justify-center">
              <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
              <span className="font-mono-tech text-xs text-[#4a6070]">{lang === 'es' ? 'Cargando...' : 'Loading...'}</span>
            </div>
          ) : stats ? (
            <div className="flex flex-col gap-2">
              {STAT_META.map(s => <StatBar key={s.key} label={s.label} value={stats[s.key] || 0} color={s.color} animate={animated} />)}
            </div>
          ) : <p className="font-mono-tech text-xs text-[#4a6070] text-center py-2">—</p>}
        </div>

        {/* Set competitivo */}
        {compData && (
          <div>
            <p className="font-orbitron text-xs font-bold text-[#4a6070] tracking-widest mb-3">{lang === 'es' ? 'SET COMPETITIVO' : 'COMPETITIVE SET'}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-[#111820] rounded-xl px-3 py-2.5">
                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'OBJETO' : 'ITEM'}</p>
                <p className="text-xs text-white font-semibold">{compData.item}</p>
              </div>
              <div className="bg-[#111820] rounded-xl px-3 py-2.5">
                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'HABILIDAD' : 'ABILITY'}</p>
                <p className="text-xs text-white font-semibold">{compData.ability}</p>
              </div>
            </div>
            <div className="bg-[#111820] rounded-xl px-3 py-2.5 mb-2">
              <p className="font-mono-tech text-xs text-[#4a6070] mb-2">{lang === 'es' ? 'MOVIMIENTOS' : 'MOVES'}</p>
              <div className="flex flex-wrap gap-1.5">
                {compData.moves.map(m => (
                  <span key={m} className="font-mono-tech text-xs px-2 py-1 rounded-lg border"
                    style={{ color: primaryColor, borderColor: `${primaryColor}30`, background: `${primaryColor}10` }}>{m}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#111820] rounded-xl p-3 border" style={{ borderColor: `${primaryColor}12` }}>
              <p className="font-mono-tech text-xs text-[#4a6070] mb-1.5">💡 {lang === 'es' ? 'ANÁLISIS' : 'ANALYSIS'}</p>
              <p className="text-xs text-[#8899aa] leading-relaxed">{lang === 'es' ? compData.noteES : compData.noteEN}</p>
            </div>
          </div>
        )}

        {/* Matchups */}
        <div>
          <p className="font-orbitron text-xs font-bold text-[#4a6070] tracking-widest mb-3">{lang === 'es' ? 'MATCHUPS DE TIPO' : 'TYPE MATCHUPS'}</p>
          <div className="flex flex-col gap-2">
            {weakTo.length > 0 && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-xl px-3 py-2.5">
                <p className="font-mono-tech text-xs text-red-400 mb-2">{lang === 'es' ? 'DÉBIL A' : 'WEAK TO'}</p>
                <div className="flex gap-1 flex-wrap">
                  {weakTo.map(({ type, mult }) => (
                    <div key={type} className="flex items-center gap-1">
                      <TypeBadge type={type} size="sm" />
                      {mult >= 4 && <span className="font-mono-tech text-xs text-red-400 font-bold">×4</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resistTo.length > 0 && (
              <div className="bg-green-950/20 border border-green-900/30 rounded-xl px-3 py-2.5">
                <p className="font-mono-tech text-xs text-green-400 mb-2">{lang === 'es' ? 'RESISTE' : 'RESISTS'}</p>
                <div className="flex gap-1 flex-wrap">{resistTo.map(t => <TypeBadge key={t} type={t} size="sm" />)}</div>
              </div>
            )}
            {immuneTo.length > 0 && (
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl px-3 py-2.5">
                <p className="font-mono-tech text-xs text-blue-400 mb-2">{lang === 'es' ? 'INMUNE A' : 'IMMUNE TO'}</p>
                <div className="flex gap-1 flex-wrap">{immuneTo.map(t => <TypeBadge key={t} type={t} size="sm" />)}</div>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => onAddToTeam(pokemon)}
          className="w-full py-3 rounded-xl font-orbitron text-sm font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-100"
          style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}40`, color: primaryColor, boxShadow: `0 0 20px ${primaryColor}12` }}>
          {lang === 'es' ? '➕ Añadir a mi equipo' : '➕ Add to my team'}
        </button>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Pokedex() {
  const { lang } = useLang()
  const { addPokemon } = useTeam()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(null)
  const [tierFilter, setTierFilter] = useState('All')
  const [genFilter, setGenFilter] = useState('All')
  const [megaFilter, setMegaFilter] = useState(false)
  const [selected, setSelected] = useState(null)
  const [statsCache, setStatsCache] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)
  const [added, setAdded] = useState(null)

  async function fetchStats(pokemon) {
    if (statsCache[pokemon.apiName]) return
    setLoadingStats(true)
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.apiName}`)
      const data = await res.json()
      const stats = {}
      data.stats.forEach(s => { stats[s.stat.name] = s.base_stat })
      setStatsCache(prev => ({ ...prev, [pokemon.apiName]: stats }))
    } catch (e) { console.error(e) }
    finally { setLoadingStats(false) }
  }

  function handleSelect(pokemon) {
    if (selected?.name === pokemon.name) { setSelected(null); return }
    setSelected(pokemon)
    fetchStats(pokemon)
  }

  function handleAddToTeam(pokemon) {
    addPokemon({ name: pokemon.name, types: pokemon.types, spriteId: pokemon.id })
    setAdded(pokemon.name)
    setTimeout(() => setAdded(null), 2000)
  }

  const filtered = ALL_POKEMON.filter(p => {
    const compData = COMPETITIVE_DATA[p.name]
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || p.types.includes(typeFilter)
    const matchTier = tierFilter === 'All' || (compData && compData.tier === tierFilter)
    const matchGen = genFilter === 'All' || p.gen === parseInt(genFilter)
    const matchMega = !megaFilter || p.canMega
    return matchSearch && matchType && matchTier && matchGen && matchMega
  })

  const metaCount = ALL_POKEMON.filter(p => COMPETITIVE_DATA[p.name]).length

  return (
    <div>
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold text-yellow-400 tracking-widest mb-1">POKÉDEX COMPETITIVA · REGULACIÓN M-A</p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {ALL_POKEMON.length} {lang === 'es' ? 'Pokémon elegibles' : 'eligible Pokémon'} · {metaCount} {lang === 'es' ? 'con análisis competitivo' : 'with competitive analysis'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">Reg M-A · Jun 2026</span>
        </div>
      </div>

      {added && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900/90 border border-green-500/40 rounded-xl px-5 py-3 font-orbitron text-sm text-green-400 font-bold shadow-2xl backdrop-blur-sm">
          ✅ {added} {lang === 'es' ? 'añadido al equipo' : 'added to team'}
        </div>
      )}

      <div className="mb-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'es' ? '🔍 Buscar Pokémon...' : '🔍 Search Pokémon...'}
          className="w-full bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm" />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {['All','S','A','B','C','D'].map(tier => (
          <button key={tier} onClick={() => setTierFilter(tier)}
            className="px-2.5 py-1 rounded-lg font-orbitron text-xs font-bold transition-all border"
            style={tierFilter === tier
              ? { color: tier === 'All' ? '#f0c040' : TIER_COLORS[tier], borderColor: tier === 'All' ? 'rgba(240,192,64,0.4)' : `${TIER_COLORS[tier]}60`, background: tier === 'All' ? 'rgba(240,192,64,0.1)' : `${TIER_COLORS[tier]}20` }
              : { color: '#4a6070', borderColor: '#1c2830', background: '#0c1015' }}>
            {tier === 'All' ? (lang === 'es' ? 'Todos' : 'All') : `T${tier}`}
          </button>
        ))}
        <div className="w-px bg-[#1c2830]" />
        {['All','1','2','3','4','5','6','7','8','9'].map(g => (
          <button key={g} onClick={() => setGenFilter(g)}
            className="px-2 py-1 rounded font-mono-tech text-xs transition-all border"
            style={genFilter === g
              ? { color: '#f0c040', borderColor: 'rgba(240,192,64,0.4)', background: 'rgba(240,192,64,0.1)' }
              : { color: '#4a6070', borderColor: '#1c2830', background: '#0c1015' }}>
            {g === 'All' ? 'G' : `G${g}`}
          </button>
        ))}
        <div className="w-px bg-[#1c2830]" />
        <button onClick={() => setMegaFilter(m => !m)}
          className="px-2 py-1 rounded font-mono-tech text-xs transition-all border"
          style={megaFilter ? { color: '#f0c040', borderColor: 'rgba(240,192,64,0.4)', background: 'rgba(240,192,64,0.1)' } : { color: '#4a6070', borderColor: '#1c2830', background: '#0c1015' }}>
          MEGA
        </button>
      </div>

      <div className="flex gap-1 flex-wrap mb-4">
        <button onClick={() => setTypeFilter(null)}
          className={`px-2 py-0.5 rounded font-mono-tech transition-all border ${!typeFilter ? 'border-yellow-400/30 text-yellow-400 bg-yellow-400/10' : 'border-[#1c2830] text-[#4a6070]'}`}
          style={{ fontSize: '10px' }}>
          {lang === 'es' ? 'Tipo' : 'Type'}
        </button>
        {ALL_TYPES.map(type => {
          const color = TYPE_COLORS[type]
          const isActive = typeFilter === type
          return (
            <button key={type} onClick={() => setTypeFilter(isActive ? null : type)}
              className="rounded font-mono-tech capitalize transition-all border"
              style={{ fontSize: '10px', padding: '2px 5px', color: isActive ? color : '#4a6070', borderColor: isActive ? `${color}60` : '#1c2830', background: isActive ? `${color}20` : '#0c1015' }}>
              {type}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className={`${selected ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
          <p className="font-mono-tech text-xs text-[#2a3840] mb-3">
            {filtered.length} Pokémon · {lang === 'es' ? 'Clic para detalles' : 'Click for details'}
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-mono-tech text-[#4a6070] text-sm">{lang === 'es' ? 'No se encontraron Pokémon' : 'No Pokémon found'}</p>
            </div>
          ) : (
            <div className={`grid gap-2 ${selected ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8'}`}>
              {filtered.map(p => (
                <PokemonCard key={`${p.name}`} pokemon={p}
                  isSelected={selected?.name === p.name}
                  onClick={() => handleSelect(p)} />
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="lg:w-1/2 lg:sticky lg:top-4 lg:self-start">
            <PokemonDetail
              pokemon={selected}
              compData={COMPETITIVE_DATA[selected.name]}
              stats={statsCache[selected.apiName]}
              loadingStats={loadingStats}
              lang={lang}
              onClose={() => setSelected(null)}
              onAddToTeam={handleAddToTeam}
            />
          </div>
        )}
      </div>
    </div>
  )
}