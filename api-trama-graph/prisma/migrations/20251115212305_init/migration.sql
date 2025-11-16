-- CreateTable
CREATE TABLE "TipoDeGases" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "formulaQuimica" TEXT NOT NULL,
    "unidadMedida" TEXT,
    "codigoSensor" TEXT,

    CONSTRAINT "TipoDeGases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicion" (
    "id" SERIAL NOT NULL,
    "fechaMedida" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(10,3) NOT NULL,
    "umbral" DECIMAL(10,3) NOT NULL,
    "ubicacion" TEXT,
    "origen" TEXT,
    "idTipoGas" INTEGER NOT NULL,

    CONSTRAINT "Medicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alarma" (
    "id" SERIAL NOT NULL,
    "idTipoGas" INTEGER NOT NULL,
    "nMedidas" INTEGER NOT NULL,
    "listaIdMedidas" INTEGER[],
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "umbralReferencia" DECIMAL(10,3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alarma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Medicion_idTipoGas_fechaMedida_idx" ON "Medicion"("idTipoGas", "fechaMedida" DESC);

-- CreateIndex
CREATE INDEX "Alarma_idTipoGas_estado_idx" ON "Alarma"("idTipoGas", "estado");

-- AddForeignKey
ALTER TABLE "Medicion" ADD CONSTRAINT "Medicion_idTipoGas_fkey" FOREIGN KEY ("idTipoGas") REFERENCES "TipoDeGases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alarma" ADD CONSTRAINT "Alarma_idTipoGas_fkey" FOREIGN KEY ("idTipoGas") REFERENCES "TipoDeGases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
