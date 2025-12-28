import type { NormalizedSchema } from "../types.js";

export const pgIntrospectionQueries = {
  selectTablesQuery: `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  `,

  selectColumnsQuery: `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `,

  selectPrimaryKeyQuery: `
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
  `,

  selectForeignKeyQuery: `
    SELECT
      tc.table_name AS source_table,
      kcu.column_name AS source_column,
      ccu.table_name AS target_table,
      ccu.column_name AS target_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  `,
};

export const normalizePgSchema = (raw: {
  tables: any[];
  columns: any[];
  primaryKeys: any[];
  foreignKeys: any[];
}) => {
  const schema: NormalizedSchema = {
    source: "postgres",
    tables: {},
  };

  /** Extract tables from raw data */
  for (const t of raw.tables) {
    schema.tables[t.table_name] = { columns: [] };
  }

  /** Extract primary key from data */
  const pkMap = new Map<string, Set<string>>();
  raw.primaryKeys.forEach((pk: any) => {
    if (!pkMap.has(pk.table_name)) {
      pkMap.set(pk.table_name, new Set());
    }
    pkMap.get(pk.table_name)!.add(pk.column_name);
  });

  /** Extract Foreign key from raw data */
  const fkMap = new Map<string, any>();
  raw.foreignKeys.forEach((fk: any) => {
    fkMap.set(`${fk.source_table}.${fk.source_column}`, {
      referencesTable: fk.target_table,
      referencesColumn: fk.target_column,
    });
  });

  /** Extract col from raw data */
  for (const col of raw.columns) {
    const column = {
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
      isPrimaryKey: pkMap.get(col.table_name)?.has(col.column_name) ?? false,
      foreignKey: fkMap.get(`${col.table_name}.${col.column_name}`),
    };

    schema.tables[col.table_name]?.columns.push(column);
  }

  return schema;
};

export const quoteIdentifier = (name: string) => {
  return /[A-Z]/.test(name) ? `"${name}"` : name;
}
