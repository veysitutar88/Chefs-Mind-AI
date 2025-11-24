# CORE PROJECT PRINCIPLES

- **ESM Above All**: All relative imports in `.ts` files MUST end with `.js`. Non-negotiable.
- **Read/Write Segregation**: ALWAYS use `dbRead` for `SELECT` queries and `dbWrite` for `INSERT`, `UPDATE`, `DELETE`.
- **Zod for Validation**: ALL external inputs (environment variables, API request bodies) MUST be validated with `zod` schemas.
- **Production-Ready Code**: All code must be typed, linted, and covered by tests before considering a task complete.
- **Follow the Plan**: Your primary directive is to follow the `CURRENT_TASK` provided in the prompt. Do not deviate or "optimize" beyond the scope of the task.