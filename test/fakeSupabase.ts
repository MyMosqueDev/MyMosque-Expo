type Row = Record<string, any>;
type Result = { data: any; error: { code?: string; message: string } | null };

/**
 * In-memory Supabase covering the query shapes this app uses:
 * select, eq, or(created_at.gt / updated_at.gt), order and single.
 */
class FakeSupabase {
  tables: Record<string, Row[]> = {};
  failing = new Set<string>();
  queries: string[] = [];
  latencyMs = 0;

  reset() {
    this.latencyMs = 0;
    this.tables = {};
    this.failing = new Set();
    this.queries = [];
  }

  goOffline() {
    this.failing = new Set(["*"]);
  }

  goOnline() {
    this.failing = new Set();
  }

  countQueries(table: string) {
    return this.queries.filter((t) => t === table).length;
  }

  client = { from: (table: string) => this.query(table) };

  private network = () =>
    this.latencyMs
      ? new Promise<void>((r) => setTimeout(r, this.latencyMs))
      : Promise.resolve();

  private query(table: string) {
    const filters: ((row: Row) => boolean)[] = [];
    let sort: { column: string; ascending: boolean } | null = null;
    let single = false;

    const run = (): Result => {
      this.queries.push(table);
      if (this.failing.has("*") || this.failing.has(table)) {
        return { data: null, error: { message: "Network request failed" } };
      }
      let rows = (this.tables[table] ?? []).filter((r) =>
        filters.every((f) => f(r)),
      );
      if (sort) {
        const { column, ascending } = sort;
        rows = [...rows].sort(
          (a, b) =>
            (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) *
            (ascending ? 1 : -1),
        );
      }
      // Clone, as a network response would.
      rows = JSON.parse(JSON.stringify(rows));
      if (!single) return { data: rows, error: null };
      return rows.length === 1
        ? { data: rows[0], error: null }
        : { data: null, error: { code: "PGRST116", message: "0 rows" } };
    };

    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => {
        filters.push((r) => r[column] === value);
        return builder;
      },
      or: (expression: string) => {
        const clauses = expression.split(",").map((clause) => {
          const [, column, value] = clause.match(/^(\w+)\.gt\.(.+)$/)!;
          return (r: Row) =>
            r[column] != null && new Date(r[column]) > new Date(value);
        });
        filters.push((r) => clauses.some((c) => c(r)));
        return builder;
      },
      order: (column: string, options: { ascending: boolean }) => {
        sort = { column, ascending: options.ascending };
        return builder;
      },
      single: () => {
        single = true;
        return builder;
      },
      then: (
        resolve: (r: Result) => unknown,
        reject?: (e: unknown) => unknown,
      ) => this.network().then(run).then(resolve, reject),
    };
    return builder;
  }
}

export const fakeSupabase = new FakeSupabase();
