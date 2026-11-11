/* Catálogo: para agregar un bocadito, copia un bloque { ... }, pégalo y cámbialo.
   tipo: "dulce", "salado" o "postre" (cada tipo tiene su botón en la carta y en el menú).
   foto: ruta de la imagen dentro de /imagenes (si la dejas vacía "", se muestra el emoji).

   presentaciones: precios por tramo, ej. { cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }.
     - Se ven en la tarjeta. Si dejas precio: null se muestra "—".
     - El contador usa el tramo más grande que alcance la cantidad y lo escala:
       50 = $10 (precio propio), 100 = $18, 150 = $27, 200 = $36... (con 100 = $18, cada 50 sale a $9).

   Postres que se venden por porción o por unidad (no de 50 en 50): agrega en su bloque
         tipo: "postre", unidad: ["porción", "porciones"], paso: 1, minimo: 1,
     y pon el precio de UNA porción: presentaciones: [{ cantidad: 1, precio: 3.5 }].
     Mientras el precio sea null, la página muestra "—" y "Precio por confirmar".

   Pedido mínimo y salto del contador (por defecto 50 y de 50 en 50):
     - Para los bocaditos que se venden de 12 en 12, agrega en su bloque:
         paso: 12, minimo: 12,
       y cambia sus presentaciones a 12, 24, etc.
     - Si no escribes nada, usa 50 y de 50 en 50. */
const PASO_POR_DEFECTO = 50;
const MINIMO_POR_DEFECTO = 50;
const MAX_UNIDADES = 1000;

