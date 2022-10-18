import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = await this.generateHash(password, salt);
    const hashedPassword = `${salt}.${hash}`;

    return this.userService.create(email, hashedPassword);
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    console.log(user);

    if (!user) throw new BadRequestException('Wrong email or password');

    const [salt, storedHash] = user.password.split('.');
    const hash = await this.generateHash(password, salt);
    if (storedHash !== hash)
      throw new BadRequestException('Wrong email or password');

    return user;
  }

  private async generateHash(password, salt) {
    return ((await scrypt(password, salt, 32)) as Buffer).toString('hex');
  }
}
