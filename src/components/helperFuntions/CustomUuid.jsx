export const uuid = () => {
  return ([1e2] + -1e2 + -1e3).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (6 >> (c / 4)))
    ).toString(6)
  );
};
