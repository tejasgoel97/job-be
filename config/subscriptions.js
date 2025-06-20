const SUBSCRIPTION_PLANS = {
    candidate: {
        basic: {
            capabilities: ['view_jobs', 'apply_jobs']
        },
        pro: {
            capabilities: ['view_jobs', 'apply_jobs', 'priority_applications', 'profile_boost']
        }
    },
    recruiter: {
        basic: {
            capabilities: ['post_jobs', 'view_applications']
        },
        pro: {
            capabilities: ['post_jobs', 'view_applications', 'featured_listings', 'candidate_search']
        }
    }
};

module.exports = SUBSCRIPTION_PLANS;
