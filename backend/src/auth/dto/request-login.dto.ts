import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestLoginDto {
  @ApiProperty({
    description: 'Email del usuario para recibir el magic link',
    example: 'usuario@ejemplo.com',
    type: String,
    format: 'email',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email!: string;
}
