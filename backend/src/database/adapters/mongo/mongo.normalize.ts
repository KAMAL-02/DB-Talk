import type {
  NormalizedSchema,
  NormalizedColumn,
  NormalizedForeignKey,
} from "../../../types.js";

/** Infer primitive Mongo field type */
function inferType(value: any): string {
  if (value === null || value === undefined) return "unknown";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) return "date";
  if (typeof value === "object") return "object";
  return typeof value;
}

/**
 * Infer foreign-key–like references using naming conventions
 * Examples:
 *   userId     → users._id
 *   order_id   → orders._id
 *   productId  → products._id
 */
function inferForeignKeys(field: string): NormalizedForeignKey[] | undefined {
  const lower = field.toLowerCase();

  if (lower === "_id") return;

  // userId, user_id, userid
  const match = lower.match(/(.+?)(_?id)$/);
  if (!match) return;

  const base = match[1];
  if (!base) return;

  return [
    {
      referencesTable: `${base}s`,
      referencesColumn: "_id",
    },
  ];
}

/** Normalize MongoDB collections into a relational-style schema */
export const normalizeMongoSchema = (raw: {
  collections: string[];
  samples: Record<string, any[]>;
}): NormalizedSchema => {
  const schema: NormalizedSchema = {
    source: "mongo",
    tables: {},
  };

  for (const collection of raw.collections) {
    const docs = raw.samples[collection] || [];

    /**
     * field → { types, nullable }
     */
    const fieldMap = new Map<
      string,
      {
        types: Set<string>;
        nullable: boolean;
      }
    >();

    for (const doc of docs) {
      if (!doc || typeof doc !== "object") continue;

      for (const [key, value] of Object.entries(doc)) {
        if (!fieldMap.has(key)) {
          fieldMap.set(key, {
            types: new Set(),
            nullable: false,
          });
        }

        const meta = fieldMap.get(key)!;

        if (value === null || value === undefined) {
          meta.nullable = true;
        } else {
          meta.types.add(inferType(value));
        }
      }
    }

    const columns: NormalizedColumn[] = [];

    for (const [field, meta] of fieldMap.entries()) {
      const isPrimaryKey = field === "_id";
      const foreignKeys = inferForeignKeys(field);
      columns.push({
        name: field,
        type:
          meta.types.size > 0
            ? Array.from(meta.types).join(" | ")
            : "unknown",
        nullable: meta.nullable,
        isPrimaryKey,
        ...(foreignKeys ? {foreignKeys} : {}),
      });
    }

    schema.tables[collection] = {
      columns,
      primaryKey: ["_id"],
    };
  }

  return schema;
};
