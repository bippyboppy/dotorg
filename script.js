const username = "oddfeed";
const repoName = "dotorg";
const branch = "main";
let cachedFiles = [];
async function fetchFiles() {
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const filePromises = data.tree
      .filter(
        (item) =>
          item.type === "blob" && /\.(org|md|html|pdf|bib)$/i.test(item.path),
      )
      .map(async (file) => {
        const fileData = await fetchFileContent(file.path);
        const tag = extractTag(fileData) || "misc";
        return {
          name: file.path.split("/").pop(),
          path: file.path,
          tag: tag,
          url: `https://${username}.github.io/${repoName}/${file.path}`,
        };
      });

    cachedFiles = await Promise.all(filePromises);
    renderFileList(cachedFiles);
    populateTagFilter(cachedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
  }
}

async function fetchFileContent(path) {
  const fileUrl = `https://${username}.github.io/${repoName}/${path}`;
  const response = await fetch(fileUrl);
  return await response.text();
}

function extractTag(fileData) {
  const tagMatch = fileData.match(/:([a-zA-Z]+):/);
  return tagMatch ? tagMatch[1] : null;
}

function renderFileList(fileArray) {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  fileArray.forEach((file) => {
    const li = document.createElement("li");
    li.className = "fileItem";

    const fileName = document.createElement("a");
    fileName.href = file.url;
    fileName.textContent = file.name;
    fileName.target = "_blank";

    const fileTag = document.createElement("span");
    fileTag.className = "tag";
    fileTag.textContent = file.tag;

    li.appendChild(fileName);
    li.appendChild(fileTag);
    fileList.appendChild(li);
  });
}

function populateTagFilter(fileArray) {
  const folderFilter = document.getElementById("folderFilter");
  folderFilter.innerHTML = `<option value="">All Tags</option>`;

  const tags = [...new Set(fileArray.map((file) => file.tag))];
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    folderFilter.appendChild(option);
  });
}

document
  .getElementById("searchBar")
  .addEventListener("input", filterAndSearchFiles);
document
  .getElementById("folderFilter")
  .addEventListener("change", filterAndSearchFiles);

fetchFiles();
