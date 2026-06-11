/**
 * Font role map for the Pokemon channel.
 * Each stack lists the authentic face first (loaded from the gitignored
 * /fonts-local/ folder when the user supplies it, see src/fonts-local.css)
 * and the bundled OFL substitute as fallback.
 * Role research: .claude/knowledge/research/pokemon-card-fonts.md.
 */
export const POKEMON_FONTS: Record<string, string> = {
  name: "'Gill Sans Std Regular Bold', 'Cabin', sans-serif",
  hpNumber: "'Gill Sans Std Ultra Bold', 'Cabin', sans-serif",
  hpPrefix: "'Futura LT Medium Bold', 'Jost', sans-serif",
  stage: "'Frutiger LT 66 Bold Italic', 'Inter', sans-serif",
  attackName: "'Gill Sans Std Bold Condensed', 'Cabin Condensed', sans-serif",
  body: "'Gill Sans Std Regular', 'Cabin', sans-serif",
  damage: "'Futura Std Heavy', 'Jost', sans-serif",
  typeBar: "'Futura LT Medium Bold', 'Jost', sans-serif",
  illustrator: "'Futura Std Bold Oblique', 'Jost', sans-serif",
  setNumber: "'Frutiger LT 66 Bold Italic', 'Inter', sans-serif",
  flavor: "'Optima Medium', 'Tenor Sans', sans-serif",
  copyright: "'Frutiger LT 55 Roman', 'Inter', sans-serif",
};
