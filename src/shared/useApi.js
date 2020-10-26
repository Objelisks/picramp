import fetch from "isomorphic-fetch";

export const api = (route) => {
  return fetch(`${window.location.origin}${route}`)
    .then((res) => res.json())
    .then((parsed) => {
      if (parsed?.errors?.length > 0) {
        throw parsed.errors[0];
      }
      return parsed;
    });
};
