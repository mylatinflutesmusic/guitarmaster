/**
 * Cuerda is a static, client-only app: everything runs in the browser and all
 * data lives in localStorage. The Worker exists only to serve the built assets.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
