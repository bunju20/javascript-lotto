(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const Constants = Object.freeze({
  LOTTO: {
    UNIT: 1e3,
    MAX_MONEY: 1e5,
    NUMBER_LENGTH: 6,
    MAX_NUMBER: 45,
    MIN_NUMBER: 1,
    CORRECT_NUMBER: {
      FIRST: 6,
      SECOND: 5,
      THIRD: 5,
      FOURTH: 4,
      FIFTH: 3
    },
    PRIZE: {
      FIFTH: 5e3,
      FOURTH: 5e4,
      THIRD: 15e5,
      SECOND: 3e7,
      FIRST: 2e9
    },
    RESULT_INDEX: {
      MATCH6: "1",
      // 6개 일치
      MATCH5_BONUS: "2",
      // 5개+보너스 일치
      MATCH5: "3",
      // 5개 일치
      MATCH4: "4",
      // 4개 일치
      MATCH3: "5"
      // 3개 일치
    }
  },
  OPERATOR: {
    SEPARATOR: ","
  },
  MESSAGE: {
    PRICE: "> 구입금액을 입력해 주세요.",
    TARGET_NUMBER: "> 당첨 번호를 입력해 주세요.",
    BONUS_NUMBER: "> 보너스 번호를 입력해 주세요.",
    RESTART_STRING: "> 다시 시작하시겠습니까? (y/n) "
  },
  ERROR: {
    PRICE_TYPE: "[ERROR] 금액은 숫자로 입력해야 한다.",
    PRICE_UNIT: "[ERROR] 금액은 1,000원으로 나누어 떨어져야 한다.",
    TARGET_NUMBER_LENGTH: "[ERROR] 당첨번호는 쉼표로 구분되어야 한다.",
    LOTTO_NUMBER_RANGE: "[ERROR] 당첨번호의 범위는 1~45이어야한다.",
    BONUS_NUMBER_TYPE: "[ERROR] 보너스 번호는 숫자이어야 한다.",
    BONUS_NUMBER_RANGE: "[ERROR] 보너스 번호의 범위는 1~45이어야한다.",
    BONUS_NUMBER_DUPLICATE: "[ERROR] 보너스 번호는 당첨번호와 중복될수 없다.",
    RESTART_STRING: "[ERROR] 다시 시작하기 위한 입력은 y또는 n이어야 한다.",
    MONEY_TO_BIG: "[ERROR] 로또 구입금액은 10만원을 넘을수 없다.",
    MONEY_TO_SMALL: "[ERROR] 로또 구입금액은 1000원 이상이어야 한다."
  }
});
class Lotto {
  constructor(numbers) {
    this.numbers = numbers;
  }
  getLottoNumber() {
    return this.numbers;
  }
  getCorrectNumber(targetNumber) {
    return this.numbers.filter((num) => targetNumber.includes(num)).length;
  }
  hasBonusNumber(bonusNumber) {
    return this.numbers.includes(bonusNumber);
  }
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function makeOneLottoArray() {
  const lotto = [];
  while (lotto.length < 6) {
    const curNumber = getRandomInt(44) + 1;
    if (lotto.includes(curNumber)) continue;
    lotto.push(curNumber);
  }
  return lotto.sort((a, b) => a - b);
}
class LottoGame {
  constructor(amount) {
    this.result = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    this.lottos = Array.from(
      { length: amount },
      () => new Lotto(makeOneLottoArray())
    );
  }
  getGameResult() {
    return this.result;
  }
  calculate(targetNumber, bonusNumber) {
    this.lottos.forEach((lotto) => {
      const correctNumber = lotto.getCorrectNumber(targetNumber);
      const isBonus = lotto.hasBonusNumber(bonusNumber);
      if (correctNumber === Constants.LOTTO.CORRECT_NUMBER.FIFTH)
        this.result["5"] += 1;
      if (correctNumber === Constants.LOTTO.CORRECT_NUMBER.FOURTH)
        this.result["4"] += 1;
      if (correctNumber === Constants.LOTTO.CORRECT_NUMBER.THIRD && !isBonus)
        this.result["3"] += 1;
      if (correctNumber === Constants.LOTTO.CORRECT_NUMBER.SECOND && isBonus)
        this.result["2"] += 1;
      if (correctNumber === Constants.LOTTO.CORRECT_NUMBER.FIRST)
        this.result["1"] += 1;
    });
  }
  getWinMoney() {
    return this.result["5"] * Constants.LOTTO.PRIZE.FIFTH + this.result["4"] * Constants.LOTTO.PRIZE.FOURTH + this.result["3"] * Constants.LOTTO.PRIZE.THIRD + this.result["2"] * Constants.LOTTO.PRIZE.SECOND + this.result["1"] * Constants.LOTTO.PRIZE.FIRST;
  }
  getEarningRate(amount) {
    const rawEarningRate = this.getWinMoney() / (amount * Constants.LOTTO.UNIT) * 100;
    return rawEarningRate.toFixed(1);
  }
}
class DomHelper {
  static createElement(tag, className, textContent = "") {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }
  static querySelector(selector) {
    return document.querySelector(selector);
  }
  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }
}
class ListChecker {
  static isDefineLength(list, value) {
    return list.length === value;
  }
  static hasDuplicateValue(list) {
    const set = new Set(list);
    return list.length !== set.size;
  }
  static isUphillList(list) {
    return list.every((element, i) => i === 0 || list[i - 1] < element);
  }
  static includeValue(targetList, values) {
    const isInclude = targetList.includes(values);
    return isInclude;
  }
}
class StringChecker {
  static isRegString(string, regExp) {
    return regExp.test(string);
  }
  static isExactString(string, value) {
    return string === value;
  }
}
class NumberChecker {
  static isLessThan(number, value) {
    return number < value;
  }
  static isMoreThan(number, value) {
    return number > value;
  }
  static isUnitNumber(number, unit) {
    return number % unit === 0;
  }
}
class Validator {
  static isPrice(priceString) {
    if (!StringChecker.isRegString(priceString, /^[0-9]+$/))
      throw new Error(Constants.ERROR.PRICE_TYPE);
    if (!NumberChecker.isUnitNumber(Number(priceString), Constants.LOTTO.UNIT))
      throw new Error(Constants.ERROR.PRICE_UNIT);
    if (NumberChecker.isMoreThan(Number(priceString), Constants.LOTTO.MAX_MONEY))
      throw new Error(Constants.ERROR.MONEY_TO_BIG);
    if (NumberChecker.isLessThan(Number(priceString), Constants.LOTTO.UNIT))
      throw new Error(Constants.ERROR.MONEY_TO_SMALL);
  }
  static isTargetNumber(targetNumberString) {
    const targetArray = targetNumberString.split(Constants.OPERATOR.SEPARATOR).map((a) => a.trim());
    if (!ListChecker.isDefineLength(targetArray, 6))
      throw new Error(Constants.ERROR.TARGET_NUMBER_LENGTH);
    if (targetArray.some(
      (num) => NumberChecker.isMoreThan(Number(num), Constants.LOTTO.MAX_NUMBER) || NumberChecker.isLessThan(Number(num), Constants.LOTTO.MIN_NUMBER)
    )) {
      throw new Error(Constants.ERROR.LOTTO_NUMBER_RANGE);
    }
  }
  static isBonusNumber(bonusNumberString, targetNumber) {
    if (!StringChecker.isRegString(bonusNumberString, /^[0-9]+$/))
      throw new Error(Constants.ERROR.BONUS_NUMBER_TYPE);
    if (NumberChecker.isMoreThan(Number(bonusNumberString), 45))
      throw new Error(Constants.ERROR.BONUS_NUMBER_RANGE);
    if (NumberChecker.isLessThan(Number(bonusNumberString), 1))
      throw new Error(Constants.ERROR.BONUS_NUMBER_RANGE);
    if (ListChecker.includeValue(targetNumber, Number(bonusNumberString)))
      throw new Error(Constants.ERROR.BONUS_NUMBER_DUPLICATE);
  }
  static isRestartString(restartString) {
    if (!StringChecker.isExactString(restartString, "y") && !StringChecker.isExactString(restartString, "n"))
      throw new Error(Constants.ERROR.RESTART_STRING);
  }
}
class LottoInput {
  constructor(onPurchase) {
    this.inputElement = DomHelper.querySelector(".input__money");
    this.buttonElement = DomHelper.querySelector(".lotto__input__btn");
    this.purchaseMessageElement = DomHelper.querySelector(
      ".lotto__box p:nth-of-type(2)"
    );
    this.onPurchase = onPurchase;
    this.init();
  }
  init() {
    this.buttonElement.addEventListener(
      "click",
      this.handlePurchase.bind(this)
    );
    this.inputElement.addEventListener(
      "keydown",
      this.handleKeyDown.bind(this)
    );
    this.purchaseMessageElement.style.display = "none";
  }
  handleKeyDown(event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      event.preventDefault();
      if (!this.buttonElement.disabled) {
        this.handlePurchase();
      }
    }
  }
  disableButton() {
    this.buttonElement.disabled = true;
    this.buttonElement.style.backgroundColor = "#cccccc";
  }
  enableButton() {
    this.buttonElement.disabled = false;
    this.buttonElement.style.backgroundColor = "";
  }
  handlePurchase() {
    try {
      const rawPriceString = this.inputElement.value;
      Validator.isPrice(rawPriceString);
      const lottoNum = Number(rawPriceString) / Constants.LOTTO.UNIT;
      this.purchaseMessageElement.style.display = "block";
      this.purchaseMessageElement.textContent = `총 ${lottoNum}개를 구매하였습니다.`;
      this.disableButton();
      this.onPurchase(lottoNum);
    } catch (error) {
      alert(error.message);
    }
  }
  reset() {
    this.inputElement.value = "";
    this.purchaseMessageElement.style.display = "none";
    this.enableButton();
  }
}
class LottoList {
  constructor() {
    this.container = DomHelper.querySelector(".lotto__list");
    this.maxHeight = "300px";
    this.setupContainer();
  }
  setupContainer() {
    this.container.style.maxHeight = this.maxHeight;
    this.container.style.overflowY = "scroll";
    this.container.style.borderRadius = "4px";
    this.container.style.padding = "10px";
  }
  displayLottos(lottos) {
    this.container.innerHTML = "";
    lottos.forEach((lotto) => {
      const lottoArray = lotto.getLottoNumber();
      const lottoElement = DomHelper.createElement("div", "random__lotto");
      const iconElement = DomHelper.createElement("div", "lotto__icon", "🎟️");
      const numbersElement = DomHelper.createElement(
        "div",
        "lotto__numbers",
        lottoArray.join(", ")
      );
      lottoElement.appendChild(iconElement);
      lottoElement.appendChild(numbersElement);
      this.container.appendChild(lottoElement);
    });
  }
  clear() {
    this.container.innerHTML = "";
  }
}
class WinningNumbers {
  constructor(onResult) {
    this.middleSection = DomHelper.querySelector(".lotto__middle");
    this.winningNumberInputs = DomHelper.querySelectorAll(
      ".target__lottos .one__numbers__input"
    );
    this.winningNumberContainer = DomHelper.querySelector(".target__lottos");
    this.bonusNumberInput = DomHelper.querySelector(
      ".bonus__number .one__numbers__input"
    );
    this.bonusNumberContainer = DomHelper.querySelector(".bonus__number");
    this.resultButton = DomHelper.querySelector(".result__btn");
    this.onResult = onResult;
    this.init();
  }
  init() {
    this.middleSection.style.display = "none";
    this.resultButton.addEventListener("click", this.handleResult.bind(this));
    this.winningNumberContainer.addEventListener(
      "keydown",
      this.handleWinningInputKeydown.bind(this)
    );
    this.bonusNumberContainer.addEventListener(
      "keydown",
      this.handleBonusInputKeydown.bind(this)
    );
  }
  handleWinningInputKeydown(event) {
    if (!event.target.classList.contains("one__numbers__input")) return;
    if (event.key !== "Enter" && event.key !== "ArrowRight" && event.key !== " ")
      return;
    event.preventDefault();
    const inputs = Array.from(this.winningNumberInputs);
    const currentIndex = inputs.indexOf(event.target);
    if (currentIndex < this.winningNumberInputs.length - 1) {
      this.winningNumberInputs[currentIndex + 1].focus();
    } else {
      this.bonusNumberInput.focus();
    }
  }
  handleBonusInputKeydown(event) {
    if (!event.target.classList.contains("one__numbers__input")) return;
    if (event.key !== "Enter" && event.key !== "ArrowRight" && event.key !== " ")
      return;
    event.preventDefault();
    this.resultButton.focus();
  }
  show() {
    this.middleSection.style.display = "block";
    if (this.winningNumberInputs.length > 0) {
      this.winningNumberInputs[0].focus();
    }
  }
  hide() {
    this.middleSection.style.display = "none";
  }
  handleResult() {
    try {
      if (!this.onResult) {
        throw new Error("로또를 먼저 구매해주세요.");
      }
      const { winningNumbers, bonusNumber } = this.validateWinningNumbers();
      this.onResult(winningNumbers, bonusNumber);
    } catch (error) {
      alert(error.message);
    }
  }
  reset() {
    [...this.winningNumberInputs, this.bonusNumberInput].forEach(
      (input) => input.value = ""
    );
    this.hide();
  }
  validateWinningNumbers() {
    const winningNumbers = [];
    this.winningNumberInputs.forEach((input) => {
      if (!input.value) {
        throw new Error("당첨 번호를 모두 입력해주세요.");
      }
      winningNumbers.push(Number(input.value));
    });
    Validator.isTargetNumber(winningNumbers.join(", "));
    if (!this.bonusNumberInput.value) {
      throw new Error("보너스 번호를 입력해주세요.");
    }
    const bonusNumber = Number(this.bonusNumberInput.value);
    Validator.isBonusNumber(bonusNumber, winningNumbers);
    return { winningNumbers, bonusNumber };
  }
}
class ResultModal {
  constructor(onRestart) {
    this.resultModal = DomHelper.querySelector("#resultModal");
    this.match3Element = DomHelper.querySelector("#match-3");
    this.match4Element = DomHelper.querySelector("#match-4");
    this.match5Element = DomHelper.querySelector("#match-5");
    this.match5BonusElement = DomHelper.querySelector("#match-5-bonus");
    this.match6Element = DomHelper.querySelector("#match-6");
    this.totalReturnRateElement = DomHelper.querySelector("#total-return-rate");
    this.restartButton = DomHelper.querySelector("#restart-button");
    this.closeButton = DomHelper.querySelector("#closeModalBtn");
    this.onRestart = onRestart;
    this.matchElements = {
      MATCH3: this.match3Element,
      MATCH4: this.match4Element,
      MATCH5: this.match5Element,
      MATCH5_BONUS: this.match5BonusElement,
      MATCH6: this.match6Element
    };
    this.init();
  }
  init() {
    var _a;
    this.restartButton.addEventListener("click", this.handleRestart.bind(this));
    (_a = this.closeButton) == null ? void 0 : _a.addEventListener("click", this.handleClose.bind(this));
    if (!this.closeButton) this.addCloseButton();
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
  }
  handleKeyPress(event) {
    if (event.key === "Escape" && this.resultModal.style.display === "flex") {
      this.hide();
    }
  }
  handleRestart() {
    this.hide();
    this.onRestart();
  }
  handleClose() {
    this.hide();
  }
  displayResult(gameResult, earningRate) {
    const { RESULT_INDEX } = Constants.LOTTO;
    Object.entries(this.matchElements).forEach(([matchType, element]) => {
      const index = RESULT_INDEX[matchType];
      const count = gameResult[index] || 0;
      element.textContent = `${count}개`;
    });
    this.totalReturnRateElement.textContent = `당신의 총 수익률은 ${earningRate}%입니다.`;
    this.show();
  }
  show() {
    this.resultModal.classList.add("modal-visible");
  }
  hide() {
    this.resultModal.classList.remove("modal-visible");
  }
  addCloseButton() {
    const closeBtn = document.createElement("button");
    closeBtn.id = "closeModalBtn";
    closeBtn.textContent = "닫기";
    closeBtn.classList.add("close-button");
    closeBtn.addEventListener("click", () => {
      this.hide();
    });
    const modalHeader = this.resultModal.querySelector(".modal-header") || this.resultModal;
    modalHeader.appendChild(closeBtn);
    this.closeButton = closeBtn;
  }
}
class WebApp {
  constructor() {
    this.lottoGame = null;
    this.lottoList = new LottoList();
    this.lottoInput = new LottoInput(this.handlePurchase.bind(this));
    this.winningNumber = new WinningNumbers(this.handleResult.bind(this));
    this.resultModal = new ResultModal(this.resetGame.bind(this));
  }
  handlePurchase(lottoNum) {
    this.lottoGame = new LottoGame(lottoNum);
    this.lottoList.displayLottos(this.lottoGame.lottos);
    this.winningNumber.show();
  }
  handleResult(winningNumbers, bonusNumber) {
    this.lottoGame.calculate(winningNumbers, bonusNumber);
    const gameResult = this.lottoGame.getGameResult();
    const earningRate = this.lottoGame.getEarningRate(
      this.lottoGame.lottos.length
    );
    this.resultModal.displayResult(gameResult, earningRate);
  }
  resetGame() {
    this.lottoGame = null;
    this.lottoInput.reset();
    this.winningNumber.reset();
    this.lottoList.clear();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new WebApp();
});
