const KEY = 'physicsmn.pending-photo';

/** Carries a photo picked on the landing page over to the solver for this tab only. */
export async function stashPhoto(blob: Blob, name: string): Promise<boolean> {
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    window.sessionStorage.setItem(KEY, JSON.stringify({ dataUrl, name }));
    return true;
  } catch {
    return false;
  }
}

export function takeStashedPhoto(): { blob: Blob; name: string } | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const { dataUrl, name } = JSON.parse(raw) as { dataUrl: string; name: string };
    const match = /^data:(image\/[a-z+.-]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return null;
    const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
    return { blob: new Blob([bytes], { type: match[1] }), name: typeof name === 'string' ? name : 'photo.jpg' };
  } catch {
    return null;
  }
}
