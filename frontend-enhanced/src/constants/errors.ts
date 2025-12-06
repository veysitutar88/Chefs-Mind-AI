export const ERROR_MAP: Record<string, { code: string; message: string; retryable: boolean }> = {
    // Network / Global
    'E_NET': { code: 'E_NET', message: 'Network connection lost. Please check your internet.', retryable: true },
    'E_AUTH': { code: 'E_AUTH', message: 'Authentication expired. Please refresh the page.', retryable: false },

    // Provider Specific
    'E_PROV_DOWN': { code: 'E_PROV_DOWN', message: 'The AI provider is currently unavailable.', retryable: true },
    'E_PROV_QUOTA': { code: 'E_PROV_QUOTA', message: 'Usage limit exceeded for this model.', retryable: false },

    // Validation
    'E_VALID': { code: 'E_VALID', message: 'Invalid parameters provided.', retryable: false },
    'E_MODEL_NS': { code: 'E_MODEL_NS', message: 'This model is no longer supported.', retryable: false },

    // Job State
    'E_JOB_STALE': { code: 'E_JOB_STALE', message: 'Job status is unknown (stale).', retryable: true },
    'E_POLL_FAIL': { code: 'E_POLL_FAIL', message: 'Failed to update job status.', retryable: true },
    'E_UPLOAD': { code: 'E_UPLOAD', message: 'Failed to upload generated asset.', retryable: true },

    // Fallback
    'UNKNOWN': { code: 'UNKNOWN', message: 'An unexpected error occurred.', retryable: true }
};

export const getErrorByCode = (code: string) => {
    return ERROR_MAP[code] || ERROR_MAP['UNKNOWN'];
};
