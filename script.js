const username = "oddfeed";
const repoName = "dotorg";
const branch = "main";
let cachedFiles = [];

async function fetchFiles() {
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    cachedFiles = data.tree
      .filter(
        (item) =>
          item.type === "blob" && /\.(org|md|html|pdf|bib)$/i.test(item.path),
      )
      .map((file) => ({
        name: file.path.split("/").pop(),
        path: file.path,
        folder: file.path.split("/")[0],
        url: `https://${username}.github.io/${repoName}/${file.path}`,
      }));

    renderFileList(cachedFiles);
    populateFolderFilter(cachedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
  }
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
    fileTag.textContent = file.folder;

    li.appendChild(fileName);
    li.appendChild(fileTag);
    fileList.appendChild(li);
  });
}

function populateFolderFilter(fileArray) {
  const folderFilter = document.getElementById("folderFilter");
  const folders = [...new Set(fileArray.map((file) => file.folder))];

  folders.forEach((folder) => {
    const option = document.createElement("option");
    option.value = folder;
    option.textContent = folder;
    folderFilter.appendChild(option);
  });
}

function filterAndSearchFiles() {
  const searchQuery = document.getElementById("searchBar").value.toLowerCase();
  const selectedFolder = document.getElementById("folderFilter").value;

  const filteredFiles = cachedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery);
    const matchesFolder = selectedFolder
      ? file.folder === selectedFolder
      : true;
    return matchesSearch && matchesFolder;
  });

  renderFileList(filteredFiles);
}

document
  .getElementById("searchBar")
  .addEventListener("input", filterAndSearchFiles);
document
  .getElementById("folderFilter")
  .addEventListener("change", filterAndSearchFiles);

fetchFiles();
