# Investigator Character Sheet

## Identity
- Name: Li Wei
- Player: ExamplePlayer
- Occupation: Journalist
- Age: 28
- Sex: F
- Residence: Shanghai
- Birthplace: Suzhou
- Era: 1920s

## Attributes
| STR | CON | SIZ | DEX | APP | INT | POW | EDU | LUCK |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 45 | 55 | 70 | 70 | 65 | 70 | 40 | 60 | 40 |

## Derived
- HP: 12
- SAN: 40
- MP: 8
- MOV: 8
- BUILD: 0
- DB: 0

## Skills
| Skill | Base | Occ | Int | Value | Half | Fifth |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Library Use | 20 | 50 | 10 | 80 | 40 | 16 |
| Spot Hidden | 25 | 40 | 10 | 75 | 37 | 15 |
| Persuade | 10 | 20 | 30 | 60 | 30 | 12 |

## Combat
| Weapon | Skill | Damage | Range | Attacks | Ammo | Malf |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Handgun (Colt M1911) | firearms_handgun | 1D10 | 15 yd | 1 | 7 | 100 |

## Status
- Current HP: 12
- Current SAN: 40
- Current MP: 8
- Major Wound: false
- Temporary Insanity: false
- Indefinite Insanity: false
- Conditions: bruised ribs

## Notes
- edu_improvement_times: 1
- occupation_formula=edu*4
- occupation_points=240
- interest_points=140
- rules_ref:docs/part-007-第三章-创建调查员.md
- rules_ref:docs/part-008-第四章-技能.md
- rules_ref:docs/part-009-第五章-游戏系统.md


## Agent Data
<!-- COC_SHEET_JSON_START -->
```json
{
  "schema": "coc7e-investigator-sheet",
  "identity": {
    "name": "Li Wei",
    "playerName": "ExamplePlayer",
    "occupation": "Journalist",
    "age": 28,
    "sex": "F",
    "residence": "Shanghai",
    "birthplace": "Suzhou",
    "era": "1920s"
  },
  "attributes": {
    "str": 45,
    "con": 55,
    "siz": 70,
    "dex": 70,
    "app": 65,
    "int": 70,
    "pow": 40,
    "edu": 60,
    "luck": 40
  },
  "derived": {
    "hp": 12,
    "san": 40,
    "mp": 8,
    "mov": 8,
    "build": 0,
    "db": "0"
  },
  "skills": {
    "library_use": {
      "name": "Library Use",
      "base": 20,
      "occupation": 50,
      "interest": 10,
      "value": 80,
      "half": 40,
      "fifth": 16,
      "growthChecked": false,
      "notes": "Occupation core skill"
    },
    "spot_hidden": {
      "name": "Spot Hidden",
      "base": 25,
      "occupation": 40,
      "interest": 10,
      "value": 75,
      "half": 37,
      "fifth": 15,
      "growthChecked": false,
      "notes": "Field investigation focus"
    },
    "persuade": {
      "name": "Persuade",
      "base": 10,
      "occupation": 20,
      "interest": 30,
      "value": 60,
      "half": 30,
      "fifth": 12,
      "growthChecked": true,
      "notes": "Social leverage"
    }
  },
  "combat": {
    "weapons": [
      {
        "name": "Handgun (Colt M1911)",
        "skill": "firearms_handgun",
        "damage": "1D10",
        "range": "15 yd",
        "attacks": 1,
        "ammo": 7,
        "malfunction": 100,
        "notes": "Backup sidearm"
      }
    ],
    "dodge": 35,
    "brawl": 25
  },
  "possessions": {
    "items": [
      "Notebook",
      "Press ID",
      "Pocket camera",
      "Colt M1911",
      "Flashlight"
    ],
    "notes": "Standard field kit"
  },
  "background": {
    "personalDescription": "Observant, calm, and precise in interviews.",
    "ideologyBeliefs": "Truth should be documented even when dangerous.",
    "significantPeople": "Editor Chen (mentor).",
    "meaningfulLocations": "Old Bund newsroom.",
    "treasuredPossessions": "Father's fountain pen.",
    "traits": "Curious, stubborn, empathetic.",
    "keyConnection": "Street informant known as Sparrow."
  },
  "finance": {
    "creditRating": 40,
    "cash": "$35",
    "assets": "Small apartment and camera equipment",
    "spendingLevel": "Average"
  },
  "status": {
    "currentHp": 12,
    "currentSan": 40,
    "currentMp": 8,
    "majorWound": false,
    "temporaryInsanity": false,
    "indefiniteInsanity": false,
    "conditions": [
      "bruised ribs"
    ]
  },
  "notes": [
    "edu_improvement_times: 1",
    "occupation_formula=edu*4",
    "occupation_points=240",
    "interest_points=140",
    "rules_ref:docs/part-007-第三章-创建调查员.md",
    "rules_ref:docs/part-008-第四章-技能.md",
    "rules_ref:docs/part-009-第五章-游戏系统.md"
  ]
}
```
<!-- COC_SHEET_JSON_END -->
