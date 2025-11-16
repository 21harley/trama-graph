-- CreateTable
CREATE TABLE "GestionAlarmas" (
    "id" SERIAL NOT NULL,
    "fechaReferencia" TIMESTAMP(3) NOT NULL,
    "totalActivaciones" INTEGER NOT NULL,
    "conteoPorGas" JSONB NOT NULL,
    "listaAlarmas" JSONB,
    "generadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GestionAlarmas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GestionAlarmas_fechaReferencia_key" ON "GestionAlarmas"("fechaReferencia");
