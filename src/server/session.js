import { picrewApi } from "./picrewApi.js";

export default async (req, res) => ({
  camper: { id: req.headers["Remote-User"] }, //await picrewApi.find("camper", req.id),
});
