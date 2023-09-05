const keywordStats = {};

function optimizeContent() {
    const htmlContent = document.getElementById("htmlContent").value;
    const keywordsTextarea = document.getElementById("keywords");
    const primaryKeywords = keywordsTextarea.value.split("\n").map(keyword => keyword.trim());

    const additionalKeywordsTextarea = document.getElementById("additionalKeywords");
    const additionalKeywordsAndUrls = additionalKeywordsTextarea.value.trim().split('\n');
    
    const additionalKeywordsMap = {};

    let currentUrl = '';
    let insideH1Tag = false; // Initialize the flag here
    for (const line of additionalKeywordsAndUrls) {
        if (line.trim() === '') {
            currentUrl = '';
        } else if (!currentUrl) {
            currentUrl = line.trim();
        } else {
            if (!additionalKeywordsMap[currentUrl]) {
                additionalKeywordsMap[currentUrl] = [];
            }
            additionalKeywordsMap[currentUrl].push(line.trim());
        }
    }

    let cleanedContent = htmlContent.replace(/<\/?(strong|em)>/g, ''); // Remove existing <strong> and <em> tags

    cleanedContent = cleanedContent.replace(/<\/(p|h[1-6]|li)>/g, '</$1>\n');

    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    cleanedContent = cleanedContent.replace(/&nbsp;/g, '');

    cleanedContent = cleanedContent.replace(/&lsquo;/g, "'");

    cleanedContent = cleanedContent.replace(/&rsquo;/g, "'");

    cleanedContent = cleanedContent.replace(/&rdquo;/g, '"');

    cleanedContent = cleanedContent.replace(/&ldquo;/g, '"');

    cleanedContent = cleanedContent.trim();

    let optimizedContent = cleanedContent;

    // Use regular expressions to find and replace keywords inside open <h1> tags with <em> tags
    primaryKeywords.forEach(keyword => {
        const keywordPattern = new RegExp(`(<h1[^>]*>.*?)(\\b${keyword}\\b)(.*?</h1>)`, "gi");
        optimizedContent = optimizedContent.replace(keywordPattern, (match, beforeH1, keywordMatch, afterH1) => {
            if (!keywordStats[keyword]) {
                keywordStats[keyword] = { strongTagCount: 0, aTagCount: 0, emTagCount: 0 };
            }
            keywordStats[keyword].emTagCount++;
            return `${beforeH1}<em>${keywordMatch}</em>${afterH1}`;
        });
    });

    // Replace other occurrences of primary keywords with <strong> tags
    primaryKeywords.forEach(keyword => {
        const keywordPattern = new RegExp(`\\b${keyword}\\b`, "gi");
        if (!insideH1Tag) {
            optimizedContent = optimizedContent.replace(keywordPattern, match => {
                if (!keywordStats[keyword]) {
                    keywordStats[keyword] = { strongTagCount: 0, aTagCount: 0, emTagCount: 0 };
                }
                keywordStats[keyword].strongTagCount++;
                return `<strong>${match}</strong>`;
            });
        }
    });

    // Reset the flag after processing primary keywords
    insideH1Tag = false;


    optimizedContent = optimizedContent.replace(/<em><strong>(.*?)<\/strong><\/em>/g, '<em>$1</em>');
    document.getElementById("outputContent").textContent = optimizedContent;
}



function finishOptimization() {
    // Clear the previous keyword statistics
    document.getElementById("keywordList").innerHTML = "";

    // Extract keywords from the primary and additional lists
    const keywordsTextarea = document.getElementById("keywords");
    const primaryKeywords = keywordsTextarea.value.split("\n").map(keyword => keyword.trim());

    const additionalKeywordsTextarea = document.getElementById("additionalKeywords");
    const additionalKeywordsAndUrls = additionalKeywordsTextarea.value.trim().split('\n');
    
    const additionalKeywordsMap = {};

    let currentUrl = '';
    for (const line of additionalKeywordsAndUrls) {
        if (line.trim() === '') {
            // Empty line indicates the end of keywords for the current URL
            currentUrl = '';
        } else if (!currentUrl) {
            // The first non-empty line is treated as the URL
            currentUrl = line.trim();
        } else {
            // Lines after the URL are treated as keywords
            if (!additionalKeywordsMap[currentUrl]) {
                additionalKeywordsMap[currentUrl] = [];
            }
            additionalKeywordsMap[currentUrl].push(line.trim());
        }
    }

    // Calculate keyword statistics for both primary and additional keywords
    const keywordStatistics = {};

    primaryKeywords.forEach(keyword => {
        const strongTagCount = (keywordStats[keyword] && keywordStats[keyword].strongTagCount) || 0;
        const aTagCount = (keywordStats[keyword] && keywordStats[keyword].aTagCount) || 0;
        const emTagCount = (keywordStats[keyword] && keywordStats[keyword].emTagCount) || 0;
        keywordStatistics[keyword] = {
            strongTagCount,
            aTagCount,
            emTagCount
        };
    });

    Object.keys(additionalKeywordsMap).forEach(url => {
        const keywords = additionalKeywordsMap[url];
        keywords.forEach(keyword => {
            const strongTagCount = (keywordStats[keyword] && keywordStats[keyword].strongTagCount) || 0;
            const aTagCount = (keywordStats[keyword] && keywordStats[keyword].aTagCount) || 0;
            keywordStatistics[keyword] = {
                strongTagCount,
                aTagCount
            };
        });
    });

    // Display keyword statistics
    const keywordList = document.getElementById("keywordList");
    Object.keys(keywordStatistics).forEach(keyword => {
        const stats = keywordStatistics[keyword];
        const listItem = document.createElement("li");
        listItem.textContent = `${keyword}: Heading Tags (${stats.emTagCount}), Strong Tags (${stats.strongTagCount}), <a> Tags (${stats.aTagCount})`;
        keywordList.appendChild(listItem);
    });
}

function copyToClipboard() {
    const outputContent = document.getElementById("outputContent");
    const textToCopy = outputContent.textContent;

    // Create a temporary input element to hold the text
    const tempInput = document.createElement("textarea");
    tempInput.value = textToCopy;

    // Append the input element to the document
    document.body.appendChild(tempInput);

    // Select and copy the text
    tempInput.select();
    document.execCommand("copy");

    // Remove the temporary input element
    document.body.removeChild(tempInput);

    // Provide user feedback (optional)
    alert("Copied to clipboard: \n" + textToCopy);
}

