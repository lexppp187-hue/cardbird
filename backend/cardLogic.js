// backend/cardLogic.js
// Простая логика генерации карт и редкостей

const rarities = [
  { type: 'Legendary', chance: 2 },
  { type: 'Epic', chance: 8 },
  { type: 'Rare', chance: 20 },
  { type: 'Common', chance: 70 }
];

function randomRarity() {
  const roll = Math.random() * 100;
  let sum = 0;
  for (const r of rarities) {
    sum += r.chance;
    if (roll <= sum) return r.type;
  }
  return 'Common';
}

function generatePack(count = 5) {
  return Array.from({ length: count }, () => {
    const rarity = randomRarity();
    const id = Math.random().toString(36).slice(2, 9);
    return { id, name: `${rarity} Card`, rarity };
  });
}

module.exports = { generatePack, randomRarity };
