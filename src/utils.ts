import moment from "moment";

/**
 * create a randomly generated string from lowercase and numbers
 *
 * @param {number} length
 * @param {(('lowercase' | 'numbers' | 'uppercase' | 'special')[])} [options]
 * @returns
 */
export function randString(
  length: number,
  options?: ("lowercase" | "numbers" | "uppercase" | "special")[]
) {
  let result = "";
  let characters = "";

  let _options = options;
  if (!_options) {
    _options = ["lowercase", "numbers"];
  }

  if (_options.includes("uppercase")) {
    characters = characters + "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (_options.includes("lowercase")) {
    characters = characters + "abcdefghijklmnopqrstuvwxyz";
  }

  if (_options.includes("numbers")) {
    characters = characters + "0123456789";
  }

  if (_options.includes("special")) {
    characters = characters + "!@#$%^&*()_+-=[]{};':\"<>?,./`~";
  }

  const charactersLength: number = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Converts a complex object with null, undefined, and functions and returns
 * an object without the types that would cause an error
 * NOTE: Suitable to for saving firebase
 *
 * @param {*} obj
 */
export const normalizeObject = async (obj: any) => {
  const omitBy = (await import("lodash")).omitBy;
  const pickBy = (await import("lodash")).pickBy;
  const identity = (await import("lodash")).identity;
  const isFunction = (await import("lodash")).isFunction;
  return omitBy(pickBy(obj, identity), isFunction);
};

export const now = () => {
  return Number(moment().format("x"));
};

export const wait = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, seconds * 1000);
  });
};
