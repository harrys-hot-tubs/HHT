import dotenv from 'dotenv';
import path from 'path';

export default async () => {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })
}