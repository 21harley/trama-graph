import process from "process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const gasTypes = [
  { id: 1, nombre: "Monóxido de Carbono", formulaQuimica: "CO", unidadMedida: "ppm" },
  { id: 2, nombre: "Alcohol", formulaQuimica: "AL", unidadMedida: "ppm" },
  { id: 3, nombre: "Hidrógeno", formulaQuimica: "H2", unidadMedida: "ppm" },
  { id: 4, nombre: "Metano", formulaQuimica: "CH4", unidadMedida: "ppm" },
  { id: 5, nombre: "Gas Licuado de Petróleo", formulaQuimica: "LPG", unidadMedida: "ppm" },
];

async function main() {
  console.info("Seeding gas types...");

  await prisma.medicion.deleteMany();
  await prisma.alarma.deleteMany();
  await prisma.tipoDeGases.deleteMany();

  await prisma.tipoDeGases.createMany({ data: gasTypes, skipDuplicates: true });

  console.info("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
