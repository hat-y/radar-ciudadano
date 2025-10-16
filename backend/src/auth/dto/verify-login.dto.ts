import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyLoginDto {
  @ApiProperty({
    description: 'Token único del magic link recibido por email',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token!: string;
}
