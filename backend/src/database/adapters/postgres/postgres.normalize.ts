import type { NormalizedSchema } from "../../../types.js";

/** Normalize raw Postgres schema data into a structured format */
export const normalizeSchema = (raw: {
  tables: any[];
  columns: any[];
  primaryKeys: any[];
  foreignKeys: any[];
}): NormalizedSchema => {
  const schema: NormalizedSchema = {
    source: "postgres",
    tables: {},
  };

  // create tables
  for (const t of raw.tables) {
    schema.tables[t.table_name] = {
      columns: [],
      primaryKey: [],
    };
  }

  // primary keys
  const pkMap = new Map<string, string[]>();
  for (const pk of raw.primaryKeys) {
    if (!pkMap.has(pk.table_name)) {
      pkMap.set(pk.table_name, []);
    }
    pkMap.get(pk.table_name)!.push(pk.column_name);
  }

  // foreign keys
  const fkMap = new Map<string, any[]>();
  for (const fk of raw.foreignKeys) {
    const key = `${fk.source_table}.${fk.source_column}`;
    if (!fkMap.has(key)) fkMap.set(key, []);

    fkMap.get(key)!.push({
      referencesTable: fk.target_table,
      referencesColumn: fk.target_column,
    });
  }

  // columns
  for (const col of raw.columns) {
    const table = schema.tables[col.table_name];
    if (!table) continue;

    table.columns.push({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
      position: col.ordinal_position,
      isPrimaryKey:
        pkMap.get(col.table_name)?.includes(col.column_name) ?? false,
      foreignKeys: fkMap.get(`${col.table_name}.${col.column_name}`) ?? [],
    });
  }

  // attach table-level PK
  for (const [tableName, pkCols] of pkMap.entries()) {
    const table = schema.tables[tableName];
    if (!table) continue;

    table.primaryKey = pkCols;
  }

  return schema;
};
