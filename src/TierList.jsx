import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

// ─── DOBLES — showdowntier.com 04/17/2026 · 50.930 batallas · Rating medio 1215
const DOUBLES_TIERS = [
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Tier A — Core del meta', labelEN: 'Tier A — Meta Core',
    pokemon: [
      {
        name: 'Sneasler', types: ['fighting','poison'], usage: '39.32%', wr: '51.82%', role: 'Attacker',
        item: 'White Herb / Focus Sash', ability: 'Unburden / Pressure',
        moves: ['Dire Claw','Close Combat','Fake Out','Protect'],
        noteES: '#1 en el meta. Unburden tras consumir White Herb lo convierte en el atacante más rápido del formato. Dire Claw es su move más peligroso por la probabilidad de parálisis.',
        noteEN: '#1 in meta. Unburden after White Herb makes it the fastest attacker. Dire Claw is its most dangerous move due to paralysis chance.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'], usage: '35.20%', wr: '51.59%', role: 'Attacker',
        item: 'Life Orb / Clear Amulet / Garchompite', ability: 'Rough Skin',
        moves: ['Earthquake','Dragon Claw','Rock Slide','Protect'],
        noteES: '#2 en uso. Earthquake spread + cobertura Dragon. Garchompite disponible para build Mega. Core ofensivo estándar en casi todos los equipos.',
        noteEN: '#2 in usage. Spread Earthquake + Dragon coverage. Garchompite option for Mega build. Standard offensive core in almost every team.',
      },
      {
        name: 'Kingambit', types: ['dark','steel'], usage: '22.51%', wr: '52.46%', role: 'Attacker',
        item: 'Sitrus Berry / Leftovers', ability: 'Supreme Overlord',
        moves: ['Iron Head','Kowtow Cleave','Sucker Punch','Protect'],
        noteES: 'Supreme Overlord gana potencia con cada compañero caído. Mejor win rate del Tier A. Limpiador de late game imparable.',
        noteEN: 'Supreme Overlord gains power with each fallen teammate. Best win rate in Tier A. Unstoppable late-game cleaner.',
      },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Tier B — Viables y frecuentes', labelEN: 'Tier B — Viable & Common',
    pokemon: [
      {
        name: 'Incineroar', types: ['fire','dark'], usage: '47.55%', wr: '49.81%', role: 'Support',
        item: 'Sitrus Berry / Rocky Helmet', ability: 'Intimidate',
        moves: ['Fake Out','Parting Shot','Flare Blitz','Darkest Lariat'],
        noteES: 'Mayor uso del formato (47.55%) pero win rate bajo el 50% — el meta se adaptó. Sigue siendo imprescindible por Fake Out + Intimidate + Parting Shot.',
        noteEN: 'Highest usage (47.55%) but below 50% win rate — meta adapted. Still essential for Fake Out + Intimidate + Parting Shot.',
      },
      {
        name: 'Sinistcha', types: ['grass','ghost'], usage: '31.19%', wr: '50.57%', role: 'Support',
        item: 'Sitrus Berry / Leftovers / Occa Berry', ability: 'Hospitality',
        moves: ['Matcha Gotcha','Rage Powder','Trick Room','Life Dew'],
        noteES: 'Support imprescindible. Hospitality cura al compañero al entrar. Rage Powder redirige. Versátil — también puede ser setter de Trick Room.',
        noteEN: 'Essential support. Hospitality heals partner on switch-in. Rage Powder redirects. Versatile — can also set Trick Room.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'], usage: '21.42%', wr: '51.89%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Adaptability',
        moves: ['Wave Crash','Shadow Ball','Aqua Jet','Protect'],
        noteES: 'Amenaza emergente. Adaptabilidad + boost de Lluvia convierte Wave Crash en un nuke devastador. Aqua Jet da prioridad.',
        noteEN: 'Emerging threat. Adaptability + Rain boost makes Wave Crash devastating. Aqua Jet provides priority.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'], usage: '17.18%', wr: '51.58%', role: 'Support',
        item: 'Sitrus Berry / Leftovers', ability: 'Levitate',
        moves: ['Hydro Pump','Thunderbolt','Will-O-Wisp','Protect'],
        noteES: 'Pivot eléctrico resistente. Will-O-Wisp corta el daño físico. Responde a Gyarados y ataques de Agua.',
        noteEN: 'Bulky Electric pivot. Will-O-Wisp cuts physical damage. Answers Gyarados and Water attacks.',
      },
      {
        name: 'Floette-Eternal', types: ['fairy'], usage: '14.70%', wr: '54.59%', role: 'Attacker',
        item: 'Sitrus Berry / Life Orb', ability: 'Flower Veil',
        moves: ['Moonblast','Dazzling Gleam','Protect','Helping Hand'],
        noteES: '⭐ Win rate más alto del Tier B (54.59%). Moonblast tiene 66.3% win rate. SpAtk masivo con bulk natural sorprendente.',
        noteEN: '⭐ Highest win rate in Tier B (54.59%). Moonblast has 66.3% win rate. Massive SpAtk with surprising natural bulk.',
      },
      {
        name: 'Aerodactyl', types: ['rock','flying'], usage: '13.12%', wr: '51.59%', role: 'Support',
        item: 'Focus Sash / King\'s Rock', ability: 'Rock Head / Pressure',
        moves: ['Rock Slide','Tailwind','Taunt','Protect'],
        noteES: 'Setter de Tailwind más rápido del formato. Rock Slide con flinch chance. Taunt bloquea setters rivales.',
        noteEN: 'Fastest Tailwind setter in the format. Rock Slide with flinch chance. Taunt stops rival setters.',
      },
      {
        name: 'Delphox', types: ['fire','psychic'], usage: '7.20%', wr: '53.23%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Magician',
        moves: ['Psychic','Fire Blast','Shadow Ball','Protect'],
        noteES: 'Magician roba el objeto del rival al atacar. Muy infrautilizado (7.20%) para su win rate (53.23%). Excelente pick anti-meta sorpresa.',
        noteEN: 'Magician steals opponent\'s item on attack. Heavily underused (7.20%) for its win rate (53.23%). Excellent surprise anti-meta pick.',
      },
    ],
  },
  {
    tier: 'C', color: '#33aaff', bg: 'bg-blue-950/20', border: 'border-blue-900/30',
    labelES: 'Tier C — Situacionales', labelEN: 'Tier C — Situational',
    pokemon: [
      {
        name: 'Pelipper', types: ['water','flying'], usage: '15.69%', wr: '49.68%', role: 'Setter',
        item: 'Damp Rock / Sitrus Berry', ability: 'Drizzle',
        moves: ['Hurricane','Scald','Tailwind','Protect'],
        noteES: 'Setter de Lluvia. Hurricane 100% precisión bajo lluvia. Win rate bajo el 50% — equipos de lluvia siendo leídos mejor en alto ladder.',
        noteEN: 'Rain setter. Hurricane 100% accurate in Rain. Below 50% win rate — Rain teams being read better at high ladder.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'], usage: '14.93%', wr: '50.19%', role: 'Setter',
        item: 'Smooth Rock / Sitrus Berry', ability: 'Sand Stream',
        moves: ['Rock Slide','Crunch','Ice Punch','Protect'],
        noteES: 'Sand Stream invoca Arena. Bulk masivo + STAB Roca. Contrarresta equipos de Nieve. Win rate justo encima del 50%.',
        noteEN: 'Sand Stream auto-summons Sandstorm. Massive bulk + Rock STAB. Counters Snow teams. Win rate just above 50%.',
      },
      {
        name: 'Farigiraf', types: ['normal','psychic'], usage: '14.83%', wr: '49.94%', role: 'Support',
        item: 'Throat Spray / Sitrus Berry / Mental Herb', ability: 'Cud Chew / Armor Tail',
        moves: ['Trick Room','Hyper Voice','Protect','Helping Hand'],
        noteES: 'Armor Tail bloquea Fake Out — counter directo al lead Incineroar. Setter de Trick Room + Future Sight pressure.',
        noteEN: 'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Trick Room setter + Future Sight pressure.',
      },
      {
        name: 'Charizard', types: ['fire','flying'], usage: '13.87%', wr: '49.99%', role: 'Attacker',
        item: 'Charizardite Y / Charizardite X / Life Orb', ability: 'Drought / Blaze',
        moves: ['Heat Wave','Protect','Solar Beam','Weather Ball'],
        noteES: 'Mega Charizard Y bajo Sol. Heat Wave spread devastador. Win rate casi exactamente 50%.',
        noteEN: 'Mega Charizard Y under Sun. Devastating spread Heat Wave. Win rate almost exactly 50%.',
      },
      {
        name: 'Archaludon', types: ['dragon','steel'], usage: '13.00%', wr: '49.62%', role: 'Attacker',
        item: 'Power Herb / Assault Vest', ability: 'Stamina / Sturdy',
        moves: ['Electro Shot','Body Press','Flash Cannon','Protect'],
        noteES: 'Electro Shot con Power Herb. Body Press aprovecha la alta Defensa. Resistente pero win rate bajo el 50%.',
        noteEN: 'Electro Shot with Power Herb. Body Press leverages high Defense. Bulky but sub-50% win rate.',
      },
      {
        name: 'Milotic', types: ['water'], usage: '9.73%', wr: '50.43%', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Competitive',
        moves: ['Scald','Ice Beam','Recover','Protect'],
        noteES: 'Competitive convierte Intimidate en +2 SpAtk. Muro especial resistente — difícil de matar sin un counter específico.',
        noteEN: 'Competitive turns Intimidate into +2 SpAtk. Bulky special wall — hard to KO without a specific counter.',
      },
      {
        name: 'Corviknight', types: ['flying','steel'], usage: '6.85%', wr: '51.34%', role: 'Tank',
        item: 'Rocky Helmet / Leftovers', ability: 'Pressure / Mirror Armor',
        moves: ['Brave Bird','Iron Head','Bulk Up','Protect'],
        noteES: 'Muro físico vs Sneasler y Garchomp. Mirror Armor rebota bajadas de stats.',
        noteEN: 'Physical wall vs Sneasler and Garchomp. Mirror Armor bounces back stat drops.',
      },
      {
        name: 'Talonflame', types: ['fire','flying'], usage: '7.09%', wr: '51.37%', role: 'Support',
        item: 'Focus Sash', ability: 'Gale Wings',
        moves: ['Tailwind','Brave Bird','Flare Blitz','Protect'],
        noteES: 'Gale Wings da prioridad a Tailwind. Setter sacrificio fiable.',
        noteEN: 'Gale Wings gives Tailwind priority. Reliable sacrifice setter.',
      },
      {
        name: 'Gardevoir', types: ['psychic','fairy'], usage: '6.18%', wr: '51.32%', role: 'Support',
        item: 'Sitrus Berry / Choice Scarf', ability: 'Trace',
        moves: ['Moonblast','Psyshock','Trick Room','Protect'],
        noteES: 'Trace copia habilidades útiles del rival. Setter de Trick Room + atacante especial.',
        noteEN: 'Trace copies useful opponent abilities. Trick Room setter + special attacker.',
      },
      {
        name: 'Aegislash', types: ['steel','ghost'], usage: '6.13%', wr: '50.34%', role: 'Attacker',
        item: 'Weakness Policy / Sitrus Berry', ability: 'Stance Change',
        moves: ['Shadow Ball','Iron Head','King\'s Shield','Wide Guard'],
        noteES: 'Wide Guard bloquea moves spread. Weakness Policy explota cuando lo golpean.',
        noteEN: 'Wide Guard blocks spread moves. Weakness Policy explodes when hit.',
      },
      {
        name: 'Primarina', types: ['water','fairy'], usage: '5.75%', wr: '50.91%', role: 'Attacker',
        item: 'Choice Specs / Sitrus Berry', ability: 'Liquid Voice',
        moves: ['Hyper Voice','Moonblast','Protect','Calm Mind'],
        noteES: 'Liquid Voice convierte Hyper Voice en ataque de Agua. Consistente pero superada por atacantes más veloces.',
        noteEN: 'Liquid Voice turns Hyper Voice into Water attack. Consistent but outclassed by faster attackers.',
      },
      {
        name: 'Azumarill', types: ['water','fairy'], usage: '1.04%', wr: '54.45%', role: 'Attacker',
        item: 'Sitrus Berry / Assault Vest', ability: 'Huge Power',
        moves: ['Aqua Jet','Play Rough','Belly Drum','Protect'],
        noteES: '⭐ GEM OCULTA — 54.45% win rate con solo 1% de uso. Enorme Poder + Aqua Jet arrasa equipos debilitados.',
        noteEN: '⭐ HIDDEN GEM — 54.45% win rate with only 1% usage. Huge Power + Aqua Jet sweeps weakened teams.',
      },
    ],
  },
  {
    tier: 'D', color: '#888888', bg: 'bg-gray-950/20', border: 'border-gray-800/30',
    labelES: 'Tier D — Con dificultades', labelEN: 'Tier D — Struggling',
    pokemon: [
      {
        name: 'Whimsicott', types: ['grass','fairy'], usage: '18.98%', wr: '48.42%', role: 'Support',
        item: 'Focus Sash / Mental Herb', ability: 'Prankster',
        moves: ['Tailwind','Moonblast','Encore','Protect'],
        noteES: 'Alto uso (18.98%) pero win rate muy negativo. Sneasler lo contrarresta duramente. Actualmente sobrevalorado — el meta tiene respuestas establecidas.',
        noteEN: 'High usage (18.98%) but very negative win rate. Sneasler hard counters it. Currently overhyped — meta has established answers.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'], usage: '9.21%', wr: '49.22%', role: 'Attacker',
        item: 'Dragoninite / Loaded Dice', ability: 'Inner Focus / Multiscale',
        moves: ['Extreme Speed','Scale Shot','Hurricane','Protect'],
        noteES: 'Multiscale aguanta el primer golpe. Extreme Speed prioridad +2. Win rate bajo el 50%.',
        noteEN: 'Multiscale tanks the first hit. Extreme Speed +2 priority. Below 50% win rate.',
      },
      {
        name: 'Froslass', types: ['ice','ghost'], usage: '8.64%', wr: '49.94%', role: 'Setter',
        item: 'Focus Sash / Icy Rock', ability: 'Snow Warning / Cursed Body',
        moves: ['Blizzard','Shadow Ball','Tailwind','Protect'],
        noteES: 'Snow Warning invoca Nieve. Blizzard 100% precisión bajo Nieve. El meta de Nieve se adaptó completamente — Roca es counter estándar.',
        noteEN: 'Snow Warning summons Snow. Blizzard 100% accurate in Snow. Snow meta fully adapted — Rock is standard counter.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'], usage: '8.54%', wr: '48.96%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Cursed Body',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Protect'],
        noteES: 'Alto SpAtk pero muy frágil. Win rate negativo — demasiado frágil en el meta dominado por Sneasler.',
        noteEN: 'High SpAtk but very frail. Negative win rate — too frail in Sneasler-dominated meta.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'], usage: '7.24%', wr: '49.61%', role: 'Attacker',
        item: 'Life Orb / Choice Scarf', ability: 'Sand Rush / Mold Breaker',
        moves: ['Earthquake','Iron Head','Rock Slide','Protect'],
        noteES: 'Sand Rush dobla Speed bajo Arena de Tyranitar. Equipos de Arena siendo leídos con más facilidad en alto ladder.',
        noteEN: 'Sand Rush doubles Speed under Tyranitar Sand. Sand teams being read more consistently at high ladder.',
      },
      {
        name: 'Torkoal', types: ['fire'], usage: '6.12%', wr: '49.29%', role: 'Setter',
        item: 'Heat Rock / Sitrus Berry', ability: 'Drought',
        moves: ['Heat Wave','Earth Power','Yawn','Protect'],
        noteES: 'Sequía invoca Sol. Core con Charizard Y. Perdiendo la guerra de clima vs Lluvia y Arena.',
        noteEN: 'Drought summons Sun. Core with Charizard Y. Losing weather war vs Rain and Sand.',
      },
    ],
  },
]

