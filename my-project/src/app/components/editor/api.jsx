import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAvailableRuntimes = async () => {
  try {
    const response = await API.get("/runtimes");
    return response.data;
  } catch (error) {
    console.error("Error fetching runtimes:", error.message);
    return [];
  }
};

const getVersionForLanguage = async (language) => {
  const runtimes = await getAvailableRuntimes();
  const runtime = runtimes.find((r) => r.language === language);
  console.log("Found runtime for language:", runtime);
  return runtime?.version || null;
};

export const executeCode = async (language, sourceCode) => {
  console.log("Executing code in language:", language);

  try {
    if (!language || !sourceCode) {
      throw new Error("Language or source code not provided.");
    }

    const version = await getVersionForLanguage(language);
    if (!version) {
      throw new Error(`Unsupported language or version not found: ${language}`);
    }

    const response = await API.post("/execute", {
      language,
      version,
      files: [
        {
          content: sourceCode,
        },
      ],
    });

    console.log("Execution result:", response.data);
    return response.data;
  } catch (error) {
    console.error("Execution error:", error.response?.data || error.message);
    return {
      run: {
        stdout: "",
        stderr:
          "Execution failed: " +
          (error.response?.data?.message || error.message),
        output: "",
      },
    };
  }
};
