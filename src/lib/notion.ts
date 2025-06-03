import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import fsPromises from 'fs/promises'; // For promise-based file system operations
import * as fs from 'fs';             // For stream-based operations like createWriteStream
import path from 'path';      // For path manipulation
import https from 'https';    // For downloading images

config();

const notionApiKey = process.env.NOTION_API_KEY;
const notionCoursesDatabaseId = process.env.NOTION_COURSES_DATABASE_ID; // Renamed for clarity

if (!notionApiKey) {
  throw new Error('NOTION_API_KEY is not set in the environment variables.');
}
// Removed the early throw for notionCoursesDatabaseId to handle it before the API call

const notion = new Client({ auth: notionApiKey });

const getPlainText = (richTextArray: any[]): string => {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map((item) => item.plain_text).join('');
};

// New function to convert rich text to HTML
const getRichTextAsHtml = (richTextArray: any[]): string => {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map((item) => {
    if (item.type !== 'text' || !item.text || !item.text.content) {
      return '';
    }
    let content = item.text.content;
    // Escape HTML special characters
    content = content.replace(/&/g, '&amp;')
                     .replace(/</g, '&lt;')
                     .replace(/>/g, '&gt;')
                     .replace(/"/g, '&quot;')
                     .replace(/'/g, '&#039;');

    if (item.annotations) {
      if (item.annotations.bold) {
        content = `<strong>${content}</strong>`;
      }
      if (item.annotations.italic) {
        content = `<em>${content}</em>`;
      }
      if (item.annotations.strikethrough) {
        content = `<s>${content}</s>`;
      }
      if (item.annotations.underline) {
        content = `<u>${content}</u>`;
      }
      if (item.annotations.code) {
        content = `<code>${content}</code>`;
      }
      // Note: Notion's color annotation might need specific handling
      // if (item.annotations.color && item.annotations.color !== 'default') {
      //   content = `<span style="color: ${item.annotations.color}">${content}</span>`;
      // }
    }
    // Handle line breaks within the text content
    return content.replace(/\n/g, '<br>');
  }).join('');
};

const getUrl = (property: any): string | null => {
  if (!property) return null;
  if (property.type === 'files' && property.files && property.files.length > 0) {
    const file = property.files[0];
    if (file.type === 'file' && file.file) return file.file.url;
    if (file.type === 'external' && file.external) return file.external.url;
  }
  if (property.type === 'url') return property.url;
  return null;
};

const getDate = (property: any): string | null => {
  if (!property || !property.date) return null;
  return property.date.start;
};

const formatSpanishDate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString + 'T00:00:00'); // Ensure parsing as local date
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string received: ${dateString}`);
      return dateString; // Return original if invalid
    }

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dayName = days[date.getUTCDay()];
    const day = date.getUTCDate();
    const monthName = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    return `${dayName}, ${day} de ${monthName} de ${year}`;
  } catch (error) {
    console.error(`Error formatting date string ${dateString}:`, error);
    return dateString; // Return original on error
  }
};

const getSelectName = (property: any): string | undefined => {
  if (!property || property.type !== 'select' || !property.select) return undefined;
  return property.select.name;
};

const getNumber = (property: any): number | undefined => {
  if (!property || property.type !== 'number' || typeof property.number !== 'number') return undefined;
  return property.number;
};

// This interface represents the data structure we'll save in JSON files
// It will align with the Zod schema in content.config.ts
// It excludes Notion's 'id' and our 'slug' (which becomes the filename)
export interface CourseData {
  nombre_del_curso: string;
  publicar: boolean; // May not be strictly needed in JSON if pre-filtered
  categoria?: string; // New: Select property
  isAvailable?: string; // Added from previous step
  orden_homepage?: number; // New: Number property for homepage order
  orden_proximos?: number; // New: Number property for "proximos eventos" order
  // Hero section
  hero_fecha: string | null;
  hero_tipo: string;
  hero_slogan: string;
  hero_descripcion: string;
  hero_img_main: string | null;
  hero_buttonText?: string;
  hero_buttonLink?: string | null;
  // Section 1
  section1_texto1: string;
  section1_img1: string | null;
  // Section 2
  section2_texto2: string;
  section2_img2: string | null;
  section2_quote2: string;
  section2_quote2_autor_nombre?: string;
  section2_quote2_autor_titulo?: string;
  // Section 3 FAQ
  section3FAQ_titulo3: string;
  section3FAQ_acerca_del_curso: string;
  // New Section (CTA)
  cta_cta: string;
  cta_button: string;
  cta_btn_link: string | null;
  cta_date?: string | null;
}

// Intermediate interface for data fetched from Notion, including slug and Notion ID
interface FetchedCourse extends CourseData {
  notionPageId: string;
  slug: string; 
}

const IMAGES_OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'courses');
const IMAGES_WEB_PATH = '/images/courses'; // Web-accessible path

async function downloadImageAndGetLocalPath(
  imageUrl: string,
  slug: string,
  fieldName: string
): Promise<string | null> {
  if (!imageUrl.startsWith('https://prod-files-secure.s3.us-west-2.amazonaws.com')) {
    console.warn(`Skipping download for non-Notion S3 URL: ${imageUrl} for ${slug}-${fieldName}`);
    return imageUrl; // Return original URL if it's not a Notion S3 link we expect to expire
  }

  try {
    const url = new URL(imageUrl);
    // Sanitize slug and fieldName for filename
    const safeSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const safeFieldName = fieldName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const extension = path.extname(url.pathname) || '.jpg'; // Default to .jpg if no extension
    const filename = `${safeSlug}-${safeFieldName}${extension}`;
    const localFilePath = path.join(IMAGES_OUTPUT_DIR, filename);
    const webFilePath = `${IMAGES_WEB_PATH}/${filename}`;

    // Check if file already exists to avoid re-downloading
    try {
      await fsPromises.access(localFilePath);
      console.log(`Image already exists, skipping download: ${localFilePath}`);
      return webFilePath;
    } catch {
      // File doesn't exist, proceed with download
    }
    
    await fsPromises.mkdir(IMAGES_OUTPUT_DIR, { recursive: true }); // Ensure directory exists

    const response = await new Promise<import('http').IncomingMessage>((resolve, reject) => {
      https.get(imageUrl, resolve).on('error', reject);
    });

    if (response.statusCode !== 200) {
      console.error(`Failed to download image ${imageUrl}. Status: ${response.statusCode}`);
      return null; // Or original URL if preferred fallback
    }

    const writer = fs.createWriteStream(localFilePath);
    response.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(webFilePath));
      writer.on('error', (err: Error) => {
        console.error(`Failed to write image ${localFilePath}:`, err);
        reject(null); // Or original URL
      });
    });
  } catch (error) {
    console.error(`Error downloading or saving image ${imageUrl}:`, error);
    return null; // Or original URL
  }
}

async function getRawCoursesFromNotion(): Promise<FetchedCourse[]> {
  if (!notionCoursesDatabaseId) { // Check for database ID before making API call
    throw new Error('NOTION_COURSES_DATABASE_ID is not set in the environment variables.');
  }
  try {
    const response = await notion.databases.query({
      database_id: notionCoursesDatabaseId, // Now guaranteed to be a string
      filter: { property: 'Publicar', checkbox: { equals: true } },
      sorts: [{ property: 'ID', direction: 'ascending' }],
    });

    const courses: FetchedCourse[] = [];
    for (const page of response.results) {
      const props = (page as any).properties;
      const slugValue = getPlainText(props.slug?.rich_text) || '';

      if (!slugValue) {
        console.warn(`Page with ID ${(page as any).id} has no slug. Skipping.`);
        continue;
      }
      
      const heroFechaRaw = getDate(props.fecha); // Get the raw date

      const heroImgMainNotionUrl = getUrl(props['img-main']);
      const section1Img1NotionUrl = getUrl(props.img1);
      const section2Img2NotionUrl = getUrl(props.img2);

      const courseDataItem: CourseData = {
        nombre_del_curso: getPlainText(props['titulo']?.title) || 'Curso Sin Título',
        publicar: props.Publicar?.checkbox || false,
        categoria: getSelectName(props.categoria),
        isAvailable: getSelectName(props.isAvailable), // Assuming isAvailable is a select in Notion
        orden_homepage: getNumber(props['orden-homepage']),
        orden_proximos: getNumber(props['orden-proximos']),
        hero_fecha: formatSpanishDate(heroFechaRaw), // Use the new formatting function
        hero_tipo: getPlainText(props.tipo?.rich_text),
        hero_slogan: getPlainText(props.subtitulo?.rich_text),
        hero_descripcion: getRichTextAsHtml(props.descripcion?.rich_text),
        hero_img_main: heroImgMainNotionUrl 
          ? await downloadImageAndGetLocalPath(heroImgMainNotionUrl, slugValue, 'hero_img_main') 
          : null,
        hero_buttonText: getPlainText(props.hero_buttonText?.rich_text),
        hero_buttonLink: getUrl(props.hero_buttonLink),
        section1_texto1: getRichTextAsHtml(props.texto1?.rich_text),
        section1_img1: section1Img1NotionUrl 
          ? await downloadImageAndGetLocalPath(section1Img1NotionUrl, slugValue, 'section1_img1') 
          : null,
        section2_texto2: getRichTextAsHtml(props.texto2?.rich_text),
        section2_img2: section2Img2NotionUrl 
          ? await downloadImageAndGetLocalPath(section2Img2NotionUrl, slugValue, 'section2_img2') 
          : null,
        section2_quote2: getPlainText(props.quote2?.rich_text),
        section2_quote2_autor_nombre: getPlainText(props.quote2_autor_nombre?.rich_text),
        section2_quote2_autor_titulo: getPlainText(props.quote2_autor_titulo?.rich_text),
        section3FAQ_titulo3: getPlainText(props.titulo3?.rich_text),
        section3FAQ_acerca_del_curso: getRichTextAsHtml(props['acerca-del-curso']?.rich_text),
        cta_cta: getPlainText(props.cta?.rich_text),
        cta_button: getPlainText(props.button?.rich_text),
        cta_btn_link: getUrl(props['btn-link']),
        cta_date: formatSpanishDate(getDate(props.cta_date)), // Also format cta_date if it exists
      };
      courses.push({
        notionPageId: (page as any).id,
        slug: slugValue,
        ...courseDataItem,
      });
    }
    return courses;

  } catch (error) {
    console.error('Failed to fetch raw courses from Notion:', error);
    return [];
  }
}

export async function fetchAndSaveCoursesAsJson() {
  const courses = await getRawCoursesFromNotion();
  const outputDirJson = path.join(process.cwd(), 'src', 'content', 'courses');

  try {
    await fsPromises.mkdir(outputDirJson, { recursive: true }); // Ensure JSON output directory exists
    await fsPromises.mkdir(IMAGES_OUTPUT_DIR, { recursive: true }); // Ensure images output directory exists
    console.log(`Ensured directories exist: ${outputDirJson} and ${IMAGES_OUTPUT_DIR}`);

    // Clean up existing JSON files in the target directory
    const existingFiles = await fsPromises.readdir(outputDirJson);
    for (const file of existingFiles) {
      if (file.endsWith('.json')) {
        const filePathToDelete = path.join(outputDirJson, file);
        try {
          await fsPromises.unlink(filePathToDelete);
          console.log(`Deleted old course file: ${filePathToDelete}`);
        } catch (err) {
          console.error(`Failed to delete old course file ${filePathToDelete}:`, err);
          // Consider if you need to halt the process on error or just log
        }
      }
    }

  } catch (error) {
    console.error(`Failed to create directories or clean up old files:`, error);
    return; // Stop if directory setup or cleanup fails
  }

  for (const course of courses) {
    // Slug check is now inside getRawCoursesFromNotion
    const filename = course.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.json';
    const filePath = path.join(outputDirJson, filename);

    const { notionPageId, slug, ...courseJsonData } = course;

    try {
      await fsPromises.writeFile(filePath, JSON.stringify(courseJsonData, null, 2));
      console.log(`Saved course data to ${filePath}`);
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
    }
  }
  console.log('Finished fetching and saving Notion courses as JSON.');
}

// Optional: To allow this script to be run directly
fetchAndSaveCoursesAsJson().catch(console.error);
