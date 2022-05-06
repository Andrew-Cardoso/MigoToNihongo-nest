import { pbkdf2, randomBytes } from 'crypto';

const hashPassword = (password: string, salt: string): Promise<string> =>
  new Promise((resolve, reject) => {
    pbkdf2(password, salt, 10000, 64, 'sha1', (err: Error, hashedPassword) =>
      err ? reject(err) : resolve(hashedPassword.toString('base64')),
    );
  });

export const generateHashAndSalt = async (password: string) => {
  const generatedBytes = randomBytes(25);
  const passwordSalt = generatedBytes.toString('hex');
  const passwordHash = await hashPassword(password, passwordSalt);

  return {
    passwordHash,
    passwordSalt,
  };
};

export const checkPassword = async (
  password: string,
  passwordHash: string,
  passwordSalt: string,
) => passwordHash === (await hashPassword(password, passwordSalt));
