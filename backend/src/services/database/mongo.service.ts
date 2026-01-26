import { BLOCKED_OPERATORS } from "../../utils/constant.util.js";

export function validateMongoPipeline(pipeline: any[]) {
  for (const stage of pipeline) {
    const keys = Object.keys(stage);

    if (keys.length !== 1) {
      return {
        isValid: false,
        error: "Invalid aggregation stage",
      }
    }

    const operator = keys[0];


    if (!operator?.startsWith("$")) {
      return {
        isValid: false,
        error: "Invalid aggregation operator",
      }
    }

    if (BLOCKED_OPERATORS.has(operator)) {
        return {
            isValid: false,
            error: `Operator ${operator} is not allowed`,
        }
    }
  }
  return { isValid: true };
}