import NodeCache from "node-cache";

// Initialize cache with a standard TTL of 60 seconds (useful for high-traffic read-heavy endpoints)
const apiCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export default apiCache;
