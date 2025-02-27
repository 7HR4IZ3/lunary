import sql from "../utils/db";
import { sleep } from "../utils/misc";

export async function startMaterializedViewRefreshJob() {
  if (process.env.DISABLE_MATERIALIZED_VIEW_REFRESH) {
    return;
  }
  try {
    const views = ["run_parent_feedback_cache"];

    while (true) {
      for (const view of views) {
        await sql`refresh materialized view concurrently ${sql(view)};`.catch(
          (error) => {
            console.error(`Error refreshing materialized view: ${view}`);
            console.error(error);
          },
        );
      }

      await sleep(1000);
    }
  } catch (error) {
    console.error(error);
  }
}
