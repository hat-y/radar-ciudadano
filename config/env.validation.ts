import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, IsString, validateSync, IsOptional } from 'class-validator';

class EnvVars {
  @IsEnum(['development', 'test', 'production'])
  @IsOptional()
  NODE_ENV!: string;

  @IsInt()
  @IsOptional()
  PORT!: number;

  @IsString()
  DB_HOST!: string;

  @IsInt()
  DB_PORT!: number;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASS!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvVars, config, { 
    enableImplicitConversion: true 
  });
  
  const errors = validateSync(validatedConfig, { 
    skipMissingProperties: false 
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};

