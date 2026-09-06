import { getConfig, signup } from "../src/server/newsletter.js";
export default {
  fetch(request: Request) {
    return signup(request, getConfig());
  },
};
