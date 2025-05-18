// scripts/fetch-notion-data.mjs
import 'dotenv/config'; // Make sure to load .env variables for the script
import { fetchAndSaveCoursesAsJson } from '../src/lib/notion.ts'; // .ts extension may be needed for ES modules

async function main() {
  console.log('Starting Notion data fetch script...');
  await fetchAndSaveCoursesAsJson();
  console.log('Notion data fetch script finished.');
}

main().catch(error => {
  console.error('Error running Notion data fetch script:', error);
  process.exit(1);
});
