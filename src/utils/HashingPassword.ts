import bcryptjs from "bcryptjs";


export function hashedPassword(password: string): string {
  const salt = bcryptjs.genSaltSync(10);
  const hashedPassword = bcryptjs.hashSync(password, salt);
  return hashedPassword;
}
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword);
}