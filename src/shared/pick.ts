const pick = <T extends object>(obj: T, keys: (keyof T)[]): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

export default pick;
