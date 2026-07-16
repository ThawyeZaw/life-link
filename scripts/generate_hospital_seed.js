// Script to generate properly UTF-8 encoded hospital seed SQL
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(
  path.join(__dirname, '..', 'lib', 'public-hospitals-in-myanmar-data.json'),
  'utf-8'
);
const data = JSON.parse(raw);

const filtered = data.features.filter(
  (f) => f.properties.SR === 'Yangon' || f.properties.SR === 'Mandalay'
);

const escapeSql = (s) => (s || '').replace(/'/g, "''");

const lines = [];
lines.push('-- Vertex Red -- Yangon & Mandalay Hospitals (UTF-8 Bilingual)');
lines.push(`-- Total: ${filtered.length} hospitals\n`);
lines.push('DELETE FROM public.hospitals;\n');
lines.push('INSERT INTO public.hospitals (name, name_mya, township, address, lat, lng, verification_status) VALUES');

const rows = filtered.map((h) => {
  const p = h.properties;
  const c = h.geometry.coordinates;
  const name = escapeSql(p.nmHsp_eng || 'Unknown');
  const nameMya = escapeSql(p.nmHsp_mya || '');
  const ts = escapeSql(p.TS_en || 'Unknown');
  const addr = escapeSql(`${p.SR}, ${p.DT} District`);
  const lat = Math.round(c[1] * 1e7) / 1e7;
  const lng = Math.round(c[0] * 1e7) / 1e7;
  return `('${name}', '${nameMya}', '${ts}', '${addr}', ${lat}, ${lng}, 'APPROVED')`;
});

lines.push(rows.join(',\n') + ';');

const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260716000400_fix_myanmar_encoding.sql');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
console.log(`Written ${filtered.length} hospitals to ${outputPath}`);
