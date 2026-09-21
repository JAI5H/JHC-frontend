import { apiClient } from "./client";

export type TalentNetworkSubmissionPayload = {
  FullName: string;
  Email: string;
  MobileNumber: string;
  Nationality: string;
  CurrentCountry: string;
  CurrentCity: string;
  CurrentJobTitle: string;
  YearsOfExperience: string;
  Industry: string;
  ExpectedSalary: string;
  SalaryCurrency: string;
  EmploymentType: string[];
  PreferredWorkCountry: string;
  EnglishLevel: string;
  AvailableToRelocate: string;
  LinkedInProfile: string;
  AdditionalNotes: string;
  CvFile: File;
};

export async function submitTalentNetworkApplication(
  payload: TalentNetworkSubmissionPayload,
) {
  const formData = new FormData();

  formData.append("FullName", payload.FullName);
  formData.append("Email", payload.Email);
  formData.append("MobileNumber", payload.MobileNumber);
  formData.append("Nationality", payload.Nationality);
  formData.append("CurrentCountry", payload.CurrentCountry);
  formData.append("CurrentCity", payload.CurrentCity);
  formData.append("CurrentJobTitle", payload.CurrentJobTitle);
  formData.append("YearsOfExperience", payload.YearsOfExperience);
  formData.append("Industry", payload.Industry);
  formData.append("ExpectedSalary", payload.ExpectedSalary);
  formData.append("SalaryCurrency", payload.SalaryCurrency);
  formData.append("EmploymentType", JSON.stringify(payload.EmploymentType));
  formData.append("PreferredWorkCountry", payload.PreferredWorkCountry);
  formData.append("EnglishLevel", payload.EnglishLevel);
  formData.append("AvailableToRelocate", payload.AvailableToRelocate);
  formData.append("LinkedInProfile", payload.LinkedInProfile);
  formData.append("AdditionalNotes", payload.AdditionalNotes);
  formData.append("CvFile", payload.CvFile);

  return apiClient.post("/api/candidates", formData);
}
