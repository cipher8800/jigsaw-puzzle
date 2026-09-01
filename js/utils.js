window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

function stopPropagation(event) {
  event.stopPropagation();
}

function save(key, value) {
  localStorage.setItem(`${PROJECT_NAME}_${key}`, JSON.stringify(value));
}

function load(key, defaultValue) {
  const savedValue = localStorage.getItem(`${PROJECT_NAME}_${key}`);
  if (savedValue == null) return defaultValue;
  return JSON.parse(savedValue);
}

function reset(key) {
  localStorage.removeItem(`${PROJECT_NAME}_${key}`);
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getFileName(file) {
  return decodeURIComponent(file.name).split("/").pop().split(".").slice(0, -1).join(".");
}

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function download(url, name) {
  const link = document.createElement("a");

  link.href = url;
  link.download = name;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function toggleHide(element) {
  element.classList.toggle("hidden");
}

function toggleFullscreen(force) {
  if (document.fullscreenElement && force !== true) {
    document.exitFullscreen();
  } else if (force !== false) {
    document.documentElement.requestFullscreen();
  }
}

const loadImage = (imgUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image at ${imgUrl}`));
  });
};

function getRandomInt(min, max) {
  // Ensure inputs are whole numbers
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  
  // Both the minimum and maximum are inclusive
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}