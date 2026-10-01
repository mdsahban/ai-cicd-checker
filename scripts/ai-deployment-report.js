const fs = require('fs');

async function analyzeDeployment() {
    // Phase 8: Gather all the deployment data passed from GitHub Actions environment variables
    const deploymentData = {
        commit_sha: process.env.GITHUB_SHA || 'unknown',
        branch: process.env.GITHUB_REF_NAME || 'unknown',
        deployment_status: process.env.DEPLOYMENT_STATUS || 'unknown',
        repository: process.env.GITHUB_REPOSITORY || 'unknown',
        actor: process.env.GITHUB_ACTOR || 'unknown',
    };

    console.log("Collected Deployment Data:", JSON.stringify(deploymentData, null, 2));

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
        console.log("No AI_API_KEY provided. Skipping AI analysis.");
        return generateFallbackReport(deploymentData);
    }

    // Phase 9: Call the AI API (using the completely free Google Gemini API)
    console.log("Analyzing deployment with AI...");
    try {
        const prompt = `
        You are an expert DevOps AI analyzer. 
        Analyze the following deployment data and output a structured JSON response.
        Do NOT invent facts. Only use the provided data. Explain deployment failures in beginner-friendly language.
        If the deployment status is success, the risk is usually LOW unless you see security vulnerabilities.
        
        Data: ${JSON.stringify(deploymentData)}
        
        Output EXACTLY this JSON structure, nothing else:
        {
          "status": "SUCCESS or FAILED",
          "risk": "LOW, MEDIUM, or HIGH",
          "summary": "2-3 sentences explaining the deployment for a beginner",
          "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"]
        }
        `;

        // Node.js 18 has built-in 'fetch' so we don't need to install external libraries like Axios
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // Parse the AI's JSON response
        let aiText = data.candidates[0].content.parts[0].text;
        // Clean up markdown formatting if the AI adds it (e.g. ```json ... ```)
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiAnalysis = JSON.parse(aiText);

        // Phase 10: Write to GitHub Actions Step Summary
        writeSummary(deploymentData, aiAnalysis);

    } catch (error) {
        console.error("AI Analysis failed:", error);
        generateFallbackReport(deploymentData);
    }
}

function writeSummary(data, ai) {
    const summary = `
# 🤖 AI DEPLOYMENT REPORT
====================

**Status:** ${ai.status}
**Risk:** ${ai.risk}

**Commit:** \`${data.commit_sha.substring(0, 7)}\`
**Triggered by:** \`${data.actor}\`

### 🧠 AI Summary:
${ai.summary}

### 💡 Recommendations:
${ai.recommendations.map(r => `- ${r}`).join('\n')}
====================================
    `;

    // GitHub Actions automatically reads the file path stored in GITHUB_STEP_SUMMARY to create beautiful UI reports
    const summaryFilePath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFilePath) {
        fs.appendFileSync(summaryFilePath, summary);
    } else {
        console.log("Local Test Output:\n" + summary);
    }
}

function generateFallbackReport(data) {
    writeSummary(data, {
        status: data.deployment_status.toUpperCase(),
        risk: "UNKNOWN",
        summary: "The deployment finished, but the AI API key was not configured so AI analysis was skipped.",
        recommendations: ["Configure the AI_API_KEY in GitHub Secrets to enable AI analysis."]
    });
}

analyzeDeployment();
