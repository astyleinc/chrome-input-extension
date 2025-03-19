// Chromeのストレージを使用して設定を保存・取得
const defaultSettings: {
  targetIds: string[];
  stepValue: number;
  offsetY: number;
} = {
  targetIds: [],
  stepValue: 0.25,
  offsetY: 50,
};

let settings: { targetIds: string[]; stepValue: number; offsetY: number } = {
  ...defaultSettings,
};

chrome.storage.sync.get(defaultSettings, (storedSettings) => {
  settings = { ...defaultSettings, ...storedSettings };
});

let currentInput: HTMLInputElement | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;

function createPopup(input: HTMLInputElement) {
  if (currentInput === input) return; // 同じ入力欄なら再生成しない
  currentInput = input;

  // 既存のポップアップを削除して新しく作成
  let popup = document.getElementById("bolt-popup") as HTMLDivElement | null;
  if (popup) {
    popup.remove();
  }

  popup = document.createElement("div");
  popup.id = "bolt-popup";

  // スタイル設定
  popup.style.position = "absolute";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "5px";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = "100000000";
  popup.style.display = "flex";
  popup.style.gap = "5px";
  popup.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
  popup.style.visibility = "visible";
  popup.style.opacity = "0.7";
  popup.style.transition = "opacity 0.3s";

  popup.addEventListener("mouseenter", () => {
    popup!.style.opacity = "1";
    if (hideTimeout) clearTimeout(hideTimeout);
  });

  popup.addEventListener("mouseleave", () => {
    popup!.style.opacity = "0.7";
    startHideTimeout();
  });

  const createButton = (label: string, step: number) => {
    const button = document.createElement("button");
    button.innerHTML = label;
    button.style.cursor = "pointer";
    button.style.padding = "5px";
    button.style.border = "none";
    button.style.backgroundColor = "transparent";
    button.style.fontSize = "14px";
    button.style.fontWeight = "bold";
    button.addEventListener("click", () => {
      const currentValue = parseFloat(input.value) || 0;
      input.value = (currentValue + step).toFixed(2);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      startHideTimeout();
    });
    return button;
  };

  const incrementButton = createButton("＋", settings.stepValue);
  const decrementButton = createButton("－", -settings.stepValue);

  popup.appendChild(decrementButton);
  popup.appendChild(incrementButton);
  document.body.appendChild(popup);

  // ポップアップの位置を更新
  const updatePosition = () => {
    const rect = input.getBoundingClientRect();
    popup!.style.top = `${window.scrollY + rect.top - settings.offsetY}px`;
    popup!.style.left = `${window.scrollX + rect.left}px`;
  };
  updatePosition();

  // 2秒後に非表示にするタイマー開始
  startHideTimeout();

  function startHideTimeout() {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (popup && document.body.contains(popup)) {
        popup.remove();
        currentInput = null;
      }
    }, 2000);
  }

  // フォーカスが外れたらポップアップを削除
  input.addEventListener("blur", (event) => {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as Node | null;
      if (!popup!.contains(relatedTarget)) {
        popup!.remove();
        currentInput = null;
      }
    }, 200);
  });
}

document.addEventListener("focusin", (event) => {
  const target = event.target as HTMLInputElement;
  if (target && settings.targetIds.includes(target.id)) {
    createPopup(target);
  }
});
