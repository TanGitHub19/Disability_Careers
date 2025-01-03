import Application from "../models/application.model.js";
import { sendConfirmationEmail } from "../mailtrap/gmail.js";
import Job from "../models/job.model.js";

export const applyJobs = async (req, res) => {
  try {
    const { jobId, applicantId, coverLetter, accessibilityNeeds } = req.body;

    if (!req.files || !req.files.resume) {
      return res.status(400).json({ error: "Resume is required." });
    }

    const application = new Application({
      jobId,
      applicantId,
      coverLetter,
      resume: req.files.resume[0].path,
      additionalFiles: req.files.additionalFiles?.map((file) => file.path),
      accessibilityNeeds,
    });

    await application.save();

    await sendConfirmationEmail(applicantId, jobId);

    res.status(200).json({ message: "Application submitted successfully." });
  } catch (error) {
    console.error("Error during application submission:", error);
    res
      .status(500)
      .json({ error: "An error occurred while submitting the application." });
  }
};

export const getApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const employerId = req.userId;

    const job = await Job.findOne({ _id: jobId, employer: employerId });

    if (!job) {
      return res.status(403).json({
        message: "You are not authorized to view this job's applications.",
      });
    }

    const applications = await Application.find({ jobId }).populate(
      "applicantId"
    );

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found." });
    }

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching applications." });
  }
};

export const getApplicationsByApplicant = async (req, res) => {
  try {
    const applicantId = req.userId;

    if (!applicantId) {
      return res.status(400).json({ error: "Applicant ID is required." });
    }

    const applications = await Application.find({ applicantId }).populate(
      "jobId"
    );

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for this applicant." });
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching applications." });
  }
};

export const getTotalApplications = async (req, res) => {
  try {
    const employerId = req.userId;

    const jobs = await Job.find({ employer: employerId });

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found posted by the employer." });
    }

    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      jobId: { $in: jobIds },
    }).populate("applicantId");

    const totalApplicants = applications.length;

    if (totalApplicants === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for your jobs." });
    }

    return res.status(200).json({
      totalApplicants,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      error: "An error occurred while fetching applications.",
    });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const applicantId = req.userId;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.applicantId.toString() !== applicantId) {
      return res
        .status(403)
        .json({ error: "You can only withdraw your own applications." });
    }

    await application.remove();

    res.status(200).json({ message: "Application withdrawn successfully." });
  } catch (error) {
    console.error("Error during application withdrawal:", error);
    res
      .status(500)
      .json({ error: "An error occurred while withdrawing the application." });
  }
};

export const getApplicantsWithJobs = async (req, res) => {
  try {
    const employerId = req.userId;

    const employerJobs = await Job.find({ employer: employerId });

    if (!employerJobs.length) {
      return res
        .status(403)
        .json({ message: "No jobs found for this employer" });
    }

    const applicants = await Application.find({
      jobId: { $in: employerJobs.map((job) => job._id) },
    })
      .populate("jobId", "jobTitle jobCategory jobType")
      .populate("applicantId", "fullName")
      .select("applicantId jobId createdAt")
      .exec();

    if (!applicants.length) {
      return res
        .status(404)
        .json({ message: "No applicants found for your jobs" });
    }

    const ApplicantsInfo = applicants.map((applicant) => ({
      applicantId: applicant.applicantId
        ? applicant.applicantId.fullName
        : "No name provided", 
      jobTitle: applicant.jobId.jobTitle,
      jobCategory: applicant.jobId.jobCategory,
      jobType: applicant.jobId.jobType,
      appliedAt: applicant.createdAt,
    }));

    res.status(200).json(ApplicantsInfo);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
