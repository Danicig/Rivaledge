import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { useLang } from './lang'

// ─── DOBLES — showdowntier.com 04/23/2026 · 107.251 batallas · Rating medio 1271
const DOUBLES_TIERS = [
  {
    tier: 'A', color: '#ff8844', bg: 'bg-orange-950/30', border: 'border-orange-500/30',
    labelES: 'Tier A — Core del meta', labelEN: 'Tier A — Meta Core',
    pokemon: [
      {
        name: 'Sneasler', types: ['fighting','poison'], usage: '41.77%', wr: '51.45%', role: 'Attacker',
        item: 'White Herb / Focus Sash', ability: 'Unburden / Pressure',
        moves: ['Dire Claw','Close Combat','Fake Out','Protect'],
        noteES: '#1 del meta. Unburden tras consumir White Herb lo convierte en el atacante más rápido del formato. Dire Claw es peligrosísimo por la probabilidad de parálisis. Uso sigue subiendo.',
        noteEN: '#1 in meta. Unburden after White Herb makes it the fastest attacker. Dire Claw is very dangerous due to paralysis chance. Usage continues to rise.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'], usage: '34.50%', wr: '51.43%', role: 'Attacker',
        item: 'Life Orb / Clear Amulet / Garchompite', ability: 'Rough Skin',
        moves: ['Earthquake','Dragon Claw','Rock Slide','Protect'],
        noteES: '#2 en uso. Earthquake spread + cobertura Dragon. Garchompite para build Mega. Core ofensivo estándar en casi todos los equipos.',
        noteEN: '#2 in usage. Spread Earthquake + Dragon coverage. Garchompite for Mega build. Standard offensive core in almost every team.',
      },
      {
        name: 'Kingambit', types: ['dark','steel'], usage: '26.70%', wr: '52.48%', role: 'Attacker',
        item: 'Sitrus Berry / Leftovers', ability: 'Supreme Overlord',
        moves: ['Iron Head','Kowtow Cleave','Sucker Punch','Protect'],
        noteES: 'Supreme Overlord gana potencia con cada compañero caído. Mejor win rate del Tier A. Limpiador de late game imparable. Uso en aumento.',
        noteEN: 'Supreme Overlord gains power with each fallen teammate. Best win rate in Tier A. Unstoppable late-game cleaner. Usage increasing.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'], usage: '23.90%', wr: '52.46%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Adaptability',
        moves: ['Wave Crash','Shadow Ball','Aqua Jet','Protect'],
        noteES: '⬆️ SUBIÓ a Tier A. Adaptabilidad + Wave Crash en equipos de lluvia es devastador. 52.46% win rate lo consolida como amenaza top. La amenaza emergente del meta.',
        noteEN: '⬆️ MOVED UP to Tier A. Adaptability + Wave Crash on Rain teams is devastating. 52.46% win rate confirms it as a top threat. The emerging threat of the meta.',
      },
    ],
  },
  {
    tier: 'B', color: '#ddbb00', bg: 'bg-yellow-950/30', border: 'border-yellow-500/30',
    labelES: 'Tier B — Viables y frecuentes', labelEN: 'Tier B — Viable & Common',
    pokemon: [
      {
        name: 'Incineroar', types: ['fire','dark'], usage: '41.63%', wr: '49.64%', role: 'Support',
        item: 'Sitrus Berry / Rocky Helmet', ability: 'Intimidate',
        moves: ['Fake Out','Parting Shot','Flare Blitz','Darkest Lariat'],
        noteES: 'Mayor uso del formato pero win rate bajo el 50% — el meta se adaptó completamente. Sigue siendo esencial por Fake Out + Intimidate + Parting Shot.',
        noteEN: 'Highest usage in the format but below 50% win rate — meta has fully adapted. Still essential for Fake Out + Intimidate + Parting Shot.',
      },
      {
        name: 'Sinistcha', types: ['grass','ghost'], usage: '30.91%', wr: '50.13%', role: 'Support',
        item: 'Sitrus Berry / Leftovers / Occa Berry', ability: 'Hospitality',
        moves: ['Matcha Gotcha','Rage Powder','Trick Room','Life Dew'],
        noteES: 'Support imprescindible. Hospitality cura al compañero al entrar. Rage Powder redirige ataques. Versátil — puede ser setter de Trick Room.',
        noteEN: 'Essential support. Hospitality heals partner on switch-in. Rage Powder redirects. Versatile — can also set Trick Room.',
      },
      {
        name: 'Floette-Eternal', types: ['fairy'], usage: '15.14%', wr: '53.56%', role: 'Attacker',
        item: 'Sitrus Berry / Life Orb', ability: 'Flower Veil',
        moves: ['Moonblast','Dazzling Gleam','Protect','Helping Hand'],
        noteES: '⭐ Mejor win rate del Tier B (53.56%). Moonblast es su move más fiable. SpAtk masivo con bulk natural sorprendente. Altamente infrautilizada para su rendimiento.',
        noteEN: '⭐ Highest win rate in Tier B (53.56%). Moonblast is its most reliable move. Massive SpAtk with surprising natural bulk. Highly underused for its performance.',
      },
    ],
  },
  {
    tier: 'C', color: '#33aaff', bg: 'bg-blue-950/20', border: 'border-blue-900/30',
    labelES: 'Tier C — Situacionales', labelEN: 'Tier C — Situational',
    pokemon: [
      {
        name: 'Aerodactyl', types: ['rock','flying'], usage: '18.17%', wr: '50.59%', role: 'Support',
        item: 'Focus Sash / King\'s Rock', ability: 'Rock Head / Pressure',
        moves: ['Rock Slide','Tailwind','Taunt','Protect'],
        noteES: '⬇️ Bajó de Tier B. Setter de Tailwind más rápido del formato. Rock Slide con flinch chance. El meta aprendió a anticiparlo mejor.',
        noteEN: '⬇️ Dropped from Tier B. Fastest Tailwind setter. Rock Slide with flinch chance. Meta learned to anticipate it better.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'], usage: '16.09%', wr: '50.81%', role: 'Support',
        item: 'Sitrus Berry / Leftovers', ability: 'Levitate',
        moves: ['Hydro Pump','Thunderbolt','Will-O-Wisp','Protect'],
        noteES: '⬇️ Bajó de Tier B. Pivot eléctrico resistente. Will-O-Wisp corta daño físico. Sigue siendo viable pero hay mejores opciones en el meta actual.',
        noteEN: '⬇️ Dropped from Tier B. Bulky electric pivot. Will-O-Wisp cuts physical damage. Still viable but better options exist in current meta.',
      },
      {
        name: 'Farigiraf', types: ['normal','psychic'], usage: '15.66%', wr: '49.97%', role: 'Support',
        item: 'Throat Spray / Sitrus Berry / Mental Herb', ability: 'Cud Chew / Armor Tail',
        moves: ['Trick Room','Hyper Voice','Protect','Helping Hand'],
        noteES: 'Armor Tail bloquea Fake Out — counter directo al lead Incineroar. Setter de Trick Room. Win rate casi exactamente 50%.',
        noteEN: 'Armor Tail blocks Fake Out — hard counter to Incineroar leads. Trick Room setter. Win rate almost exactly 50%.',
      },
      {
        name: 'Pelipper', types: ['water','flying'], usage: '15.58%', wr: '50.40%', role: 'Setter',
        item: 'Damp Rock / Sitrus Berry', ability: 'Drizzle',
        moves: ['Hurricane','Scald','Tailwind','Protect'],
        noteES: 'Setter de Lluvia — sube con Basculegion en Tier A. Hurricane 100% precisión bajo lluvia. Los equipos de lluvia están ganando fuerza.',
        noteEN: 'Rain setter — rises with Basculegion in Tier A. Hurricane 100% accurate in Rain. Rain teams are gaining strength.',
      },
      {
        name: 'Whimsicott', types: ['grass','fairy'], usage: '13.88%', wr: '49.09%', role: 'Support',
        item: 'Focus Sash / Mental Herb', ability: 'Prankster',
        moves: ['Tailwind','Moonblast','Encore','Protect'],
        noteES: 'Win rate negativo (49.09%). Sneasler lo contrarresta duramente. Alto uso pero rendimiento decepcionante en alto ladder.',
        noteEN: 'Negative win rate (49.09%). Sneasler hard counters it. High usage but disappointing performance at high ladder.',
      },
      {
        name: 'Charizard', types: ['fire','flying'], usage: '13.84%', wr: '50.26%', role: 'Attacker',
        item: 'Charizardite Y / Charizardite X / Life Orb', ability: 'Drought / Blaze',
        moves: ['Heat Wave','Protect','Solar Beam','Weather Ball'],
        noteES: 'Mega Charizard Y bajo Sol. Heat Wave spread devastador. Win rate estable en el 50% — amenaza real con counters establecidos.',
        noteEN: 'Mega Charizard Y under Sun. Devastating spread Heat Wave. Stable 50% win rate — real threat with established counters.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'], usage: '13.70%', wr: '50.14%', role: 'Setter',
        item: 'Smooth Rock / Sitrus Berry', ability: 'Sand Stream',
        moves: ['Rock Slide','Crunch','Ice Punch','Protect'],
        noteES: 'Sand Stream invoca Arena. Bulk masivo + STAB Roca. Contrarresta equipos de Nieve. Win rate estable.',
        noteEN: 'Sand Stream summons Sandstorm. Massive bulk + Rock STAB. Counters Snow teams. Stable win rate.',
      },
      {
        name: 'Archaludon', types: ['dragon','steel'], usage: '13.17%', wr: '50.65%', role: 'Attacker',
        item: 'Power Herb / Assault Vest', ability: 'Stamina / Sturdy',
        moves: ['Electro Shot','Body Press','Flash Cannon','Protect'],
        noteES: 'Electro Shot con Power Herb. Body Press aprovecha alta Defensa. Win rate mejorando ligeramente.',
        noteEN: 'Electro Shot with Power Herb. Body Press leverages high Defense. Win rate improving slightly.',
      },
      {
        name: 'Milotic', types: ['water'], usage: '12.60%', wr: '49.40%', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Competitive',
        moves: ['Scald','Ice Beam','Recover','Protect'],
        noteES: 'Competitive convierte Intimidate en +2 SpAtk. Muro especial resistente. Win rate ligeramente negativo.',
        noteEN: 'Competitive turns Intimidate into +2 SpAtk. Bulky special wall. Slightly negative win rate.',
      },
      {
        name: 'Froslass', types: ['ice','ghost'], usage: '8.46%', wr: '50.36%', role: 'Setter',
        item: 'Focus Sash / Icy Rock', ability: 'Snow Warning / Cursed Body',
        moves: ['Blizzard','Shadow Ball','Tailwind','Protect'],
        noteES: 'Snow Warning invoca Nieve. Blizzard 100% bajo Nieve. El meta de Nieve se adaptó — Roca es counter estándar.',
        noteEN: 'Snow Warning summons Snow. Blizzard 100% in Snow. Snow meta adapted — Rock is standard counter.',
      },
      {
        name: 'Corviknight', types: ['flying','steel'], usage: '7.16%', wr: '50.81%', role: 'Tank',
        item: 'Rocky Helmet / Leftovers', ability: 'Pressure / Mirror Armor',
        moves: ['Brave Bird','Iron Head','Bulk Up','Protect'],
        noteES: 'Muro físico vs Sneasler y Garchomp. Mirror Armor rebota bajadas de stats. Consistente pero bajo uso.',
        noteEN: 'Physical wall vs Sneasler and Garchomp. Mirror Armor bounces stat drops. Consistent but low usage.',
      },
      {
        name: 'Talonflame', types: ['fire','flying'], usage: '7.15%', wr: '50.64%', role: 'Support',
        item: 'Focus Sash', ability: 'Gale Wings',
        moves: ['Tailwind','Brave Bird','Flare Blitz','Protect'],
        noteES: 'Gale Wings da prioridad a Tailwind. Setter sacrificio rápido y fiable.',
        noteEN: 'Gale Wings gives Tailwind priority. Fast and reliable sacrifice setter.',
      },
      {
        name: 'Delphox', types: ['fire','psychic'], usage: '6.94%', wr: '52.25%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Magician',
        moves: ['Psychic','Fire Blast','Shadow Ball','Protect'],
        noteES: '⭐ Infrautilizado — 6.94% uso para un 52.25% win rate. Magician roba objetos al atacar. Excelente pick sorpresa anti-meta.',
        noteEN: '⭐ Underused — 6.94% usage for 52.25% win rate. Magician steals items on attack. Excellent surprise anti-meta pick.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'], usage: '6.49%', wr: '50.03%', role: 'Attacker',
        item: 'Life Orb / Choice Scarf', ability: 'Sand Rush / Mold Breaker',
        moves: ['Earthquake','Iron Head','Rock Slide','Protect'],
        noteES: 'Sand Rush dobla Speed bajo Arena. Win rate neutral — equipos de Arena siendo leídos con más facilidad.',
        noteEN: 'Sand Rush doubles Speed under Sand. Neutral win rate — Sand teams being read more easily.',
      },
      {
        name: 'Gardevoir', types: ['psychic','fairy'], usage: '6.00%', wr: '50.61%', role: 'Support',
        item: 'Sitrus Berry / Choice Scarf', ability: 'Trace',
        moves: ['Moonblast','Psyshock','Trick Room','Protect'],
        noteES: 'Trace copia habilidades útiles del rival. Setter de Trick Room + atacante especial. Win rate positivo.',
        noteEN: 'Trace copies useful opponent abilities. Trick Room setter + special attacker. Positive win rate.',
      },
      {
        name: 'Primarina', types: ['water','fairy'], usage: '5.62%', wr: '50.22%', role: 'Attacker',
        item: 'Choice Specs / Sitrus Berry', ability: 'Liquid Voice',
        moves: ['Hyper Voice','Moonblast','Protect','Calm Mind'],
        noteES: 'Liquid Voice convierte Hyper Voice en Agua. Tipado Agua/Hada cubre bien el meta. Uso bajo pero consistente.',
        noteEN: 'Liquid Voice turns Hyper Voice into Water. Water/Fairy typing covers the meta well. Low but consistent usage.',
      },
    ],
  },
  {
    tier: 'D', color: '#888888', bg: 'bg-gray-950/20', border: 'border-gray-800/30',
    labelES: 'Tier D — Con dificultades', labelEN: 'Tier D — Struggling',
    pokemon: [
      {
        name: 'Venusaur', types: ['grass','poison'], usage: '9.11%', wr: '49.68%', role: 'Attacker',
        item: 'Venusaurite / Black Sludge', ability: 'Chlorophyll / Thick Fat',
        moves: ['Sludge Bomb','Energy Ball','Sleep Powder','Protect'],
        noteES: '🆕 Nuevo en Tier D. Mega Venusaur con Thick Fat reduce daño de Fuego e Hielo. Sleep Powder es peligroso pero el meta lo está leyendo bien.',
        noteEN: '🆕 New in Tier D. Mega Venusaur with Thick Fat reduces Fire and Ice damage. Sleep Powder is dangerous but meta is reading it well.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'], usage: '7.90%', wr: '49.82%', role: 'Attacker',
        item: 'Dragoninite / Loaded Dice', ability: 'Inner Focus / Multiscale',
        moves: ['Extreme Speed','Scale Shot','Hurricane','Protect'],
        noteES: 'Multiscale aguanta el primer golpe. Extreme Speed prioridad +2. Win rate bajo el 50% — eclipsado por atacantes más rápidos.',
        noteEN: 'Multiscale tanks the first hit. Extreme Speed +2 priority. Below 50% win rate — eclipsed by faster attackers.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'], usage: '7.79%', wr: '48.24%', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Cursed Body',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Protect'],
        noteES: 'Win rate negativo (48.24%). Muy frágil en el meta dominado por Sneasler. Cursed Body puede ser su salvación ocasional.',
        noteEN: 'Negative win rate (48.24%). Very frail in Sneasler-dominated meta. Cursed Body can be its occasional saving grace.',
      },
      {
        name: 'Meganium', types: ['grass'], usage: '7.42%', wr: '49.98%', role: 'Support',
        item: 'Meganiumite / Sitrus Berry', ability: 'Mega Sol',
        moves: ['Giga Drain','Aromatherapy','Helping Hand','Protect'],
        noteES: '🆕 Nuevo en Tier D. Mega Meganium con Mega Sol da ventajas del Sol sin cambiar el clima. Interesante pero aún en desarrollo estratégico.',
        noteEN: '🆕 New in Tier D. Mega Meganium with Mega Sol gives Sun perks without changing weather. Interesting but still developing strategically.',
      },
      {
        name: 'Aegislash', types: ['steel','ghost'], usage: '7.37%', wr: '49.74%', role: 'Attacker',
        item: 'Weakness Policy / Sitrus Berry', ability: 'Stance Change',
        moves: ['Shadow Ball','Iron Head','King\'s Shield','Wide Guard'],
        noteES: 'Wide Guard bloquea moves spread. Win rate ligeramente bajo el 50%. Stance Change da roles distintos pero predecible.',
        noteEN: 'Wide Guard blocks spread moves. Slightly below 50% win rate. Stance Change gives distinct roles but predictable.',
      },
      {
        name: 'Maushold', types: ['normal'], usage: '6.89%', wr: '49.60%', role: 'Attacker',
        item: 'Focus Sash / Wide Lens', ability: 'Technician / Tidy Up',
        moves: ['Population Bomb','Tidy Up','Follow Me','Protect'],
        noteES: '🆕 Nuevo en Tier D. Tidy Up limpia Sticky Web y sube stats. Population Bomb puede ser devastador. Frágil pero sorprendente.',
        noteEN: '🆕 New in Tier D. Tidy Up clears Sticky Web and boosts stats. Population Bomb can be devastating. Frail but surprising.',
      },
      {
        name: 'Torkoal', types: ['fire'], usage: '6.14%', wr: '49.56%', role: 'Setter',
        item: 'Heat Rock / Sitrus Berry', ability: 'Drought',
        moves: ['Heat Wave','Earth Power','Yawn','Protect'],
        noteES: 'Sequía invoca Sol. Core con Charizard Y. Perdiendo la guerra de clima vs Lluvia y Arena.',
        noteEN: 'Drought summons Sun. Core with Charizard Y. Losing weather war vs Rain and Sand.',
      },
      {
        name: 'Scizor', types: ['bug','steel'], usage: '4.74%', wr: '50.70%', role: 'Attacker',
        item: 'Scizorite / Choice Band', ability: 'Technician',
        moves: ['Bullet Punch','U-turn','Knock Off','Swords Dance'],
        noteES: '🆕 Nuevo en Tier D. Mega Scizor con Technician potencia Bullet Punch STAB. Win rate positivo pero uso muy bajo.',
        noteEN: '🆕 New in Tier D. Mega Scizor with Technician boosts STAB Bullet Punch. Positive win rate but very low usage.',
      },
      {
        name: 'Blastoise', types: ['water'], usage: '4.13%', wr: '51.89%', role: 'Tank',
        item: 'Blastoisinite / Sitrus Berry', ability: 'Mega Launcher',
        moves: ['Water Pulse','Dark Pulse','Aura Sphere','Protect'],
        noteES: '🆕 Nuevo en Tier D. Mega Launcher potencia moves de pulso. 51.89% win rate prometedor. Muy infrautilizado — posible gema oculta.',
        noteEN: '🆕 New in Tier D. Mega Launcher boosts pulse moves. 51.89% win rate is promising. Very underused — possible hidden gem.',
      },
    ],
  },
]

