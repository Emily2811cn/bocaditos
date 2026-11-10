/* Catálogo: para agregar un bocadito, copia un bloque { ... }, pégalo y cámbialo.
   tipo: "dulce" o "salado".
   foto: ruta de la imagen dentro de /imagenes (si la dejas vacía "", se muestra el emoji).

   presentaciones: precios por tramo, ej. { cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }.
     - Se ven en la tarjeta. Si dejas precio: null se muestra "—".
     - El contador usa el tramo más grande que alcance la cantidad y lo escala:
       50 = $10 (precio propio), 100 = $18, 150 = $27, 200 = $36... (con 100 = $18, cada 50 sale a $9).

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
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "empanadas de maiz sabrosa", nombre: "Empanadas de maiz sabrosa", tipo: "salado", emoji: "🥟", foto: "imagenes/empanadas_maiz_sabrosa.webp",
  desc: "Doradas y crujientes.",
  opciones: ["Queso", "Pollo", "Carne"],
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
{
  id: "medallones de chorizo", nombre: "Medallones de chorizo", tipo: "salado", emoji: "🥓", foto: "imagenes/medallones_chorizo.webp",
  desc: "Medallones de chorizo a la parrilla.",
  opciones: ["Pavo", "Pollo", "Carne"],
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
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},
  {
  id: "bolitas de carne", nombre: "Bolitas de carne", tipo: "salado", emoji: "🧆", foto: "imagenes/bolitas_carne.webp",
  desc: "Bolitas de carne con queso cheddar.",
  opciones: ["Queso", "Pollo", "Carne"],
  gratis: "Aderezo de mayonesa",
  presentaciones: [{ cantidad: 50, precio: 10 }, { cantidad: 100, precio: 18 }]
},

];