const BOCADITOS = [
  {
    id: "alfajores", nombre: "Alfajores", tipo: "dulce", emoji: "🍪", foto: "imagenes/alfajores.webp",
    desc: "Suaves, rellenos de manjar y espolvoreados con azúcar.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
    id: "Conitos rellenos de manjar", nombre: "Conitos rellenos de manjar", tipo: "dulce", emoji: "🍦", foto: "imagenes/conitos_rellenos.webp",
    desc: "Conitos rellenos de manjar y espolvoreados con azúcar.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
    id: "trufas de chocolate", nombre: "Trufas de chocolate", tipo: "dulce", emoji: "🍫", foto: "imagenes/trufas_chocolate.webp",
    desc: "Trufas cremosas con sabor a chocolate.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
    id: "tartaletas con crema pastelera", nombre: "Tartaletas con crema pastelera", tipo: "dulce", emoji: "🧁", foto: "imagenes/tartaletas_crema.webp",
    desc: "Tartaletas con crema pastelera y frutas frescas.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
    {
    id: "tartaletas con crema con mermelada de mora", nombre: "Tartaletas con crema con mermelada de mora", tipo: "dulce", emoji: "🍇", foto: "imagenes/tartaleta_mora.webp",
    desc: "Tartaletas con crema con mermelada de mora y frutas frescas.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
    {
    id: "frutitas de mazapan", nombre: "Frutitas de mazapan", tipo: "dulce", emoji: "🍬", foto: "imagenes/frutas_mazapan.webp",
    desc: "Dulces de leche suaves, moldeados en forma de frutas.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
    {
    id: "huevos moyos", nombre: "Huevos moyos", tipo: "dulce", emoji: "🥚", foto: "imagenes/huevos_moyos.webp",
    desc: "Suaves caramelos caseros, con sabor a manjar de leche, envueltos uno a uno en papel celofán.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
    {
    id: "bombones de chocolate", nombre: "Bombones de chocolate", tipo: "dulce", emoji: "🍫", foto: "imagenes/bombones_chocolate.webp",
    desc: "Bombones de chocolate en forma de corazón, rellenos de maní.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
    id: "mini tortas de chocolate", nombre: "Mini tortas de chocolate", tipo: "dulce", emoji: "🍫", foto: "imagenes/mini_tortas_chocolate.webp",
    desc: "Mini tortas de chocolate con sabor intenso.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
    id: "vasitos-fresa", nombre: "Cheesecake de fresa", tipo: "dulce", emoji: "🍓", foto: "imagenes/cheesecake_fresa.webp",
    desc: "Base de galleta, crema suave y fresa.",
    paso: 12, minimo: 12,
    presentaciones: [{ cantidad: 12, precio: 10 }, { cantidad: 24, precio: 20 }]
  },
    {
    id: "vasitos-mora", nombre: "Cheesecake de mora", tipo: "dulce", emoji: "🍇", foto: "imagenes/cheesecake_mora.webp",
    desc: "Base de galleta, crema suave y mora.",
    paso: 12, minimo: 12,
    presentaciones: [{ cantidad: 12, precio: 10 }, { cantidad: 24, precio: 20 }]
  },
  {
    id: "vasitos-maracuya", nombre: "Cheesecake de maracuya", tipo: "dulce", emoji: "🥭", foto: "imagenes/cheesecake_maracuya.webp",
    desc: "Base de galleta, crema suave y maracuya.",
    paso: 12, minimo: 12,
    presentaciones: [{ cantidad: 12, precio: 10 }, { cantidad: 24, precio: 20 }]
  },
  {
    id: "tartaletas de atun", nombre: "Tartaletas de atún", tipo: "salado", emoji: "🐟", foto: "imagenes/tartaletas_atun.webp",
    desc: "Pan con relleno de atún y queso crema acompañado de aceituna.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
    {
    id: "tartaletas de ensalada rusa", nombre: "Tartaletas de ensalada rusa", tipo: "salado", emoji: "🥗", foto: "imagenes/tartaletas_ensalada_rusa.webp",
    desc: "Pan con relleno de ensalada rusa.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
{
  id: "empanadas de harina", nombre: "Empanadas de harina", tipo: "salado", emoji: "🥟", foto: "imagenes/empanadas_harina.webp",
  desc: "Doradas y crujientes.",
  opciones: ["Queso", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "empanadas de maiz sabrosa", nombre: "Empanadas de maiz sabrosa", tipo: "salado", emoji: "🥟", foto: "imagenes/empanadas_maiz_sabrosa.webp",
  desc: "Doradas y crujientes.",
  opciones: ["Queso", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "medallones de chorizo", nombre: "Medallones de chorizo", tipo: "salado", emoji: "🥓", foto: "imagenes/medallones_chorizo.webp",
  desc: "Medallones de chorizo a la parrilla.",
  opciones: ["Pavo", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
    id: "mini sanduches de ojaldre", nombre: "Mini sánduches de ojaldre", tipo: "salado", emoji: "🥪", foto: "imagenes/sanduche_ojaldre.webp",
    desc: "Hojaldre crujiente y dorado, relleno de jamón y queso.",
    presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
  },
  {
  id: "empanaditas de verde", nombre: "Empanaditas de verde", tipo: "salado", emoji: "🥟", foto: "imagenes/empanadas_verde.webp",
  desc: "Empanaditas de verde.",
  opciones: ["Queso", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "bolitas de carne", nombre: "Bolitas de carne", tipo: "salado", emoji: "🧆", foto: "imagenes/bolitas_carne.webp",
  desc: "Bolitas de carne con queso cheddar.",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "rollitos de jamon y queso", nombre: "Rollitos de jamón y queso", tipo: "salado", emoji: "🥪", foto: "imagenes/rollitos_jamon.webp",
  desc: "Rollitos de jamón y queso, acompañado de aceitunas.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "rollitos de tocino", nombre: "Rollitos de tocino", tipo: "salado", emoji: "🥪", foto: "imagenes/rollitos_tocino.webp",
  desc: "Rollitos de tocino.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "mini sanduches de jamon y queso", nombre: "Mini Sánduches de jamón y queso", tipo: "salado", emoji: "🥪", foto: "imagenes/sanduches_queso_jamon.webp",
  desc: "Sánduches en capas de jamón y queso, acompañado de aceitunas.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "canapes de jamon y aceituna", nombre: "Canapés de jamón y aceitunas", tipo: "salado", emoji: "🥪", foto: "imagenes/canapes_jamon.webp",
  desc: "Canapés de jamón y aceitunas.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "mini sanduches de pollo", nombre: "Mini Sánduches de pollo", tipo: "salado", emoji: "🥪", foto: "imagenes/sanduches_pollo.webp",
  desc: "Sánduches con relleno de pollo.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "mini sanduches de atun", nombre: "Mini Sánduches de atún", tipo: "salado", emoji: "🥪", foto: "imagenes/sanduche_atun.webp",
  desc: "Mini sánduches con relleno de atún.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "camarones enrollados", nombre: "Camarones enrollados", tipo: "salado", emoji: "🦐", foto: "imagenes/camarones_enrollados.webp",
  desc: "Camarones envueltos en masa crujiente",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 20 }]
},
{
  id: "mini corviches", nombre: "Mini Corviches de pescado", tipo: "salado", emoji: "🐠", foto: "imagenes/corviches.webp",
  desc: "Mini corviches de pescado, dorados y crujientes",
  gratis: "Ají",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 20 }]
},
{
  id: "mini muchines", nombre: "Mini Muchines de queso", tipo: "salado", emoji: "🐠", foto: "imagenes/muchines.webp",
  desc: "Mini muchines de yuca con relleno de queso.",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "bolitas de pollo", nombre: "Mini Bolitas de pollo", tipo: "salado", emoji: "🍗", foto: "imagenes/bolitas_pollo.webp",
  desc: "Mini bolitas de pollo, doradas y crujientes",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 20 }]
},
{
  id: "bolitas de queso", nombre: "Mini Bolitas de queso", tipo: "salado", emoji: "🧀", foto: "imagenes/bolitas_queso.webp",
  desc: "Mini bolitas de queso, doradas y crujientes",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "mini brochetas", nombre: "Mini Brochetas de pollo", tipo: "salado", emoji: "🍗", foto: "imagenes/mini_brochetas.webp",
  desc: "Brochetas de queso, jamón, aceituna y pimiento.",
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "canastas de carne con guacamole", nombre: "Canastas de carne con guacamole", tipo: "salado", emoji: "🥑", foto: "imagenes/canastas_carne.webp",
  desc: "Canastitas crujientes rellenas de carne y cubiertas con guacamole.",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 20 }]
},
{
  id: "mini copa mexicana", nombre: "Mini Copa Mexicana", tipo: "salado", emoji: "🥑", foto: "imagenes/copa_mexicana.webp",
  desc: "Capas de salsas, carne y guacamole en un vasito",
  paso: 12, minimo: 12,
   extra: 10,
  presentaciones: [{ cantidad: 12, precio: 15 }, { cantidad: 24, precio: 25 }]
},
{
  id: "shots de ceviche", nombre: "Shots de Ceviche", tipo: "salado", emoji: "🐟", foto: "imagenes/ceviche.webp",
  desc: "Ceviche fresco envasado en pequeños shots",
  paso: 12, minimo: 12,
   extra: 10,
  presentaciones: [{ cantidad: 12, precio: 15 }, { cantidad: 24, precio: 25 }]
},
  {
  id: "empanaditas de ojaldre", nombre: "Empanaditas de ojaldre", tipo: "salado", emoji: "🥟", foto: "imagenes/empanadas_ojaldre.webp",
  desc: "Empanaditas de hojaldre dorado y crujiente..",
  opciones: ["Queso", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
    id: "rolls de canela", nombre: "Rolls de canela", tipo: "postre", emoji: "🌀", foto: "",
    desc: "Rolls de canela suaves y esponjosos.",
    unidad: ["roll", "rolls"], paso: 1, minimo: 1,
    presentaciones: [{ cantidad: 1, precio: null }]
  },
  {
    id: "porcion torta chocolate mojada", nombre: "Torta de chocolate mojada (porción)", tipo: "postre", emoji: "🍰", foto: "",
    desc: "Porción de torta de chocolate húmeda y esponjosa.",
    unidad: ["porción", "porciones"], paso: 1, minimo: 1,
    presentaciones: [{ cantidad: 1, precio: null }]
  },
  {
    id: "porcion tres leches", nombre: "Tres leches (porción)", tipo: "postre", emoji: "🍰", foto: "",
    desc: "Porción de torta tres leches.",
    unidad: ["porción", "porciones"], paso: 1, minimo: 1,
    presentaciones: [{ cantidad: 1, precio: null }]
  },

];

/* ================= LOS MÁS PEDIDOS Y GALERÍA ================= */

/* Los más pedidos (se muestran solo con el nombre): escribe los "id" de los bocaditos (los mismos de la lista de arriba).
   *** EJEMPLO: pon aquí los que más te piden *** */
const MAS_PEDIDOS = [
  "alfajores",
  "empanadas de harina",
  "tartaletas de atun",
  "bolitas de carne",
  "frutitas de mazapan",
  "tartaletas con crema pastelera",
  "mini tortas de chocolate",
  "vasitos-fresa",
  "tartaletas de atun",
  "Conitos rellenos de manjar",


];

/* PORTADA: fotos que pasan solas arriba de la página, en lugar del banner.
   - Una foto por línea. texto: opcional, sale abajo de la foto (ej. "Cumpleaños de Ana").
   - Se ven mejor las horizontales. Guárdalas en imagenes/galeria/ y conviértelas a .webp
     con optimizar_imagenes.py para que la página cargue rápido.
   - Si la lista queda vacía, se muestra el banner de siempre. */
const PORTADA_SEGUNDOS = 5;   // cuántos segundos se ve cada foto

const PORTADA = [
  { foto: "imagenes/galeria/pedido1.webp", texto: "Camarones con sus salsas" },
  { foto: "imagenes/galeria/pedido2.webp", texto: "Minigelatinas Pool Party" },
  { foto: "imagenes/galeria/pedido10.webp", texto: "Frutitas para Revelación de Género" },
  { foto: "imagenes/galeria/pedido9.webp", texto: "Cajitas personalizadas" },
  { foto: "imagenes/galeria/pedido5.webp", texto: "Cajas personalizadas para matrimonio" },
  { foto: "imagenes/galeria/pedido6.webp", texto: "Pedido dulce: Chesscakes y frutitas de mapazán" },
  { foto: "imagenes/galeria/pedido7.webp", texto: "Pedido para cumpleaños" },
  { foto: "imagenes/galeria/pedido8.webp", texto: "Chef Chary" },
];
