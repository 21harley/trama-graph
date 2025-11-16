declare module "prisma/config" {
  type ImportConfigOptions = {
    path?: string | string[];
    importMeta: ImportMeta;
  };

  export function defineConfig<T>(config: T): T;
  export function env(key: string): string;
  export function importConfig(options: ImportConfigOptions): void;
}
