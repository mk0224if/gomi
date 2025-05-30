let generatedPlate = "";
let hasSolution = false;
let timer;
let timeLeft = 30;

function generatePlate() {
  const number = Math.floor(0 + Math.random() * 10000);
  generatedPlate = number.toString().padStart(4, '0');
  document.getElementById("plateDisplay").textContent = generatedPlate;
  document.getElementById("result").textContent = "";
  document.getElementById("userInput").value = "";
  hasSolution = checkIfSolvable(generatedPlate);
  resetTimer();
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      document.getElementById("result").textContent = "時間切れ！もう一度挑戦してみてください。";
      document.getElementById("result").style.color = "red";
    }
  }, 1000);
}

function getDigits(str) {
  return str.split('').sort();
}

function getUsedDigits(expr) {
  return expr.replace(/[^0-9]/g, '').split('').sort();
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function checkInput() {
  if (timeLeft <= 0) return;

  const userInput = document.getElementById("userInput").value.trim();
  const normalizedInput = userInput.replace(/\s+/g, '').toLowerCase();

  if (["答えがない", "こたえがない", "noanswer"].includes(normalizedInput)) {
    clearInterval(timer);
    if (!hasSolution) {
      document.getElementById("result").textContent = "正解！この数字では10は作れません。";
      document.getElementById("result").style.color = "green";
    } else {
      document.getElementById("result").textContent = "実は解があります！もう一度考えてみてください。";
      document.getElementById("result").style.color = "red";
    }
    return;
  }

  try {
    const sanitized = userInput.replace(/\÷/g, '/').replace(/×/g, '*');
    const userDigits = getUsedDigits(userInput);
    const targetDigits = getDigits(generatedPlate);

    if (!arraysEqual(userDigits, targetDigits)) {
      document.getElementById("result").textContent = "すべての数字を一度ずつ使ってください。";
      document.getElementById("result").style.color = "orange";
      return;
    }

    const result = Function(`"use strict"; return (${sanitized})`)();
    clearInterval(timer);

    if (Math.abs(result - 10) < 0.0001) {
      document.getElementById("result").textContent = "正解！10になりました！";
      document.getElementById("result").style.color = "green";
    } else {
      document.getElementById("result").textContent = `残念、結果は ${result} でした。`;
      document.getElementById("result").style.color = "red";
    }
  } catch (e) {
    document.getElementById("result").textContent = "式が無効です。カッコや演算子を確認してください。";
    document.getElementById("result").style.color = "red";
  }
}

function checkIfSolvable(digits) {
  const nums = digits.split("");
  const ops = ['+', '-', '*', '/'];

  function permute(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of permute(rest)) {
        result.push([arr[i], ...p]);
      }
    }
    return result;
  }

  function combineOps(n) {
    if (n === 1) return [[]];
    const result = [];
    const rest = combineOps(n - 1);
    for (const r of rest) {
      for (const o of ops) {
        result.push([o, ...r]);
      }
    }
    return result;
  }

  const numPerms = permute(nums);
  const opCombos = combineOps(3);

  for (const np of numPerms) {
    for (const opset of opCombos) {
      const a = np[0], b = np[1], c = np[2], d = np[3];
      const o1 = opset[0], o2 = opset[1], o3 = opset[2];
      const expressions = [
        `${a}${o1}${b}${o2}${c}${o3}${d}`,
        `(${a}${o1}${b})${o2}${c}${o3}${d}`,
        `${a}${o1}(${b}${o2}${c})${o3}${d}`,
        `${a}${o1}${b}${o2}(${c}${o3}${d})`,
        `(${a}${o1}${b}${o2}${c})${o3}${d}`,
        `${a}${o1}(${b}${o2}${c}${o3}${d})`,
        `(${a}${o1}${b})${o2}(${c}${o3}${d})`
      ];
      for (const expr of expressions) {
        try {
          const val = Function(`"use strict"; return (${expr})`)();
          if (Math.abs(val - 10) < 0.0001) {
            return true;
          }
        } catch (e) { continue; }
      }
    }
  }
  return false;
}

document.getElementById("submitBtn").addEventListener("click", checkInput);
document.getElementById("retryBtn").addEventListener("click", generatePlate);

generatePlate();
