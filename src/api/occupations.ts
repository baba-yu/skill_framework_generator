import axios from "axios";

export interface Occupation {
  code: string;
  title: string;
  description: string;
}

export async function fetchOccupations(keywords: string[]): Promise<Occupation[]> {
  const response = await axios.post(
    "https://apitest.sandbox-zipteam.us/occupations",
    { keywords },
    { headers: { "Content-Type": "application/json", Accept: "application/json" } }
  );
  return response.data.occupations;
}
