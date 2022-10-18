import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  const fakeUserService: Partial<UsersService> = {
    find: () => Promise.resolve([]),
    create: (email: string, password: string) =>
      Promise.resolve({
        id: '2959be58-1ed5-4c60-9902-8e2a750c1464',
        email,
        password,
      } as User),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#signup', () => {
    it('creates a new user with a salted and hashed password', async () => {
      const user = await service.signup('test@test.com', 'password');
      expect(user.password).not.toEqual('password');
      const [salt, hash] = user.password.split('.');
      expect(salt).toBeDefined();
      expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async () => {
      fakeUserService.find = () =>
        Promise.resolve([
          {
            id: '2959be58-1ed5-4c60-9902-8e2a750c1464',
            email: 'asdf@asdf.com',
            password: '1',
          } as User,
        ]);
      await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws if signin is called with an unused email', async () => {
      await expect(
        service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
      fakeUserService.find = () =>
        Promise.resolve([
          { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
        ]);
      await expect(
        service.signin('laskdjf@alskdfj.com', 'passowrd'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
