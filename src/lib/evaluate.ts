export async function evaluateSubmission({
    userFile,
    solutionFile,
    metric,
    minScore,
    maxScore,
}: {
    userFile: File;
    solutionFile: File;
    metric: string;
    minScore: number;
    maxScore: number;
}) {
    const form = new FormData();

    form.append("user_file", userFile);
    form.append("solution_file", solutionFile);

    form.append("metric", metric);
    form.append("min_score", String(minScore));
    form.append("max_score", String(maxScore));

    const response = await fetch(
        "https://YOUR-VERCEL-URL.vercel.app/api/evaluate",
        {
            method: "POST",
            body: form,
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
    }

    return await response.json();
}