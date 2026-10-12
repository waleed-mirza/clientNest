export function formString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

export function formStrings(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((value) => String(value));
}

export function formFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}
