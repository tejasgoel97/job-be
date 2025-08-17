const Job = require('../models/Job');

const getJobsByExpertise = async (req, res) => {
    try {
        // Get current date for deadline check
        const currentDate = new Date();

        // First, get all unique expertise categories
        const expertiseCategories = await Job.distinct('expertise.category');

        // Process each expertise category
        const result = await Promise.all(expertiseCategories.map(async (category) => {
            // Get total count of non-expired jobs for this category
            const totalCount = await Job.countDocuments({
                'expertise.category': category,
                deadline: { $gt: currentDate }
            });

            // Get top 6 latest jobs for this category
            const topJobs = await Job.find({
                'expertise.category': category,
                deadline: { $gt: currentDate }
            })
            .populate('companyId', 'infoData.companyName companyLogo') // Include company details
            .sort({ createdAt: -1 })
            .limit(6)
            .select('title fromSalary toSalary salaryCurrency jobType city state country expertise createdAt'); // Select necessary fields

            const formattedJobs = topJobs.map(job => ({
                id: job._id,
                title: job.title,
                salary: {
                    from: job.fromSalary,
                    to: job.toSalary,
                    currency: job.salaryCurrency
                },
                jobType: job.jobType,
                location: {
                    city: job.city,
                    state: job.state,
                    country: job.country
                },
                company: job.companyId ? {
                    id: job.companyId._id,
                    name: job.companyId.infoData.companyName,
                    logo: job.companyId.companyLogo
                } : null,
                expertise: job.expertise,
                createdAt: job.createdAt
            }));

            return {
                category,
                totalJobCount: totalCount,
                topJobs: formattedJobs
            };
        }));

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in getJobsByExpertise:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getJobsByExpertise
};
