import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class SigninUserDto extends CreateUserDto {
  @IsString()
  @IsOptional()
  username: string;
}