// ─── SINGLES BSS — Smogon Champions BSS Viability Rankings · Abr 17, 2026
// Fuente: smogon.com/forums — VR Council · Formato 3v3 Battle Stadium Singles
const SINGLES_TIERS = [
  {
    tier: 'S', color: '#ff2244', bg: 'bg-red-950/30', border: 'border-red-500/30',
    labelES: 'Tier S — Dominantes', labelEN: 'Tier S — Dominant',
    pokemon: [
      {
        name: 'Corviknight', types: ['flying','steel'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Rocky Helmet', ability: 'Pressure / Mirror Armor',
        moves: ['Brave Bird','Iron Head','Roost','Body Press'],
        noteES: 'Muro físico top del meta Singles. Roost le da longevidad enorme. Mirror Armor rebota bajadas de stats. Cubre la debilidad a Roca/Eléctrico con cobertura.',
        noteEN: 'Top physical wall in Singles meta. Roost gives massive longevity. Mirror Armor bounces back stat drops. Coverage handles Rock/Electric weaknesses.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Soft Sand / Garchompite', ability: 'Rough Skin',
        moves: ['Earthquake','Dragon Claw','Stone Edge','Swords Dance'],
        noteES: 'All-rounder top en Singles también. Earthquake + Dragon Claw cubre casi todo el meta. Swords Dance lo convierte en sweeper imparable. Garchompite para Mega.',
        noteEN: 'Top all-rounder in Singles too. Earthquake + Dragon Claw covers almost the entire meta. Swords Dance makes it an unstoppable sweeper. Garchompite for Mega.',
      },
      {
        name: 'Primarina', types: ['water','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Specs / Sitrus Berry', ability: 'Liquid Voice',
        moves: ['Hyper Voice','Moonblast','Ice Beam','Calm Mind'],
        noteES: 'Sorprendentemente en el top de Singles. Liquid Voice convierte Hyper Voice en Agua — muy difícil de contrarrestar. Tipado Agua/Hada cubre el meta perfectamente.',
        noteEN: 'Surprisingly at the top of Singles. Liquid Voice turns Hyper Voice into Water — very hard to counter. Water/Fairy typing covers the meta perfectly.',
      },
    ],
  },
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Tier A — Muy fuertes', labelEN: 'Tier A — Very Strong',
    pokemon: [
      {
        name: 'Archaludon', types: ['dragon','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Power Herb / Assault Vest', ability: 'Stamina / Sturdy',
        moves: ['Electro Shot','Body Press','Flash Cannon','Dragon Pulse'],
        noteES: 'A+ en el VR de Smogon. Electro Shot con Power Herb es devastador. Body Press aprovecha la altísima Defensa. Stamina lo hace más difícil de derribar con ataques físicos.',
        noteEN: 'A+ in Smogon VR. Electro Shot with Power Herb is devastating. Body Press leverages massive Defense. Stamina makes it harder to knock down with physical attacks.',
      },
      {
        name: 'Charizard', types: ['fire','flying'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Charizardite Y / Charizardite X', ability: 'Drought / Blaze',
        moves: ['Fire Blast','Solar Beam','Air Slash','Dragon Pulse'],
        noteES: 'A+ — Mega Charizard Y bajo Sol es brutal en Singles sin redirección. Mega Charizard X es opción física igualmente devastadora. Uno de los mejores atacantes del formato.',
        noteEN: 'A+ — Mega Charizard Y under Sun is brutal in Singles without redirection. Mega Charizard X is an equally devastating physical option. One of the best attackers in the format.',
      },
      {
        name: 'Mega Gengar', types: ['ghost','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Gengarite', ability: 'Shadow Tag',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Taunt'],
        noteES: 'A+ — Shadow Tag atrapa al rival sin posibilidad de huida o cambio. Uno de los más controvertidos del meta. Muy poderoso pero predecible — los rivales saben qué esperar.',
        noteEN: 'A+ — Shadow Tag traps the opponent with no escape or switching. One of the most controversial in the meta. Very powerful but predictable — opponents know what to expect.',
      },
      {
        name: 'Mega Lopunny', types: ['normal','fighting'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Lopunnite', ability: 'Scrappy',
        moves: ['Return','High Jump Kick','Ice Punch','Fake Out'],
        noteES: 'A+ — Scrappy le permite golpear Fantasma con Normal. Extremadamente rápido. High Jump Kick es un nuker tremendo. Fake Out da control de turno en Singles.',
        noteEN: 'A+ — Scrappy lets it hit Ghosts with Normal moves. Extremely fast. High Jump Kick is a tremendous nuke. Fake Out gives turn control in Singles.',
      },
      {
        name: 'Meowscarada', types: ['grass','dark'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Scarf / Focus Sash', ability: 'Overgrow / Protean',
        moves: ['Flower Trick','Knock Off','Play Rough','U-turn'],
        noteES: 'A+ — Flower Trick siempre critica con Florización. Protean cambia de tipo con cada move. Knock Off es devastador en Singles sin Objetos de elección de entrada.',
        noteEN: 'A+ — Flower Trick always crits with Moxie. Protean changes type with each move. Knock Off is devastating in Singles.',
      },
      {
        name: 'Mega Venusaur', types: ['grass','poison'], usage: '—', wr: '—', role: 'Tank',
        item: 'Venusaurite', ability: 'Thick Fat',
        moves: ['Sludge Bomb','Energy Ball','Synthesis','Sleep Powder'],
        noteES: 'A+ — Thick Fat reduce daño de Fuego e Hielo. Synthesis da curación enorme. Sleep Powder permite knock outs sin combate. Muro especial muy difícil de vencer.',
        noteEN: 'A+ — Thick Fat halves Fire and Ice damage. Synthesis gives massive healing. Sleep Powder enables free KOs. Very hard to overcome special wall.',
      },
      {
        name: 'Aegislash', types: ['steel','ghost'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Weakness Policy / Sitrus Berry', ability: 'Stance Change',
        moves: ['Shadow Ball','Iron Head','King\'s Shield','Shadow Sneak'],
        noteES: 'A — Stance Change alterna entre ataque y defensa. Shadow Sneak da prioridad STAB. King\'s Shield anula ataques físicos y baja el Atk del rival.',
        noteEN: 'A — Stance Change alternates between attack and defense. Shadow Sneak gives STAB priority. King\'s Shield nullifies physical attacks and lowers rival Atk.',
      },
      {
        name: 'Mega Delphox', types: ['fire','psychic'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Delphoxite', ability: 'Magician',
        moves: ['Psychic','Fire Blast','Shadow Ball','Grass Knot'],
        noteES: 'A — Magician roba el objeto del rival con cada ataque. Excelente cobertura especial. Muy peligroso en Singles donde no hay redirección para proteger objetos clave.',
        noteEN: 'A — Magician steals opponent\'s item with each attack. Excellent special coverage. Very dangerous in Singles where there\'s no redirection to protect key items.',
      },
      {
        name: 'Hippowdon', types: ['ground'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Smooth Rock', ability: 'Sand Stream',
        moves: ['Earthquake','Slack Off','Stealth Rock','Stone Edge'],
        noteES: 'A — Muro físico top con curación. Sand Stream invoca Arena para daño pasivo. Slack Off da longevidad enorme. Difícilmente desplazable una vez en campo.',
        noteEN: 'A — Top physical wall with healing. Sand Stream summons Sandstorm for passive damage. Slack Off gives massive longevity. Hard to dislodge once in battle.',
      },
      {
        name: 'Kingambit', types: ['dark','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Leftovers', ability: 'Supreme Overlord',
        moves: ['Kowtow Cleave','Iron Head','Sucker Punch','Swords Dance'],
        noteES: 'A — Supreme Overlord es más poderoso en Singles donde las caídas son más frecuentes. Sucker Punch prioritario para remates. Sweeper de late game devastador.',
        noteEN: 'A — Supreme Overlord is stronger in Singles where knockouts happen more frequently. Sucker Punch priority for finishing. Devastating late-game sweeper.',
      },
      {
        name: 'Sneasler', types: ['fighting','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Focus Sash / Life Orb', ability: 'Unburden / Pressure',
        moves: ['Close Combat','Dire Claw','Acrobatics','Swords Dance'],
        noteES: 'A — Fuerte en Singles también aunque pierde el contexto de Doubles. Dire Claw sigue siendo peligrosísimo. Sin terrenos que abusar, Unburden es menos fiable.',
        noteEN: 'A — Strong in Singles too though it loses the Doubles context. Dire Claw is still very dangerous. Without terrain to abuse, Unburden is less reliable.',
      },
      {
        name: 'Mega Scizor', types: ['bug','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Scizorite', ability: 'Technician',
        moves: ['Bullet Punch','U-turn','Knock Off','Swords Dance'],
        noteES: 'A — Technician potencia Bullet Punch STAB con prioridad. Knock Off en Singles es devastador sin restricciones. Excelente pivot con U-turn.',
        noteEN: 'A — Technician boosts STAB Bullet Punch with priority. Knock Off in Singles is devastating. Excellent pivot with U-turn.',
      },
      {
        name: 'Mega Victreebel', types: ['grass','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Victreebellite', ability: 'Chlorophyll',
        moves: ['Power Whip','Sludge Bomb','Sleep Powder','Sucker Punch'],
        noteES: 'A — Chlorophyll dobla la Speed bajo Sol. Sleep Powder permite knock outs libres. Sinergia top con Charizard Y en equipos de Sol.',
        noteEN: 'A — Chlorophyll doubles Speed under Sun. Sleep Powder enables free KOs. Top synergy with Charizard Y on Sun teams.',
      },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Tier B — Viables', labelEN: 'Tier B — Viable',
    pokemon: [
      {
        name: 'Mega Charizard X', types: ['fire','dragon'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Charizardite X', ability: 'Tough Claws',
        moves: ['Dragon Claw','Flare Blitz','Dragon Dance','Earthquake'],
        noteES: 'A- — Tough Claws potencia moves de contacto. Dragon Dance + Tough Claws lo convierte en un sweeper imparable tras 1 turno de setup.',
        noteEN: 'A- — Tough Claws boosts contact moves. Dragon Dance + Tough Claws makes it an unstoppable sweeper after 1 turn of setup.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Dragoninite / Lum Berry', ability: 'Multiscale',
        moves: ['Extreme Speed','Dragon Claw','Thunder Wave','Fire Punch'],
        noteES: 'A- — Multiscale aguanta el primer golpe. Extreme Speed +2 prioridad es único. Dragoninite da boost especial a sus moves. Excelente en Singles.',
        noteEN: 'A- — Multiscale tanks the first hit. Extreme Speed +2 priority is unique. Dragoninite gives special boost. Excellent in Singles.',
      },
      {
        name: 'Hydreigon', types: ['dark','dragon'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Scarf / Choice Specs', ability: 'Levitate',
        moves: ['Draco Meteor','Dark Pulse','Fire Blast','U-turn'],
        noteES: 'A- — Levitate da inmunidad a Tierra. Draco Meteor con Specs es un nuke devastador. Excelente pivot con U-turn. Cobertura especial top.',
        noteEN: 'A- — Levitate gives Ground immunity. Draco Meteor with Specs is a devastating nuke. Excellent pivot with U-turn. Top special coverage.',
      },
      {
        name: 'Mimikyu', types: ['ghost','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Sitrus Berry', ability: 'Disguise',
        moves: ['Play Rough','Shadow Sneak','Swords Dance','Shadow Claw'],
        noteES: 'A- — Disguise garantiza un turno gratuito de setup o un golpe seguro. Swords Dance + Disguise es muy poderoso en Singles. Shadow Sneak da prioridad STAB.',
        noteEN: 'A- — Disguise guarantees a free setup turn or safe hit. Swords Dance + Disguise is very powerful in Singles. Shadow Sneak gives STAB priority.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'], usage: '—', wr: '—', role: 'Support',
        item: 'Sitrus Berry / Leftovers', ability: 'Levitate',
        moves: ['Hydro Pump','Thunderbolt','Will-O-Wisp','Volt Switch'],
        noteES: 'A- — Pivot eléctrico con Levitate. Will-O-Wisp quema físicos. Volt Switch para salir con ventaja. Menos dominante en Singles que en Dobles.',
        noteEN: 'A- — Electric pivot with Levitate. Will-O-Wisp burns physical attackers. Volt Switch for safe exits. Less dominant in Singles than Doubles.',
      },
      {
        name: 'Sylveon', types: ['fairy'], usage: '—', wr: '—', role: 'Tank',
        item: 'Sitrus Berry / Leftovers', ability: 'Pixilate',
        moves: ['Hyper Voice','Moonblast','Calm Mind','Wish'],
        noteES: 'A- — Pixilate convierte Hyper Voice en Hada con potencia adicional. Wish da curación a compañeros. Muro especial Hada muy difícil de vencer.',
        noteEN: 'A- — Pixilate turns Hyper Voice into boosted Fairy. Wish provides healing to teammates. Very hard to overcome Fairy special wall.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Band / Smooth Rock', ability: 'Sand Stream',
        moves: ['Stone Edge','Crunch','Earthquake','Ice Punch'],
        noteES: 'A- — Bulk masivo + STAB Roca. Sand Stream activa Sand Rush en Excadrill. Choice Band + Stone Edge es brutal. Core de Arena muy efectivo.',
        noteEN: 'A- — Massive bulk + Rock STAB. Sand Stream activates Excadrill\'s Sand Rush. Choice Band + Stone Edge is brutal. Very effective Sand core.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Adaptability',
        moves: ['Wave Crash','Shadow Ball','Aqua Jet','Flip Turn'],
        noteES: 'B+ — Adaptabilidad + Wave Crash es devastador. Aqua Jet da prioridad. Flip Turn permite pivotar. Excelente en equipos de Lluvia.',
        noteEN: 'B+ — Adaptability + Wave Crash is devastating. Aqua Jet provides priority. Flip Turn for pivoting. Excellent on Rain teams.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Air Balloon', ability: 'Sand Rush / Mold Breaker',
        moves: ['Earthquake','Iron Head','Rock Slide','Swords Dance'],
        noteES: 'B+ — Sand Rush dobla Speed bajo Arena. Mold Breaker ignora habilidades como Levitate. Sweeper de Arena muy peligroso.',
        noteEN: 'B+ — Sand Rush doubles Speed under Sand. Mold Breaker ignores abilities like Levitate. Very dangerous Sand sweeper.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Cursed Body',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Taunt'],
        noteES: 'B+ — Sin Gengarite, Cursed Body puede bloquear moves clave. Muy frágil pero ataque especial enorme. Menos dominante que su Mega pero viable.',
        noteEN: 'B+ — Without Gengarite, Cursed Body can block key moves. Very frail but enormous special attack. Less dominant than Mega but viable.',
      },
      {
        name: 'Glimmora', types: ['rock','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Power Herb / Focus Sash', ability: 'Toxic Debris',
        moves: ['Sludge Bomb','Power Gem','Earth Power','Spikes'],
        noteES: 'B+ — Toxic Debris pone Púas Tóxicas al rival cuando lo golpean con físicos. Spikes para hazards. Excelente presión pasiva en Singles.',
        noteEN: 'B+ — Toxic Debris sets Toxic Spikes on opponent when hit with physical moves. Spikes for hazards. Excellent passive pressure in Singles.',
      },
      {
        name: 'Azumarill', types: ['water','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Assault Vest', ability: 'Huge Power',
        moves: ['Aqua Jet','Play Rough','Belly Drum','Ice Punch'],
        noteES: 'B — Enorme Poder dobla el Ataque base. Aqua Jet da prioridad STAB. Belly Drum en Singles es menos arriesgado que en Dobles. Amenaza real de late game.',
        noteEN: 'B — Huge Power doubles base Attack. Aqua Jet gives STAB priority. Belly Drum in Singles is less risky than Doubles. Real late-game threat.',
      },
      {
        name: 'Volcarona', types: ['bug','fire'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Lum Berry', ability: 'Flame Body',
        moves: ['Quiver Dance','Fire Blast','Bug Buzz','Giga Drain'],
        noteES: 'B — Quiver Dance eleva SpAtk, SpDef y Speed a la vez. Muy poderoso tras 1-2 boosts. Frágil a Roca pero con Giga Drain cubre el terreno.',
        noteEN: 'B — Quiver Dance raises SpAtk, SpDef and Speed simultaneously. Very powerful after 1-2 boosts. Frail to Rock but Giga Drain covers ground.',
      },
      {
        name: 'Mega Kangaskhan', types: ['normal'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Kangaskhanite', ability: 'Parental Bond',
        moves: ['Return','Earthquake','Sucker Punch','Power-Up Punch'],
        noteES: 'B — Parental Bond golpea dos veces por ataque. Power-Up Punch da +1 Ataque dos veces. Excelente presión ofensiva con STAB Normal potente.',
        noteEN: 'B — Parental Bond hits twice per attack. Power-Up Punch gives +1 Attack twice. Excellent offensive pressure with strong Normal STAB.',
      },
      {
        name: 'Umbreon', types: ['dark'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Synchronize',
        moves: ['Foul Play','Moonlight','Wish','Toxic'],
        noteES: 'A- — Synchronize propaga status al rival. Wish da curación al equipo. Foul Play usa el Ataque del rival en su contra. Muro oscuro muy resistente.',
        noteEN: 'A- — Synchronize spreads status to rival. Wish provides team healing. Foul Play uses rival\'s Attack against them. Very resilient Dark wall.',
      },
      {
        name: 'Snorlax', types: ['normal'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Thick Fat / Immunity',
        moves: ['Body Slam','Earthquake','Rest','Sleep Talk'],
        noteES: 'B — HP enorme y Thick Fat reduce Fuego e Hielo. Rest + Sleep Talk da curación completa. Muro físico muy difícil de derribar.',
        noteEN: 'B — Massive HP and Thick Fat reduces Fire and Ice. Rest + Sleep Talk gives full recovery. Very hard to knock out physical wall.',
      },
      {
        name: 'Mega Gardevoir', types: ['psychic','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Gardevoirite', ability: 'Pixilate',
        moves: ['Hyper Voice','Psyshock','Shadow Ball','Calm Mind'],
        noteES: 'B- — Pixilate convierte Hyper Voice en Hada. SpAtk altísimo. Frágil pero devastadora. Menos viable que otras Mega opciones pero poderosa.',
        noteEN: 'B- — Pixilate turns Hyper Voice into Fairy. Very high SpAtk. Frail but devastating. Less viable than other Mega options but powerful.',
      },
      {
        name: 'Espathra', types: ['psychic'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Lum Berry', ability: 'Speed Boost',
        moves: ['Lumina Crash','Dazzling Gleam','Calm Mind','Protect'],
        noteES: 'B- — Speed Boost aumenta la Speed cada turno. Lumina Crash baja SpDef 2 niveles. Controversialmente fuerte — hay debate sobre si necesita restricciones.',
        noteEN: 'B- — Speed Boost increases Speed each turn. Lumina Crash lowers SpDef 2 stages. Controversially strong — there\'s debate about whether it needs restrictions.',
      },
    ],
  },
]

const ROLE_COLORS = {
  'Setter':'#4488ff','Attacker':'#ff4422','Support':'#33aa33','Tank':'#aa88ff',
}

const ALL_ROLES = ['All','Attacker','Support','Tank','Setter']

export default function TierList() {
  const { t, lang } = useLang()
  const [format, setFormat] = useState('doubles')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [collapsed, setCollapsed] = useState({})
  const [expandedPokemon, setExpandedPokemon] = useState(null)

  function toggleCollapse(tier) {
    setCollapsed(prev => ({ ...prev, [tier]: !prev[tier] }))
  }

  function toggleExpand(name) {
    setExpandedPokemon(prev => prev === name ? null : name)
  }

  function filterPokemon(pokemon) {
    return pokemon.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'All' || p.role === roleFilter
      return matchSearch && matchRole
    })
  }

  const tiers = format === 'doubles' ? DOUBLES_TIERS : SINGLES_TIERS
  const totalVisible = tiers.reduce((sum, tier) => sum + filterPokemon(tier.pokemon).length, 0)

  return (
    <div>
      {/* Format selector */}
      <div className="flex gap-3 mb-4">
        <button onClick={() => { setFormat('doubles'); setCollapsed({}); setExpandedPokemon(null) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${format === 'doubles' ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'}`}>
          {lang === 'es' ? '⚔️ Dobles VGC' : '⚔️ Doubles VGC'}
        </button>
        <button onClick={() => { setFormat('singles'); setCollapsed({}); setExpandedPokemon(null) }}
          className={`flex-1 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase border transition-all ${format === 'singles' ? 'bg-blue-400/10 border-blue-400/40 text-blue-400' : 'bg-[#0c1015] border-[#1c2830] text-[#4a6070] hover:text-white'}`}>
          {lang === 'es' ? '🗡️ Singles BSS' : '🗡️ Singles BSS'}
        </button>
      </div>

      {/* Info bar */}
      <div className="mb-4 bg-[#0c1015] border border-[#1c2830] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-orbitron text-xs font-bold tracking-widest mb-1" style={{ color: format === 'doubles' ? '#f0c040' : '#60a5fa' }}>
            {format === 'doubles'
              ? 'TIER LIST DOBLES · REGULATION M-A'
              : 'TIER LIST SINGLES BSS · REGULATION M-A'}
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {format === 'doubles'
              ? 'showdowntier.com · 50.930 batallas · Abr 9–17, 2026 · Rating medio 1215'
              : 'Smogon VR Council · Champions BSS · Abr 17, 2026 · smogon.com'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="font-mono-tech text-xs text-yellow-400">{t('global.active_until')}</span>
        </div>
      </div>

      {/* Search + Role filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'es' ? 'Buscar Pokémon...' : 'Search Pokémon...'}
          className="flex-1 bg-[#0c1015] border border-[#1c2830] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6070] outline-none focus:border-yellow-400/50 transition-colors font-mono-tech text-sm" />
        <div className="flex gap-2 flex-wrap">
          {ALL_ROLES.map(role => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className="px-3 py-2 rounded-xl font-mono-tech text-xs tracking-widest uppercase transition-all border flex-shrink-0"
              style={roleFilter === role && role !== 'All'
                ? { borderColor: `${ROLE_COLORS[role]}60`, color: ROLE_COLORS[role], background: `${ROLE_COLORS[role]}15` }
                : roleFilter === role
                  ? { borderColor: 'rgba(240,192,64,0.4)', color: '#f0c040', background: 'rgba(240,192,64,0.1)' }
                  : { borderColor: '#1c2830', color: '#4a6070', background: '#0c1015' }
              }>
              {role === 'All' ? (lang === 'es' ? 'Todos' : 'All') : role}
            </button>
          ))}
        </div>
      </div>

      {totalVisible === 0 && (
        <div className="text-center py-12">
          <p className="text-[#4a6070] font-mono-tech text-sm">
            {lang === 'es' ? 'No se encontraron Pokémon para' : 'No Pokémon found for'} "{search}"
          </p>
        </div>
      )}

      {/* Tiers */}
      <div className="flex flex-col gap-4">
        {tiers.map(tier => {
          const visible = filterPokemon(tier.pokemon)
          if (visible.length === 0) return null
          const isCollapsed = collapsed[tier.tier]
          const label = lang === 'es' ? tier.labelES : tier.labelEN

          return (
            <div key={tier.tier} className={`rounded-xl border ${tier.border} ${tier.bg} overflow-hidden`}>
              <button onClick={() => toggleCollapse(tier.tier)}
                className="w-full flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-orbitron text-3xl font-black" style={{ color: tier.color }}>{tier.tier}</div>
                  <div className="text-left">
                    <p className="font-orbitron text-xs font-bold text-white tracking-widest uppercase">{label}</p>
                    <p className="font-mono-tech text-xs text-[#4a6070] mt-0.5">{visible.length} Pokémon</p>
                  </div>
                </div>
                <span className="text-[#4a6070] text-sm font-mono-tech">{isCollapsed ? '▼' : '▲'}</span>
              </button>

              {!isCollapsed && (
                <div className="p-3 flex flex-col gap-2">
                  {visible.map(p => {
                    const isExpanded = expandedPokemon === p.name
                    return (
                      <div key={p.name} className="bg-[#0c1015]/60 border border-white/5 rounded-lg hover:border-white/10 transition-all duration-200 overflow-hidden">
                        <button onClick={() => toggleExpand(p.name)}
                          className="w-full flex items-center justify-between p-3 text-left">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-bold text-white text-sm">{p.name}</p>
                                <span className="text-xs px-1.5 py-0.5 rounded font-mono-tech flex-shrink-0"
                                  style={{ background: `${ROLE_COLORS[p.role]}22`, color: ROLE_COLORS[p.role] }}>{p.role}</span>
                              </div>
                              <div className="flex gap-1 flex-wrap">{p.types.map(type => <TypeBadge key={type} type={type} />)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-3 flex-shrink-0">
                            {p.usage !== '—' && (
                              <div className="text-right hidden sm:block">
                                <p className="font-mono-tech text-xs text-[#4a6070]">{p.usage} {lang === 'es' ? 'uso' : 'use'}</p>
                                <p className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} {lang === 'es' ? 'win' : 'win'}</p>
                              </div>
                            )}
                            <span className="text-[#4a6070] text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-white/5 pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'OBJETO' : 'ITEM'}</p>
                                <p className="text-xs text-white font-semibold">{p.item}</p>
                              </div>
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-1">{lang === 'es' ? 'HABILIDAD' : 'ABILITY'}</p>
                                <p className="text-xs text-white font-semibold">{p.ability}</p>
                              </div>
                              <div className="bg-[#111820] rounded-lg p-2.5">
                                <p className="font-mono-tech text-xs text-[#4a6070] mb-2">{lang === 'es' ? 'MOVIMIENTOS TOP' : 'TOP MOVES'}</p>
                                <div className="flex flex-wrap gap-1">
                                  {p.moves.map(m => (
                                    <span key={m} className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded font-mono-tech">{m}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-[#6a7a8a] leading-relaxed">{lang === 'es' ? p.noteES : p.noteEN}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            {format === 'doubles'
              ? (lang === 'es'
                ? '📊 Datos de showdowntier.com — 50.930 batallas Reg M-A, Abr 9–17 2026, rating medio 1215. Sets de Pikalytics Champions Tournament.'
                : '📊 Data from showdowntier.com — 50,930 Reg M-A battles, Apr 9–17 2026, avg rating 1215. Sets from Pikalytics Champions Tournament.')
              : (lang === 'es'
                ? '📊 Rankings de Smogon VR Council — Champions Battle Stadium Singles, Abr 17 2026. Rankings basados en viabilidad competitiva, no solo en uso.'
                : '📊 Smogon VR Council rankings — Champions Battle Stadium Singles, Apr 17 2026. Rankings based on competitive viability, not just usage.')}
          </p>
        </div>
        <div className="bg-[#0c1015] border border-[#1c2830] rounded-xl p-4">
          <p className="font-mono-tech text-xs text-[#4a6070] leading-relaxed">
            {lang === 'es'
              ? '⚠️ Los Pokémon Paradoja y los Tesoros de la Ruina están prohibidos en Regulación M-A. Cualquier tier list que incluya Flutter Mane, Iron Hands o Chien-Pao es de otro formato.'
              : '⚠️ Paradox Pokémon and Treasures of Ruin are banned in Regulation M-A. Any tier list including Flutter Mane, Iron Hands or Chien-Pao is from a different format.'}
          </p>
        </div>
      </div>
    </div>
  )
}