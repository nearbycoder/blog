import { getConfig, confirm } from "../src/server/newsletter.js";
export default {
  fetch(request: Request) {
    return confirm(request, getConfig());
  },
};
