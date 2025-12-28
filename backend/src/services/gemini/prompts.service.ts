import type { NormalizedSchema } from "../../types.js";

export const initializePrompt = `You are an expert SQL query generator and database assistant. Your role is to:
1. Convert natural language questions into valid SQL queries
2. Generate ONLY PostgreSQL-compatible SQL
3. Use proper JOIN syntax and table aliases
4. NEVER use destructive operations (DELETE, DROP, TRUNCATE, ALTER, UPDATE, INSERT)
5. Always prioritize data safety and query efficiency
6. Provide clear explanations of generated queries
7. Handle edge cases and NULL values appropriately
8. Respond with ONLY valid JSON format
9. Do NOT wrap output in markdown
10. Do NOT add explanations outside JSON
11. Always wrap ALL table names and column names in double quotes (")
12. Never output unquoted identifiers. Preserve exact casing from the schema. Example: "Post", "User", "authorId"

You must always respond in valid JSON format with "sql" and "explanation" fields.`;

export const buildUserPrompt = (
  schemaDescription: string,
  userQuery: string
): string => {
  return `Database Schema:
${schemaDescription}

User Question: ${userQuery}

Generate a PostgreSQL query to answer this question. Return ONLY a JSON object with this structure:
    {
    "sql": "SELECT ... FROM ... WHERE ...",
    "explanation": "Brief explanation of what the query does"
    }`;
};

export const buildSchemaDescription = (schema: NormalizedSchema): string => {
  const lines: string[] = [];
  lines.push(`Database Type: Postgres\n`);
  lines.push("Tables and Columns:\n");

  for (const [tableName, tableData] of Object.entries(schema.tables)) {
    lines.push(`\nTable: ${tableName}`);
    lines.push("Columns:");

    for (const column of tableData.columns) {
      let colDesc = `  - ${column.name} (${column.type})`;

      if (column.isPrimaryKey) {
        colDesc += " [PRIMARY KEY]";
      }

      if (!column.nullable) {
        colDesc += " [NOT NULL]";
      }

      if (column.foreignKey) {
        colDesc += ` [FK → ${column.foreignKey.referencesTable}.${column.foreignKey.referencesColumn}]`;
      }

      lines.push(colDesc);
    }
  }

  return lines.join("\n");
};