// ─── SINGLES BSS — Smogon Champions BSS Viability Rankings · Abr 17, 2026
const SINGLES_TIERS = [
  {
    tier: 'S', color: '#ff2244', bg: 'bg-red-950/30', border: 'border-red-500/30',
    labelES: 'Tier S — Dominantes', labelEN: 'Tier S — Dominant',
    pokemon: [
      {
        name: 'Corviknight', types: ['flying','steel'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Rocky Helmet', ability: 'Pressure / Mirror Armor',
        moves: ['Brave Bird','Iron Head','Roost','Body Press'],
        noteES: 'Muro físico top de Singles. Roost da longevidad enorme. Mirror Armor rebota bajadas de stats. Casi imposible de vencer sin un counter específico.',
        noteEN: 'Top physical wall in Singles. Roost gives massive longevity. Mirror Armor bounces stat drops. Nearly impossible to beat without a specific counter.',
      },
      {
        name: 'Garchomp', types: ['dragon','ground'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Soft Sand / Garchompite', ability: 'Rough Skin',
        moves: ['Earthquake','Dragon Claw','Stone Edge','Swords Dance'],
        noteES: 'All-rounder top también en Singles. Earthquake + Dragon Claw cubre casi todo. Swords Dance lo convierte en sweeper imparable.',
        noteEN: 'Top all-rounder in Singles too. Earthquake + Dragon Claw covers almost everything. Swords Dance makes it an unstoppable sweeper.',
      },
      {
        name: 'Primarina', types: ['water','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Specs / Sitrus Berry', ability: 'Liquid Voice',
        moves: ['Hyper Voice','Moonblast','Ice Beam','Calm Mind'],
        noteES: 'Liquid Voice convierte Hyper Voice en Agua — muy difícil de contrarrestar. Tipado Agua/Hada cubre el meta perfectamente.',
        noteEN: 'Liquid Voice turns Hyper Voice into Water — very hard to counter. Water/Fairy typing covers the meta perfectly.',
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
        noteES: 'A+ — Electro Shot con Power Herb es devastador. Body Press aprovecha la altísima Defensa. Stamina lo hace más difícil de derribar.',
        noteEN: 'A+ — Electro Shot with Power Herb is devastating. Body Press leverages massive Defense. Stamina makes it harder to knock down.',
      },
      {
        name: 'Charizard', types: ['fire','flying'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Charizardite Y / Charizardite X', ability: 'Drought / Blaze',
        moves: ['Fire Blast','Solar Beam','Air Slash','Dragon Pulse'],
        noteES: 'A+ — Mega Charizard Y bajo Sol es brutal en Singles sin redirección. Mega Charizard X opción física igualmente devastadora.',
        noteEN: 'A+ — Mega Charizard Y under Sun is brutal in Singles without redirection. Mega Charizard X equally devastating physical option.',
      },
      {
        name: 'Mega Gengar', types: ['ghost','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Gengarite', ability: 'Shadow Tag',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Taunt'],
        noteES: 'A+ — Shadow Tag atrapa al rival sin posibilidad de huida. Muy poderoso pero predecible. Uno de los más controvertidos del meta.',
        noteEN: 'A+ — Shadow Tag traps the opponent with no escape. Very powerful but predictable. One of the most controversial in the meta.',
      },
      {
        name: 'Mega Lopunny', types: ['normal','fighting'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Lopunnite', ability: 'Scrappy',
        moves: ['Return','High Jump Kick','Ice Punch','Fake Out'],
        noteES: 'A+ — Scrappy le permite golpear Fantasma con Normal. Extremadamente rápido. High Jump Kick es un nuker tremendo.',
        noteEN: 'A+ — Scrappy lets it hit Ghosts with Normal. Extremely fast. High Jump Kick is a tremendous nuke.',
      },
      {
        name: 'Meowscarada', types: ['grass','dark'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Scarf / Focus Sash', ability: 'Overgrow / Protean',
        moves: ['Flower Trick','Knock Off','Play Rough','U-turn'],
        noteES: 'A+ — Flower Trick siempre critica. Protean cambia de tipo con cada move. Knock Off devastador en Singles.',
        noteEN: 'A+ — Flower Trick always crits. Protean changes type with each move. Knock Off devastating in Singles.',
      },
      {
        name: 'Mega Venusaur', types: ['grass','poison'], usage: '—', wr: '—', role: 'Tank',
        item: 'Venusaurite', ability: 'Thick Fat',
        moves: ['Sludge Bomb','Energy Ball','Synthesis','Sleep Powder'],
        noteES: 'A+ — Thick Fat reduce daño de Fuego e Hielo. Synthesis da curación enorme. Sleep Powder permite KOs gratuitos.',
        noteEN: 'A+ — Thick Fat halves Fire and Ice damage. Synthesis gives massive healing. Sleep Powder enables free KOs.',
      },
      {
        name: 'Aegislash', types: ['steel','ghost'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Weakness Policy / Sitrus Berry', ability: 'Stance Change',
        moves: ['Shadow Ball','Iron Head','King\'s Shield','Shadow Sneak'],
        noteES: 'A — Stance Change alterna ataque y defensa. Shadow Sneak da prioridad STAB. King\'s Shield anula físicos y baja el Atk rival.',
        noteEN: 'A — Stance Change alternates attack and defense. Shadow Sneak gives STAB priority. King\'s Shield nullifies physical and lowers rival Atk.',
      },
      {
        name: 'Mega Delphox', types: ['fire','psychic'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Delphoxite', ability: 'Magician',
        moves: ['Psychic','Fire Blast','Shadow Ball','Grass Knot'],
        noteES: 'A — Magician roba el objeto del rival con cada ataque. Muy peligroso en Singles donde no hay redirección.',
        noteEN: 'A — Magician steals rival\'s item with each attack. Very dangerous in Singles without redirection.',
      },
      {
        name: 'Hippowdon', types: ['ground'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Smooth Rock', ability: 'Sand Stream',
        moves: ['Earthquake','Slack Off','Stealth Rock','Stone Edge'],
        noteES: 'A — Muro físico top con curación. Sand Stream invoca Arena para daño pasivo. Slack Off da longevidad enorme.',
        noteEN: 'A — Top physical wall with healing. Sand Stream summons Sandstorm for passive damage. Slack Off gives massive longevity.',
      },
      {
        name: 'Kingambit', types: ['dark','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Leftovers', ability: 'Supreme Overlord',
        moves: ['Kowtow Cleave','Iron Head','Sucker Punch','Swords Dance'],
        noteES: 'A — Supreme Overlord más poderoso en Singles. Sucker Punch para remates. Sweeper de late game devastador.',
        noteEN: 'A — Supreme Overlord stronger in Singles. Sucker Punch for finishing. Devastating late-game sweeper.',
      },
      {
        name: 'Sneasler', types: ['fighting','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Focus Sash / Life Orb', ability: 'Unburden / Pressure',
        moves: ['Close Combat','Dire Claw','Acrobatics','Swords Dance'],
        noteES: 'A — Fuerte en Singles también. Dire Claw sigue siendo peligrosísimo. Unburden menos fiable sin contexto de Dobles.',
        noteEN: 'A — Strong in Singles too. Dire Claw is still very dangerous. Unburden less reliable without Doubles context.',
      },
      {
        name: 'Mega Scizor', types: ['bug','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Scizorite', ability: 'Technician',
        moves: ['Bullet Punch','U-turn','Knock Off','Swords Dance'],
        noteES: 'A — Technician potencia Bullet Punch STAB con prioridad. Knock Off devastador en Singles. Excelente pivot.',
        noteEN: 'A — Technician boosts STAB Bullet Punch with priority. Knock Off devastating in Singles. Excellent pivot.',
      },
      {
        name: 'Mega Victreebel', types: ['grass','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Victreebellite', ability: 'Chlorophyll',
        moves: ['Power Whip','Sludge Bomb','Sleep Powder','Sucker Punch'],
        noteES: 'A — Chlorophyll dobla Speed bajo Sol. Sleep Powder permite KOs libres. Sinergia top con Charizard Y.',
        noteEN: 'A — Chlorophyll doubles Speed under Sun. Sleep Powder enables free KOs. Top synergy with Charizard Y.',
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
        noteES: 'A- — Tough Claws potencia moves de contacto. Dragon Dance + Tough Claws: sweeper imparable tras 1 turno.',
        noteEN: 'A- — Tough Claws boosts contact moves. Dragon Dance + Tough Claws: unstoppable sweeper after 1 turn.',
      },
      {
        name: 'Dragonite', types: ['dragon','flying'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Dragoninite / Lum Berry', ability: 'Multiscale',
        moves: ['Extreme Speed','Dragon Claw','Thunder Wave','Fire Punch'],
        noteES: 'A- — Multiscale aguanta el primer golpe. Extreme Speed +2 prioridad es único. Excelente en Singles.',
        noteEN: 'A- — Multiscale tanks the first hit. Extreme Speed +2 priority is unique. Excellent in Singles.',
      },
      {
        name: 'Hydreigon', types: ['dark','dragon'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Scarf / Choice Specs', ability: 'Levitate',
        moves: ['Draco Meteor','Dark Pulse','Fire Blast','U-turn'],
        noteES: 'A- — Levitate da inmunidad a Tierra. Draco Meteor con Specs devastador. Excelente pivot con U-turn.',
        noteEN: 'A- — Levitate gives Ground immunity. Draco Meteor with Specs devastating. Excellent pivot with U-turn.',
      },
      {
        name: 'Mimikyu', types: ['ghost','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Sitrus Berry', ability: 'Disguise',
        moves: ['Play Rough','Shadow Sneak','Swords Dance','Shadow Claw'],
        noteES: 'A- — Disguise garantiza un turno gratuito. Swords Dance + Disguise muy poderoso en Singles.',
        noteEN: 'A- — Disguise guarantees a free turn. Swords Dance + Disguise very powerful in Singles.',
      },
      {
        name: 'Rotom-Wash', types: ['electric','water'], usage: '—', wr: '—', role: 'Support',
        item: 'Sitrus Berry / Leftovers', ability: 'Levitate',
        moves: ['Hydro Pump','Thunderbolt','Will-O-Wisp','Volt Switch'],
        noteES: 'A- — Pivot eléctrico con Levitate. Will-O-Wisp quema físicos. Volt Switch para salir con ventaja.',
        noteEN: 'A- — Electric pivot with Levitate. Will-O-Wisp burns physical attackers. Volt Switch for safe exits.',
      },
      {
        name: 'Sylveon', types: ['fairy'], usage: '—', wr: '—', role: 'Tank',
        item: 'Sitrus Berry / Leftovers', ability: 'Pixilate',
        moves: ['Hyper Voice','Moonblast','Calm Mind','Wish'],
        noteES: 'A- — Pixilate convierte Hyper Voice en Hada potenciada. Wish da curación al equipo. Muro especial Hada.',
        noteEN: 'A- — Pixilate turns Hyper Voice into boosted Fairy. Wish heals teammates. Fairy special wall.',
      },
      {
        name: 'Tyranitar', types: ['rock','dark'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Choice Band / Smooth Rock', ability: 'Sand Stream',
        moves: ['Stone Edge','Crunch','Earthquake','Ice Punch'],
        noteES: 'A- — Bulk masivo + STAB Roca. Sand Stream activa Sand Rush en Excadrill. Core de Arena muy efectivo.',
        noteEN: 'A- — Massive bulk + Rock STAB. Sand Stream activates Excadrill Sand Rush. Very effective Sand core.',
      },
      {
        name: 'Umbreon', types: ['dark'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Synchronize',
        moves: ['Foul Play','Moonlight','Wish','Toxic'],
        noteES: 'A- — Synchronize propaga status al rival. Wish cura al equipo. Foul Play usa el Atk rival en su contra.',
        noteEN: 'A- — Synchronize spreads status to rival. Wish heals team. Foul Play uses rival\'s Attack against them.',
      },
      {
        name: 'Basculegion', types: ['water','ghost'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Adaptability',
        moves: ['Wave Crash','Shadow Ball','Aqua Jet','Flip Turn'],
        noteES: 'B+ — Adaptabilidad + Wave Crash devastador. Aqua Jet prioridad. Flip Turn para pivotar. En auge gracias a su tier A en Dobles.',
        noteEN: 'B+ — Adaptability + Wave Crash devastating. Aqua Jet priority. Flip Turn for pivoting. Rising thanks to its Tier A in Doubles.',
      },
      {
        name: 'Excadrill', types: ['ground','steel'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Air Balloon', ability: 'Sand Rush / Mold Breaker',
        moves: ['Earthquake','Iron Head','Rock Slide','Swords Dance'],
        noteES: 'B+ — Sand Rush dobla Speed bajo Arena. Mold Breaker ignora Levitate. Sweeper de Arena muy peligroso.',
        noteEN: 'B+ — Sand Rush doubles Speed under Sand. Mold Breaker ignores Levitate. Very dangerous Sand sweeper.',
      },
      {
        name: 'Gengar', types: ['ghost','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Life Orb / Choice Specs', ability: 'Cursed Body',
        moves: ['Shadow Ball','Sludge Bomb','Dazzling Gleam','Taunt'],
        noteES: 'B+ — Sin Gengarite, Cursed Body puede bloquear moves clave. Frágil pero SpAtk enorme.',
        noteEN: 'B+ — Without Gengarite, Cursed Body can block key moves. Frail but enormous SpAtk.',
      },
      {
        name: 'Glimmora', types: ['rock','poison'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Power Herb / Focus Sash', ability: 'Toxic Debris',
        moves: ['Sludge Bomb','Power Gem','Earth Power','Spikes'],
        noteES: 'B+ — Toxic Debris pone Púas Tóxicas cuando lo golpean con físicos. Spikes para hazards. Presión pasiva excelente.',
        noteEN: 'B+ — Toxic Debris sets Toxic Spikes when hit with physical moves. Spikes for hazards. Excellent passive pressure.',
      },
      {
        name: 'Azumarill', types: ['water','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Assault Vest', ability: 'Huge Power',
        moves: ['Aqua Jet','Play Rough','Belly Drum','Ice Punch'],
        noteES: 'B — Enorme Poder dobla el Ataque base. Aqua Jet prioridad STAB. Amenaza real de late game.',
        noteEN: 'B — Huge Power doubles base Attack. Aqua Jet STAB priority. Real late-game threat.',
      },
      {
        name: 'Volcarona', types: ['bug','fire'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Lum Berry', ability: 'Flame Body',
        moves: ['Quiver Dance','Fire Blast','Bug Buzz','Giga Drain'],
        noteES: 'B — Quiver Dance eleva SpAtk, SpDef y Speed a la vez. Devastador tras 1-2 boosts.',
        noteEN: 'B — Quiver Dance raises SpAtk, SpDef and Speed simultaneously. Devastating after 1-2 boosts.',
      },
      {
        name: 'Mega Kangaskhan', types: ['normal'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Kangaskhanite', ability: 'Parental Bond',
        moves: ['Return','Earthquake','Sucker Punch','Power-Up Punch'],
        noteES: 'B — Parental Bond golpea dos veces. Power-Up Punch da +1 Ataque dos veces. STAB Normal potente.',
        noteEN: 'B — Parental Bond hits twice. Power-Up Punch gives +1 Attack twice. Strong Normal STAB.',
      },
      {
        name: 'Snorlax', types: ['normal'], usage: '—', wr: '—', role: 'Tank',
        item: 'Leftovers / Sitrus Berry', ability: 'Thick Fat / Immunity',
        moves: ['Body Slam','Earthquake','Rest','Sleep Talk'],
        noteES: 'B — HP enorme y Thick Fat reduce Fuego e Hielo. Rest + Sleep Talk da curación completa.',
        noteEN: 'B — Massive HP and Thick Fat reduces Fire and Ice. Rest + Sleep Talk gives full recovery.',
      },
      {
        name: 'Mega Gardevoir', types: ['psychic','fairy'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Gardevoirite', ability: 'Pixilate',
        moves: ['Hyper Voice','Psyshock','Shadow Ball','Calm Mind'],
        noteES: 'B- — Pixilate convierte Hyper Voice en Hada. SpAtk altísimo. Frágil pero devastadora.',
        noteEN: 'B- — Pixilate turns Hyper Voice into Fairy. Very high SpAtk. Frail but devastating.',
      },
      {
        name: 'Espathra', types: ['psychic'], usage: '—', wr: '—', role: 'Attacker',
        item: 'Sitrus Berry / Lum Berry', ability: 'Speed Boost',
        moves: ['Lumina Crash','Dazzling Gleam','Calm Mind','Protect'],
        noteES: 'B- — Speed Boost aumenta la Speed cada turno. Lumina Crash baja SpDef 2 niveles. Controversialmente fuerte.',
        noteEN: 'B- — Speed Boost increases Speed each turn. Lumina Crash lowers SpDef 2 stages. Controversially strong.',
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
            {format === 'doubles' ? 'TIER LIST DOBLES · REGULATION M-A' : 'TIER LIST SINGLES BSS · REGULATION M-A'}
          </p>
          <p className="font-mono-tech text-xs text-[#4a6070]">
            {format === 'doubles'
              ? 'showdowntier.com · 107.251 batallas · Abr 10–23, 2026 · Rating medio 1271'
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
                            {p.usage !== '—' && (
                              <div className="flex gap-4 mb-3 sm:hidden">
                                <span className="font-mono-tech text-xs text-[#4a6070]">{p.usage} {lang === 'es' ? 'uso' : 'use'}</span>
                                <span className="font-mono-tech text-xs font-bold" style={{ color: tier.color }}>{p.wr} {lang === 'es' ? 'win' : 'win'}</span>
                              </div>
                            )}
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
                ? '📊 Datos de showdowntier.com — 107.251 batallas Reg M-A, Abr 10–23 2026, rating medio 1271. Sets de Pikalytics Champions Tournament.'
                : '📊 Data from showdowntier.com — 107,251 Reg M-A battles, Apr 10–23 2026, avg rating 1271. Sets from Pikalytics Champions Tournament.')
              : (lang === 'es'
                ? '📊 Rankings de Smogon VR Council — Champions Battle Stadium Singles, Abr 17 2026.'
                : '📊 Smogon VR Council rankings — Champions Battle Stadium Singles, Apr 17 2026.')}
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