import fetch from "isomorphic-fetch";
import { onMount } from "svelte";

export const useApi = (route) => {
  let promise = new Promise((resolve) => {
    onMount(async () => {
      fetch(`${window.location.origin}${route}`)
        .then((res) => res.json())
        .then((parsed) => {
          if (parsed?.errors?.length > 0) {
            throw parsed.errors[0];
          }
          resolve(parsed);
        });
    });
  });
  return promise;
};
