import { defineCollection, z } from 'astro:content';

const coursesCollection = defineCollection({
  type: 'data', // Using 'data' type for JSON files
  schema: z.object({
    nombre_del_curso: z.string(),
    publicar: z.boolean(),
    categoria: z.string().optional(),
    isAvailable: z.string().optional(),
    orden_homepage: z.number().optional(),
    orden_proximos: z.number().optional(),
    hero_fecha: z.string().nullable(),
    hero_tipo: z.string(),
    hero_slogan: z.string(),
    hero_descripcion: z.string(),
    hero_img_main: z.string().nullable(),
    hero_buttonText: z.string().optional(),
    hero_buttonLink: z.string().nullable().optional(),
    section1_titulo1: z.string(),
    section1_texto1: z.string(),
    section1_img1: z.string().nullable(),
    section1_quote1: z.string(),
    section1_quote1_autor_nombre: z.string().optional(),
    section1_quote1_autor_titulo: z.string().optional(),
    section2_titulo2: z.string(),
    section2_texto2: z.string(),
    section2_img2: z.string().nullable(),
    section2_quote2: z.string(),
    section2_quote2_autor_nombre: z.string().optional(),
    section2_quote2_autor_titulo: z.string().optional(),
    section3FAQ_titulo3: z.string(),
    section3FAQ_acerca_del_curso: z.string(),
    cta_cta: z.string(),
    cta_button: z.string(),
    cta_btn_link: z.string().nullable().optional(),
    cta_date: z.string().nullable().optional(),
  }),
});

export const collections = {
  courses: coursesCollection,
}; 