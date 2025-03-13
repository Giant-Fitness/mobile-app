// config/posthog.ts

import outputs from '../posthog.json';

export const POSTHOG_CONFIG = {
    apiKey: outputs.POSTHOG_API_KEY,
    host: outputs.POSTHOG_HOST,
};
