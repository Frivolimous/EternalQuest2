import * as _ from 'lodash';

import { EnchantSlug, ItemSlug } from './ItemData';
import { SkillSlug, SkillTreeSlug } from './SkillData';
import { ZoneId, EnemySetId, EnemySlug } from './EnemyData';

export const StringData = {
  GAME_TITLE: 'Eternal Quest',

  ZONE_NAME: {
    [ZoneId.FOREST]: 'Forest',
    [ZoneId.DESERT]: 'Desert',
    [ZoneId.REALM]: 'Realm',
  },

  MONSTER_SET_NAME: {
    [EnemySetId.GOBLIN]: 'Goblin',
    [EnemySetId.BEAST]: 'Beast',
    [EnemySetId.DEMON]: 'Demonic',
    [EnemySetId.UNDEAD]: 'Undead',
    [EnemySetId.DROW]: 'Dark Elf',
  },

  ENEMY_NAME: {
    [EnemySlug.G_WARRIOR]: 'Warrior',
    [EnemySlug.G_BRUTE]: 'Brute',
    [EnemySlug.G_ALCHEMIST]: 'Alchemist',
    [EnemySlug.G_SHAMAN]: 'Shaman',
    [EnemySlug.G_BLOB]: 'Blobling',
    [EnemySlug.G_BOSS]: 'Chieftain',
  },

  SKILL: {
    [SkillSlug.FITNESS]: 'Fitness',
    [SkillSlug.TOUGHNESS]: 'Toughness',
    [SkillSlug.SUPER_STRENGTH]: 'Super Strength',
    [SkillSlug.LEAP_ATTACK]: 'Leap Attack',
    [SkillSlug.COMBAT_TRAINING]: 'Combat Training',
    [SkillSlug.SPELL_TURNING]: 'Spell Turning',
    [SkillSlug.VESSEL]: 'Vessel',
    [SkillSlug.MAGICAL_APTITUDE]: 'Magical Aptitude',
    [SkillSlug.FOCUS]: 'Focus',
    [SkillSlug.ATTUNEMENT]: 'Attunement',
    [SkillSlug.DOUBLESHOT]: 'Doubleshot',
    [SkillSlug.VITAL_STRIKE]: 'Vital Strike',
    [SkillSlug.EAGLE_EYE]: 'Eagle Eye',
    [SkillSlug.BATTLE_AWARENESS]: 'Battle Awareness',
    [SkillSlug.WITHDRAW]: 'Withdraw',

    [SkillSlug.WARRIOR]: 'Warrior',
    [SkillSlug.MAGE]: 'Mage',
    [SkillSlug.RANGER]: 'Ranger',

    [SkillSlug.ORDINARY]: 'Ordinary',
    [SkillSlug.DEFT]: 'Deft',
    [SkillSlug.UNGIFTED]: 'Ungifted',
    [SkillSlug.ENLIGHTENED]: 'Enlightenment',
    [SkillSlug.HOLY]: 'Holy',
    [SkillSlug.NOBLE]: 'Noble',
    [SkillSlug.CLEVER]: 'Clever',
    [SkillSlug.POWERFUL]: 'Powerful',
    [SkillSlug.WILD]: 'Wild',
    [SkillSlug.STUDIOUS]: 'Studious',
  },
  SKILL_DESC: {
    [SkillSlug.FITNESS]: 'Working out makes you physically fit.',
    [SkillSlug.SUPER_STRENGTH]: 'Strength training has given your attacks great potential.',
    [SkillSlug.COMBAT_TRAINING]: 'Your weapons training has made you a formidable foe.',
    [SkillSlug.TOUGHNESS]: 'You have trained your body to withstand even the mightiest blows.',
    [SkillSlug.LEAP_ATTACK]: 'True flight is one step closer.',
    [SkillSlug.MAGICAL_APTITUDE]: 'Your spiritual eye opens to reveal what lies beyond.',
    [SkillSlug.FOCUS]: 'Your mind hones in like a hawk swooping for its prey.',
    [SkillSlug.VESSEL]: 'Your soul becomes empty and ready to receive.',
    [SkillSlug.ATTUNEMENT]: 'Magical energies course through you harmlessly regardless of the source.',
    [SkillSlug.SPELL_TURNING]: 'Your mind is ever alert, your skin tingling as magical powers manifest.',
    [SkillSlug.EAGLE_EYE]: 'Your mind is sharp, your aim is true.',
    [SkillSlug.DOUBLESHOT]: 'Your hand is quicker than your opponent\'s eye.',
    [SkillSlug.BATTLE_AWARENESS]: 'After a lifetime of practice you have developped a 6th sense for danger.',
    [SkillSlug.VITAL_STRIKE]: 'A hunter must know how to strike for maximum potential.',
    [SkillSlug.WITHDRAW]: 'The key to staying alive is staying out of danger.',

    [SkillSlug.WARRIOR]: 'Your weapon becomes an extension of your self.',
    [SkillSlug.MAGE]: 'Mystical energies bend to your will.',
    [SkillSlug.RANGER]: 'You learn how to keep your opponents at bay.',

    [SkillSlug.ORDINARY]: 'You are a regular nobody who comes from a small town in the middle of nowhere.',
    [SkillSlug.DEFT]: 'Your speed and stealth are legendary.',
    [SkillSlug.CLEVER]: 'You have an eye for valuables and a love of utilities.',
    [SkillSlug.UNGIFTED]: 'Sages are baffled by the way magic avoids you.',
    [SkillSlug.STUDIOUS]: 'Other scientists gawk at your accomplishments.',
    [SkillSlug.ENLIGHTENED]: 'Seekers of truth and power flock to you, hoping for answers.',
    [SkillSlug.POWERFUL]: 'Tales of your might are spoken in taverns across the land.',
    [SkillSlug.HOLY]: 'You are known as a man of piety and honour.',
    [SkillSlug.WILD]: 'Your unusual fighting style makes others wary of you.',
    [SkillSlug.NOBLE]: 'You were born to a wealthy family with many resources.',
  },

  SKILL_TREE: {
    [SkillTreeSlug.WARRIOR]: 'Warrior',
    [SkillTreeSlug.MAGE]: 'Wizard',
    [SkillTreeSlug.RANGER]: 'Ranger',
    [SkillTreeSlug.MONK]: 'Monk',
    [SkillTreeSlug.SCIENTIST]: 'Scientist',
    [SkillTreeSlug.PALADIN]: 'Paladin',
    [SkillTreeSlug.ACOLYTE]: 'Acolyte',
    [SkillTreeSlug.ROGUE]: 'Rogue',
    [SkillTreeSlug.BERSERKER]: 'Berserker',
  },

  SKILL_TREE_DESC: {
    [SkillTreeSlug.WARRIOR]: 'Mixture of Offense and Defense',
    [SkillTreeSlug.MAGE]: 'Specialized spellcaster and destroyer.',
    [SkillTreeSlug.RANGER]: 'Ranged Master and Critical Thinker.',
    [SkillTreeSlug.MONK]: 'Unarmed warrior with mystic tendencies',
    [SkillTreeSlug.SCIENTIST]: 'Many tricks and many treats.',
    [SkillTreeSlug.ACOLYTE]: 'Made a deal with darkness for more power.',
    [SkillTreeSlug.PALADIN]: 'Made a deal with the light for more power.',
    [SkillTreeSlug.ROGUE]: 'Master of shadows and lethality.',
    [SkillTreeSlug.BERSERKER]: 'Warrior from the wilds, full of fury',
  },

  TITLES_MINOR: {
    [SkillTreeSlug.WARRIOR]: 'Fighter',
    [SkillTreeSlug.MAGE]: 'Mage',
    [SkillTreeSlug.RANGER]: 'Scout',
    [SkillTreeSlug.MONK]: 'Centered',
    [SkillTreeSlug.SCIENTIST]: 'Tinkering',
    [SkillTreeSlug.PALADIN]: 'Light',
    [SkillTreeSlug.ACOLYTE]: 'Dark',
    [SkillTreeSlug.ROGUE]: 'Hidden',
    [SkillTreeSlug.BERSERKER]: 'Enraged',
  },

  TITLES_PREFIX: {
    [SkillTreeSlug.WARRIOR]: 'Hardened',
    [SkillTreeSlug.MAGE]: 'Gifted',
    [SkillTreeSlug.RANGER]: 'Wandering',
    [SkillTreeSlug.MONK]: 'Brawler',
    [SkillTreeSlug.SCIENTIST]: 'Gadgeteer',
    [SkillTreeSlug.PALADIN]: 'Initiate',
    [SkillTreeSlug.ACOLYTE]: 'Cultist',
    [SkillTreeSlug.ROGUE]: 'Sneak',
    [SkillTreeSlug.BERSERKER]: 'Rager',
  },

  TITLES_COMB: {
    [SkillTreeSlug.WARRIOR]: {
      [SkillTreeSlug.WARRIOR]: 'Warrior',
      [SkillTreeSlug.MAGE]: 'Spellsword',
      [SkillTreeSlug.RANGER]: 'Mercenary',
      [SkillTreeSlug.MONK]: 'Gladiator',
      [SkillTreeSlug.SCIENTIST]: 'Trooper',
      [SkillTreeSlug.PALADIN]: 'Knight',
      [SkillTreeSlug.ACOLYTE]: 'Reaper',
      [SkillTreeSlug.ROGUE]: 'Bandit',
      [SkillTreeSlug.BERSERKER]: 'Ironguard',
    },
    [SkillTreeSlug.MAGE]: {
      [SkillTreeSlug.WARRIOR]: 'Warmage',
      [SkillTreeSlug.MAGE]: 'Wizard',
      [SkillTreeSlug.RANGER]: 'Wuss',
      [SkillTreeSlug.MONK]: 'Mystic',
      [SkillTreeSlug.SCIENTIST]: 'Librarian',
      [SkillTreeSlug.PALADIN]: 'Exorcist',
      [SkillTreeSlug.ACOLYTE]: 'Warlock',
      [SkillTreeSlug.ROGUE]: 'Illusionist',
      [SkillTreeSlug.BERSERKER]: 'Stormchanter',
    },
    [SkillTreeSlug.RANGER]: {
      [SkillTreeSlug.WARRIOR]: 'Duelist',
      [SkillTreeSlug.MAGE]: 'Warden',
      [SkillTreeSlug.RANGER]: 'Ranger',
      [SkillTreeSlug.MONK]: 'Dervish',
      [SkillTreeSlug.SCIENTIST]: 'Hunter',
      [SkillTreeSlug.PALADIN]: 'Nazir',
      [SkillTreeSlug.ACOLYTE]: 'Dusk',
      [SkillTreeSlug.ROGUE]: 'Bountyhunter',
      [SkillTreeSlug.BERSERKER]: 'Survivor',
    },
    [SkillTreeSlug.MONK]: {
      [SkillTreeSlug.WARRIOR]: 'Enforcer',
      [SkillTreeSlug.MAGE]: 'Kuji',
      [SkillTreeSlug.RANGER]: 'Seeker',
      [SkillTreeSlug.MONK]: 'Monk',
      [SkillTreeSlug.SCIENTIST]: 'Drunken Master',
      [SkillTreeSlug.PALADIN]: 'Sifu',
      [SkillTreeSlug.ACOLYTE]: 'Nightmare',
      [SkillTreeSlug.ROGUE]: 'Spy',
      [SkillTreeSlug.BERSERKER]: 'Bouncer',
    },
    [SkillTreeSlug.SCIENTIST]: {
      [SkillTreeSlug.WARRIOR]: 'Grenadier',
      [SkillTreeSlug.MAGE]: 'Magister',
      [SkillTreeSlug.RANGER]: 'Herbalist',
      [SkillTreeSlug.MONK]: 'Brewmaster',
      [SkillTreeSlug.SCIENTIST]: 'Scientist',
      [SkillTreeSlug.PALADIN]: 'Friar',
      [SkillTreeSlug.ACOLYTE]: 'Locusta',
      [SkillTreeSlug.ROGUE]: 'Toxicologist',
      [SkillTreeSlug.BERSERKER]: 'Frustrated',
    },
    [SkillTreeSlug.PALADIN]: {
      [SkillTreeSlug.WARRIOR]: 'Templar',
      [SkillTreeSlug.MAGE]: 'Seer',
      [SkillTreeSlug.RANGER]: 'Executioner',
      [SkillTreeSlug.MONK]: 'Avenger',
      [SkillTreeSlug.SCIENTIST]: 'Meister',
      [SkillTreeSlug.PALADIN]: 'Paladin',
      [SkillTreeSlug.ACOLYTE]: 'Zealot',
      [SkillTreeSlug.ROGUE]: 'Undertaker',
      [SkillTreeSlug.BERSERKER]: 'Blatherer',
    },
    [SkillTreeSlug.ACOLYTE]: {
      [SkillTreeSlug.WARRIOR]: 'Doombringer',
      [SkillTreeSlug.MAGE]: 'Occultist',
      [SkillTreeSlug.RANGER]: 'Flayer',
      [SkillTreeSlug.MONK]: 'Fanatic',
      [SkillTreeSlug.SCIENTIST]: 'Scryer',
      [SkillTreeSlug.PALADIN]: 'Shaman',
      [SkillTreeSlug.ACOLYTE]: 'Acolyte',
      [SkillTreeSlug.ROGUE]: 'Vizir',
      [SkillTreeSlug.BERSERKER]: 'Horror',
    },
    [SkillTreeSlug.ROGUE]: {
      [SkillTreeSlug.WARRIOR]: 'Instigator',
      [SkillTreeSlug.MAGE]: 'Trickster',
      [SkillTreeSlug.RANGER]: 'Thief',
      [SkillTreeSlug.MONK]: 'Ninja',
      [SkillTreeSlug.SCIENTIST]: 'Hacker',
      [SkillTreeSlug.PALADIN]: 'Masquerade',
      [SkillTreeSlug.ACOLYTE]: 'Assassin',
      [SkillTreeSlug.ROGUE]: 'Rogue',
      [SkillTreeSlug.BERSERKER]: 'Seether',
    },
    [SkillTreeSlug.BERSERKER]: {
      [SkillTreeSlug.WARRIOR]: 'Destroyer',
      [SkillTreeSlug.MAGE]: 'Rage Mage',
      [SkillTreeSlug.RANGER]: 'Barbarian',
      [SkillTreeSlug.MONK]: 'Brute',
      [SkillTreeSlug.SCIENTIST]: 'Psychotic',
      [SkillTreeSlug.PALADIN]: 'Executioner',
      [SkillTreeSlug.ACOLYTE]: 'Chaotical',
      [SkillTreeSlug.ROGUE]: 'Hurricane',
      [SkillTreeSlug.BERSERKER]: 'Berserker',
    },
  },

  ENCHANT: {
    [EnchantSlug.MASTER]: 'Master',
    [EnchantSlug.FOCAL]: 'Focal',
    [EnchantSlug.MYSTIC]: 'Mystic',
    [EnchantSlug.GUIDED]: 'Guided',
    [EnchantSlug.KEEN]: 'Keen',
    [EnchantSlug.GRENADIER]: 'Grenadier',
    [EnchantSlug.DEFENDER]: 'Defender',
    [EnchantSlug.FLAMING]: 'Flaming',
    [EnchantSlug.BRILLIANT]: 'Brilliant',
    [EnchantSlug.VENOMOUS]: 'Venomous',
    [EnchantSlug.EXPLOSIVE]: 'Explosive',
    [EnchantSlug.CURSING]: 'Cursing',
    [EnchantSlug.VAMPIRIC]: 'Vampiric',
    [EnchantSlug.DAZZLING]: 'Dazzling',
    [EnchantSlug.REFLECTIVE]: 'Reflective',
    [EnchantSlug.SUPERIOR]: 'Superior',
    [EnchantSlug.WIZARD]: 'Wizard',
    [EnchantSlug.TROLL]: 'Troll',
    [EnchantSlug.CHANNELING]: 'Channeling',
    [EnchantSlug.LIGHT]: 'Light',
    [EnchantSlug.WARDED]: 'Warded',
    [EnchantSlug.ALCHEMIST]: 'Alchemist',
    [EnchantSlug.VIRTUOUS]: 'Virtuous',
    [EnchantSlug.PROTECTIVE]: 'Protective',
    [EnchantSlug.SEEKING]: 'Seeking',
    [EnchantSlug.CLOAKING]: 'Cloaking',
    [EnchantSlug.UTILITY]: 'Utility',
    [EnchantSlug.SPIKEY]: 'Spikey',
    [EnchantSlug.BERSERKER]: 'Berserker',
    [EnchantSlug.FEARSOME]: 'Fearsome',
    [EnchantSlug.HOMING]: 'Homing',
    [EnchantSlug.PLENTIFUL]: 'Plentiful',
    [EnchantSlug.UNLIMITED]: 'Unlimited',
    [EnchantSlug.READY]: 'Ready',
  },

  ITEM: {
    [ItemSlug.GREATSWORD]: 'Greatsword',
    [ItemSlug.BATTLE_AXE]: 'Battle Axe',
    [ItemSlug.STAFF]: 'Staff',
    [ItemSlug.SHORT_SWORDS]: 'Short Swords',
    [ItemSlug.GLOVES]: 'Gloves',
    [ItemSlug.DAGGERS]: 'Daggers',
    [ItemSlug.SWORD_SHIELD]: 'Sword & Shield',
    [ItemSlug.AXE_SHIELD]: 'Axe & Shield',
    [ItemSlug.MACE_SHIELD]: 'Mace & Shield',
    [ItemSlug.SHORTBOW]: 'Shortbow',
    [ItemSlug.BANDANA]: 'Bandana',
    [ItemSlug.CONE]: 'Cone',
    [ItemSlug.CAP]: 'Cap',
    [ItemSlug.HELMET]: 'Helmet',
    [ItemSlug.ARMET]: 'Armet',
    [ItemSlug.MAGIC_BOLT]: 'Magic Bolt',
    [ItemSlug.FIREBALL]: 'Fireball',
    [ItemSlug.LIGHTNING]: 'Lightning',
    [ItemSlug.SEARING_LIGHT]: 'Searing Light',
    [ItemSlug.POISON_BOLT]: 'Poison Bolt',
    [ItemSlug.CONFUSION]: 'Confusion',
    [ItemSlug.CRIPPLE]: 'Cripple',
    [ItemSlug.VULNERABILITY]: 'Vulnerability',
    [ItemSlug.HEALING]: 'Healing',
    [ItemSlug.EMPOWER]: 'Empower',
    [ItemSlug.HASTE]: 'Haste',
    [ItemSlug.ENCHANT_WEAPON]: 'Enchant Weapon',
    [ItemSlug.HEALING_POTION]: 'Healing Potion',
    [ItemSlug.MANA_POTION]: 'Mana Potion',
    [ItemSlug.AMPLIFICATION_POTION]: 'Amplification Potion',
    [ItemSlug.RECOVERY_POTION]: 'Recovery Potion',
    [ItemSlug.CELERITY_POTION]: 'Celerity Potion',
    [ItemSlug.TURTLE_SOUP]: 'Turtle Soup',
    [ItemSlug.PURITY_POTION]: 'Purity Potion',
    [ItemSlug.ALCHEMIST_FIRE]: 'Alchemist Fire',
    [ItemSlug.TOXIC_GAS]: 'Toxic Gas',
    [ItemSlug.HOLY_WATER]: 'Holy Water',
    [ItemSlug.THROWING_DAGGER]: 'Throwing Dagger',
    [ItemSlug.THROWING_AXE]: 'Throwing Axe',
    [ItemSlug.DARTS]: 'Darts',
    [ItemSlug.STATUE]: 'Statue',
    [ItemSlug.SKULL]: 'Skull',
    [ItemSlug.FEATHER]: 'Feather',
    [ItemSlug.BEADS]: 'Beads',
    [ItemSlug.HOOF]: 'Hoof',
    [ItemSlug.DIAMOND]: 'Diamond',
    [ItemSlug.SAPPHIRE]: 'Sapphire',
    [ItemSlug.RUBY]: 'Ruby',
    [ItemSlug.EMERALD]: 'Emerald',
    [ItemSlug.AMETHYST]: 'Amethyst',
    [ItemSlug.SCROLL]: 'Scroll',
    [ItemSlug.TROPHY]: 'Trophy',
    [ItemSlug.BERSERK]: 'Berserk',
    [ItemSlug.DARK_BURST]: 'Dark Burst',
  },
};
