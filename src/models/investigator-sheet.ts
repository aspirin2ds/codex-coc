import { z } from "zod";

const percentStatSchema = z.number().int().min(1).max(200);

export const investigatorAttributesSchema = z.object({
  str: percentStatSchema,
  con: percentStatSchema,
  siz: percentStatSchema,
  dex: percentStatSchema,
  app: percentStatSchema,
  int: percentStatSchema,
  pow: percentStatSchema,
  edu: percentStatSchema,
  luck: percentStatSchema,
});

export const investigatorDerivedSchema = z.object({
  hp: z.number().int().min(0),
  san: z.number().int().min(0).max(200),
  mp: z.number().int().min(0).max(200),
  mov: z.number().int().min(0).max(20),
  build: z.number().int().min(-2).max(20),
  db: z.string().min(1),
});

export const investigatorSkillEntrySchema = z.object({
  name: z.string().min(1),
  base: z.number().int().min(0).max(200),
  occupation: z.number().int().min(0).max(200),
  interest: z.number().int().min(0).max(200),
  value: z.number().int().min(0).max(200),
  half: z.number().int().min(0).max(200),
  fifth: z.number().int().min(0).max(200),
  growthChecked: z.boolean(),
  notes: z.string().optional(),
});

export const investigatorWeaponEntrySchema = z.object({
  name: z.string().min(1),
  skill: z.string().min(1),
  damage: z.string().min(1),
  range: z.string().optional(),
  attacks: z.number().int().min(0).optional(),
  ammo: z.number().int().min(0).optional(),
  malfunction: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const investigatorIdentitySchema = z.object({
  name: z.string().optional(),
  playerName: z.string().optional(),
  occupation: z.string().optional(),
  age: z.number().int().min(1).max(120).optional(),
  sex: z.string().optional(),
  residence: z.string().optional(),
  birthplace: z.string().optional(),
  era: z.string().optional(),
});

export const investigatorBackgroundSchema = z.object({
  personalDescription: z.string().optional(),
  ideologyBeliefs: z.string().optional(),
  significantPeople: z.string().optional(),
  meaningfulLocations: z.string().optional(),
  treasuredPossessions: z.string().optional(),
  traits: z.string().optional(),
  keyConnection: z.string().optional(),
});

export const investigatorFinanceSchema = z.object({
  creditRating: z.number().int().min(0).max(200).optional(),
  cash: z.string().optional(),
  assets: z.string().optional(),
  spendingLevel: z.string().optional(),
});

export const investigatorStatusSchema = z.object({
  currentHp: z.number().int().min(0),
  currentSan: z.number().int().min(0).max(200),
  currentMp: z.number().int().min(0).max(200),
  majorWound: z.boolean(),
  temporaryInsanity: z.boolean(),
  indefiniteInsanity: z.boolean(),
  conditions: z.array(z.string()),
});

export const investigatorSheetSchema = z.object({
  schema: z.literal("coc7e-investigator-sheet"),
  identity: investigatorIdentitySchema,
  attributes: investigatorAttributesSchema,
  derived: investigatorDerivedSchema,
  skills: z.record(z.string(), investigatorSkillEntrySchema),
  combat: z.object({
    weapons: z.array(investigatorWeaponEntrySchema),
    dodge: z.number().int().min(0).max(200).optional(),
    brawl: z.number().int().min(0).max(200).optional(),
  }),
  possessions: z.object({
    items: z.array(z.string()),
    notes: z.string().optional(),
  }),
  background: investigatorBackgroundSchema,
  finance: investigatorFinanceSchema,
  status: investigatorStatusSchema,
  notes: z.array(z.string()),
});

export type InvestigatorAttributes = z.infer<typeof investigatorAttributesSchema>;
export type InvestigatorDerived = z.infer<typeof investigatorDerivedSchema>;
export type InvestigatorSkillEntry = z.infer<typeof investigatorSkillEntrySchema>;
export type InvestigatorWeaponEntry = z.infer<typeof investigatorWeaponEntrySchema>;
export type InvestigatorIdentity = z.infer<typeof investigatorIdentitySchema>;
export type InvestigatorBackground = z.infer<typeof investigatorBackgroundSchema>;
export type InvestigatorFinance = z.infer<typeof investigatorFinanceSchema>;
export type InvestigatorStatus = z.infer<typeof investigatorStatusSchema>;
export type InvestigatorSheet = z.infer<typeof investigatorSheetSchema>;

export function validateInvestigatorSheet(sheet: unknown): InvestigatorSheet {
  return investigatorSheetSchema.parse(sheet);
}

export function createEmptyInvestigatorSheet(
  attributes: InvestigatorAttributes,
  derived: InvestigatorDerived,
): InvestigatorSheet {
  return validateInvestigatorSheet({
    schema: "coc7e-investigator-sheet",
    identity: {},
    attributes,
    derived,
    skills: {},
    combat: {
      weapons: [],
    },
    possessions: {
      items: [],
    },
    background: {},
    finance: {},
    status: {
      currentHp: derived.hp,
      currentSan: derived.san,
      currentMp: derived.mp,
      majorWound: false,
      temporaryInsanity: false,
      indefiniteInsanity: false,
      conditions: [],
    },
    notes: [],
  });
}
