import fetch from 'node-fetch';

export async function isUrlAvailable(url: string): Promise<boolean> {
  try {
    await fetch(url);
    return true;
  } catch (error) {
    return false;
  }
}
