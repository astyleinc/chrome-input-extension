document.addEventListener("DOMContentLoaded", () => {
  const targetIdsInput = document.getElementById("targetIds");
  const stepValueInput = document.getElementById("stepValue");
  const offsetYInput = document.getElementById("offsetY");
  const saveButton = document.getElementById("save");
  const statusText = document.getElementById("status");

  // 設定を読み込む
  chrome.storage.sync.get(["targetIds", "stepValue", "offsetY"], (data) => {
      targetIdsInput.value = data.targetIds ? data.targetIds.join(",") : "";
      stepValueInput.value = data.stepValue ?? 0.25;
      offsetYInput.value = data.offsetY ?? 50;
  });

  // 設定を保存
  saveButton.addEventListener("click", () => {
      const targetIds = targetIdsInput.value.split(",").map(id => id.trim());
      const stepValue = parseFloat(stepValueInput.value);
      const offsetY = parseInt(offsetYInput.value, 10);

      chrome.storage.sync.set({ targetIds, stepValue, offsetY }, () => {
          statusText.textContent = "設定が保存されました";
          setTimeout(() => statusText.textContent = "", 2000);
      });
  });
});
